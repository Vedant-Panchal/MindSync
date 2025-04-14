from email import message
from fastapi import APIRouter, Request, status, HTTPException
from datetime import date, datetime
from uuid import uuid4
from app.core.config import MODEL_VECTOR
from app.core.exceptions import APIException
from app.db.schemas.journal import ChatbotType, DraftRequest
from app.core.connection import db
from fastapi.encoders import jsonable_encoder
from loguru import logger

from app.utils.otp_utils import get_history, store_draft, store_otp
from app.utils.utils import submit_draft
from app.utils.chatbot_utils import (
    final_response,
    get_journals_by_date,
    query_function,
    query_parser,
)

router = APIRouter()


@router.post("/draft/save")
async def save_drafts(request: Request, draft: DraftRequest):
    user = getattr(request.state, "user", None)
    logger.info(f"User: {user}, User ID type: {type(user['id']) if user else 'None'}")

    try:
        today = date.today().isoformat()
        redis_key = f"Draft:{user['id']}:{today}"
        draft_data = {
            "content": draft.content,
            "date": today,
            "user_id": user["id"],
            "tags": draft.tags,
            "title": draft.title,
            "rich_text" : draft.rich_text
        }

        logger.info(f"Draft data prepared: {draft_data}, Type: {type(draft_data)}")
        store_draft(draft_data, redis_key)
        logger.debug(f"Draft stored in Redis with key: {redis_key}")

        return {"message": "Stored Data In Redis", "draft_data": draft_data}

    except Exception as e:
        logger.exception(f"Error saving draft: {str(e)}")
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            message="An Error Has Occurred",
        )


@router.post("/draft/add")
async def save_draft(request : Request):
    try:
        logger.info("Starting /test endpoint execution")
        user = getattr(request.state, "user", None)
        print(user['id'])
        from datetime import date

        today = date.today().isoformat()  # 'YYYY-MM-DD'
        get_today_journal = db.table("journals").select("*").eq("created_at", today).eq("user_id", user['id']).execute()  
        print(f"Todays Journals : {get_today_journal}")
        if get_today_journal.data and len(get_today_journal.data) > 0:
            raise APIException(
                status_code=400,
                detail="You Have Submitted Today's Journal, Come again Tomorrow",
                message="You Have Submitted Today's Journal"
            )
        variable_test = submit_draft(user['id'])
        # logger.debug(f"submit_draft result: {variable_test}")
        return {"message": variable_test}
    except APIException as e:
        logger.error(f"Custom APIException caught: {str(e.message)}")
        raise e  # Re-raise as-is

    except Exception as e:
        logger.exception(f"Unexpected error in /test endpoint: {str(e)}")
        raise APIException(
            status_code=500,
            detail="Internal Server Error",
            message=f"An unexpected error occurred: {str(e)}"
        )


@router.post("/chatbot")
async def getQuery(request: Request, user_query: ChatbotType):
    logger.info(f"Received chatbot query: {user_query.query}")

    try:
        filter_params = query_parser(user_query.query)
        logger.info(f"Parsed filter parameters: {filter_params}")

        user = getattr(request.state, "user", None)

        try:
            history = get_history(user_id=user["id"])
        except Exception as e:
            logger.error(f"Failed to load history: {str(e)}")
            history = []

        llm_data = []

        if filter_params.get("is_history", False):
            logger.info("Processing history-only query")
            try:
                final_result = final_response(
                    data=llm_data,
                    user_query=user_query.query,
                    history=history,
                    user_id=user["id"],
                    is_history=True,
                )
                return final_result
            except Exception as e:
                logger.exception(f"Error processing history query: {str(e)}")
                raise APIException(
                    status_code=500,
                    detail=str(e),
                    message="Error processing history-based query",
                )

        # Process journal query
        logger.info("Processing journal query")
        try:
            result = query_function(
                user["id"],
                user_query.query,
                filter_params,
            )
            logger.debug(f"Query function result: {result['title_search']}")
        except Exception as e:
            logger.exception(f"Error in query_function: {str(e)}")
            raise APIException(
                status_code=500, detail=str(e), message="Error fetching journal data"
            )

        if result.get("data") and len(result["data"]) > 0:
            for data in result["data"]:
                data_object = {
                    "content": data.get("content", ""),
                    "title": data.get("title", ""),
                    "date": data.get("created_at", ""),
                    "moods": data.get("moods", []),
                    "semantic_result": result.get("Semantic Result", []),
                    "title_search": result.get("title_search", []),
                }
                llm_data.append(data_object)

        try:
            final_result = final_response(
                data=llm_data,
                user_query=user_query.query,
                history=history,
                user_id=user["id"],
                is_history=False,
            )
            return final_result
        except Exception as e:
            logger.exception(f"Error in final_response for journal query: {str(e)}")
            raise APIException(
                status_code=500,
                detail=str(e),
                message="Error generating final response",
            )

    except Exception as e:
        logger.exception(f"Unexpected error in /chatbot: {str(e)}")
        raise APIException(
            status_code=500, detail=str(e), message="An unexpected error occurred"
        )


@router.get("/get-all-history")
def get_chat_history(request:Request):
    try:
        user = getattr(request.state, "user", None)
        history = get_history(user['id'])
        if not history:
            return []
        else :
            logger.info(f"Chatbot History is {history}")
            return history
    except Exception as e:
        logger.exception(f"Unexpected error in getting chatbot history: {str(e)}")
        raise APIException(
            status_code=500, detail=str(e), message="An unexpected error occurred"
        )
    

@router.get("/get-all-journal")
def get_all_journal(request:Request):
    try:
        user = getattr(request.state, "user", None)
        response = get_journals_by_date(user['id'])

        if not response or not response[0]:
            raise APIException(
                status_code=404,
                message="There are no journals written."
            )

        journals = response
        data = []

        for journal in journals:
            created_at = journal.get('created_at')
            if not created_at:
                continue

            # Parse and format date
            date_obj = datetime.strptime(created_at, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d %B, %Y").lstrip("0")

            # Prepare data
            data_obj = {
                'content': journal.get('content', ''),
                'date': formatted_date,
                'moods': journal.get('moods', {}),
                'title':journal.get('title','')
            }
            data.append(data_obj)

        return {"journals": data}
    except Exception as e:
        logger.exception(f"Unexpected error in getting all journals: {str(e)}")
        raise APIException(
            status_code=500, detail=str(e), message="An unexpected error occurred"
        )





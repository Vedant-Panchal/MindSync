from fastapi import APIRouter, Request, status, HTTPException
from datetime import date
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
    filter_by_embeddings,
    filter_by_moods,
    filter_by_tags,
    final_response,
    get_journals_by_date,
    query_function,
    query_parser,
)

router = APIRouter()


@router.post("/drafts")
async def save_drafts(request: Request, draft: DraftRequest):
    user = getattr(request.state, "user", None)
    logger.info(f"User: {user}, User ID type: {type(user['id']) if user else 'None'}")

    if not user:
        logger.warning("Unauthorized access attempt")
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="You are not authorized to access this resource",
            detail="Please login to access this resource",
        )

    if not draft.content:
        logger.error("Draft content is empty")
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="No Content To Save",
            detail="There is Nothing Written To Save",
            hint="Write Something",
        )

    if not draft.title:  # Fixed duplicate check for content; assuming you meant title
        logger.error("Draft title is empty")
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="No Title To Save",
            detail="There is Nothing Written In Title To Save",
            hint="Write Something",
        )

    try:
        today = date.today().isoformat()
        redis_key = f"Draft:{user['id']}:{today}"
        draft_data = {
            "content": draft.content,
            "date": today,
            "user_id": user["id"],
            "tags": draft.tags,
            "title": draft.title,
        }

        logger.info(f"Draft data prepared: {draft_data}, Type: {type(draft_data)}")
        store_draft(draft_data, redis_key)
        logger.debug(f"Draft stored in Redis with key: {redis_key}")

        # Uncomment if you need to store OTP
        # store_otp("mohammedrupawala8@gmail.com", "123456")
        # logger.debug("OTP stored")

        return {"message": "Stored Data In Redis", "draft_data": draft_data}

    except Exception as e:
        logger.exception(f"Error saving draft: {str(e)}")
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            message="An Error Has Occurred",
        )


@router.post("/test")
async def save_draft():
    try:
        logger.info("Starting /test endpoint execution")
        variable_test = submit_draft()
        # logger.debug(f"submit_draft result: {variable_test}")
        return {"message": variable_test}
    except Exception as e:
        logger.exception(f"Error in /test endpoint: {str(e)}")
        raise APIException(
            status_code=400, detail=str(e), message=f"Error occurred: {str(e)}"
        )


@router.post("/chatbot")
async def getQuery(request: Request, user_query: ChatbotType):
    logger.info(f"Received chatbot query: {user_query.query}")

    if not user_query.query:
        logger.error("Empty query received")
        raise APIException(status_code=400, detail="Enter A Query", message="No Query")

    try:
        filter_params = query_parser(user_query.query)
        logger.info(f"Parsed filter parameters: {filter_params}")

        user = getattr(request.state, "user", None)
        if not user:
            logger.warning("Unauthorized access attempt to /chatbot")
            raise APIException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="You are not authorized to access this resource",
                detail="Please login to access this resource",
            )

        # Load chat history
        try:
            history = get_history(user_id=user["id"])
            # logger.debug(f"Loaded history: {history}")
        except Exception as e:
            logger.error(f"Failed to load history: {str(e)}")
            history = []  # Fallback to empty history

        # Initialize llm_data
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
                # logger.debug(f"Final result for history query: {final_result}")
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
            # logger.debug(f"Prepared llm_data: {llm_data}")

        try:
            final_result = final_response(
                data=llm_data,
                user_query=user_query.query,
                history=history,
                user_id=user["id"],
                is_history=False,
            )
            # logger.debug(f"Final result for journal query: {final_result}")
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

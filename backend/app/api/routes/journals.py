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


@router.get("/get")
def get_all_journal(request: Request):
    try:
        user = getattr(request.state, "user", None)
        response = get_journals_by_date(user["id"])

        if not response or not response[0]:
            raise APIException(
                status_code=404,
                message="There are no journals written.",
                detail="Journals not found",
                hint="Please write a journal to see the list.",
            )

        journals = response
        data = []

        for journal in journals:
            created_at = journal.get("created_at")
            if not created_at:
                continue

            # Parse and format date
            date_obj = datetime.strptime(created_at, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d %B, %Y").lstrip("0")

            # Prepare data
            data_obj = {
                "content": journal.get("content", ""),
                "date": formatted_date,
                "moods": journal.get("moods", {}),
                "title": journal.get("title", ""),
            }
            data.append(data_obj)

        return {"journals": data}
    except APIException as e:
        logger.exception(f"Unexpected error in getting all journals: {str(e)}")
        raise APIException(
            status_code=500,
            detail=str(e.detail),
            message=str(e.message),
            hint=str(e.hint),
        )


@router.post("/draft/add")
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
            "rich_text": draft.rich_text,
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


@router.post("/draft/submit")
async def save_draft(request: Request):
    """
    Endpoint to save a draft journal entry.
    """
    try:
        logger.info("Starting /test endpoint execution")
        user = getattr(request.state, "user", None)
        print(user["id"])

        today = date.today().isoformat()  # 'YYYY-MM-DD'
        get_today_journal = (
            db.table("journals")
            .select("*")
            .eq("created_at", today)
            .eq("user_id", user["id"])
            .execute()
        )
        print(f"Todays Journals : {get_today_journal}")
        if get_today_journal.data and len(get_today_journal.data) > 0:
            raise APIException(
                status_code=400,
                detail="You Have Submitted Today's Journal, Come again Tomorrow",
                message="You Have Submitted Today's Journal",
            )
        variable_test = submit_draft(user["id"])
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
            message=f"An unexpected error occurred: {str(e)}",
        )

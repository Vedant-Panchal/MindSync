from fastapi import APIRouter, Request, status
from datetime import date, datetime, timezone
from uuid import uuid4
from app.core.config import MODEL_VECTOR
from app.core.exceptions import APIException
from app.db.schemas.journal import ChatbotType, DraftCreate, DraftRequest
from app.core.connection import db
from fastapi.encoders import jsonable_encoder

from app.utils.otp_utils import store_draft, store_otp
from app.utils.utils import submit_draft
from app.utils.chatbot_utils import get_journals_by_date, query_parser

router = APIRouter()


@router.post("/drafts")
async def save_drafts(request: Request, draft: DraftRequest):
    user = getattr(request.state, "user", None)
    print(f"User {user}, User ID type: {type(user['id'])}")
    if not user:
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="You are not authorized to access this resource",
            detail="Please login to access this resource",
        )
    if not draft.content:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="NO Content To save",
            detail="There is Nothing Written To Save",
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
        }

        print(f"Draft Data : {draft_data} And Type of Draft Data : {type(draft_data)}")
        store_draft(draft_data, redis_key)
        # store_otp("mohammedrupawala8@gmail.com","123456")
        print("Called Store_otp")

        return {"message": "Stored Data In Redis", "draft_data": draft_data}

    except Exception as e:
        APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            message="An Error Has Occured",
        )


@router.post("/test")
async def save_draft():
    try:
        variable_test = submit_draft()
        return {"message": variable_test}
    except Exception as e:
        raise APIException(
            status_code=400, detail=str(e), message=f"Error occurred: {str(e)}"
        )


@router.post("/chatbot")
async def getQuery(request: Request, user_query: ChatbotType):
    if not user_query.query:
        raise APIException(status_code=400, detail="Enter A Query", message=f"No Query")

    result = query_parser(user_query.query)
    start_date = result["date_range"]["start"]
    end_date = result["date_range"]["end"]
    print(start_date)
    user = getattr(request.state, "user", None)
    data_by_date = get_journals_by_date(
        user["id"], start_date=start_date, end_date=end_date
    )
    if len(data_by_date) == 0:
        print("No Journal entry")

    for i in data_by_date:
        # print(i['text'])
        print(i)

    return result

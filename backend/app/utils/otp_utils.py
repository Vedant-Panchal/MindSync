from app.core.config import OTP_EXPIRY_MINS
from app.core.connection import redis_client
import logging
import json
from app.core.exceptions import APIException
from app.db.schemas.journal import DraftCreate


def store_otp(email: str, otp: str):
    try:
        redis_client.set(name=email, value=otp, ex=OTP_EXPIRY_MINS * 60)
        logging.info(f"✅ OTP stored successfully in Redis for {email}")
    except Exception as e:
        logging.error(f"❌ Error storing OTP in Redis for {email}: {str(e)}")


def store_draft(draft_data: dict[str, any], redis_key: str):
    try:
        draft_json = json.dumps(draft_data)
        print(type(draft_json))
        redis_client.set(redis_key, draft_json, ex=86400)
        logging.info(f"✅ Draft stored successfully in Redis for {redis_key}")
    except Exception as e:
        logging.error(f"❌ Error storing Draft in Redis for {redis_key}: {str(e)}")
        raise APIException(
            status_code=400,
            detail=f"Error storing draft in Redis: {str(e)}",
            message="Failed to store draft",
        )


def verify_otp(email: str, entered_otp: str):
    stored_otp = redis_client.get(name=email)
    if stored_otp is None:
        raise ValueError("Your OTP has expired")
    if stored_otp != entered_otp:
        raise ValueError("Your OTP is incorrect")
    redis_client.delete(email)
    return True


def store_history(data: list, user_id: str):
    try:
        redis_client.set(name=user_id, value=data, ex=30 * 24 * 60 * 60)
        logging.info(f"✅ History stored successfully in Redis for {user_id}")
    except Exception as e:
        error_msg = (
            f"❌ Failed to store history in Redis for user ID '{user_id}': {str(e)}"
        )
        logging.error(error_msg)
        raise APIException(
            400,
            "An error occurred while storing the user's history in Redis.",
            detail=error_msg,
        )


def get_history(user_id: str):
    try:
        data = redis_client.get(user_id)
        if not data:
            logging.info(
                f"📭 No history found in Redis for user ID '{user_id}'. Returning empty list."
            )
            return []
        logging.info(
            f"📦 History retrieved successfully from Redis for user ID '{user_id}'."
        )
        loaded_data: list = json.loads(data)
        return loaded_data

    except Exception as e:
        error_msg = (
            f"❌ Error retrieving history from Redis for user ID '{user_id}': {str(e)}"
        )
        logging.error(error_msg)
        raise APIException(
            500,
            "An error occurred while retrieving the user's history.",
            detail=error_msg,
        )

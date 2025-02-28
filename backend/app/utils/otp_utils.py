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

def store_draft(draft_data: dict[str,any], redis_key: str):
    try:
        # Serialize Pydantic model to JSON string
        draft_json = json.dumps(draft_data)
        print(type(draft_json))
        # Store in Redis with 24-hour expiration (ex=86400 seconds)
        redis_client.set(redis_key, draft_json, ex=86400)
        logging.info(f"✅ Draft stored successfully in Redis for {redis_key}")
    except Exception as e:
        logging.error(f"❌ Error storing Draft in Redis for {redis_key}: {str(e)}")
        raise APIException(
            status_code=400,
            detail=f"Error storing draft in Redis: {str(e)}",
            message="Failed to store draft"
        )


def verify_otp(email: str, entered_otp: str):
    stored_otp = redis_client.get(name=email)
    if stored_otp is None:
        raise ValueError("Your OTP has expired. Please request a new one.")
    if stored_otp != entered_otp:
        raise ValueError("Your OTP is incorrect. Please try again.")
    redis_client.delete(email) 
    return True
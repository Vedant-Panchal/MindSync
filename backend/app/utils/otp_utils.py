from app.core.config import OTP_EXPIRY_MINS
from app.core.connection import redis_client
import logging


def store_otp(email: str, otp: str):
    try:
        redis_client.set(name=email, value=otp, ex=OTP_EXPIRY_MINS * 60)
        logging.info(f"✅ OTP stored successfully in Redis for {email}")
    except Exception as e:
        logging.error(f"❌ Error storing OTP in Redis for {email}: {str(e)}")

def verify_otp(email: str, entered_otp: str):
    stored_otp = redis_client.get(name=email)
    print(stored_otp)
    if stored_otp is None:
        raise ValueError("Your OTP has expired. Please request a new one.")
    if stored_otp != entered_otp:
        raise ValueError("Incorrect OTP")
    redis_client.delete(email) 
    return True
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException,status
from fastapi import HTTPException,status
from jose import jwt
from jose.exceptions import JWTError,ExpiredSignatureError
from app.core.config import JWT_SECRET,JWT_ALGO,OTP_EXPIRY_MINS

# def create_otp_token(email: str, otp: str) -> str:
#     expire = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINS)
#     payload = {"sub": email, "otp": otp, "exp": expire}
#     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

# def verify_otp_token(token: str, otp: str) -> bool:
#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
#         return payload.get("otp") == otp
#     except JWTError:
#         return False
def generate_otp_jwt(email: str, otp: str) -> str:
    """Generate a JWT containing the OTP and expiration."""
    payload = {
        "email": email,
        "otp": otp,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_otp_jwt(token: str) -> dict:
    """Decode the OTP JWT and validate."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGO)
    except ExpiredSignatureError:
        raise ValueError("OTP has expired")
    except JWTError:
        raise ValueError("Invalid OTP token")
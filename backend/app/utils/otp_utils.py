from datetime import datetime, timedelta, timezone
from jose import jwt
from jose.exceptions import JWTError,ExpiredSignatureError
from app.core.config import JWT_SECRET,JWT_ALGO,OTP_EXPIRY_MINS

def generate_otp_jwt(email: str, otp: str) -> str:
    
    payload = {
        "email": email,
        "otp": otp,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_otp_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGO)
    except ExpiredSignatureError:
        raise ValueError("OTP has expired")
    except JWTError:
        raise ValueError("Invalid OTP token")
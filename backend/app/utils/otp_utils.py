from datetime import datetime, timedelta, timezone
from email.policy import HTTP
from fastapi import HTTPException,status
from jose import jwt
from jose.exceptions import JWTError,ExpiredSignatureError
from app.core.config import JWT_SECRET,JWT_ALGO,OTP_EXPIRY_MINS
from app.db.schemas.user import verify_otp_response, verify_otp_type

def generate_otp_jwt(email: str, otp: str) -> str:
    
    payload = {
        "email": email,
        "otp": otp,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_otp_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGO)
    except ExpiredSignatureError:
        raise ValueError("OTP has expired")
    except JWTError:
        raise ValueError("Invalid OTP token")
    
def verify_token(data : verify_otp_type):
    try: 
        decoded_payload = decode_otp_jwt(data.token)
        print("decoded payload ",decoded_payload)
        email = decoded_payload["email"]
        otp = decoded_payload["otp"]
        exp = decoded_payload["exp"]
        print(email)
        # if decoded_payload["used"]:
        #     raise HTTPException(status_code=400, detail="OTP has already been used")
        if otp != data.otp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect OTP")
        if exp < datetime.now(timezone.utc).timestamp():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new OTP")
        return email
    except Exception as e:
        raise e
        # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="An Error has Ocurred")

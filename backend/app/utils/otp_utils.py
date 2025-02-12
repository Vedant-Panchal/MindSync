from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from fastapi import HTTPException,status
from jose import jwt
from jose.exceptions import JWTError,ExpiredSignatureError
from app.core.config import JWT_SECRET,JWT_ALGO,OTP_EXPIRY_MINS,ENCRYPTION_KEY
from app.db.schemas.user import verify_otp_type
from app.core.connection import redis_client
import logging
fernet = Fernet(ENCRYPTION_KEY)

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
        raise ValueError("Invalid OTP")
    
def store_otp(email: str, otp: str):
    try:
        redis_client.set(name=email, value=otp, ex=OTP_EXPIRY_MINS * 60)
        logging.info(f"✅ OTP stored successfully in Redis for {email}")
    except Exception as e:
        logging.error(f"❌ Error storing OTP in Redis for {email}: {str(e)}")

def verify_otp(email: str, entered_otp: str):
    stored_otp = redis_client.get(name=email)
    if stored_otp is None:
        raise ValueError("OTP expired or not found")
    if stored_otp != entered_otp:
        raise ValueError("Incorrect OTP")
    redis_client.delete(email) 
    return True

    
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

def encrypt_jwt(token : str):
   try:
        encrypted_otp = fernet.encrypt(token.encode())
        return encrypted_otp.decode()
   except Exception as e:
       raise e
    #    raise HTTPException(status.HTTP_400_BAD_REQUEST,detail = "Error While Enctrypting Token")
def decrypt_jwt(token : str):
    try:
        decrypted_jwt = fernet.decrypt(token.encode()).decode()
        return decrypted_jwt
    except Exception as e:
       raise e
    #    raise HTTPException(status.HTTP_400_BAD_REQUEST,detail = "Error While Enctrypting Token")


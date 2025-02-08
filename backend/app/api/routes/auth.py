from tkinter import NO
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header,status
from uuid import uuid4
from datetime import datetime,timezone

from fastapi.security import OAuth2PasswordBearer
from app.core.config import EXPIRES_IN, OTP_EXPIRY_MINS
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, CreateUser,VerifyUser,ResetPasswordRequest
from app.services.auth import hashPass, createToken,verify
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import decode_otp_jwt, generate_otp_jwt

router = APIRouter()


PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

@router.post("/sign-up")
async def sign_up(data: CreateUser):
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    if existing_user.data:
        return HTTPException(status_code=400, detail="User already exists")
    if not re.fullmatch(PASSWORD_REGEX, data.password):
        return HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    otp = str(uuid4().int)[:6]
    hash_password = hashPass(data.password)
    otp_token = generate_otp_jwt(data.email, otp)
    user = UserInDB(
        id=str(uuid4()),
        email=data.email,
        username=data.username,
        password=hash_password,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        is_verified=False,
    )

    # Insert user into DB with JSON serialization
    try:
        db.table("users").insert(jsonable_encoder(user)).execute()
        send_otp_email(data.email, otp)
        return {
        "message": "User created successfully. Check your email for OTP verification.", 
        "email": data.email,
        # "token": createToken(user, EXPIRES_IN),
        "otp_token": otp_token
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error while signing up: {str(e)}")
    
@router.post("/sign-in")
async def signIn(data: VerifyUser):
    try:
        response: SupabaseResponse = db.table("users").select("*").eq("email", data.email).execute()
    except Exception as e:
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database query failed")

    if not response.data:
        return HTTPException(status_code=400, detail="No email exists with this user")

    existing_user = UserInDB(**response.data[0])
    
    if not existing_user.is_verified:
        return HTTPException(status_code=401, detail="User is not verified. Please complete OTP verification")
    
    is_verified = verify(data.password,existing_user.password)
    if is_verified:
        token = createToken(existing_user, EXPIRES_IN)
        return {    
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/verify-otp")
async def verify_otp(otp_token: str, entered_otp: str):
    # Decode the OTP JWT
    try:
        decoded_payload = decode_otp_jwt(otp_token)
        email = decoded_payload["email"]
        otp = decoded_payload["otp"]
        exp= decoded_payload["exp"]
    except ValueError as e:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    # Validate OTP manually
    if otp != entered_otp:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect OTP")
    
    if exp < datetime.now(timezone.utc).timestamp():
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new OTP")
    # Fetch user and verify account
    response = db.table("users").select("*").eq("email", email).execute()
    if not response.data:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    user = UserInDB(**response.data[0])
    

    if user.is_verified:
        return {
            "message": "User is already verified"
            }

    # Mark user as verified
    db.table("users").update({"is_verified": True}).eq("email", email).execute()
    return {
        "message": "User verified successfully",
        "email": email,
        "decoded_otp":otp
        }

@router.post("/reset-password")
async def generatePasswordOtp(email : str):
    try:
        response = db.table("users").select("*").eq("email",email).execute()
    except Exception as e:
        return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Fetching Data")
    if not response.data:
        return HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        otp = str(uuid4().int)[:6]
        send_otp_email(email, otp)
        otpToken = generate_otp_jwt(email,otp)
        return {
            "message" : "OTP Sent Successfully",
            "token" : otpToken
        }
@router.put("/reset-password")
async def resetPassword(
    entered_otp : str,
    newPassword : str,
    authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or invalid")
    else:
        print(f"""
        *********************************
            {authorization}
        ******************************
        """)
        token = authorization.split(" ")[1]
        try: 
            decoded_payload = decode_otp_jwt(token)
            email = decoded_payload["email"]
            otp = decoded_payload["otp"]
            exp = decoded_payload["exp"]
        except Exception as e:
            return e
            # return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
        if otp != entered_otp:
            return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect OTP")
    
        if exp < datetime.now(timezone.utc).timestamp():
            return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new OTP")
        try:
            response = db.table("users").select("*").eq("email",email).execute()
        except Exception as e:
            return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Fetching Data")
        if not response.data:
            return HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
        else:
            existingUser = UserInDB(**response.data[0])
            if not re.fullmatch(PASSWORD_REGEX, newPassword):
                return HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")

            hashedPassword = hashPass(newPassword)
            try:
                db.table("users").update({"password": hashedPassword}).eq("email", email).execute()
                return{
                    "message" : "Password Updated Successfully"
                }
            except:
                return HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Updating Password")



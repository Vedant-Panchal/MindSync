from tkinter import N
from typing import Dict
from fastapi import APIRouter, Cookie, HTTPException,responses,Response, Header, status
from uuid import uuid4
from datetime import datetime, timezone
from app.core.config import EXPIRES_IN
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, create_user,VerifyUser,ResetPasswordRequest,SignUpType,verify_otp_type
from app.services.auth import hashPass, create_token,verify
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import decode_otp_jwt, generate_otp_jwt, verify_token

router = APIRouter()


PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


router = APIRouter()

@router.post("/sign-up", response_model=Dict[str, str])
async def sign_up(data: SignUpType, response: Response):
    try:
        existing_user = db.table("users").select("*").eq("email", data.email).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User already exists"
            )
        
        otp = str(uuid4().int)[:6]
        send_otp_email(data.email, otp)
        otp_token = generate_otp_jwt(data.email, otp)
        
        response.set_cookie(
            key="sign_up_token",
            value=otp_token,
            max_age=600,
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        print(response.headers)

        
        return responses.JSONResponse(
            content={"message": "OTP Sent Successfully"},
            status_code=status.HTTP_200_OK
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database query failed: {str(e)}"
        )

@router.post("/verify-otp", response_model=Dict[str, str])
async def verify_otp(
    response: Response,
    data: create_user,
    sign_up_token: str | None = Cookie(None)
):
    if not sign_up_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="OTP token missing in cookies"
        )
    
    try:
        print(sign_up_token)
        otpData = verify_otp_type()(
            otp_token=sign_up_token,
            entered_otp=data.otp
        )
        email = verify_token(otpData)
        hash_password = hashPass(data.password)
        
        user = UserInDB(
            id=str(uuid4()),
            email=email,
            username=data.username,
            password=hash_password,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            is_verified=True,
        )

        user_token = create_token(user, EXPIRES_IN)
        db.table("users").insert(jsonable_encoder(user)).execute()

        response.delete_cookie("sign_up_token")
        response.set_cookie(
            key="user_token",
            value=user_token,
            max_age=691200,
            httponly=True,
            secure=True,
            samesite="Lax"
        )
        
        return {
            "message": "User created successfully. Check your email for OTP verification.",
            "email": email,
            "token": user_token,
        }
        
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error while signing up: {str(e)}"
        )
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
        token = create_token(existing_user, EXPIRES_IN)
        return {    
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/reset-password")
async def reset_password(email : str):
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
async def reset_password(
    data: ResetPasswordRequest,
    authorization: str|None = Header(None)):

    entered_otp = data.entered_otp
    newPassword = data.new_password
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or invalid")
    
    token = authorization.split(" ")[1]
    
    # try: 
    #     decoded_payload = decode_otp_jwt(token)
    #     print(f"""
    #     **********************************
    #     {decoded_payload}
    #     **********************************
    #     """)
    #     token = authorization.split(" ")[1]
        # try: 
        #     decoded_payload = decode_otp_jwt(token)
        #     email = decoded_payload["email"]
        #     otp = decoded_payload["otp"]
        #     exp = decoded_payload["exp"]
        # except Exception as e:
        #     return e
        #     # return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
        # if otp != entered_otp:
        #     return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect OTP")
    
        # if exp < datetime.now(timezone.utc).timestamp():
        #     return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired. Please request a new OTP")
    data = verify_otp(
        otp_token=token,
        entered_otp=entered_otp
    )
    email = verify_token(data)
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



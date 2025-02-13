
import logging
from idna import decode
from jose import jwt,JWTError
from fastapi import APIRouter, Cookie, Depends, HTTPException,Response,status
from uuid import uuid4
from datetime import datetime, timezone
from pydantic import EmailStr
from app.core.config import ACCESS_TOKEN_EXPIRES_MINS,REFRESH_TOKEN_EXPIRES_DAYS,ACCESS_TOKEN_EXPIRES_MINS
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, create_user,VerifyUser,ResetPasswordRequest,CreateOtpType
from app.db.schemas.user import SignUpType
from app.services.auth import hashPass, create_token,verify_pass,decode_token
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import verify_otp
from app.utils.utils import check_user_present
from app.utils.otp_utils import store_otp
router = APIRouter()

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


router = APIRouter()
@router.post("/sign-up")
async def sign_up(response: Response,data: SignUpType):
    try:
        existing_user:SupabaseResponse = db.table("users").select("*").eq("email", data.email).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User already exists"
            )
        otp:str = str(uuid4().int)[:6]
        send_otp_email(data.email, otp)
        store_otp(data.email,otp)        
        return {
            "message": "OTP Sent Successfully",
            "status_code":status.HTTP_200_OK
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database query failed: {str(e)}"
        )

@router.post("/verify-otp")
async def verify(
    response: Response,
    data: create_user
):
    email = data.email
    password = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    try:
        verify_otp(email,data.otp)
        hash_password = hashPass(data.password)
        id = str(uuid4())
        user = UserInDB(
            id=id,
            email=email,
            username=data.username,
            password=hash_password,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            is_verified=True,
        )
        userData = CreateOtpType(
            email=email,
            id = id
        )
        access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60)
        db.table("users").insert(jsonable_encoder(user)).execute()
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS, # in seconds
            httponly=True,
            secure=True,
            samesite="Lax"
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60,  # Convert days to seconds
            httponly=True,
            secure=True,
            samesite="Strict"
        )
        return {
            "message": "User created successfully.",
            "email": email,
            "token": access_token,
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logging.error(f"Unexpected error during OTP verification: {str(e)}")
        # raise HTTPException(
        #     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #     detail="An unexpected error occurred. Please try again."
        # )
        raise e

@router.post("/sign-in")
async def signIn(response: Response,data: VerifyUser):
    user = check_user_present(data.email)
    password:str = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    if not user:
        raise HTTPException(status_code=400, detail="No email exists with this user")

    existing_user = UserInDB(**user[0])
    
    if not existing_user.is_verified:
        raise HTTPException(status_code=401, detail="User is not verified. Please complete OTP verification")
    
    is_verified = verify_pass(data.password,existing_user.password)
    
    if is_verified:
        token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)
        response.set_cookie(
        key="access_token",
        value=token,
        max_age=ACCESS_TOKEN_EXPIRES_MINS*60, # in seconds
        httponly=True,
        secure=False,
        samesite="Lax"
        )
        print(response.headers)
        return {    
            "message": "User signed in successfully",
            "email": data.email,
            "token": token
        }
    else:
        return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/reset-password",response_model=None)
async def reset_password(email : EmailStr):
    user_data = check_user_present(email)
    print(user_data)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        otp = str(uuid4().int)[:6]
        store_otp(email,otp)
        send_otp_email(email, otp)
        return {
            "message": "OTP Sent Successfully",
            "status_code":status.HTTP_200_OK
        }

@router.put("/reset-password/verify")
async def reset_password(
    data: ResetPasswordRequest
):

    entered_otp:str = data.entered_otp
    newPassword:str = data.new_password
    email:str = data.email
    userData = check_user_present(email)
    if not userData:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="No User Exists With This Email")
    else:
        if not verify_otp(email,entered_otp):  
            raise HTTPException(status_code=400, detail="Incorrect or expired OTP")
        if not re.fullmatch(PASSWORD_REGEX, newPassword):
            raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")

        hashedPassword = hashPass(newPassword)
        try:
            db.table("users").update({"password": hashedPassword}).eq("email", email).execute()
            return{
                "message" : "Password Updated Successfully",
                "status_code":status.HTTP_200_OK
            }
        except:
            raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT,detail="Error Ocurred While Updating Password")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {
        "message": "User logged out successfully"
    }


@router.post("/refresh-token")
async def refresh_token(response: Response, refresh_token : str = Cookie(None)):
    """Refresh access token using a valid refresh token."""
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login In Or Create Account")

    try:
        decoded_token = decode_token(refresh_token)
        existing_user = CreateOtpType(
            email = decoded_token["email"],
            id = decoded_token["id"]                         )
        # user_exists = check_user_present(email)
        # if not user_exists:
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="User Not Exists With This Email")
        # else:
        # existing_user = UserInDB(**user_exists[0])
        # Generate a new access token
        new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)

        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS,
            httponly=True,
            secure=True,
            samesite="Lax"
        )

        return {
            "message" : "Access Token Refreshed"
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
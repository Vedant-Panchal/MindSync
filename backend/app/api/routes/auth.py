from jose import jwt, JWTError
from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from uuid import uuid4
from datetime import datetime, timezone
from pydantic import EmailStr
from app.core.config import ACCESS_TOKEN_EXPIRES_MINS, GOOGLE_URI, REFRESH_TOKEN_EXPIRES_DAYS, ACCESS_TOKEN_EXPIRES_MINS
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import UserInDB, create_user, VerifyUser, ResetPasswordRequest, CreateOtpType
from app.db.schemas.user import SignUpType
from app.services.auth import hashPass, create_token, verify_pass, decode_token
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import verify_otp
from app.utils.utils import check_user_present
from app.utils.otp_utils import store_otp
from loguru import logger
from starlette.responses import RedirectResponse
from app.services.google_oauth import oauth, get_google_user

router = APIRouter()

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

@router.post("/sign-up")
async def sign_up(response: Response, data: SignUpType):
    try:
        logger.info("Attempting to sign up user with email: {}", data.email)
        # existing_user: SupabaseResponse = db.table("users").select("*").eq("email", data.email).execute()
        existing_user = check_user_present(data.email)
        
        if existing_user:
            logger.warning("User already exists with email: {}", data.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User already exists"
            )
        otp: str = str(uuid4().int)[:6]
        send_otp_email(data.email, otp)
        store_otp(data.email, otp)
        logger.success("OTP sent successfully to email: {}", data.email)
        return {
            "message": "OTP Sent Successfully",
        }
        
    except Exception as e:
        logger.error("Database query failed: {}", str(e))
        raise e

@router.post("/verify-otp")
async def verify(response: Response, data: create_user):
    email = data.email
    password = data.password
    logger.info("Attempting to verify user with email: {}", data.email)
    if not re.fullmatch(PASSWORD_REGEX, password):
        logger.warning("Password does not meet criteria for email: {}", email)
        raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    try:
        verify_otp(email, data.otp)
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
            id=id
        )
        access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 2)
        db.table("users").insert(jsonable_encoder(user)).execute()
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS,  # in seconds
            httponly=True,
            secure=True,
            samesite="Lax"
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRES_DAYS,  # Convert days to seconds
            httponly=True,
            secure=True,
            samesite="Strict"
        )
        logger.success("User created successfully with email: {}", email)
        return {
            "message": "User created successfully."
        }
    except ValueError as ve:
        logger.error("Value error during OTP verification: {}", str(ve))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.critical("Unexpected error during OTP verification: {}", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )

@router.post("/sign-in")
async def signIn(response: Response, data: VerifyUser):
    user = check_user_present(data.email)
    password: str = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
        logger.warning("Password does not meet criteria for email: {}", data.email)
        raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")
    if not user:
        logger.warning("No email exists with this user: {}", data.email)
        raise HTTPException(status_code=400, detail="No email exists with this user")

    existing_user = UserInDB(**user[0])
    
    if not existing_user.is_verified:
        logger.warning("User is not verified for email: {}", data.email)
        raise HTTPException(status_code=401, detail="User is not verified. Please complete OTP verification")
    
    is_verified = verify_pass(data.password, existing_user.password)
    
    if is_verified:
        access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS * 3)
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS * 60,  # in seconds
            httponly=True,
            secure=False,
            samesite="Lax"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS * 3 * 60,  # Convert days to seconds
            httponly=True,
            secure=True,
            samesite="Strict"
        )
        logger.success("User signed in successfully with email: {}", data.email)
        return {
            "message": "User signed in successfully"
        }
    else:
        logger.warning("Incorrect password for email: {}", data.email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect Password")

@router.post("/reset-password", response_model=None)
async def reset_password(email: EmailStr):
    user_data = check_user_present(email)
    if not user_data:
        logger.warning("No user exists with this email: {}", email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No User Exists With This Email")
    else:
        otp = str(uuid4().int)[:6]
        store_otp(email, otp)
        send_otp_email(email, otp)
        logger.success("OTP sent successfully to email: {}", email)
        return {
            "message": "OTP Sent Successfully",
        }

@router.put("/reset-password/verify")
async def reset_password(data: ResetPasswordRequest):
    entered_otp: str = data.entered_otp
    newPassword: str = data.new_password
    email: str = data.email
    userData = check_user_present(email)
    if not userData:
        logger.warning("No user exists with this email: {}", email)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No User Exists With This Email")
    else:
        try:
            if not verify_otp(email, entered_otp):
                logger.warning("Incorrect or expired OTP for email: {}", email)
                raise HTTPException(status_code=400, detail="Incorrect or expired OTP")
            if not re.fullmatch(PASSWORD_REGEX, newPassword):
                logger.warning("Password does not meet criteria for email: {}", email)
                raise HTTPException(status_code=400, detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.")

            hashedPassword = hashPass(newPassword)
            try:
                db.table("users").update({"password": hashedPassword}).eq("email", email).execute()
                logger.success("Password updated successfully for email: {}", email)
                return {
                    "message": "Password Updated Successfully",
                    "status_code": status.HTTP_200_OK
                }
            except Exception as e:
                logger.error("Error occurred while updating password for email: {}", email)
                raise HTTPException(status_code=status.HTTP_408_REQUEST_TIMEOUT, detail="Error Occurred While Updating Password")
        except ValueError as ve:
            logger.error("Value error during OTP verification: {}", str(ve))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    logger.success("User logged out successfully")
    return {
        "message": "User logged out successfully"
    }

@router.post("/refresh-token")
async def refresh_token(response: Response, refresh_token: str = Cookie(None)):
    """Refresh access token using a valid refresh token."""
    if not refresh_token:
        logger.warning("No refresh token provided")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login In Or Create Account")

    try:
        decoded_token = decode_token(refresh_token)
        existing_user = CreateOtpType(
            email=decoded_token["email"],
            id=decoded_token["id"]
        )
        new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS,
            httponly=True,
            secure=True,
            samesite="Lax"
        )
        logger.success("Access token refreshed successfully for email: {}", decoded_token["email"])
        return {
            "message": "Access Token Refreshed"
        }

    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token expired")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    except JWTError:
        logger.warning("Invalid refresh token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
# @router.get("/google/login")
# async def google_login(request: Request):
#     """Redirect user to Google's OAuth login page"""
#     try:
#         logger.info("Redirecting user to Google's OAuth login page")
#         return await oauth.google.authorize_redirect(request, GOOGLE_URI)
#     except Exception as e:
#         logger.error("Error during Google login redirect: {}", str(e))
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during Google login redirect")

# @router.get("/google/callback")
# async def google_callback(request: Request):
#     """Handle Google OAuth callback and authenticate user"""
#     try:
#         google_user = await get_google_user(request)
#         email = google_user.get("email")
#         name = google_user.get("name")

#         existing_user = db.table("users").select("*").eq("email", email).execute()

#         if not existing_user.data:
#             user_id = str(uuid4())
#             new_user = UserInDB(
#                 id=user_id,
#                 email=email,
#                 username=name,
#                 password=None,
#                 created_at=datetime.now(timezone.utc),
#                 updated_at=datetime.now(timezone.utc),
#                 is_verified=True,
#             )
#             userData = CreateOtpType(
#                 email=email,
#                 id=user_id
#             )
#             access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
#             refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 2)
#             db.table("users").insert(jsonable_encoder(new_user)).execute()
#             logger.success("New user created successfully with email: {}", email)
#         else:
#             userData = CreateOtpType(
#                 email=email,
#                 id=existing_user.data[0]["id"]
#             )
#             access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
#             refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 2)
#             logger.info("Existing user authenticated successfully with email: {}", email)

#         response = RedirectResponse(url="http://localhost:3000/dashboard")  # Change to your frontend URL
#         response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="Lax")
#         response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="Strict")

#         return response
#     except Exception as e:
#         logger.error("Error during Google OAuth callback: {}", str(e))
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during Google OAuth callback")
@router.get("/google/login")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_URI)

@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        google_user = await get_google_user(request)
        email = google_user.get("email")
        name = google_user.get("name")

        existing_user = db.table("users").select("*").eq("email", email).execute()

        if not existing_user.data:
            user_id = str(uuid4())
            new_user = UserInDB(
                id=user_id,
                email=email,
                username=name,
                password=None,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                is_verified=True,
            )
            userData = CreateOtpType(email=email, id=user_id)
            access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
            refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 2)
            db.table("users").insert(jsonable_encoder(new_user)).execute()
        else:
            userData = CreateOtpType(email=email, id=existing_user.data[0]["id"])
            access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
            refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 2)

        response = RedirectResponse(url="http://localhost:3000/dashboard")
        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="Lax")
        response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="Strict")

        return response
    except Exception as e:
        logger.error("Error during Google OAuth callback: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during Google OAuth callback")

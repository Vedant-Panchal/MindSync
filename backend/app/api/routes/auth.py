from email import message
from jose import jwt, JWTError
from fastapi import APIRouter, Cookie, Request, Response, status
from uuid import uuid4
from datetime import datetime, timezone
from pydantic import EmailStr
import requests
from app.core.config import (
    ACCESS_TOKEN_EXPIRES_MINS,
    GOOGLE_CLIENT_ID,
    GOOGLE_URI,
    REFRESH_TOKEN_EXPIRES_DAYS,
    ACCESS_TOKEN_EXPIRES_MINS,
)
from fastapi.encoders import jsonable_encoder
from app.core.connection import db
import re
from app.db.schemas.user import (
    UserInDB,
    create_user,
    VerifyUser,
    ResetPasswordRequest,
    CreateOtpType,
)
from app.db.schemas.user import SignUpType
from app.services.auth import hashPass, create_token, verify_pass, decode_token
from app.db.schemas.supabase import SupabaseResponse
from app.utils.email import send_otp_email
from app.utils.otp_utils import verify_otp
from app.utils.utils import get_user_by_email
from app.utils.otp_utils import store_otp
from loguru import logger
from starlette.responses import RedirectResponse
from app.services.google_oauth import GOOGLE_JWKS_URL, oauth
from app.models.auth import OAuthType
from app.core.exceptions import APIException
from app.core.config import ENVIRONMENT

router = APIRouter()

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"


@router.get("/me")
async def get_me(request: Request):
    return request.state.user  # User is already set by middleware


@router.post("/sign-up")
async def sign_up(data: SignUpType):
    try:
        logger.info("Attempting to sign up user with email: {}", data.email)
        existing_user = get_user_by_email(data.email)

        if existing_user:
            logger.warning("User already exists with email: {}", data.email)
            raise APIException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="User already exists",
                detail="User already exists with this email",
                hint="Please sign in or reset your password",
            )
        otp: str = str(uuid4().int)[:6]
        send_otp_email(data.email, otp)
        store_otp(data.email, otp)
        logger.success("OTP sent successfully to email: {}", data.email)
        return {
            "message": "OTP Sent Successfully",
        }

    except APIException as e:
        raise e


@router.post("/verify-otp")
async def verify(response: Response, data: create_user):
    email = data.email
    password = data.password
    username = data.username
    logger.info("Attempting to verify user with email: {}", data.email)
    if not re.fullmatch(PASSWORD_REGEX, password):
        logger.warning("Password does not meet criteria for email: {}", email)
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Password does not meet criteria",
            detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.",
            hint="Please try again",
        )
    try:
        verify_otp(email, data.otp)
        hash_password = hashPass(data.password)
        id = str(uuid4())
        user = UserInDB(
            id=id,
            email=email,
            username=data.username,
            password=hash_password,
            oauth_id=None,
            oauth_provider=OAuthType.local.value,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            is_verified=True,
        )
        userData = CreateOtpType(email=email, id=id, username=username)
        access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60)
        db.table("users").insert(jsonable_encoder(user)).execute()

        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS * 60,  # convert mins to seconds
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRES_DAYS
            * 24
            * 60
            * 60,  # Convert days to seconds
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        logger.success("User created successfully with email: {}", email)
        return {"message": "User created successfully."}
    except ValueError as ve:
        logger.error("Value error during OTP verification: {}", str(ve))
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Error during OTP verification",
            detail=str(ve),
        )
    except Exception as e:
        logger.critical("Unexpected error during OTP verification: {}", str(e))
        raise APIException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An unexpected error occurred",
            detail="An unexpected error occurred. Please try again.",
        )


@router.post("/sign-in")
async def signIn(response: Response, data: VerifyUser):
    user = get_user_by_email(data.email)
    password: str = data.password
    if not re.fullmatch(PASSWORD_REGEX, password):
        logger.warning("Password does not meet criteria for email: {}", data.email)
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Password does not meet criteria",
            detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.",
            hint="Please try again",
        )
    if not user:
        logger.warning("No email exists with this user: {}", data.email)
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            message="No email exists with this user",
            detail="No user found with this email",
            hint="Please sign up or check your email",
        )
    elif user[0].get("oauth_provider") != OAuthType.local.value:
        logger.warning(
            "User with email: {} is not registered with email or password",
            user[0].get("email"),
        )
        raise APIException(
            status_code=status.HTTP_409_CONFLICT,
            message="User is not registered with email/password",
            detail="User is registered with a different method",
            hint="Please use the correct login method",
        )
    existing_user = UserInDB(**user[0])

    if not existing_user.is_verified:
        logger.warning("User is not verified for email: {}", data.email)
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="User is not verified",
            detail="Please complete OTP verification",
            hint="Please verify your email",
        )

    is_verified = verify_pass(data.password, existing_user.password)

    if is_verified:
        userData = CreateOtpType(
            email=existing_user.email,
            id=existing_user.id,
            username=existing_user.username,
        )
        access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(userData, REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60)
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS * 60,  # in seconds
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRES_DAYS
            * 24
            * 60
            * 60,  # Convert days to seconds
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        logger.success("User signed in successfully with email: {}", data.email)
        return {"message": "User signed in successfully"}
    else:
        logger.warning("Incorrect password for email: {}", data.email)
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Incorrect Password",
            detail="The password you entered is incorrect",
            hint="Please try again",
        )


@router.post("/reset-password")
async def reset_password(email: EmailStr):
    user_data = get_user_by_email(email)
    if not user_data:
        logger.warning("No user exists with this email: {}", email)
        raise APIException(
            status_code=status.HTTP_409_CONFLICT,
            message="No user exists with this email",
            hint="Please sign up.",
        )
    elif user_data[0].get("oauth_provider") != OAuthType.local.value:
        logger.warning(
            "User with email: {} is not registered with email or password", email
        )
        raise APIException(
            status_code=status.HTTP_409_CONFLICT,
            message="User is not registered with email/password",
            detail="User is registered with a different method",
            hint="Please use the correct login method",
        )
    else:
        otp = str(uuid4().int)[:6]
        store_otp(email, otp)
        send_otp_email(email, otp)
        logger.success("OTP sent successfully to email: {}", email)
        return {
            "message": "OTP Sent Successfully",
        }


@router.put("/reset-password/verify")
async def reset_password_verify(data: ResetPasswordRequest):
    entered_otp: str = data.entered_otp
    newPassword: str = data.new_password
    email: str = data.email
    userData = get_user_by_email(email)
    if not userData:
        logger.warning("No user exists with this email: {}", email)
        raise APIException(
            status_code=status.HTTP_409_CONFLICT,
            message="No user exists with this email",
            hint="Please sign up",
        )
    else:
        try:
            if not verify_otp(email, entered_otp):
                logger.warning("Incorrect or expired OTP for email: {}", email)
                raise APIException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="Incorrect or expired OTP",
                    detail="The OTP you entered is incorrect or has expired",
                    hint="Please request a new OTP",
                )
            if not re.fullmatch(PASSWORD_REGEX, newPassword):
                logger.warning("Password does not meet criteria for email: {}", email)
                raise APIException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="Password does not meet criteria",
                    detail="Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be at least 8 characters long.",
                    hint="Please try again",
                )

            hashedPassword = hashPass(newPassword)
            try:
                db.table("users").update({"password": hashedPassword}).eq(
                    "email", email
                ).execute()
                logger.success("Password updated successfully for email: {}", email)
                return {
                    "message": "Password Updated Successfully",
                }
            except Exception as e:
                logger.error(
                    "Error occurred while updating password for email: {}", email
                )
                raise APIException(
                    status_code=status.HTTP_408_REQUEST_TIMEOUT,
                    message="Error occurred while updating password",
                    detail="There was an error while updating the password. Please try again.",
                )
        except ValueError as ve:
            logger.error("Value error during OTP verification: {}", str(ve))
            raise APIException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Error during OTP verification",
                detail=str(ve),
            )


@router.post("/logout")
async def logout(response: Response):
    cookie_args = {
        "path": "/",
        "secure": True,
        "samesite": "None",
    }

    response.delete_cookie("access_token", **cookie_args)
    response.delete_cookie("refresh_token", **cookie_args)
    logger.success("User logged out successfully")
    return {"message": "User logged out successfully"}


@router.post("/refresh-token")
async def refresh_token(response: Response, refresh_token: str = Cookie(None)):

    if not refresh_token:
        logger.warning("No refresh token provided")
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Login In Or Create Account",
            detail="No refresh token provided",
        )

    try:
        decoded_token = decode_token(refresh_token)
        existing_user = CreateOtpType(
            email=decoded_token["email"],
            id=decoded_token["id"],
            username=decoded_token["username"],
        )
        new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=ACCESS_TOKEN_EXPIRES_MINS,
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        logger.success(
            "Access token refreshed successfully for email: {}", decoded_token["email"]
        )
        return {"message": "Access Token Refreshed"}

    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token expired")
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Refresh token expired",
            detail="The refresh token has expired",
            hint="Please log in again",
        )
    except JWTError:
        logger.warning("Invalid refresh token")
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid refresh token",
            detail="The refresh token is invalid",
            hint="Please log in again",
        )


@router.get("/google/login")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_URI)


@router.get("/google/callback")
async def google_callback(request: Request):
    token: dict = await oauth.google.authorize_access_token(request)
    id_token = token.get("id_token")
    access_token = token.get("access_token")
    try:
        if not id_token or not access_token:
            raise APIException(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Missing tokens",
                detail="ID token or access token is missing",
            )
        user_info = jwt.decode(
            id_token,
            requests.get(GOOGLE_JWKS_URL).json(),
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID,
            access_token=access_token,
        )
        email = user_info.get("email")
        name: message.Any | None = user_info.get("name")
        google_id = user_info.get("sub")

        user_id = str(uuid4())
        existing_user = get_user_by_email(email)
        if existing_user:
            user = existing_user[0]
            # If the existing user was created via email/password, prevent duplicate Google login
            if user.get("oauth_provider") == OAuthType.local.value:
                response = RedirectResponse(
                    url="https://mindsyncc.vercel.app/signin?status=error&message=Email%20already%20registered%20with%20email%20and%20password"
                )
                return response
        else:
            new_user = UserInDB(
                id=user_id,
                email=email,
                username=name,
                password=None,
                oauth_provider=OAuthType.google.value,
                oauth_id=google_id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                is_verified=True,
            )
            db.table("users").insert(jsonable_encoder(new_user)).execute()
        userData = CreateOtpType(email=email, id=user_id, username=name)
        access_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS)
        refresh_token = create_token(userData, ACCESS_TOKEN_EXPIRES_MINS * 2)

        # Set cookies for tokens
        response = RedirectResponse(url="https://c.vercel.app/app/dashboard/")
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=True if ENVIRONMENT == "production" else False,
            samesite="None",
        )
        return response
    except APIException as e:
        print(e)
        logger.error("Error occurred during Google OAuth callback: {}", str(e))
        raise e

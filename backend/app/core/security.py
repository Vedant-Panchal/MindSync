from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException, Request, Response, status
from jose import JWTError
from app.core.config import ACCESS_TOKEN_EXPIRES_MINS, ENVIRONMENT
from app.services.auth import decode_token, create_token
from app.db.schemas.user import CreateOtpType
from app.core.exceptions import APIException
import json


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.excluded_paths = {
            "/api/auth/v1/login",
            "/api/auth/v1/sign-in",
            "/api/auth/v1/sign-up",
            "/api/auth/v1/reset-password",
            "/api/auth/v1/reset-password/verify",
            "/api/auth/v1/verify-otp",
            "/heartbeat",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/auth/v1/google/login",
            "/api/auth/v1/google/callback",
        }  # Public routes

    # print("IN Security")
    async def dispatch(self, request: Request, call_next):
        if ENVIRONMENT == "production":
            secure = True
        else:
            secure = False
        try:
            # Skip ALL OPTIONS requests to let CORSMiddleware handle them
            if request.method == "OPTIONS":
                return await call_next(request)
            if request.url.path in self.excluded_paths:
                return await call_next(request)

            access_token = request.cookies.get("access_token")
            refresh_token = request.cookies.get("refresh_token")

            if not access_token:
                logger.error("Access token not found")
                if not refresh_token:
                    logger.error("Refresh token not found")
                    raise APIException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Unauthorized",
                        message="Login Required",
                        hint="Please login to access this resource",
                    )
                try:
                    # Decode refresh token & generate new access token
                    decoded_token = decode_token(refresh_token)
                    existing_user = CreateOtpType(**decoded_token)
                    new_access_token = create_token(
                        existing_user, ACCESS_TOKEN_EXPIRES_MINS
                    )

                    # Store user in request state
                    request.state.user = decode_token(new_access_token)

                    response = await call_next(request)
                    response.set_cookie(
                        key="access_token",
                        value=new_access_token,
                        max_age=ACCESS_TOKEN_EXPIRES_MINS * 60,
                        httponly=True,
                        secure=(ENVIRONMENT == "production"),
                        samesite="None",
                    )
                    return response
                except Exception as e:
                    raise APIException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid refresh token",
                        message="Unauthorized",
                        hint="Please login to access this resource",
                    )
            else:
                try:
                    request.state.user = decode_token(access_token)
                    return await call_next(request)
                except JWTError:
                    raise APIException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token",
                        message="The provided access token is invalid or expired",
                        hint="Please login again to obtain a new token",
                    )
        except APIException as e:
            response = Response(
                content=json.dumps(
                    {
                        "status_code": e.status_code,
                        "detail": e.detail,
                        "message": e.message,
                        "hint": e.hint,
                    }
                ),
                status_code=e.status_code,
                media_type="application/json",
            )
            # Ensure CORS headers are included even in error responses
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

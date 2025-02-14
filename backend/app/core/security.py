from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response, HTTPException,status
from jose import JWTError
from app.core.config import ACCESS_TOKEN_EXPIRES_MINS
from app.services.auth import decode_token, create_token
from app.db.schemas.user import CreateOtpType

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.excluded_paths = {
            "/auth/v1/login",
            "/auth/v1/sign-in",
            "/auth/v1/sign-up",
            "/auth/v1/reset-password",
            "/auth/v1/verify-otp",
            "/heartbeat",
            "/docs",
            "/redoc",
            "/openapi.json",
        }  # Public routes

    async def dispatch(self, request: Request, call_next):
        try:
            if request.url.path in self.excluded_paths:
                return await call_next(request)

            access_token = request.cookies.get("access_token")
            refresh_token = request.cookies.get("refresh_token")

            if not access_token:
                print("No Access Token Found")
                if not refresh_token:
                    raise HTTPException(status_code=401, detail="Login Required")

                try:
                    # Decode refresh token & generate new access token
                    decoded_token = decode_token(refresh_token)
                    existing_user = CreateOtpType(**decoded_token)
                    new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)

                    # Store user in request state
                    request.state.user = decode_token(new_access_token)
                    print(f"New Access Token Created: {new_access_token}")

                    response = await call_next(request)
                    response.set_cookie(
                        key="access_token",
                        value=new_access_token,
                        max_age=ACCESS_TOKEN_EXPIRES_MINS,
                        httponly=True,
                        secure=True,
                        samesite="Lax"
                    )
                    return response
                except Exception as e:
                    print(f" Refresh Token Error: {str(e)}")
                    raise HTTPException(status_code=401, detail="Invalid refresh token")

            else:
                try:
                    request.state.user = decode_token(access_token)
                    return await call_next(request)
                except JWTError:
                    raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

        except HTTPException as e:
            return Response(content=f'{{"detail": "{e.detail}"}}', status_code=e.status_code)  

        except Exception as e:
            print(f"Internal Server Error: {str(e)}")  # Debugging
            return Response(content=f'{{"detail": "Internal Server Error: {str(e)}"}}', status_code=500)
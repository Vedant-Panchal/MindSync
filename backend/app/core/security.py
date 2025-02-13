# from fastapi import FastAPI, Request, Response, HTTPException
# from fastapi.middleware import Middleware
# from jose import JWTError
# from app.core.config import JWT_SECRET, JWT_ALGO, ACCESS_TOKEN_EXPIRES_MINS
# from app.services.auth import decode_token, create_token
# from app.db.schemas.user import CreateOtpType

# async def auth_middleware(request: Request):
#     """
#     Middleware to authenticate users via JWT stored in cookies.
#     Returns the decoded payload instead of calling call_next.
#     """
#     access_token: str | None = request.cookies.get("access_token")
#     refresh_token: str | None = request.cookies.get("refresh_token")

#     if not access_token:
#         print("NO Access Token")
#         if not refresh_token:
#             raise HTTPException(status_code=401, detail="Login Required")
#         else:
#             decoded_token = decode_token(refresh_token)
#             existing_user = CreateOtpType(**decoded_token)
            
#             # Generate a new access token
#             new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)

#             # Set new access token cookie
#             response = Response("New Access Token Issued", status_code=200)
#             response.set_cookie(
#                 key="access_token",
#                 value=new_access_token,
#                 max_age=ACCESS_TOKEN_EXPIRES_MINS,
#                 httponly=True,
#                 secure=True,
#                 samesite="Lax"
#             )

#     try:
#         payload = decode_token(access_token)
#         request.state.user = payload  # ✅ Store payload in request state
#         return payload  # ✅ Return the decoded token payload directly
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

# # Register middleware
# middleware = [Middleware(auth_middleware)]

# app = FastAPI(middleware=middleware)



from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware import Middleware
from jose import JWTError
from app.core.config import JWT_SECRET, JWT_ALGO, ACCESS_TOKEN_EXPIRES_MINS
from app.services.auth import decode_token, create_token
from app.db.schemas.user import CreateOtpType
from starlette.middleware.base import BaseHTTPMiddleware


async def auth_middleware(request: Request,call_next):
    """
    Middleware to authenticate users via JWT stored in cookies.
    """
    access_token: str | None = request.cookies.get("access_token")
    refresh_token: str | None = request.cookies.get("refresh_token")

    if not access_token:
        print("No Access Token")
        if not refresh_token:
            raise HTTPException(status_code=401, detail="Login Required")
        else:
            decoded_token = decode_token(refresh_token)
            existing_user = CreateOtpType(**decoded_token)

            # Generate a new access token
            new_access_token = create_token(existing_user, ACCESS_TOKEN_EXPIRES_MINS)
            payload = decode_token(new_access_token)
            request.state.user = payload
            # Set new access token cookie
            response = await call_next(request)  # Process the request and get the response
            response.set_cookie(
                key="access_token",
                value=new_access_token,
                max_age=ACCESS_TOKEN_EXPIRES_MINS,
                httponly=True,
                secure=True,
                samesite="Lax"
            )
            return response
    else:
        try:
            payload = decode_token(access_token)
            request.state.user = payload  # Store payload in request state
            response = await call_next(request)  # Continue the request processing
            return response
        except JWTError:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")
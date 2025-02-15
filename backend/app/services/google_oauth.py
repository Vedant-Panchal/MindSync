from authlib.integrations.starlette_client import OAuth
from fastapi import Depends, HTTPException
from starlette.requests import Request
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_SECRET_KEY, GOOGLE_URI, JWT_SECRET


# oauth = OAuth()
# oauth.register(
#     name="google",
#     client_id=GOOGLE_CLIENT_ID,
#     client_secret=GOOGLE_SECRET_KEY,
#     authorize_url="https://accounts.google.com/o/oauth2/auth",
#     authorize_params=None,
#     authorize_state=JWT_SECRET,
#     access_token_url="https://oauth2.googleapis.com/token",
#     access_token_params=None,
#     refresh_token_url=None,
#     redirect_uri=GOOGLE_URI,
#     jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
#     client_kwargs={"scope": "openid email profile"},
# )
# async def get_google_user(request: Request):
#     """Fetch the Google user profile from the token"""
#     token = await oauth.google.authorize_access_token(request)
#     user = await oauth.google.parse_id_token(request, token)
#     if not user:
#         raise HTTPException(status_code=400, detail="Google authentication failed")
#     return user



oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_SECRET_KEY,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    access_token_url="https://oauth2.googleapis.com/token",
    redirect_uri=GOOGLE_URI,
    client_kwargs={"scope": "openid email profile"},
)

async def get_google_user(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = await oauth.google.parse_id_token(request, token)
    if not user:
        raise HTTPException(status_code=400, detail="Google authentication failed")
    return user

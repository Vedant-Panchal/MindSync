from authlib.integrations.starlette_client import OAuth
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_SECRET_KEY, GOOGLE_URI, JWT_SECRET

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUER = "https://accounts.google.com"

oauth = OAuth()
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_SECRET_KEY,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"include_granted_scopes": "true"},
    authorize_state=JWT_SECRET,
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    refresh_token_url="https://oauth2.googleapis.com/token",
    redirect_uri=GOOGLE_URI,
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    client_kwargs={
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    },
)

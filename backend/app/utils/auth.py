from fastapi import Response
from app.core.config import (
    ENVIRONMENT,
    ACCESS_TOKEN_EXPIRES_MINS,
    REFRESH_TOKEN_EXPIRES_DAYS,
)


def set_access_token_cookie(response: Response, access_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRES_MINS * 60,  # in seconds
        httponly=True,
        secure=True if ENVIRONMENT == "production" else False,
        samesite="None",
    )


def set_refresh_token_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60,  # days to seconds
        httponly=True,
        secure=True if ENVIRONMENT == "production" else False,
        samesite="None",
    )

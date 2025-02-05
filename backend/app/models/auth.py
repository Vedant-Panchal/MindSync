from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# ----------------------
# Authentication Schemas
# ----------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class OAuth2PasswordRequestForm:
    def __init__(
        self,
        grant_type: str = None,
        username: str = None,
        password: str = None,
        scope: str = "",
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
    ):
        self.grant_type = grant_type
        self.username = username
        self.password = password
        self.scopes = scope.split()
        self.client_id = client_id
        self.client_secret = client_secret
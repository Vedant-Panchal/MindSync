from threading import local
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum
from typing import ClassVar
# ----------------------
# Authentication Schemas
# ----------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


class OAuthType(str, Enum):
    google = "google"
    github = "github"
    local = "local"
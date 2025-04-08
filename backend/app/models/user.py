from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str  # Only used for email/password auth
    oauth_provider: Optional[str] = None  # e.g., "google", "github"


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

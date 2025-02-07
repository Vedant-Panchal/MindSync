from pydantic import BaseModel, EmailStr, Field
from pydantic.types import UUID4
from typing import Optional
from datetime import datetime

class CreateUser(BaseModel):
    email: EmailStr = Field(
        ...,  # Required field
        description="Enter Your Email"
    )
    password: str = Field(
        ...,  # Required field
        min_length=8,
        description="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
    )
    username: str = Field(
        ...,  # Required field
        description="Enter Your User Name"
    )

class UserInDB(BaseModel):
    id: str
    email: EmailStr = Field(
        ...,  
        description="Enter Your Email"
    )
    password: str = Field(
        ...,  
        description="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
    )
    username: str = Field(
        ...,  
        description="Enter Your User Name")
    onboarding_data: Optional[dict] = Field(
        None,
        description="Onboarding Data"
    )
    created_at: datetime
    updated_at: datetime
    is_verified: bool = Field(
        False,
        description="User Verification Status"
    )

class VerifyUser(BaseModel):
    email: EmailStr = Field(
        ...,  
        description="Enter Your Email"
    )
    password: str = Field(
        ...,  
        description="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
    )
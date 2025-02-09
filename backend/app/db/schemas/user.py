from pydantic import BaseModel, EmailStr, Field
from fastapi import Header
from pydantic.types import UUID4
from typing import Annotated, Optional
from datetime import datetime

class create_user(BaseModel):
    password: str = Field(
        ...,  # Required field
        min_length=8,
        description="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
    )
    username: str = Field(
        ...,  # Required field
        description="Enter Your User Name"
    ),
    otp : str = Field(
        ...,
        min_length=6
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
class ResetPasswordRequest(BaseModel):
    entered_otp: str
    new_password: str


class verify_otp_type(BaseModel):
    token : str
    entered_password : str


class verify_otp_response(BaseModel):
    message: str
    email: str
    token: str

class SignUpType(BaseModel):
    email : str
from pydantic import BaseModel, EmailStr, Field
from pydantic.types import UUID4
from typing import Optional
from datetime import datetime
from app.models.auth import OAuthType

class create_user(BaseModel):
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
    username: str = Field(
        ...,  
        description="Enter Your Username")
    password: Optional[str] = Field(
        default=None,  
        description="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
    )
    oauth_provider: Optional[OAuthType] = Field(
        None,
        description="OAuth Provider"
    )
    oauth_id: Optional[str] = Field(
        None,
        description="OAuth ID"
    )
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
    email: EmailStr
    entered_otp: str
    new_password: str


class CreateOtpType(BaseModel):
    username : str
    email : str
    id : str


class verify_otp_response(BaseModel):
    message: str
    email: str
    token: str

class SignUpType(BaseModel):
    email : EmailStr
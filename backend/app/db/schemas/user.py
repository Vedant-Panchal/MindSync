from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime,timezone

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
        description="Enter Your User Name"
    )
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


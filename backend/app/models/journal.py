from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
# ----------------------
# Journal Schemas (CRUD)
# ----------------------

class JournalBase(BaseModel):
    content: str
    is_draft: bool = False

class JournalCreate(JournalBase):
    pass  # Mood will be auto-detected by AI

class JournalUpdate(BaseModel):
    content: Optional[str] = None
    is_draft: Optional[bool] = None

class JournalResponse(JournalBase):
    id: UUID
    user_id: UUID
    mood: Optional[str] = None  # AI-generated
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        orm_mode = True
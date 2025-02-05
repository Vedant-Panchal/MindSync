from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
# ----------------------
# Tag Schemas
# ----------------------

class TagBase(BaseModel):
    tag_type: str  # "mood", "topic", "custom"
    tag_value: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    journal_id: UUID

    class Config:
        orm_mode = True

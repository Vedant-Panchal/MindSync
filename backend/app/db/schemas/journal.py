from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime, date
from typing import Optional, Dict, List


# Draft schema (for Redis storage, YYYY-MM-DD date)
class DraftRequest(BaseModel):
    content: str
    tags: Dict


class DraftCreate(BaseModel):
    content: str
    user_id: UUID
    date: str
    tags: Dict


# Journal schema
class JournalCreate(BaseModel):
    text: str  # Matches 'text' in journals table
    user_id: UUID
    date: str  # YYYY-MM-DD, will be converted to date in Journal


class Journal(BaseModel):
    id: UUID  # Primary Key, NOT NULL
    user_id: UUID  # NOT NULL, Foreign Key to users.id
    text: str  # NOT NULL
    date: date  # date type, NOT NULL
    moods: Optional[Dict] = None  # jsonb, optional
    tags: Dict
    embedding: Optional[List[float]] = (None,)  # vector(768), optional for response
    created_at: datetime


# Journal Section (Chunk) schema
class JournalSectionCreate(BaseModel):
    text: str  # Matches 'text' in journal_sections table
    journal_id: UUID
    section_number: int  # NOT NULL
    moods: Dict  # jsonb, NOT NULL


class JournalSection(BaseModel):
    id: UUID  # Primary Key, NOT NULL
    journal_id: UUID  # NOT NULL, Foreign Key to journals.id
    section_number: int  # NOT NULL
    text: str  # NOT NULL
    moods: Dict  # jsonb, NOT NULL
    embedding: List[float]  # vector(768), optional for response
    created_at: date  # date type, NOT NULL


class ChatbotType(BaseModel):
    query: str

from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime, date
from typing import Optional, Dict, List


class DraftRequest(BaseModel):
    content: str
    tags: list
    title: str


class DraftCreate(BaseModel):
    content: str
    user_id: UUID
    date: str
    tags: list
    title: str


class JournalCreate(BaseModel):
    text: str
    user_id: UUID
    date: str


class Journal(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    date: date
    moods: Optional[Dict] = None
    tags: list
    embedding: Optional[List[float]] = (None,)
    title: str
    title_embedding: list[float]
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

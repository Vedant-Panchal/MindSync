from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime, date
from typing import Optional, Dict, List


class DraftRequest(BaseModel):
    plain_text: str
    tags: List[Dict[str, str]]
    title: str
    rich_text: str

class DraftRequest(BaseModel):
    plain_text: str
    tags: List[Dict[str, str]]
    title: str
    rich_text: str
    journal_date : str



class DraftCreate(BaseModel):
    content: str
    user_id: UUID
    date: str
    tags: list
    title: str
    rich_text: str


class JournalCreate(BaseModel):
    text: str
    user_id: UUID
    date: str


class Journal(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    moods: Optional[Dict] = None
    tags: list
    embedding: Optional[List[float]] = (None,)
    title: str
    title_embedding: list[float]
    created_at: datetime
    rich_text: str


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


class DateRange(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None

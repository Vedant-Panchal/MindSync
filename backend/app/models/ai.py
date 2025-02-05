from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from journal import JournalResponse
# ----------------------
# AI Feature Schemas
# ----------------------

class MoodDetection(BaseModel):
    content: str
    mood: str
    confidence: float

class Summary(BaseModel):
    content: str
    summary_type: str  # "weekly" or "monthly"
    generated_at: datetime

class ChatbotQuery(BaseModel):
    query_text: str  # e.g., "When was I happiest last month?"

class ChatbotResponse(BaseModel):
    answer: str
    entries: List[JournalResponse]
    mood_trend: Optional[List[dict]] = None

class VectorSearchRequest(BaseModel):
    query: str
    top_k: int = 5

class VectorSearchResult(BaseModel):
    journal_id: UUID
    similarity_score: float
    content_snippet: str
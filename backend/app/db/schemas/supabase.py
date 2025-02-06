from pydantic import BaseModel
from typing import List, Optional


class DataItem(BaseModel):
    id: int
    name: str


class SupabaseResponse(BaseModel):
    data: List[DataItem]
    count: Optional[int] = None

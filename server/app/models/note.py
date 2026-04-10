from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NoteCreate(BaseModel):
    resource_id: str
    video_id: Optional[str] = None
    timestamp_seconds: Optional[int] = None
    content: str


class NoteUpdate(BaseModel):
    content: str


class NoteOut(BaseModel):
    id: str
    user_id: str
    resource_id: str
    video_id: Optional[str] = None
    timestamp_seconds: Optional[int] = None
    content: str
    created_at: datetime
    updated_at: datetime

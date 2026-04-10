from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LabelCreate(BaseModel):
    name: str
    color: str = "#6B6B66"


class LabelUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class LabelOut(BaseModel):
    id: str
    user_id: str
    name: str
    color: str
    created_at: datetime

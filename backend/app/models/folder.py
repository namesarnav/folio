from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FolderCreate(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class FolderOut(BaseModel):
    id: str
    user_id: str
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    created_at: datetime

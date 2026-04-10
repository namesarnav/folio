from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ResourceType(str, Enum):
    youtube_playlist = "youtube_playlist"
    external_course = "external_course"
    pdf = "pdf"
    book = "book"
    paper = "paper"


class ResourceStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    paused = "paused"
    completed = "completed"
    dropped = "dropped"


class VideoItem(BaseModel):
    video_id: str
    title: str
    duration_seconds: int = 0
    thumbnail_url: str = ""
    section: Optional[str] = None
    completed: bool = False
    order: int = 0


class ResourceCreate(BaseModel):
    resource_type: ResourceType
    title: str
    description: Optional[str] = None
    folder_id: Optional[str] = None
    label_ids: List[str] = []
    status: ResourceStatus = ResourceStatus.not_started
    thumbnail_url: Optional[str] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None

    # external_course fields
    platform: Optional[str] = None
    estimated_hours: Optional[float] = None

    # book fields
    author: Optional[str] = None
    isbn: Optional[str] = None
    total_pages: Optional[int] = None
    current_page: Optional[int] = None

    # paper fields
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None


class VideoTitleUpdate(BaseModel):
    video_id: str
    title: str


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    folder_id: Optional[str] = None
    label_ids: Optional[List[str]] = None
    status: Optional[ResourceStatus] = None
    thumbnail_url: Optional[str] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[float] = None
    video_title_updates: Optional[List[VideoTitleUpdate]] = None

    # book
    current_page: Optional[int] = None
    total_pages: Optional[int] = None

    # external_course
    platform: Optional[str] = None
    estimated_hours: Optional[float] = None

    # paper
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None


class ResourceOut(BaseModel):
    id: str
    user_id: str
    resource_type: ResourceType
    title: str
    description: Optional[str] = None
    folder_id: Optional[str] = None
    label_ids: List[str] = []
    status: ResourceStatus
    progress: float = 0.0
    thumbnail_url: Optional[str] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # youtube_playlist
    playlist_id: Optional[str] = None
    channel_name: Optional[str] = None
    total_videos: Optional[int] = None
    total_duration_seconds: Optional[int] = None
    videos: Optional[List[VideoItem]] = None

    # external_course
    platform: Optional[str] = None
    estimated_hours: Optional[float] = None

    # book
    author: Optional[str] = None
    isbn: Optional[str] = None
    total_pages: Optional[int] = None
    current_page: Optional[int] = None

    # paper
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    r2_key: Optional[str] = None

    # pdf
    file_size_bytes: Optional[int] = None
    last_page_read: Optional[int] = None

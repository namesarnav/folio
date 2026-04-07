import re
from datetime import datetime, timezone

import httpx
import isodate
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.db.collections import RESOURCES
from app.db.mongo import get_db
from app.models.resource import ResourceOut, ResourceStatus, ResourceType
from app.api.v1.routes.resources import _resource_out, _compute_progress

router = APIRouter(prefix="/playlists", tags=["playlists"])

PLAYLIST_URL_RE = re.compile(r"(?:list=)([A-Za-z0-9_-]+)")
YT_API_BASE = "https://www.googleapis.com/youtube/v3"


def _extract_playlist_id(url_or_id: str) -> str:
    match = PLAYLIST_URL_RE.search(url_or_id)
    if match:
        return match.group(1)
    # Assume it's a raw playlist ID
    if re.match(r"^[A-Za-z0-9_-]+$", url_or_id):
        return url_or_id
    raise ValueError("Cannot extract playlist ID")


def _parse_duration(iso: str) -> int:
    try:
        return int(isodate.parse_duration(iso).total_seconds())
    except Exception:
        return 0


async def _fetch_all_playlist_items(playlist_id: str, api_key: str) -> list[dict]:
    items = []
    params = {
        "part": "snippet,contentDetails",
        "playlistId": playlist_id,
        "maxResults": 50,
        "key": api_key,
    }
    async with httpx.AsyncClient() as client:
        while True:
            resp = await client.get(f"{YT_API_BASE}/playlistItems", params=params)
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="YouTube API error")
            data = resp.json()
            items.extend(data.get("items", []))
            next_page = data.get("nextPageToken")
            if not next_page:
                break
            params["pageToken"] = next_page
    return items


async def _fetch_video_durations(video_ids: list[str], api_key: str) -> dict[str, int]:
    durations = {}
    async with httpx.AsyncClient() as client:
        for i in range(0, len(video_ids), 50):
            batch = video_ids[i : i + 50]
            resp = await client.get(
                f"{YT_API_BASE}/videos",
                params={"part": "contentDetails", "id": ",".join(batch), "key": api_key},
            )
            if resp.status_code != 200:
                continue
            for item in resp.json().get("items", []):
                vid_id = item["id"]
                iso = item["contentDetails"]["duration"]
                durations[vid_id] = _parse_duration(iso)
    return durations


class PlaylistImportBody(BaseModel):
    url: str
    folder_id: str | None = None
    label_ids: list[str] = []


@router.post("/import", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def import_playlist(body: PlaylistImportBody, user_id: str = Depends(get_current_user_id)):
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(status_code=503, detail="YouTube API key not configured")

    try:
        playlist_id = _extract_playlist_id(body.url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid playlist URL or ID")

    db = get_db()
    # Check if already imported by this user
    existing = await db[RESOURCES].find_one(
        {"user_id": ObjectId(user_id), "playlist_id": playlist_id}
    )
    if existing:
        return _resource_out(existing)

    items = await _fetch_all_playlist_items(playlist_id, settings.YOUTUBE_API_KEY)
    if not items:
        raise HTTPException(status_code=404, detail="Playlist not found or empty")

    video_ids = [
        item["contentDetails"]["videoId"]
        for item in items
        if item.get("contentDetails", {}).get("videoId")
    ]
    durations = await _fetch_video_durations(video_ids, settings.YOUTUBE_API_KEY)

    videos = []
    for order, item in enumerate(items):
        snip = item.get("snippet", {})
        vid_id = item.get("contentDetails", {}).get("videoId", "")
        thumb = ""
        thumbs = snip.get("thumbnails", {})
        for size in ("medium", "default", "high"):
            if size in thumbs:
                thumb = thumbs[size]["url"]
                break
        videos.append(
            {
                "video_id": vid_id,
                "title": snip.get("title", ""),
                "duration_seconds": durations.get(vid_id, 0),
                "thumbnail_url": thumb,
                "section": None,
                "completed": False,
                "order": order,
            }
        )

    channel_name = items[0]["snippet"].get("channelTitle", "") if items else ""
    playlist_title = items[0]["snippet"].get("playlistTitle") or items[0]["snippet"].get("title", "Playlist")
    total_duration = sum(v["duration_seconds"] for v in videos)

    # Fetch playlist title separately
    async with httpx.AsyncClient() as client:
        pl_resp = await client.get(
            f"{YT_API_BASE}/playlists",
            params={"part": "snippet", "id": playlist_id, "key": settings.YOUTUBE_API_KEY},
        )
        if pl_resp.status_code == 200:
            pl_items = pl_resp.json().get("items", [])
            if pl_items:
                playlist_title = pl_items[0]["snippet"]["title"]
                channel_name = pl_items[0]["snippet"]["channelTitle"]

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "resource_type": ResourceType.youtube_playlist,
        "title": playlist_title,
        "description": None,
        "folder_id": ObjectId(body.folder_id) if body.folder_id else None,
        "label_ids": [ObjectId(lid) for lid in body.label_ids],
        "status": ResourceStatus.not_started,
        "progress": 0.0,
        "thumbnail_url": videos[0]["thumbnail_url"] if videos else None,
        "source_url": f"https://www.youtube.com/playlist?list={playlist_id}",
        "notes": None,
        "playlist_id": playlist_id,
        "channel_name": channel_name,
        "total_videos": len(videos),
        "total_duration_seconds": total_duration,
        "videos": videos,
        "created_at": now,
        "updated_at": now,
    }
    result = await db[RESOURCES].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _resource_out(doc)


class VideoToggleResponse(ResourceOut):
    pass


@router.patch("/{resource_id}/videos/{video_id}/complete", response_model=ResourceOut)
async def toggle_video_complete(
    resource_id: str, video_id: str, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    doc = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")

    videos = doc.get("videos", [])
    found = False
    for v in videos:
        if v["video_id"] == video_id:
            v["completed"] = not v["completed"]
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Video not found")

    progress = _compute_progress({**doc, "videos": videos})

    # Determine status
    completed_count = sum(1 for v in videos if v["completed"])
    total = len(videos)
    if completed_count == 0:
        new_status = ResourceStatus.not_started
    elif completed_count == total:
        new_status = ResourceStatus.completed
    else:
        new_status = ResourceStatus.in_progress

    updated = await db[RESOURCES].find_one_and_update(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)},
        {
            "$set": {
                "videos": videos,
                "progress": progress,
                "status": new_status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        return_document=True,
    )
    return _resource_out(updated)

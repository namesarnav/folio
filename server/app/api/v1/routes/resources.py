from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user_id
from app.db.collections import RESOURCES
from app.db.mongo import get_db
from app.models.resource import ResourceCreate, ResourceOut, ResourceStatus, ResourceType, ResourceUpdate, VideoItem

router = APIRouter(prefix="/resources", tags=["resources"])


def _resource_out(doc: dict) -> ResourceOut:
    videos = None
    if doc.get("videos"):
        videos = [VideoItem(**v) for v in doc["videos"]]
    return ResourceOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        resource_type=doc["resource_type"],
        title=doc["title"],
        description=doc.get("description"),
        folder_id=str(doc["folder_id"]) if doc.get("folder_id") else None,
        label_ids=[str(lid) for lid in doc.get("label_ids", [])],
        status=doc["status"],
        progress=doc.get("progress", 0.0),
        thumbnail_url=doc.get("thumbnail_url"),
        source_url=doc.get("source_url"),
        notes=doc.get("notes"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        playlist_id=doc.get("playlist_id"),
        channel_name=doc.get("channel_name"),
        total_videos=doc.get("total_videos"),
        total_duration_seconds=doc.get("total_duration_seconds"),
        videos=videos,
        platform=doc.get("platform"),
        estimated_hours=doc.get("estimated_hours"),
        author=doc.get("author"),
        isbn=doc.get("isbn"),
        total_pages=doc.get("total_pages"),
        current_page=doc.get("current_page"),
        authors=doc.get("authors"),
        abstract=doc.get("abstract"),
        venue=doc.get("venue"),
        year=doc.get("year"),
        doi=doc.get("doi"),
        r2_key=doc.get("r2_key"),
        file_size_bytes=doc.get("file_size_bytes"),
        last_page_read=doc.get("last_page_read"),
    )


def _compute_progress(doc: dict) -> float:
    rt = doc.get("resource_type")
    if rt == ResourceType.youtube_playlist:
        total = doc.get("total_videos", 0)
        if not total:
            return 0.0
        completed = sum(1 for v in doc.get("videos", []) if v.get("completed"))
        return completed / total
    elif rt == ResourceType.pdf:
        total = doc.get("total_pages", 0)
        if not total:
            return 0.0
        return min(doc.get("last_page_read", 0) / total, 1.0)
    elif rt == ResourceType.book:
        total = doc.get("total_pages", 0)
        if not total:
            return 0.0
        return min(doc.get("current_page", 0) / total, 1.0)
    return doc.get("progress", 0.0)


@router.get("", response_model=List[ResourceOut])
async def list_resources(
    folder_id: Optional[str] = Query(None),
    label_id: Optional[str] = Query(None),
    status: Optional[ResourceStatus] = Query(None),
    type: Optional[ResourceType] = Query(None),
    search: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    query: dict = {"user_id": ObjectId(user_id)}
    if folder_id:
        query["folder_id"] = ObjectId(folder_id)
    if label_id:
        query["label_ids"] = ObjectId(label_id)
    if status:
        query["status"] = status
    if type:
        query["resource_type"] = type
    if search:
        query["$text"] = {"$search": search}
    docs = await db[RESOURCES].find(query).sort("created_at", -1).to_list(None)
    return [_resource_out(d) for d in docs]


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(body: ResourceCreate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "resource_type": body.resource_type,
        "title": body.title,
        "description": body.description,
        "folder_id": ObjectId(body.folder_id) if body.folder_id else None,
        "label_ids": [ObjectId(lid) for lid in body.label_ids],
        "status": body.status,
        "progress": 0.0,
        "thumbnail_url": body.thumbnail_url,
        "source_url": body.source_url,
        "notes": body.notes,
        "created_at": now,
        "updated_at": now,
    }
    # Subtype-specific fields
    if body.resource_type == ResourceType.external_course:
        doc["platform"] = body.platform
        doc["estimated_hours"] = body.estimated_hours
    elif body.resource_type == ResourceType.book:
        doc["author"] = body.author
        doc["isbn"] = body.isbn
        doc["total_pages"] = body.total_pages or 0
        doc["current_page"] = body.current_page or 0
        doc["progress"] = _compute_progress(doc)
    elif body.resource_type == ResourceType.paper:
        doc["authors"] = body.authors or []
        doc["abstract"] = body.abstract
        doc["venue"] = body.venue
        doc["year"] = body.year
        doc["doi"] = body.doi

    result = await db[RESOURCES].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _resource_out(doc)


@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource(resource_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _resource_out(doc)


@router.patch("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: str, body: ResourceUpdate, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}

    # Handle video title updates separately before building $set
    video_title_updates = updates.pop("video_title_updates", None)

    if "folder_id" in updates and updates["folder_id"]:
        updates["folder_id"] = ObjectId(updates["folder_id"])
    if "label_ids" in updates:
        updates["label_ids"] = [ObjectId(lid) for lid in updates["label_ids"]]
    updates["updated_at"] = datetime.now(timezone.utc)

    # Fetch current doc to recompute progress and apply video title patches
    current = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not current:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Apply video title updates onto the existing videos array
    if video_title_updates:
        title_map = {u["video_id"]: u["title"] for u in video_title_updates}
        patched_videos = [
            {**v, "title": title_map[v["video_id"]]} if v["video_id"] in title_map else v
            for v in current.get("videos", [])
        ]
        updates["videos"] = patched_videos

    merged = {**current, **updates}
    updates["progress"] = _compute_progress(merged)

    result = await db[RESOURCES].find_one_and_update(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)},
        {"$set": updates},
        return_document=True,
    )
    return _resource_out(result)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    result = await db[RESOURCES].delete_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")


@router.patch("/{resource_id}/reorder")
async def reorder_resource(
    resource_id: str,
    body: dict,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    order = body.get("order")
    if order is None:
        raise HTTPException(status_code=400, detail="order field required")
    result = await db[RESOURCES].find_one_and_update(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)},
        {"$set": {"order": order, "updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _resource_out(result)

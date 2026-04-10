from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user_id
from app.db.collections import NOTES
from app.db.mongo import get_db
from app.models.note import NoteCreate, NoteOut, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


def _note_out(doc: dict) -> NoteOut:
    return NoteOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        resource_id=str(doc["resource_id"]),
        video_id=doc.get("video_id"),
        timestamp_seconds=doc.get("timestamp_seconds"),
        content=doc["content"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=List[NoteOut])
async def list_notes(
    resource_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    query: dict = {"user_id": ObjectId(user_id)}
    if resource_id:
        query["resource_id"] = ObjectId(resource_id)
    docs = await db[NOTES].find(query).sort("created_at", 1).to_list(None)
    return [_note_out(d) for d in docs]


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(body: NoteCreate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "resource_id": ObjectId(body.resource_id),
        "video_id": body.video_id,
        "timestamp_seconds": body.timestamp_seconds,
        "content": body.content,
        "created_at": now,
        "updated_at": now,
    }
    result = await db[NOTES].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _note_out(doc)


@router.patch("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: str, body: NoteUpdate, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    result = await db[NOTES].find_one_and_update(
        {"_id": ObjectId(note_id), "user_id": ObjectId(user_id)},
        {"$set": {"content": body.content, "updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")
    return _note_out(result)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    result = await db[NOTES].delete_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(user_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

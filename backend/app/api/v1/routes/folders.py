from datetime import datetime, timezone
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id
from app.db.collections import FOLDERS, RESOURCES
from app.db.mongo import get_db
from app.models.folder import FolderCreate, FolderOut, FolderUpdate
from app.models.resource import ResourceOut

router = APIRouter(prefix="/folders", tags=["folders"])


def _folder_out(doc: dict) -> FolderOut:
    return FolderOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        name=doc["name"],
        color=doc.get("color"),
        icon=doc.get("icon"),
        created_at=doc["created_at"],
    )


@router.get("", response_model=List[FolderOut])
async def list_folders(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    docs = await db[FOLDERS].find({"user_id": ObjectId(user_id)}).to_list(None)
    return [_folder_out(d) for d in docs]


@router.post("", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(body: FolderCreate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = {
        "user_id": ObjectId(user_id),
        "name": body.name,
        "color": body.color,
        "icon": body.icon,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[FOLDERS].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _folder_out(doc)


@router.patch("/{folder_id}", response_model=FolderOut)
async def update_folder(
    folder_id: str, body: FolderUpdate, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db[FOLDERS].find_one_and_update(
        {"_id": ObjectId(folder_id), "user_id": ObjectId(user_id)},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Folder not found")
    return _folder_out(result)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    result = await db[FOLDERS].delete_one(
        {"_id": ObjectId(folder_id), "user_id": ObjectId(user_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    # Resources become uncategorized
    await db[RESOURCES].update_many(
        {"folder_id": ObjectId(folder_id)}, {"$set": {"folder_id": None}}
    )


@router.get("/{folder_id}/resources")
async def get_folder_resources(folder_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    folder = await db[FOLDERS].find_one(
        {"_id": ObjectId(folder_id), "user_id": ObjectId(user_id)}
    )
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    docs = await db[RESOURCES].find(
        {"user_id": ObjectId(user_id), "folder_id": ObjectId(folder_id)}
    ).to_list(None)
    from app.api.v1.routes.resources import _resource_out
    return [_resource_out(d) for d in docs]

from datetime import datetime, timezone
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id
from app.db.collections import LABELS, RESOURCES
from app.db.mongo import get_db
from app.models.label import LabelCreate, LabelOut, LabelUpdate

router = APIRouter(prefix="/labels", tags=["labels"])


def _label_out(doc: dict) -> LabelOut:
    return LabelOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        name=doc["name"],
        color=doc["color"],
        created_at=doc["created_at"],
    )


@router.get("", response_model=List[LabelOut])
async def list_labels(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    docs = await db[LABELS].find({"user_id": ObjectId(user_id)}).to_list(None)
    return [_label_out(d) for d in docs]


@router.post("", response_model=LabelOut, status_code=status.HTTP_201_CREATED)
async def create_label(body: LabelCreate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = {
        "user_id": ObjectId(user_id),
        "name": body.name,
        "color": body.color,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[LABELS].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _label_out(doc)


@router.patch("/{label_id}", response_model=LabelOut)
async def update_label(
    label_id: str, body: LabelUpdate, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db[LABELS].find_one_and_update(
        {"_id": ObjectId(label_id), "user_id": ObjectId(user_id)},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Label not found")
    return _label_out(result)


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(label_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    result = await db[LABELS].delete_one(
        {"_id": ObjectId(label_id), "user_id": ObjectId(user_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Label not found")
    await db[RESOURCES].update_many(
        {"label_ids": ObjectId(label_id)},
        {"$pull": {"label_ids": ObjectId(label_id)}},
    )


@router.get("/{label_id}/resources")
async def get_label_resources(label_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    label = await db[LABELS].find_one(
        {"_id": ObjectId(label_id), "user_id": ObjectId(user_id)}
    )
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    docs = await db[RESOURCES].find(
        {"user_id": ObjectId(user_id), "label_ids": ObjectId(label_id)}
    ).to_list(None)
    from app.api.v1.routes.resources import _resource_out
    return [_resource_out(d) for d in docs]

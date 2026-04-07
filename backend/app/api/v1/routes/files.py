from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.dependencies import get_current_user_id
from app.db.collections import RESOURCES
from app.db.mongo import get_db
from app.models.resource import ResourceOut, ResourceStatus, ResourceType
from app.api.v1.routes.resources import _resource_out
from app.services.r2 import r2_service

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()
    file_size = len(contents)

    r2_key = await r2_service.upload(contents, file.filename, user_id)

    # Try to get page count — skip if PyMuPDF not available
    total_pages = 0
    try:
        import fitz  # PyMuPDF
        pdf_doc = fitz.open(stream=contents, filetype="pdf")
        total_pages = pdf_doc.page_count
        pdf_doc.close()
    except Exception:
        pass

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "resource_type": ResourceType.pdf,
        "title": file.filename.rsplit(".", 1)[0],
        "description": None,
        "folder_id": None,
        "label_ids": [],
        "status": ResourceStatus.not_started,
        "progress": 0.0,
        "thumbnail_url": None,
        "source_url": None,
        "notes": None,
        "r2_key": r2_key,
        "file_size_bytes": file_size,
        "total_pages": total_pages,
        "last_page_read": 0,
        "created_at": now,
        "updated_at": now,
    }
    db = get_db()
    result = await db[RESOURCES].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _resource_out(doc)


@router.get("/{resource_id}/url")
async def get_signed_url(resource_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    r2_key = doc.get("r2_key")
    if not r2_key:
        raise HTTPException(status_code=400, detail="No file associated with this resource")
    url = await r2_service.get_signed_url(r2_key)
    return {"url": url}


class PageUpdate(BaseModel):
    page: int


@router.patch("/{resource_id}/page", response_model=ResourceOut)
async def update_page(
    resource_id: str, body: PageUpdate, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    doc = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")

    total = doc.get("total_pages", 0)
    progress = (body.page / total) if total else 0.0

    updated = await db[RESOURCES].find_one_and_update(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)},
        {
            "$set": {
                "last_page_read": body.page,
                "progress": min(progress, 1.0),
                "updated_at": datetime.now(timezone.utc),
            }
        },
        return_document=True,
    )
    return _resource_out(updated)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(resource_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = await db[RESOURCES].find_one(
        {"_id": ObjectId(resource_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    r2_key = doc.get("r2_key")
    if r2_key:
        await r2_service.delete(r2_key)
    await db[RESOURCES].delete_one({"_id": ObjectId(resource_id)})

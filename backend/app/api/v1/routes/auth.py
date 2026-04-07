from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Cookie, HTTPException, Response, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.collections import USERS
from app.db.mongo import get_db
from app.models.user import TokenPair, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"


def _user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        email=doc["email"],
        created_at=doc["created_at"],
    )


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, response: Response):
    db = get_db()
    if await db[USERS].find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.now(timezone.utc)
    doc = {
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "created_at": now,
    }
    result = await db[USERS].insert_one(doc)
    user_id = str(result.inserted_id)
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    response.set_cookie(
        REFRESH_COOKIE, refresh, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30
    )
    return TokenPair(access_token=access)


@router.post("/login", response_model=TokenPair)
async def login(body: UserLogin, response: Response):
    db = get_db()
    doc = await db[USERS].find_one({"email": body.email})
    if not doc or not verify_password(body.password, doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(doc["_id"])
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    response.set_cookie(
        REFRESH_COOKIE, refresh, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30
    )
    return TokenPair(access_token=access)


@router.post("/refresh", response_model=TokenPair)
async def refresh(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    response.set_cookie(
        REFRESH_COOKIE, new_refresh, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30
    )
    return TokenPair(access_token=access)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE, httponly=True, samesite="lax", secure=False)
    return {"detail": "Logged out"}

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router
from app.core.config import settings
from app.db.collections import RESOURCES, NOTES, USERS
from app.db.mongo import connect_db, close_db, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    db = get_db()
    # Create indexes
    await db[USERS].create_index("email", unique=True)
    await db[RESOURCES].create_index("user_id")
    await db[RESOURCES].create_index("folder_id")
    await db[RESOURCES].create_index("label_ids")
    await db[RESOURCES].create_index("status")
    await db[RESOURCES].create_index("resource_type")
    await db[RESOURCES].create_index(
        [("title", "text"), ("description", "text")],
        name="resources_text_idx",
        default_language="english",
    )
    await db[NOTES].create_index("resource_id")
    await db[NOTES].create_index("user_id")
    yield
    await close_db()


app = FastAPI(title="Folio API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}

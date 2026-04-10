from fastapi import APIRouter

from app.api.v1.routes import auth, folders, labels, resources, playlists, files, notes

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(folders.router)
router.include_router(labels.router)
router.include_router(resources.router)
router.include_router(playlists.router)
router.include_router(files.router)
router.include_router(notes.router)

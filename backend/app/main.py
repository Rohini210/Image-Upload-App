from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".ico", ".heic", ".heif"}

# In-memory store (no database)
images_store: List[dict] = []
_next_id = 0


def _next_image_id() -> int:
    global _next_id
    image_id = _next_id
    _next_id += 1
    return image_id


def _is_image(filename: str) -> bool:
    return Path(filename).suffix.lower() in IMAGE_EXTENSIONS


def _unique_flat_name(original: str, used: set[str]) -> str:
    """Flatten folder paths (folder/sub/file.png) to a safe unique filename."""
    normalized = original.replace("\\", "/")
    flat = normalized.replace("/", "_")
    if not flat or flat in {".", ".."}:
        flat = "unnamed"

    stem = Path(flat).stem or "unnamed"
    suffix = Path(flat).suffix
    candidate = flat
    counter = 1
    while candidate in used:
        candidate = f"{stem}_{counter}{suffix}"
        counter += 1

    used.add(candidate)
    return candidate


@app.get("/home")
def home():
    return {"message": "Welcome to the Upload Files application!"}


@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    saved = []
    skipped = []
    used_names: set[str] = set()

    for file in files:
        if not file.filename:
            skipped.append("(empty filename)")
            continue

        if not _is_image(file.filename):
            skipped.append(file.filename)
            continue

        safe_name = _unique_flat_name(file.filename, used_names)
        dest = os.path.join(UPLOAD_DIR, safe_name)

        with open(dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        entry = {
            "id": _next_image_id(),
            "filename": safe_name,
            "display_name": file.filename.replace("\\", "/"),
            "filepath": f"uploads/{safe_name}",
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        images_store.append(entry)
        saved.append(safe_name)

    return {
        "uploaded": saved,
        "count": len(saved),
        "skipped": len(skipped),
    }


@app.get("/images")
def list_images():
    return images_store

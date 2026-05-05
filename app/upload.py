import os
import uuid
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE_KB = 5120  # ✅ 5MB max

# ✅ Allowed file types by category
ALLOWED_TYPES = {
    "report": ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    "prescription": ["pdf", "jpg", "jpeg", "png"]  # ✅ Prescription types
}

os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_file(file: UploadFile, category: str = "report") -> tuple:
    # ✅ Read file content
    content = await file.read()

    # ✅ Check file size
    file_size_kb = len(content) / 1024
    if file_size_kb > MAX_FILE_SIZE_KB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large! Max size is {MAX_FILE_SIZE_KB}KB (5MB)"
        )

    # ✅ Check file type
    extension = file.filename.split(".")[-1].lower()
    allowed = ALLOWED_TYPES.get(category, ALLOWED_TYPES["report"])
    if extension not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{extension}' not allowed for {category}. "
                   f"Allowed: {allowed}"
        )

    # ✅ Save with unique name
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    return unique_filename, file_size_kb, extension
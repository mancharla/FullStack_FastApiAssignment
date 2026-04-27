import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

# ✅ Create uploads folder if not exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_file(file: UploadFile) -> str:
    # ✅ Generate unique filename
    extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # ✅ Save file to disk
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return unique_filename
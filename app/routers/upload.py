from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.file import PatientFile
from app.schemas.file import FileResponse as FileSchema
from app.upload import save_file
from app.rate_limit import limiter
from app.tasks import log_file_upload
from typing import List
import os

router = APIRouter(prefix="/patients", tags=["Patient Files"])

ALLOWED_TYPES = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]

@router.post("/{patient_id}/upload", response_model=FileSchema)
@limiter.limit("5/minute")
async def upload_file(
    request: Request,
    patient_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # ✅ Check file type
    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {ALLOWED_TYPES}"
        )

    # ✅ Save file
    unique_filename = await save_file(file)

    # ✅ Save to database
    db_file = PatientFile(
        patient_id=patient_id,
        filename=unique_filename,
        original_name=file.filename,
        file_type=extension
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # ✅ Log in background
    background_tasks.add_task(
        log_file_upload,
        patient_id=patient_id,
        filename=file.filename
    )

    return db_file

@router.get("/{patient_id}/files", response_model=List[FileSchema])
@limiter.limit("10/minute")
def get_patient_files(
    request: Request,
    patient_id: int,
    db: Session = Depends(get_db)
):
    files = db.query(PatientFile).filter(
        PatientFile.patient_id == patient_id
    ).all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found")
    return files

@router.get("/{patient_id}/files/{file_id}/download")
@limiter.limit("10/minute")
def download_file(
    request: Request,
    patient_id: int,
    file_id: int,
    db: Session = Depends(get_db)
):
    db_file = db.query(PatientFile).filter(
        PatientFile.id == file_id,
        PatientFile.patient_id == patient_id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join("uploads", db_file.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=file_path,
        filename=db_file.original_name,
        media_type="application/octet-stream"
    )
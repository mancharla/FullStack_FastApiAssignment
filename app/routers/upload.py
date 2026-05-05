from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.file import PatientFile
from app.models.patient import Patient
from app.schemas.file import FileResponse as FileSchema
from app.upload import save_file
from app.rate_limit import limiter
from app.tasks import log_file_upload
from app.utils.response import success_response
from app.utils.dependencies import require_auth
from typing import List, Optional
import os

router = APIRouter(prefix="/patients", tags=["Patient Files"])

# ✅ Upload report
@router.post("/{patient_id}/upload")
@limiter.limit("5/minute")
async def upload_file(
    request: Request,
    patient_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    category: str = "report",  # ✅ report or prescription
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    # ✅ Check patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # ✅ Save file with validation
    unique_filename, file_size_kb, extension = await save_file(
        file, category
    )

    # ✅ Save metadata to database
    db_file = PatientFile(
        patient_id=patient_id,
        filename=unique_filename,
        original_name=file.filename,
        file_type=extension,
        file_size=round(file_size_kb, 2),
        file_category=category,
        uploaded_by=current_user.username
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

    return success_response(
        data=db_file,
        message=f"{category.capitalize()} uploaded successfully"
    )

# ✅ Upload prescription specifically
@router.post("/{patient_id}/upload")
@limiter.limit("5/minute")
async def upload_file(
    request: Request,
    patient_id: int,
    background_tasks: BackgroundTasks,
    category: str = "report",  # ✅ Query param
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    # ✅ Check patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # ✅ Save as prescription
    unique_filename, file_size_kb, extension = await save_file(
        file, "prescription"
    )

    # ✅ Save metadata
    db_file = PatientFile(
        patient_id=patient_id,
        filename=unique_filename,
        original_name=file.filename,
        file_type=extension,
        file_size=round(file_size_kb, 2),
        file_category="prescription",
        uploaded_by=current_user.username
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    background_tasks.add_task(
        log_file_upload,
        patient_id=patient_id,
        filename=file.filename
    )

    return success_response(
        data=db_file,
        message="Prescription uploaded successfully"
    )

# ✅ Get all files for patient
@router.get("/{patient_id}/files")
@limiter.limit("10/minute")
def get_patient_files(
    request: Request,
    patient_id: int,
    category: Optional[str] = None,  # ✅ Filter by category
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    query = db.query(PatientFile).filter(
        PatientFile.patient_id == patient_id
    )
    if category:
        query = query.filter(PatientFile.file_category == category)

    files = query.all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found")

    return success_response(
        data=files,
        message="Files fetched successfully"
    )

# ✅ Download file
@router.get("/{patient_id}/files/{file_id}/download")
@limiter.limit("10/minute")
def download_file(
    request: Request,
    patient_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    db_file = db.query(PatientFile).filter(
        PatientFile.id == file_id,
        PatientFile.patient_id == patient_id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = os.path.join("uploads", db_file.filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found on server"
        )

    return FileResponse(
        path=file_path,
        filename=db_file.original_name,
        media_type="application/octet-stream"
    )

# ✅ Delete file
@router.delete("/{patient_id}/files/{file_id}")
@limiter.limit("5/minute")
def delete_file(
    request: Request,
    patient_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    db_file = db.query(PatientFile).filter(
        PatientFile.id == file_id,
        PatientFile.patient_id == patient_id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    # ✅ Delete from disk
    file_path = os.path.join("uploads", db_file.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # ✅ Delete from database
    db.delete(db_file)
    db.commit()

    return success_response(message="File deleted successfully")
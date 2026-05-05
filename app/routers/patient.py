from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import PatientService
from app.utils.response import success_response, paginated_response
from app.utils.dependencies import require_auth, require_admin
from app.rate_limit import limiter
from typing import Optional

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/")
@limiter.limit("5/minute")
def create_patient(
    request: Request,
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    db_patient = PatientService.create_patient(db, patient)
    return success_response(
        data=db_patient,
        message="Patient created successfully"
    )

@router.get("/")
@limiter.limit("10/minute")
def get_patients(
    request: Request,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    patients, total = PatientService.get_patients(
        db, name, phone, skip, limit, sort_by, order
    )
    return paginated_response(
        data=patients,
        total=total,
        skip=skip,
        limit=limit,
        message="Patients fetched successfully"
    )

@router.get("/{patient_id}")
@limiter.limit("10/minute")
def get_patient(
    request: Request,
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    patient = PatientService.get_patient_by_id(db, patient_id)
    return success_response(
        data=patient,
        message="Patient fetched successfully"
    )

@router.put("/{patient_id}")
@limiter.limit("5/minute")
def update_patient(
    request: Request,
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    db_patient = PatientService.update_patient(db, patient_id, patient)
    return success_response(
        data=db_patient,
        message="Patient updated successfully"
    )

@router.delete("/{patient_id}")
@limiter.limit("5/minute")
def delete_patient(
    request: Request,
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    PatientService.delete_patient(db, patient_id)
    return success_response(message="Patient deleted successfully")
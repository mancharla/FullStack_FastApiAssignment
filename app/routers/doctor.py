from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.services.doctor_service import DoctorService
from app.utils.response import success_response, paginated_response
from app.utils.dependencies import require_admin, require_auth
from app.rate_limit import limiter
from typing import Optional

router = APIRouter(prefix="/doctors", tags=["Doctors"])

# ✅ Admin only — create
@router.post("/")
@limiter.limit("5/minute")
def create_doctor(
    request: Request,
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    db_doctor = DoctorService.create_doctor(db, doctor)
    return success_response(
        data=db_doctor,
        message="Doctor created successfully"
    )

# ✅ All logged in users — view
@router.get("/")
@limiter.limit("10/minute")
def get_doctors(
    request: Request,
    specialization: Optional[str] = None,
    name: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)  # ← Any logged in user
):
    doctors, total = DoctorService.get_doctors(
        db, specialization, name, skip, limit, sort_by, order
    )
    return paginated_response(
        data=doctors,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{doctor_id}")
@limiter.limit("10/minute")
def get_doctor(
    request: Request,
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    doctor = DoctorService.get_doctor_by_id(db, doctor_id)
    return success_response(data=doctor)

# ✅ Admin only — update
@router.put("/{doctor_id}")
@limiter.limit("5/minute")
def update_doctor(
    request: Request,
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    db_doctor = DoctorService.update_doctor(db, doctor_id, doctor)
    return success_response(
        data=db_doctor,
        message="Doctor updated successfully"
    )

# ✅ Admin only — delete
@router.delete("/{doctor_id}")
@limiter.limit("5/minute")
def delete_doctor(
    request: Request,
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    DoctorService.delete_doctor(db, doctor_id)
    return success_response(message="Doctor deleted successfully")

# ✅ Admin only — activate/deactivate
@router.patch("/{doctor_id}/activate")
@limiter.limit("5/minute")
def toggle_doctor(
    request: Request,
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    doctor = DoctorService.toggle_doctor_status(db, doctor_id)
    status = "activated" if doctor.is_active else "deactivated"
    return success_response(
        data=doctor,
        message=f"Doctor {status} successfully"
    )
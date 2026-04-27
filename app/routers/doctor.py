from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.logger import logger
from app.rate_limit import limiter
from typing import List, Optional

router = APIRouter(prefix="/doctors", tags=["Doctors"])

# ✅ Max 5 requests per minute for create
@router.post("/", response_model=DoctorResponse)
@limiter.limit("5/minute")
def create_doctor(request: Request, doctor: DoctorCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating doctor: {doctor.name}")
    db_doctor = Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

# ✅ Max 10 requests per minute for listing
@router.get("/", response_model=List[DoctorResponse])
@limiter.limit("10/minute")
def get_doctors(
    request: Request,
    specialization: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    logger.info("Fetching doctors list")
    query = db.query(Doctor)
    if specialization:
        query = query.filter(Doctor.specialization == specialization)
    return query.offset(skip).limit(limit).all()

@router.get("/{doctor_id}", response_model=DoctorResponse)
@limiter.limit("10/minute")
def get_doctor(request: Request, doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.put("/{doctor_id}", response_model=DoctorResponse)
@limiter.limit("5/minute")
def update_doctor(request: Request, doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    for key, value in doctor.model_dump(exclude_unset=True).items():
        setattr(db_doctor, key, value)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/{doctor_id}")
@limiter.limit("5/minute")
def delete_doctor(request: Request, doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}

@router.patch("/{doctor_id}/activate", response_model=DoctorResponse)
@limiter.limit("5/minute")
def activate_deactivate_doctor(request: Request, doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_active = not doctor.is_active
    db.commit()
    db.refresh(doctor)
    logger.info(f"Doctor {doctor_id} active status: {doctor.is_active}")
    return doctor
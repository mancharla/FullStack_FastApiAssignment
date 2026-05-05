from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from typing import Optional

class DoctorService:

    # ✅ Create doctor
    @staticmethod
    def create_doctor(db: Session, doctor: DoctorCreate):
        # Check if email exists
        existing = db.query(Doctor).filter(
            Doctor.email == doctor.email
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        db_doctor = Doctor(**doctor.model_dump())
        db.add(db_doctor)
        db.commit()
        db.refresh(db_doctor)
        return db_doctor

    # ✅ Get all doctors with search + pagination + sorting
    @staticmethod
    def get_doctors(
        db: Session,
        specialization: Optional[str] = None,
        name: Optional[str] = None,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "id",
        order: str = "asc"
    ):
        query = db.query(Doctor)

        # Search
        if specialization:
            query = query.filter(
                Doctor.specialization.ilike(f"%{specialization}%")
            )
        if name:
            query = query.filter(
                Doctor.name.ilike(f"%{name}%")
            )

        # Sorting
        if sort_by == "name":
            query = query.order_by(
                Doctor.name.asc() if order == "asc" else Doctor.name.desc()
            )
        elif sort_by == "specialization":
            query = query.order_by(
                Doctor.specialization.asc() if order == "asc"
                else Doctor.specialization.desc()
            )
        else:
            query = query.order_by(
                Doctor.id.asc() if order == "asc" else Doctor.id.desc()
            )

        total = query.count()
        doctors = query.offset(skip).limit(limit).all()
        return doctors, total

    # ✅ Get doctor by ID
    @staticmethod
    def get_doctor_by_id(db: Session, doctor_id: int):
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor

    # ✅ Update doctor
    @staticmethod
    def update_doctor(db: Session, doctor_id: int, doctor: DoctorUpdate):
        db_doctor = DoctorService.get_doctor_by_id(db, doctor_id)
        for key, value in doctor.model_dump(exclude_unset=True).items():
            setattr(db_doctor, key, value)
        db.commit()
        db.refresh(db_doctor)
        return db_doctor

    # ✅ Delete doctor
    @staticmethod
    def delete_doctor(db: Session, doctor_id: int):
        doctor = DoctorService.get_doctor_by_id(db, doctor_id)
        db.delete(doctor)
        db.commit()
        return True

    # ✅ Toggle activate/deactivate
    @staticmethod
    def toggle_doctor_status(db: Session, doctor_id: int):
        doctor = DoctorService.get_doctor_by_id(db, doctor_id)
        doctor.is_active = not doctor.is_active
        db.commit()
        db.refresh(doctor)
        return doctor
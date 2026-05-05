from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
from typing import Optional

class PatientService:

    # ✅ Create patient
    @staticmethod
    def create_patient(db: Session, patient: PatientCreate):
        # ✅ Check if phone already exists
        existing = db.query(Patient).filter(
            Patient.phone == patient.phone
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered!"
            )
        db_patient = Patient(**patient.model_dump())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient

    # ✅ Get all patients with search + pagination + sorting
    @staticmethod
    def get_patients(
        db: Session,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "id",
        order: str = "asc"
    ):
        query = db.query(Patient)

        # ✅ Search
        if name:
            query = query.filter(
                Patient.name.ilike(f"%{name}%")
            )
        if phone:
            query = query.filter(
                Patient.phone.ilike(f"%{phone}%")
            )

        # ✅ Sorting
        if sort_by == "name":
            query = query.order_by(
                Patient.name.asc() if order == "asc"
                else Patient.name.desc()
            )
        elif sort_by == "age":
            query = query.order_by(
                Patient.age.asc() if order == "asc"
                else Patient.age.desc()
            )
        else:
            query = query.order_by(
                Patient.id.asc() if order == "asc"
                else Patient.id.desc()
            )

        total = query.count()
        patients = query.offset(skip).limit(limit).all()
        return patients, total

    # ✅ Get patient by ID
    @staticmethod
    def get_patient_by_id(db: Session, patient_id: int):
        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()
        if not patient:
            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )
        return patient

    # ✅ Update patient
    @staticmethod
    def update_patient(
        db: Session,
        patient_id: int,
        patient: PatientUpdate
    ):
        db_patient = PatientService.get_patient_by_id(db, patient_id)
        for key, value in patient.model_dump(exclude_unset=True).items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
        return db_patient

    # ✅ Delete patient
    @staticmethod
    def delete_patient(db: Session, patient_id: int):
        patient = PatientService.get_patient_by_id(db, patient_id)
        db.delete(patient)
        db.commit()
        return True
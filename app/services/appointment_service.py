from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from datetime import datetime, timedelta
from typing import Optional

class AppointmentService:

    # ✅ Create appointment with double booking check
    @staticmethod
    def create_appointment(db: Session, appointment: AppointmentCreate):

        # ✅ Check doctor exists
        doctor = db.query(Doctor).filter(
            Doctor.id == appointment.doctor_id
        ).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # ✅ Check doctor is active
        if not doctor.is_active:
            raise HTTPException(
                status_code=400,
                detail="Doctor is not active!"
            )

        # ✅ Check patient exists
        patient = db.query(Patient).filter(
            Patient.id == appointment.patient_id
        ).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        # ✅ Check double booking — 1 hour time slot
        slot_start = appointment.appointment_date
        slot_end = slot_start + timedelta(hours=1)

        existing = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.status.in_(["Pending", "Approved"]),
            Appointment.appointment_date >= slot_start,
            Appointment.appointment_date < slot_end
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Doctor already has an appointment at this time slot! "
                       f"Please choose a different time."
            )

        # ✅ Create appointment
        db_appointment = Appointment(
            doctor_id=appointment.doctor_id,
            patient_id=appointment.patient_id,
            appointment_date=appointment.appointment_date,
            notes=appointment.notes,
            status="Pending"
        )
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        return db_appointment

    # ✅ Get all appointments with filters + sorting
    @staticmethod
    def get_appointments(
        db: Session,
        doctor_id: Optional[int] = None,
        patient_id: Optional[int] = None,
        status: Optional[str] = None,
        date: Optional[str] = None,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "appointment_date",
        order: str = "asc"
    ):
        query = db.query(Appointment)

        # ✅ Filters
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)
        if status:
            query = query.filter(Appointment.status == status)
        if date:
            filter_date = datetime.strptime(date, "%Y-%m-%d")
            query = query.filter(
                Appointment.appointment_date >= filter_date,
                Appointment.appointment_date < filter_date + timedelta(days=1)
            )

        # ✅ Sorting
        if sort_by == "appointment_date":
            query = query.order_by(
                Appointment.appointment_date.asc()
                if order == "asc"
                else Appointment.appointment_date.desc()
            )
        elif sort_by == "status":
            query = query.order_by(
                Appointment.status.asc()
                if order == "asc"
                else Appointment.status.desc()
            )

        total = query.count()
        appointments = query.offset(skip).limit(limit).all()
        return appointments, total

    # ✅ Get appointment by ID
    @staticmethod
    def get_appointment_by_id(db: Session, appointment_id: int):
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        if not appointment:
            raise HTTPException(
                status_code=404,
                detail="Appointment not found"
            )
        return appointment

    # ✅ Update appointment status
    @staticmethod
    def update_appointment(
        db: Session,
        appointment_id: int,
        data: AppointmentUpdate
    ):
        appointment = AppointmentService.get_appointment_by_id(
            db, appointment_id
        )

        # ✅ Status transition rules
        allowed_transitions = {
            "Pending": ["Approved", "Rejected", "Cancelled"],
            "Approved": ["Completed", "Cancelled"],
            "Rejected": [],
            "Completed": [],
            "Cancelled": []
        }

        if data.status:
            current = appointment.status
            allowed = allowed_transitions.get(current, [])
            if data.status not in allowed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot change status from "
                           f"{current} to {data.status}. "
                           f"Allowed: {allowed}"
                )
            appointment.status = data.status

        if data.notes:
            appointment.notes = data.notes

        db.commit()
        db.refresh(appointment)
        return appointment

    # ✅ Cancel appointment
    @staticmethod
    def cancel_appointment(db: Session, appointment_id: int):
        appointment = AppointmentService.get_appointment_by_id(
            db, appointment_id
        )
        if appointment.status in ["Completed", "Cancelled"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel a {appointment.status} appointment!"
            )
        appointment.status = "Cancelled"
        db.commit()
        db.refresh(appointment)
        return appointment
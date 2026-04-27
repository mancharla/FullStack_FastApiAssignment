from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.websockets import manager
from app.rate_limit import limiter
from app.tasks import send_appointment_notification, cleanup_cancelled_appointment
from typing import List, Optional

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
@limiter.limit("5/minute")
async def create_appointment(
    request: Request,
    appointment: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # ✅ Get doctor and patient names
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # ✅ Create appointment
    db_appointment = Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    # ✅ Send notification in background
    background_tasks.add_task(
        send_appointment_notification,
        doctor_name=doctor.name,
        patient_name=patient.name,
        date=str(appointment.appointment_date)
    )

    # ✅ Notify via WebSocket
    await manager.broadcast(
        f"🔔 New appointment booked! "
        f"Doctor: {doctor.name} "
        f"Patient: {patient.name} "
        f"Date: {appointment.appointment_date}"
    )

    return db_appointment

@router.get("/", response_model=List[AppointmentResponse])
@limiter.limit("10/minute")
def get_appointments(
    request: Request,
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    return query.all()

@router.get("/{appointment_id}", response_model=AppointmentResponse)
@limiter.limit("10/minute")
def get_appointment(
    request: Request,
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
@limiter.limit("5/minute")
async def cancel_appointment(
    request: Request,
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = "Cancelled"
    db.commit()
    db.refresh(appointment)

    # ✅ Cleanup in background
    background_tasks.add_task(
        cleanup_cancelled_appointment,
        appointment_id=appointment_id
    )

    # ✅ Notify via WebSocket
    await manager.broadcast(
        f"❌ Appointment {appointment_id} has been cancelled!"
    )

    return appointment
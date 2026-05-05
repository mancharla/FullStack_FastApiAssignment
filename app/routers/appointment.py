from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.services.appointment_service import AppointmentService
from app.websockets import manager
from app.rate_limit import limiter
from app.tasks import send_appointment_notification
from app.utils.response import success_response, paginated_response
from app.utils.dependencies import require_auth
from typing import Optional

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/")
@limiter.limit("5/minute")
async def create_appointment(
    request: Request,
    appointment: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    db_appointment = AppointmentService.create_appointment(db, appointment)

    background_tasks.add_task(
        send_appointment_notification,
        doctor_name=f"Doctor ID {appointment.doctor_id}",
        patient_name=f"Patient ID {appointment.patient_id}",
        date=str(appointment.appointment_date)
    )

    await manager.broadcast(
        f"🔔 New appointment booked! "
        f"Doctor ID: {appointment.doctor_id} "
        f"Patient ID: {appointment.patient_id}"
    )

    return success_response(
        data=db_appointment,
        message="Appointment created successfully"
    )

@router.get("/")
@limiter.limit("10/minute")
def get_appointments(
    request: Request,
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "appointment_date",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    appointments, total = AppointmentService.get_appointments(
        db, doctor_id, patient_id, status, date, skip, limit, sort_by, order
    )
    return paginated_response(
        data=appointments,
        total=total,
        skip=skip,
        limit=limit,
        message="Appointments fetched successfully"
    )

@router.get("/{appointment_id}")
@limiter.limit("10/minute")
def get_appointment(
    request: Request,
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    appointment = AppointmentService.get_appointment_by_id(
        db, appointment_id
    )
    return success_response(data=appointment)

@router.put("/{appointment_id}")
@limiter.limit("5/minute")
async def update_appointment(
    request: Request,
    appointment_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    appointment = AppointmentService.update_appointment(
        db, appointment_id, data
    )

    await manager.broadcast(
        f"📋 Appointment {appointment_id} "
        f"status updated to: {appointment.status}"
    )

    return success_response(
        data=appointment,
        message=f"Appointment updated successfully"
    )

@router.put("/{appointment_id}/cancel")
@limiter.limit("5/minute")
async def cancel_appointment(
    request: Request,
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_auth)
):
    appointment = AppointmentService.cancel_appointment(db, appointment_id)

    await manager.broadcast(
        f"❌ Appointment {appointment_id} has been cancelled!"
    )

    return success_response(
        data=appointment,
        message="Appointment cancelled successfully"
    )
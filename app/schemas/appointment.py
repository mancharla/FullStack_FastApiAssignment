from pydantic import BaseModel, field_validator
from datetime import datetime, timedelta
from typing import Optional

class AppointmentCreate(BaseModel):
    doctor_id: int
    patient_id: int
    appointment_date: datetime
    notes: Optional[str] = None

    @field_validator('appointment_date')
    def validate_date(cls, v):
        # ✅ Remove timezone info
        if v.tzinfo is not None:
            v = v.replace(tzinfo=None)
        # ✅ Allow appointments at least 5 minutes from now
        if v < datetime.utcnow() - timedelta(minutes=5):
            raise ValueError('Appointment date must be in the future!')
        return v

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('status')
    def validate_status(cls, v):
        if v is None:
            return v
        allowed = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']
        if v not in allowed:
            raise ValueError(f'Status must be one of {allowed}')
        return v

class AppointmentResponse(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    appointment_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
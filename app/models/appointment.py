from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String, default="Pending")  # ✅ Default is Pending now
    notes = Column(String, nullable=True)        # ✅ NEW
    created_at = Column(DateTime, default=datetime.utcnow)  # ✅ NEW

    doctor = relationship("Doctor")
    patient = relationship("Patient")
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class PatientFile(Base):
    __tablename__ = "patient_files"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Float, nullable=False)        # ✅ NEW — size in KB
    file_category = Column(String, default="report") # ✅ NEW — report/prescription
    uploaded_at = Column(DateTime, default=datetime.utcnow) # ✅ NEW
    uploaded_by = Column(String, nullable=True)      # ✅ NEW — who uploaded

    patient = relationship("Patient")
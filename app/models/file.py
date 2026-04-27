from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class PatientFile(Base):
    __tablename__ = "patient_files"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
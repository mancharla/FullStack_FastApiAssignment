from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FileResponse(BaseModel):
    id: int
    patient_id: int
    filename: str
    original_name: str
    file_type: str
    file_size: float
    file_category: str
    uploaded_at: Optional[datetime] = None
    uploaded_by: Optional[str] = None

    class Config:
        from_attributes = True
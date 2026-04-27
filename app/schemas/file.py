from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    patient_id: int
    filename: str
    original_name: str
    file_type: str

    class Config:
        from_attributes = True
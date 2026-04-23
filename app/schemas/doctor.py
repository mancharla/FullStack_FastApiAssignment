from pydantic import BaseModel, EmailStr
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    email: EmailStr
    is_active: bool = True

class DoctorUpdate(BaseModel):
    name: Optional[str]
    specialization: Optional[str]
    email: Optional[EmailStr]
    is_active: Optional[bool]

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True
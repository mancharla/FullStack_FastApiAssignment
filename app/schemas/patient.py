from pydantic import BaseModel, field_validator
from typing import Optional

class PatientCreate(BaseModel):
    name: str
    age: int
    phone: str

    @field_validator('age')
    def age_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Age must be greater than 0')
        return v

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    phone: str

    class Config:
        from_attributes = True
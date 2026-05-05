from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")

    # ✅ Forgot password fields
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
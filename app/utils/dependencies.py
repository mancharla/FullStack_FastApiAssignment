from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import verify_token
from app.models.user import User

def get_current_user(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ✅ Admin only
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied! Admin only."
        )
    return current_user

# ✅ Admin or Doctor
def require_doctor(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied! Doctors only."
        )
    return current_user

# ✅ Admin or Patient
def require_patient(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "patient"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied! Patients only."
        )
    return current_user

# ✅ Any logged in user
def require_auth(current_user: User = Depends(get_current_user)):
    return current_user
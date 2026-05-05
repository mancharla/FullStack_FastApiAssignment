from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import (
    UserCreate, UserLogin,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    AuthService.register_user(
        db,
        username=user.username,
        password=user.password,
        role=user.role
    )
    return success_response(message="User registered successfully")

# ✅ This format works perfectly with Swagger Authorize button
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    data = AuthService.login_user(db, user.username, user.password)
    return {
        "access_token": data["access_token"],
        "token_type": "bearer",
        "role": data["role"],
        "status": "success",
        "message": "Login successful"
    }

# ✅ Forgot password
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    data = AuthService.forgot_password(db, request.username)
    return success_response(
        data=data,
        message="Reset token generated successfully"
    )

# ✅ Reset password
@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    data = AuthService.reset_password(
        db,
        token=request.token,
        new_password=request.new_password
    )
    return success_response(
        data=data,
        message="Password reset successful"
    )
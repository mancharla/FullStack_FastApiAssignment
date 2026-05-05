from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.auth import hash_password, verify_password, create_access_token
from datetime import datetime, timedelta
import secrets

class AuthService:

    # ✅ Register user
    @staticmethod
    def register_user(db: Session, username: str, password: str, role: str):
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )
        new_user = User(
            username=username,
            hashed_password=hash_password(password),
            role=role
        )
        db.add(new_user)
        db.commit()
        return new_user

    # ✅ Login user
    @staticmethod
    def login_user(db: Session, username: str, password: str):
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )
        token = create_access_token(data={
            "sub": user.username,
            "role": user.role
        })
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role
        }

    # ✅ Forgot password — generate reset token
    @staticmethod
    def forgot_password(db: Session, username: str):
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Username not found"
            )

        # ✅ Generate secure random token
        reset_token = secrets.token_urlsafe(32)

        # ✅ Set token expiry — 30 minutes
        expiry = datetime.utcnow() + timedelta(minutes=30)

        # ✅ Save to database
        user.reset_token = reset_token
        user.reset_token_expiry = expiry
        db.commit()

        # In real app → send email with token
        # For now → return token directly
        return {
            "reset_token": reset_token,
            "message": "Use this token to reset your password",
            "expires_in": "30 minutes"
        }

    # ✅ Reset password — verify token and update password
    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        # ✅ Find user with this token
        user = db.query(User).filter(
            User.reset_token == token
        ).first()

        if not user:
            raise HTTPException(
                status_code=400,
                detail="Invalid reset token"
            )

        # ✅ Check token not expired
        if datetime.utcnow() > user.reset_token_expiry:
            raise HTTPException(
                status_code=400,
                detail="Reset token has expired! Request a new one."
            )

        # ✅ Update password
        user.hashed_password = hash_password(new_password)

        # ✅ Clear token after use
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()

        return {"message": "Password reset successfully!"}
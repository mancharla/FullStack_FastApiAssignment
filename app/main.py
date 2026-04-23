from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.database import engine, Base
from app.routers import doctor, patient, appointment, auth
from app.models import doctor as doctor_model
from app.models import patient as patient_model
from app.models import appointment as appointment_model
from app.models import user as user_model
from app.logger import logger

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor & Patient Management API",
    description="Advanced FastAPI Assignment - End to End",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(appointment.router)

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI Assignment!"}

# ✅ This adds the Authorize button in Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Doctor & Patient Management API",
        version="1.0.0",
        description="Advanced FastAPI Assignment - End to End",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.routers import doctor, patient, appointment, auth, upload
from app.routers import websocket as ws_router
from app.models import doctor as doctor_model
from app.models import patient as patient_model
from app.models import appointment as appointment_model
from app.models import user as user_model
from app.models import file as file_model
from app.logger import logger
from app.rate_limit import limiter
import traceback
from app.routers import websocket as ws_router 
# ✅ Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor & Patient Management API",
    description="Advanced FastAPI Assignment - End to End",
    version="1.0.0"
)
app.include_router(ws_router.router) 
# ✅ CORS Middleware — allows React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ✅ Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "traceback": traceback.format_exc()
        }
    )

# ✅ Include All Routers
app.include_router(auth.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(appointment.router)
app.include_router(upload.router)
app.include_router(ws_router.router)

@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {"message": "Welcome to FastAPI Assignment!"}

# ✅ Swagger Authorize Button
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
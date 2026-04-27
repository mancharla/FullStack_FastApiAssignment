import logging
from app.logger import logger

# ✅ Send email notification (simulated)
def send_appointment_notification(doctor_name: str, patient_name: str, date: str):
    logger.info(f"📧 Sending email notification...")
    logger.info(f"   Doctor: {doctor_name}")
    logger.info(f"   Patient: {patient_name}")
    logger.info(f"   Date: {date}")
    logger.info(f"✅ Email notification sent successfully!")

# ✅ Log file upload
def log_file_upload(patient_id: int, filename: str):
    logger.info(f"📁 File uploaded for Patient ID: {patient_id}")
    logger.info(f"   Filename: {filename}")
    logger.info(f"✅ File upload logged successfully!")

# ✅ Clean up cancelled appointments
def cleanup_cancelled_appointment(appointment_id: int):
    logger.info(f"🧹 Cleaning up cancelled appointment ID: {appointment_id}")
    logger.info(f"✅ Cleanup completed for appointment {appointment_id}")
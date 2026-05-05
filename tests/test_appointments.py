def test_create_appointment(client, admin_token):
    # Create doctor
    doctor = client.post("/doctors/", json={
        "name": "Dr. Appt",
        "specialization": "General",
        "email": "appt@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = doctor.json()["data"]["id"]

    # Create patient
    patient = client.post("/patients/", json={
        "name": "Appt Patient",
        "age": 25,
        "phone": "5555555556"
    }, headers=admin_token)
    patient_id = patient.json()["data"]["id"]

    # Create appointment
    response = client.post("/appointments/", json={
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "appointment_date": "2026-12-01T10:00:00",
        "notes": "Test appointment"
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Pending"

def test_get_appointments(client, admin_token):
    response = client.get("/appointments/", headers=admin_token)
    assert response.status_code == 200
    assert "pagination" in response.json()

def test_prevent_double_booking(client, admin_token):
    doctor = client.post("/doctors/", json={
        "name": "Dr. Double",
        "specialization": "General",
        "email": "double@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = doctor.json()["data"]["id"]

    patient1 = client.post("/patients/", json={
        "name": "Patient One",
        "age": 25,
        "phone": "6666666667"
    }, headers=admin_token)
    patient1_id = patient1.json()["data"]["id"]

    patient2 = client.post("/patients/", json={
        "name": "Patient Two",
        "age": 30,
        "phone": "7777777778"
    }, headers=admin_token)
    patient2_id = patient2.json()["data"]["id"]

    # First booking
    client.post("/appointments/", json={
        "doctor_id": doctor_id,
        "patient_id": patient1_id,
        "appointment_date": "2026-12-02T10:00:00",
        "notes": "First"
    }, headers=admin_token)

    # ✅ Double booking — same doctor EXACT same time
    response = client.post("/appointments/", json={
        "doctor_id": doctor_id,
        "patient_id": patient2_id,
        "appointment_date": "2026-12-02T10:00:00",  # ← exact same time
        "notes": "Double"
    }, headers=admin_token)
    assert response.status_code == 400
    
def test_update_appointment_status(client, admin_token):
    doctor = client.post("/doctors/", json={
        "name": "Dr. Status",
        "specialization": "General",
        "email": "status@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = doctor.json()["data"]["id"]

    patient = client.post("/patients/", json={
        "name": "Status Patient",
        "age": 25,
        "phone": "8888888889"
    }, headers=admin_token)
    patient_id = patient.json()["data"]["id"]

    appt = client.post("/appointments/", json={
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "appointment_date": "2026-12-03T10:00:00",
        "notes": "Status test"
    }, headers=admin_token)
    appt_id = appt.json()["data"]["id"]

    response = client.put(f"/appointments/{appt_id}", json={
        "status": "Approved"
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Approved"
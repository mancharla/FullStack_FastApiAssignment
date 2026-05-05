def test_create_doctor_admin(client, admin_token):
    response = client.post("/doctors/", json={
        "name": "Dr. Test",
        "specialization": "Cardiology",
        "email": "test1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_create_doctor_patient_forbidden(client, patient_token):
    response = client.post("/doctors/", json={
        "name": "Dr. Test2",
        "specialization": "Cardiology",
        "email": "test2@hospital.com",
        "is_active": True
    }, headers=patient_token)
    assert response.status_code == 403

def test_get_doctors(client, admin_token):
    response = client.get("/doctors/", headers=admin_token)
    assert response.status_code == 200
    assert "pagination" in response.json()

def test_get_doctor_by_id(client, admin_token):
    create = client.post("/doctors/", json={
        "name": "Dr. GetTest",
        "specialization": "Neurology",
        "email": "gettest1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = create.json()["data"]["id"]
    response = client.get(f"/doctors/{doctor_id}", headers=admin_token)
    assert response.status_code == 200

def test_get_doctor_not_found(client, admin_token):
    response = client.get("/doctors/99999", headers=admin_token)
    assert response.status_code == 404

def test_update_doctor(client, admin_token):
    create = client.post("/doctors/", json={
        "name": "Dr. Update",
        "specialization": "Dermatology",
        "email": "update1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = create.json()["data"]["id"]
    response = client.put(f"/doctors/{doctor_id}", json={
        "name": "Dr. Updated",
        "specialization": "Oncology",
        "email": "updated1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Dr. Updated"

def test_delete_doctor(client, admin_token):
    create = client.post("/doctors/", json={
        "name": "Dr. Delete",
        "specialization": "Pediatrics",
        "email": "delete1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = create.json()["data"]["id"]
    response = client.delete(f"/doctors/{doctor_id}", headers=admin_token)
    assert response.status_code == 200

def test_activate_deactivate_doctor(client, admin_token):
    create = client.post("/doctors/", json={
        "name": "Dr. Activate",
        "specialization": "Surgery",
        "email": "activate1@hospital.com",
        "is_active": True
    }, headers=admin_token)
    doctor_id = create.json()["data"]["id"]
    response = client.patch(
        f"/doctors/{doctor_id}/activate",
        headers=admin_token
    )
    assert response.status_code == 200
    assert response.json()["data"]["is_active"] == False
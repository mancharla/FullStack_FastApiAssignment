def test_create_doctor(client, auth_token):
    response = client.post("/doctors/", json={
        "name": "Dr. Test",
        "specialization": "Cardiology",
        "email": "test@hospital.com",
        "is_active": True
    }, headers=auth_token)
    assert response.status_code == 200
    assert response.json()["name"] == "Dr. Test"
    assert response.json()["specialization"] == "Cardiology"

def test_get_doctors(client, auth_token):
    response = client.get("/doctors/", headers=auth_token)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_doctor_by_id(client, auth_token):
    # Create doctor first
    create = client.post("/doctors/", json={
        "name": "Dr. GetTest",
        "specialization": "Neurology",
        "email": "gettest@hospital.com",
        "is_active": True
    }, headers=auth_token)
    doctor_id = create.json()["id"]

    # Get by ID
    response = client.get(f"/doctors/{doctor_id}", headers=auth_token)
    assert response.status_code == 200
    assert response.json()["id"] == doctor_id

def test_get_doctor_not_found(client, auth_token):
    response = client.get("/doctors/99999", headers=auth_token)
    assert response.status_code == 404

def test_update_doctor(client, auth_token):
    # Create doctor
    create = client.post("/doctors/", json={
        "name": "Dr. Update",
        "specialization": "Dermatology",
        "email": "update@hospital.com",
        "is_active": True
    }, headers=auth_token)
    doctor_id = create.json()["id"]

    # Update
    response = client.put(f"/doctors/{doctor_id}", json={
        "name": "Dr. Updated",
        "specialization": "Oncology",
        "email": "updated@hospital.com",
        "is_active": True
    }, headers=auth_token)
    assert response.status_code == 200
    assert response.json()["name"] == "Dr. Updated"

def test_delete_doctor(client, auth_token):
    # Create doctor
    create = client.post("/doctors/", json={
        "name": "Dr. Delete",
        "specialization": "Pediatrics",
        "email": "delete@hospital.com",
        "is_active": True
    }, headers=auth_token)
    doctor_id = create.json()["id"]

    # Delete
    response = client.delete(f"/doctors/{doctor_id}", headers=auth_token)
    assert response.status_code == 200
    assert response.json()["message"] == "Doctor deleted successfully"

def test_activate_deactivate_doctor(client, auth_token):
    # Create doctor
    create = client.post("/doctors/", json={
        "name": "Dr. Activate",
        "specialization": "Surgery",
        "email": "activate@hospital.com",
        "is_active": True
    }, headers=auth_token)
    doctor_id = create.json()["id"]

    # Toggle activate
    response = client.patch(
        f"/doctors/{doctor_id}/activate",
        headers=auth_token
    )
    assert response.status_code == 200
    assert response.json()["is_active"] == False
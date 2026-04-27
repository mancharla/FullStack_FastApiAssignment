def test_create_patient(client, auth_token):
    response = client.post("/patients/", json={
        "name": "Test Patient",
        "age": 25,
        "phone": "9876543210"
    }, headers=auth_token)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Patient"

def test_get_patients(client, auth_token):
    response = client.get("/patients/", headers=auth_token)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_patient_invalid_age(client, auth_token):
    response = client.post("/patients/", json={
        "name": "Invalid Patient",
        "age": -1,
        "phone": "1234567890"
    }, headers=auth_token)
    assert response.status_code == 422

def test_update_patient(client, auth_token):
    # Create patient
    create = client.post("/patients/", json={
        "name": "Update Patient",
        "age": 30,
        "phone": "1111111111"
    }, headers=auth_token)
    patient_id = create.json()["id"]

    # Update
    response = client.put(f"/patients/{patient_id}", json={
        "name": "Updated Patient",
        "age": 31,
        "phone": "2222222222"
    }, headers=auth_token)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Patient"

def test_delete_patient(client, auth_token):
    # Create patient
    create = client.post("/patients/", json={
        "name": "Delete Patient",
        "age": 22,
        "phone": "3333333333"
    }, headers=auth_token)
    patient_id = create.json()["id"]

    # Delete
    response = client.delete(f"/patients/{patient_id}", headers=auth_token)
    assert response.status_code == 200
    assert response.json()["message"] == "Patient deleted successfully"

def test_search_patient_by_name(client, auth_token):
    # Create patient
    client.post("/patients/", json={
        "name": "SearchName",
        "age": 28,
        "phone": "4444444444"
    }, headers=auth_token)

    # Search
    response = client.get("/patients/?name=SearchName", headers=auth_token)
    assert response.status_code == 200
    assert len(response.json()) > 0
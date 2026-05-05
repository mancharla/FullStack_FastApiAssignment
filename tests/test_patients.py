def test_create_patient(client, admin_token):
    response = client.post("/patients/", json={
        "name": "Test Patient",
        "age": 25,
        "phone": "9876543211"
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["data"]["name"] == "Test Patient"

def test_get_patients(client, admin_token):
    response = client.get("/patients/", headers=admin_token)
    assert response.status_code == 200
    assert "pagination" in response.json()

def test_get_patients_with_search(client, admin_token):
    client.post("/patients/", json={
        "name": "SearchPatient",
        "age": 30,
        "phone": "1111111112"
    }, headers=admin_token)
    response = client.get(
        "/patients/?name=SearchPatient",
        headers=admin_token
    )
    assert response.status_code == 200

def test_get_patients_with_sorting(client, admin_token):
    response = client.get(
        "/patients/?sort_by=name&order=asc",
        headers=admin_token
    )
    assert response.status_code == 200

def test_create_patient_invalid_age(client, admin_token):
    response = client.post("/patients/", json={
        "name": "Invalid Patient",
        "age": -1,
        "phone": "1234567891"
    }, headers=admin_token)
    assert response.status_code == 422

def test_update_patient(client, admin_token):
    create = client.post("/patients/", json={
        "name": "Update Patient",
        "age": 30,
        "phone": "2222222223"
    }, headers=admin_token)
    patient_id = create.json()["data"]["id"]
    response = client.put(f"/patients/{patient_id}", json={
        "name": "Updated Patient",
        "age": 31,
        "phone": "3333333334"
    }, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Updated Patient"

def test_delete_patient(client, admin_token):
    create = client.post("/patients/", json={
        "name": "Delete Patient",
        "age": 22,
        "phone": "4444444445"
    }, headers=admin_token)
    patient_id = create.json()["data"]["id"]
    response = client.delete(
        f"/patients/{patient_id}",
        headers=admin_token
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"
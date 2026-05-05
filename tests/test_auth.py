def test_register(client):
    response = client.post("/auth/register", json={
        "username": "newuser1",
        "password": "newpass123",
        "role": "patient"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_register_duplicate(client):
    client.post("/auth/register", json={
        "username": "dupuser1",
        "password": "duppass123",
        "role": "patient"
    })
    response = client.post("/auth/register", json={
        "username": "dupuser1",
        "password": "duppass123",
        "role": "patient"
    })
    assert response.status_code == 400

def test_login_success(client):
    client.post("/auth/register", json={
        "username": "loginuser1",
        "password": "loginpass123",
        "role": "patient"
    })
    response = client.post("/auth/login", json={
        "username": "loginuser1",
        "password": "loginpass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "username": "loginuser2",
        "password": "loginpass123",
        "role": "patient"
    })
    response = client.post("/auth/login", json={
        "username": "loginuser2",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_forgot_password(client):
    client.post("/auth/register", json={
        "username": "forgotuser1",
        "password": "forgotpass123",
        "role": "patient"
    })
    response = client.post("/auth/forgot-password", json={
        "username": "forgotuser1"
    })
    assert response.status_code == 200
    assert "reset_token" in response.json()["data"]

def test_reset_password(client):
    client.post("/auth/register", json={
        "username": "resetuser1",
        "password": "resetpass123",
        "role": "patient"
    })
    forgot = client.post("/auth/forgot-password", json={
        "username": "resetuser1"
    })
    token = forgot.json()["data"]["reset_token"]
    response = client.post("/auth/reset-password", json={
        "token": token,
        "new_password": "newpass123"
    })
    assert response.status_code == 200

def test_login_after_reset(client):
    client.post("/auth/register", json={
        "username": "resetlogin1",
        "password": "oldpass123",
        "role": "patient"
    })
    forgot = client.post("/auth/forgot-password", json={
        "username": "resetlogin1"
    })
    token = forgot.json()["data"]["reset_token"]
    client.post("/auth/reset-password", json={
        "token": token,
        "new_password": "newpass456"
    })
    response = client.post("/auth/login", json={
        "username": "resetlogin1",
        "password": "newpass456"
    })
    assert response.status_code == 200
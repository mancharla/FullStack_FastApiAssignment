def test_register(client):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "password": "newpass123"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"

def test_register_duplicate(client):
    # Register first time
    client.post("/auth/register", json={
        "username": "dupuser",
        "password": "duppass123"
    })
    # Register again with same username
    response = client.post("/auth/register", json={
        "username": "dupuser",
        "password": "duppass123"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already exists"

def test_login_success(client):
    client.post("/auth/register", json={
        "username": "loginuser",
        "password": "loginpass123"
    })
    response = client.post("/auth/login", json={
        "username": "loginuser",
        "password": "loginpass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client):
    response = client.post("/auth/login", json={
        "username": "loginuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from unittest.mock import patch

TEST_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    # ✅ Disable rate limiting for tests
    with patch("app.rate_limit.limiter.enabled", False):
        with TestClient(app) as c:
            yield c

@pytest.fixture(scope="function")
def admin_token(client):
    client.post("/auth/register", json={
        "username": "testadmin",
        "password": "testpass123",
        "role": "admin"
    })
    response = client.post("/auth/login", json={
        "username": "testadmin",
        "password": "testpass123"
    })
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def doctor_token(client):
    client.post("/auth/register", json={
        "username": "testdoctor",
        "password": "testpass123",
        "role": "doctor"
    })
    response = client.post("/auth/login", json={
        "username": "testdoctor",
        "password": "testpass123"
    })
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def patient_token(client):
    client.post("/auth/register", json={
        "username": "testpatient",
        "password": "testpass123",
        "role": "patient"
    })
    response = client.post("/auth/login", json={
        "username": "testpatient",
        "password": "testpass123"
    })
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}
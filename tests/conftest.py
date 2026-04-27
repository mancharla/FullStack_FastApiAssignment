import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# ✅ Use separate test database
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

# ✅ Create test tables
Base.metadata.create_all(bind=engine)

# ✅ Override DB dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# ✅ Test client
@pytest.fixture
def client():
    return TestClient(app)

# ✅ Auth token fixture
@pytest.fixture
def auth_token(client):
    # Register
    client.post("/auth/register", json={
        "username": "testuser",
        "password": "testpass123"
    })
    # Login
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
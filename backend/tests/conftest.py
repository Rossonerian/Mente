from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
<<<<<<< HEAD
from app.security import VerifiedSupabaseClaims


class StubSupabaseVerifier:
    def __init__(self, claims: VerifiedSupabaseClaims) -> None:
        self.claims = claims

    def verify(self, _token: str) -> VerifiedSupabaseClaims:
        return self.claims
=======
>>>>>>> origin/new_components


@pytest.fixture
def client(tmp_path) -> Generator[TestClient, None, None]:
    database_path = tmp_path / "test.db"
    settings = Settings(
        database_url=f"sqlite:///{database_path.as_posix()}",
        auto_create_tables=True,
<<<<<<< HEAD
        supabase_url="https://mente-test.supabase.co",
        call_bot_api_key="test-call-bot-key-that-is-long-enough",
        cors_origins="http://localhost:19006",
    )
    app = create_app(settings)
    app.state.caregiver_token_verifier = StubSupabaseVerifier(
        VerifiedSupabaseClaims(
            subject="71d1a67f-a892-4ef1-b06d-489c69b455d0",
            email="ana@example.com",
            role="authenticated",
        )
    )
    with TestClient(app) as test_client:
=======
        jwt_secret="test-jwt-secret-that-is-long-enough",
        call_bot_api_key="test-call-bot-key-that-is-long-enough",
        cors_origins="http://localhost:19006",
    )
    with TestClient(create_app(settings)) as test_client:
>>>>>>> origin/new_components
        yield test_client


@pytest.fixture
def caregiver_setup(client: TestClient) -> dict:
    auth = client.post(
<<<<<<< HEAD
        "/v1/auth/profile",
        headers={"Authorization": "Bearer supabase-access-token"},
        json={"display_name": "Ana"},
    )
    assert auth.status_code == 201, auth.text
    headers = {"Authorization": "Bearer supabase-access-token"}
=======
        "/v1/auth/register",
        json={"email": "ana@example.com", "password": "safe-password", "display_name": "Ana"},
    )
    assert auth.status_code == 201, auth.text
    token = auth.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
>>>>>>> origin/new_components

    family = client.post("/v1/families", headers=headers, json={"name": "Delgado Family", "mode": "GROUP"})
    assert family.status_code == 201, family.text
    family_id = family.json()["id"]

    patient = client.post(
        f"/v1/families/{family_id}/patients",
        headers=headers,
        json={
            "preferred_name": "Rosa",
            "legal_name": "Rosa Delgado",
            "phone_e164": "+919876543210",
            "timezone": "Asia/Kolkata",
            "preferred_language": "en-IN",
        },
    )
    assert patient.status_code == 201, patient.text
    return {
        "headers": headers,
        "family_id": family_id,
        "patient_id": patient.json()["id"],
    }


@pytest.fixture
def patient_headers(client: TestClient, caregiver_setup: dict) -> dict[str, str]:
    response = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/join-codes",
        headers=caregiver_setup["headers"],
        json={},
    )
    assert response.status_code == 201, response.text
    binding = client.post("/v1/patient/bind", json={"code": response.json()["code"]})
    assert binding.status_code == 200, binding.text
    return {"X-Patient-Token": binding.json()["patient_token"]}

from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.security import VerifiedSupabaseClaims
from tests.conftest import StubSupabaseVerifier


def test_profile_and_family_access(client: TestClient, caregiver_setup: dict) -> None:
    profile = client.get("/v1/auth/me", headers=caregiver_setup["headers"])
    assert profile.status_code == 200
    assert profile.json()["display_name"] == "Ana"

    patient = client.get(
        f"/v1/patients/{caregiver_setup['patient_id']}",
        headers=caregiver_setup["headers"],
    )
    assert patient.status_code == 200
    assert patient.json()["preferred_name"] == "Rosa"

    client.app.state.caregiver_token_verifier = StubSupabaseVerifier(
        VerifiedSupabaseClaims(
            subject="ef71a0da-2a30-4b67-b5ea-b95b219ea20a",
            email="outsider@example.com",
            role="authenticated",
        )
    )
    second_auth = client.post(
        "/v1/auth/profile",
        headers={"Authorization": "Bearer supabase-access-token"},
        json={"display_name": "Outsider"},
    )
    assert second_auth.status_code == 201
    outsider_headers = {"Authorization": "Bearer supabase-access-token"}
    hidden = client.get(f"/v1/patients/{caregiver_setup['patient_id']}", headers=outsider_headers)
    assert hidden.status_code == 404


def test_memory_and_settings_are_available_to_call_bot(client: TestClient, caregiver_setup: dict) -> None:
    patient_id = caregiver_setup["patient_id"]
    headers = caregiver_setup["headers"]

    memory = client.post(
        f"/v1/patients/{patient_id}/memories",
        headers=headers,
        json={
            "memory_type": "PERSON",
            "subject_name": "Ana",
            "relationship_label": "Daughter",
            "prompt_text": "Who joins you for Sunday lunch?",
            "accepted_answers": ["Ana", "Annie"],
            "consent_recorded_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert memory.status_code == 201, memory.text

    schedule = client.put(
        f"/v1/patients/{patient_id}/call-schedule",
        headers=headers,
        json={
            "local_time": "09:00",
            "timezone": "Asia/Kolkata",
            "days_of_week": [0, 1, 2, 3, 4, 5, 6],
            "quiet_start": "20:00",
            "quiet_end": "08:00",
            "language_code": "en-IN",
            "active": True,
            "allow_one_retry": True,
        },
    )
    assert schedule.status_code == 200, schedule.text

    bot_headers = {"X-Call-Bot-Key": "test-call-bot-key-that-is-long-enough"}
    context = client.get(f"/v1/integrations/call-bot/patients/{patient_id}/context", headers=bot_headers)
    assert context.status_code == 200, context.text
    assert context.json()["patient"]["preferred_name"] == "Rosa"
    assert context.json()["memories"][0]["accepted_answers"] == ["Ana", "Annie"]
    assert context.json()["schedule"]["active"] is True

    schedules = client.get("/v1/integrations/call-bot/schedules", headers=bot_headers)
    assert schedules.status_code == 200
    assert schedules.json()[0]["patient"]["id"] == patient_id

    denied = client.get(f"/v1/integrations/call-bot/patients/{patient_id}/context")
    assert denied.status_code == 401

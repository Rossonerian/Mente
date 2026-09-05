from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings


def test_join_codes_are_single_use_and_devices_can_be_revoked(client: TestClient, caregiver_setup: dict) -> None:
    patient_id = caregiver_setup["patient_id"]
    caregiver_headers = caregiver_setup["headers"]

    first = client.post(f"/v1/patients/{patient_id}/join-codes", headers=caregiver_headers, json={})
    second = client.post(f"/v1/patients/{patient_id}/join-codes", headers=caregiver_headers, json={})
    assert first.status_code == 201
    assert second.status_code == 201

    superseded = client.post("/v1/patient/bind", json={"code": first.json()["code"]})
    assert superseded.status_code == 400

    binding = client.post("/v1/patient/bind", json={"code": second.json()["code"]})
    assert binding.status_code == 200, binding.text
    patient_headers = {"X-Patient-Token": binding.json()["patient_token"]}
    assert client.get("/v1/patient/me", headers=patient_headers).status_code == 200

    reused = client.post("/v1/patient/bind", json={"code": second.json()["code"]})
    assert reused.status_code == 400

    devices = client.get(f"/v1/patients/{patient_id}/devices", headers=caregiver_headers)
    assert devices.status_code == 200
    assert len(devices.json()) == 1
    assert "token_hash" not in devices.json()[0]

    revoked = client.delete(
        f"/v1/patients/{patient_id}/devices/{devices.json()[0]['id']}",
        headers=caregiver_headers,
    )
    assert revoked.status_code == 200
    assert client.get("/v1/patient/me", headers=patient_headers).status_code == 401


def test_input_boundaries_reject_unsafe_or_ambiguous_values(
    client: TestClient,
    caregiver_setup: dict,
    patient_headers: dict[str, str],
) -> None:
    patient_id = caregiver_setup["patient_id"]
    unsafe_memory = client.post(
        f"/v1/patients/{patient_id}/memories",
        headers=caregiver_setup["headers"],
        json={
            "memory_type": "PHOTO",
            "prompt_text": "Who is shown here?",
            "asset_ref": "https://untrusted.example/photo.jpg",
        },
    )
    assert unsafe_memory.status_code == 422

    windows_traversal = client.post(
        f"/v1/patients/{patient_id}/memories",
        headers=caregiver_setup["headers"],
        json={
            "memory_type": "PHOTO",
            "prompt_text": "Who is shown here?",
            "asset_ref": "..\\private\\photo.jpg",
            "consent_recorded_at": datetime.now().astimezone().isoformat(),
        },
    )
    assert windows_traversal.status_code == 422

    missing_consent = client.post(
        f"/v1/patients/{patient_id}/memories",
        headers=caregiver_setup["headers"],
        json={
            "memory_type": "PHOTO",
            "prompt_text": "Who is shown here?",
            "asset_ref": "patients/photo.jpg",
        },
    )
    assert missing_consent.status_code == 422

    unknown_field = client.post(
        "/v1/patient/game-sessions",
        headers=patient_headers,
        json={
            "activity_type": "MEMORY_MATCH",
            "client_session_id": "unknown-field",
            "unexpected": True,
        },
    )
    assert unknown_field.status_code == 422

    blank_name = client.post(
        f"/v1/families/{caregiver_setup['family_id']}/patients",
        headers=caregiver_setup["headers"],
        json={"preferred_name": "   "},
    )
    assert blank_name.status_code == 422

    oversized = client.post(
        "/v1/patient/game-sessions",
        headers=patient_headers,
        json={
            "activity_type": "MEMORY_MATCH",
            "client_session_id": "oversized-metadata",
            "metadata_json": {"value": "x" * 16_384},
        },
    )
    assert oversized.status_code == 422

    now_without_timezone = datetime.now().replace(microsecond=0).isoformat()
    ambiguous_call = client.post(
        "/v1/integrations/call-bot/sessions",
        headers={"X-Call-Bot-Key": "test-call-bot-key-that-is-long-enough"},
        json={
            "external_id": "naive-time-call",
            "patient_id": patient_id,
            "started_at": now_without_timezone,
            "ended_at": now_without_timezone,
            "status": "COMPLETED",
        },
    )
    assert ambiguous_call.status_code == 422


def test_production_configuration_rejects_development_defaults() -> None:
    with pytest.raises(ValidationError):
        Settings(environment="production")

    with pytest.raises(ValidationError):
        Settings(
            environment="production",
<<<<<<< HEAD
            supabase_url="https://mente-test.supabase.co",
=======
            jwt_secret="replace-with-at-least-32-random-characters",
>>>>>>> origin/new_components
            call_bot_api_key="replace-with-a-different-long-random-key",
        )

    production = Settings(
        environment="production",
<<<<<<< HEAD
        supabase_url="https://mente-test.supabase.co",
=======
        jwt_secret="production-jwt-secret-with-at-least-32-characters",
>>>>>>> origin/new_components
        call_bot_api_key="production-callbot-key-with-at-least-32-characters",
    )
    assert production.auto_create_tables is False
    assert production.environment == "production"

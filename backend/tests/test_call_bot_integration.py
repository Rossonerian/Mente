from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient


def test_call_ingestion_is_idempotent_and_creates_restrained_alert(
    client: TestClient,
    caregiver_setup: dict,
) -> None:
    now = datetime.now(timezone.utc)
    payload = {
        "external_id": "twilio-call-sid-example-1",
        "patient_id": caregiver_setup["patient_id"],
        "activity_type": "DAILY_CALL",
        "started_at": (now - timedelta(minutes=6)).isoformat(),
        "ended_at": now.isoformat(),
        "status": "EARLY_TERMINATED",
        "termination_reason": "CONSECUTIVE_INCORRECT",
        "metrics": [
            {
                "client_metric_id": "question-1",
                "item_type": "FAMILY_NAME",
                "accuracy": 0,
                "average_response_latency_ms": 4200,
                "hesitation_count": 1,
            },
            {
                "client_metric_id": "question-2",
                "item_type": "FAMILY_RELATIONSHIP",
                "accuracy": 0,
                "average_response_latency_ms": 5100,
                "hesitation_count": 1,
            },
        ],
    }
    bot_headers = {"X-Call-Bot-Key": "test-call-bot-key-that-is-long-enough"}
    ingested = client.post("/v1/integrations/call-bot/sessions", headers=bot_headers, json=payload)
    assert ingested.status_code == 201, ingested.text
    assert ingested.json()["source"] == "CALL"
    assert ingested.json()["review_classification"] == "SAME_DAY"
    session_id = ingested.json()["id"]

    replay = client.post("/v1/integrations/call-bot/sessions", headers=bot_headers, json=payload)
    assert replay.status_code == 200
    assert replay.json()["id"] == session_id

    changed_payload = {**payload, "termination_reason": "PATIENT_STOP"}
    conflict = client.post("/v1/integrations/call-bot/sessions", headers=bot_headers, json=changed_payload)
    assert conflict.status_code == 409

    alerts = client.get(
        f"/v1/patients/{caregiver_setup['patient_id']}/alerts",
        headers=caregiver_setup["headers"],
    )
    assert alerts.status_code == 200
    assert len(alerts.json()) == 1
    assert alerts.json()[0]["reason_code"] == "FAMILY_RECOGNITION_DIFFICULTY"
    assert "not a diagnosis" in alerts.json()[0]["reason_text"]

    acknowledged = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/alerts/{alerts.json()[0]['id']}/acknowledge",
        headers=caregiver_setup["headers"],
    )
    assert acknowledged.status_code == 200
    assert acknowledged.json()["acknowledged_at"] is not None

    active_alerts = client.get(
        f"/v1/patients/{caregiver_setup['patient_id']}/alerts",
        headers=caregiver_setup["headers"],
    )
    assert active_alerts.json() == []


def test_failed_call_is_recorded_without_caregiver_alert(client: TestClient, caregiver_setup: dict) -> None:
    now = datetime.now(timezone.utc)
    payload = {
        "external_id": "failed-call-1",
        "patient_id": caregiver_setup["patient_id"],
        "started_at": (now - timedelta(minutes=2)).isoformat(),
        "ended_at": now.isoformat(),
        "status": "FAILED",
        "termination_reason": "PROVIDER_ERROR",
        "metrics": [
            {
                "client_metric_id": "question-1",
                "item_type": "FAMILY_NAME",
                "accuracy": 0,
            },
            {
                "client_metric_id": "question-2",
                "item_type": "FAMILY_RELATIONSHIP",
                "accuracy": 0,
            },
        ],
    }
    bot_headers = {"X-Call-Bot-Key": "test-call-bot-key-that-is-long-enough"}
    ingested = client.post("/v1/integrations/call-bot/sessions", headers=bot_headers, json=payload)
    assert ingested.status_code == 201, ingested.text
    assert ingested.json()["review_classification"] == "ROUTINE"

    alerts = client.get(
        f"/v1/patients/{caregiver_setup['patient_id']}/alerts",
        headers=caregiver_setup["headers"],
    )
    assert alerts.status_code == 200
    assert alerts.json() == []

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

BOT_HEADERS = {"X-Call-Bot-Key": "test-call-bot-key-that-is-long-enough"}


def test_active_call_schedule_requires_patient_phone(client: TestClient, caregiver_setup: dict) -> None:
    patient = client.post(
        f"/v1/families/{caregiver_setup['family_id']}/patients",
        headers=caregiver_setup["headers"],
        json={"preferred_name": "No Phone", "timezone": "Asia/Kolkata"},
    )
    assert patient.status_code == 201, patient.text

    schedule = client.put(
        f"/v1/patients/{patient.json()['id']}/call-schedule",
        headers=caregiver_setup["headers"],
        json={"active": True},
    )
    assert schedule.status_code == 422
    assert "phone number" in schedule.json()["detail"]


def test_pausing_reminders_removes_patient_from_call_bot_schedule(
    client: TestClient,
    caregiver_setup: dict,
) -> None:
    patient_id = caregiver_setup["patient_id"]
    headers = caregiver_setup["headers"]
    schedule = client.put(
        f"/v1/patients/{patient_id}/call-schedule",
        headers=headers,
        json={"active": True},
    )
    assert schedule.status_code == 200, schedule.text
    assert len(client.get("/v1/integrations/call-bot/schedules", headers=BOT_HEADERS).json()) == 1

    paused = client.put(
        f"/v1/patients/{patient_id}/notification-preferences",
        headers=headers,
        json={"reminders_paused": True},
    )
    assert paused.status_code == 200, paused.text
    schedules = client.get("/v1/integrations/call-bot/schedules", headers=BOT_HEADERS)
    assert schedules.status_code == 200
    assert schedules.json() == []


def test_comparable_history_can_produce_a_non_diagnostic_declining_trend(
    client: TestClient,
    caregiver_setup: dict,
) -> None:
    patient_id = caregiver_setup["patient_id"]
    now = datetime.now(timezone.utc)
    samples = [
        (18, 1.0, 1000),
        (16, 1.0, 1000),
        (14, 1.0, 1000),
        (12, 1.0, 1000),
        (10, 1.0, 1000),
        (5, 0.4, 3000),
        (3, 0.4, 3000),
        (1, 0.4, 3000),
    ]
    for index, (days_ago, accuracy, latency) in enumerate(samples):
        started_at = now - timedelta(days=days_ago, minutes=5)
        response = client.post(
            "/v1/integrations/call-bot/sessions",
            headers=BOT_HEADERS,
            json={
                "external_id": f"trend-call-{index}",
                "patient_id": patient_id,
                "started_at": started_at.isoformat(),
                "ended_at": (started_at + timedelta(minutes=5)).isoformat(),
                "status": "COMPLETED",
                "metrics": [
                    {
                        "client_metric_id": "orientation-1",
                        "item_type": "ORIENTATION",
                        "accuracy": accuracy,
                        "average_response_latency_ms": latency,
                    }
                ],
            },
        )
        assert response.status_code == 201, response.text

    overview = client.get(f"/v1/patients/{patient_id}/overview", headers=caregiver_setup["headers"])
    assert overview.status_code == 200, overview.text
    trend = overview.json()["trend"]
    assert trend["data_sufficiency"] == "sufficient"
    assert trend["status"] == "declining"
    assert trend["baseline_session_count"] == 5
    assert trend["recent_session_count"] == 3
    assert "not a diagnosis" in trend["reason"]

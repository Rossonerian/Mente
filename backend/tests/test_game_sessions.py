from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient


def test_patient_device_can_submit_idempotent_game_session(
    client: TestClient,
    caregiver_setup: dict,
    patient_headers: dict[str, str],
) -> None:
    started_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    start_payload = {
        "activity_type": "MEMORY_MATCH",
        "client_session_id": "game-device-1-session-1",
        "started_at": started_at.isoformat(),
    }
    started = client.post("/v1/patient/game-sessions", headers=patient_headers, json=start_payload)
    assert started.status_code == 201, started.text
    session_id = started.json()["id"]

    replay = client.post("/v1/patient/game-sessions", headers=patient_headers, json=start_payload)
    assert replay.status_code == 200
    assert replay.json()["id"] == session_id

    changed_start = {**start_payload, "activity_type": "FAMILY_TREE"}
    conflict = client.post("/v1/patient/game-sessions", headers=patient_headers, json=changed_start)
    assert conflict.status_code == 409

    metric_payload = {
        "client_metric_id": "round-1",
        "item_type": "MEMORY_MATCH_PAIR",
        "accuracy": 1,
        "average_response_latency_ms": 1800,
        "hesitation_count": 0,
        "difficulty": "easy",
    }
    metric = client.post(
        f"/v1/patient/game-sessions/{session_id}/metrics",
        headers=patient_headers,
        json=metric_payload,
    )
    assert metric.status_code == 201, metric.text
    metric_replay = client.post(
        f"/v1/patient/game-sessions/{session_id}/metrics",
        headers=patient_headers,
        json=metric_payload,
    )
    assert metric_replay.status_code == 200
    assert metric_replay.json()["id"] == metric.json()["id"]

    changed_metric = {**metric_payload, "accuracy": 0}
    metric_conflict = client.post(
        f"/v1/patient/game-sessions/{session_id}/metrics",
        headers=patient_headers,
        json=changed_metric,
    )
    assert metric_conflict.status_code == 409

    finalized = client.post(
        f"/v1/patient/game-sessions/{session_id}/finalize",
        headers=patient_headers,
        json={"status": "COMPLETED", "ended_at": datetime.now(timezone.utc).isoformat()},
    )
    assert finalized.status_code == 200, finalized.text
    body = finalized.json()
    assert body["summary_accuracy"] == 1
    assert body["review_classification"] == "ROUTINE"
    assert len(body["metrics"]) == 1

    finalized_replay = client.post(
        f"/v1/patient/game-sessions/{session_id}/finalize",
        headers=patient_headers,
        json={"status": "COMPLETED", "ended_at": body["ended_at"]},
    )
    assert finalized_replay.status_code == 200

    post_finalize_metric_replay = client.post(
        f"/v1/patient/game-sessions/{session_id}/metrics",
        headers=patient_headers,
        json=metric_payload,
    )
    assert post_finalize_metric_replay.status_code == 200

    changed_finalization = client.post(
        f"/v1/patient/game-sessions/{session_id}/finalize",
        headers=patient_headers,
        json={"status": "INTERRUPTED", "termination_reason": "PATIENT_STOP"},
    )
    assert changed_finalization.status_code == 409

    overview = client.get(
        f"/v1/patients/{caregiver_setup['patient_id']}/overview",
        headers=caregiver_setup["headers"],
    )
    assert overview.status_code == 200, overview.text
    assert overview.json()["recent_sessions"][0]["source"] == "GAME"
    assert overview.json()["trend"]["data_sufficiency"] == "insufficient"

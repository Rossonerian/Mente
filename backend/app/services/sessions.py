from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import CognitiveSession, SessionMetric, utc_now
from ..schemas import MetricCreate
from ..security import payload_fingerprint
from .alerts import evaluate_session_alert

TERMINAL_STATUSES = {"COMPLETED", "EARLY_TERMINATED", "INTERRUPTED", "FAILED", "RESCHEDULED"}
MAX_SESSION_DURATION_MS = 12 * 60 * 60 * 1000


def add_metric(db: Session, session: CognitiveSession, payload: MetricCreate) -> tuple[SessionMetric, bool]:
    fingerprint = payload_fingerprint(payload.model_dump(mode="json"))
    existing = db.scalar(
        select(SessionMetric).where(
            SessionMetric.session_id == session.id,
            SessionMetric.client_metric_id == payload.client_metric_id,
        )
    )
    if existing is not None:
        if existing.idempotency_fingerprint != fingerprint:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="client_metric_id was replayed with different content",
            )
        return existing, False

    if session.status != "IN_PROGRESS":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Session is already finalized")

    metric = SessionMetric(
        session_id=session.id,
        patient_id=session.patient_id,
        client_metric_id=payload.client_metric_id,
        idempotency_fingerprint=fingerprint,
        item_type=payload.item_type,
        accuracy=payload.accuracy,
        average_response_latency_ms=payload.average_response_latency_ms,
        hesitation_count=payload.hesitation_count,
        difficulty=payload.difficulty,
        recorded_at=payload.recorded_at or utc_now(),
        metadata_json=payload.metadata_json,
    )
    db.add(metric)
    db.flush()
    return metric, True


def finalize_session(
    db: Session,
    session: CognitiveSession,
    *,
    final_status: str,
    ended_at: datetime | None,
    termination_reason: str | None,
    metadata_update: dict | None = None,
) -> CognitiveSession:
    if final_status not in TERMINAL_STATUSES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Invalid terminal status")

    if session.status in TERMINAL_STATUSES:
        stored_ended_at = session.ended_at
        ended_at_changed = ended_at is not None and (
            stored_ended_at is None or _as_utc(stored_ended_at) != _as_utc(ended_at)
        )
        metadata_changed = any(
            (session.metadata_json or {}).get(key) != value for key, value in (metadata_update or {}).items()
        )
        if (
            session.status != final_status
            or session.termination_reason != termination_reason
            or ended_at_changed
            or metadata_changed
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Session was already finalized with different terminal data",
            )
        return session

    final_time = ended_at or utc_now()
    started_at = _as_utc(session.started_at)
    final_time_utc = _as_utc(final_time)
    if final_time_utc < started_at:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="ended_at precedes started_at")

    metrics = list(db.scalars(select(SessionMetric).where(SessionMetric.session_id == session.id)))
    scorable = [metric.accuracy for metric in metrics if metric.accuracy is not None]
    latencies = [
        metric.average_response_latency_ms for metric in metrics if metric.average_response_latency_ms is not None
    ]

    duration_ms = round((final_time_utc - started_at).total_seconds() * 1000)
    if duration_ms > MAX_SESSION_DURATION_MS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Session duration exceeds 12 hours"
        )

    session.ended_at = final_time
    session.duration_ms = duration_ms
    session.status = final_status
    session.termination_reason = termination_reason
    session.summary_accuracy = sum(scorable) / len(scorable) if scorable else None
    session.average_response_latency_ms = sum(latencies) / len(latencies) if latencies else None
    session.hesitation_count = sum(metric.hesitation_count for metric in metrics)
    session.session_score = round(session.summary_accuracy * 100, 2) if session.summary_accuracy is not None else None
    session.metadata_json = {
        **(session.metadata_json or {}),
        **(metadata_update or {}),
        "scorable_count": len(scorable),
    }

    evaluate_session_alert(db, session, metrics)
    db.flush()
    return session


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)

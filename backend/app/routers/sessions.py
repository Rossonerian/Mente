from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..dependencies import CurrentUser, DbSession, PatientDeviceAuth, require_patient_access
from ..models import AlertEvent, CognitiveSession, SessionMetric, utc_now
from ..schemas import (
    GameSessionStart,
    MetricCreate,
    MetricRead,
    PatientOverview,
    SessionFinalize,
    SessionRead,
)
from ..security import payload_fingerprint
from ..services.sessions import add_metric, finalize_session
from ..services.trends import build_patient_trend

patient_router = APIRouter(prefix="/patient/game-sessions", tags=["patient game sessions"])
caregiver_router = APIRouter(prefix="/patients/{patient_id}", tags=["caregiver history"])


@patient_router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def start_game_session(
    payload: GameSessionStart,
    response: Response,
    device: PatientDeviceAuth,
    db: DbSession,
) -> CognitiveSession:
    fingerprint = payload_fingerprint(payload.model_dump(mode="json"))
    existing = db.scalar(
        select(CognitiveSession).where(
            CognitiveSession.patient_id == device.patient_id,
            CognitiveSession.source == "GAME",
            CognitiveSession.external_id == payload.client_session_id,
        )
    )
    if existing is not None:
        if existing.idempotency_fingerprint != fingerprint:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="client_session_id was replayed with different content",
            )
        response.status_code = status.HTTP_200_OK
        return existing

    session = CognitiveSession(
        patient_id=device.patient_id,
        source="GAME",
        activity_type=payload.activity_type,
        external_id=payload.client_session_id,
        idempotency_fingerprint=fingerprint,
        started_at=payload.started_at or utc_now(),
        metadata_json=payload.metadata_json,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@patient_router.post("/{session_id}/metrics", response_model=MetricRead, status_code=status.HTTP_201_CREATED)
def record_game_metric(
    session_id: str,
    payload: MetricCreate,
    response: Response,
    device: PatientDeviceAuth,
    db: DbSession,
) -> SessionMetric:
    session = _patient_session(db, session_id, device.patient_id)
    metric, created = add_metric(db, session, payload)
    if not created:
        response.status_code = status.HTTP_200_OK
    db.commit()
    db.refresh(metric)
    return metric


@patient_router.post("/{session_id}/finalize", response_model=SessionRead)
def finalize_game_session(
    session_id: str,
    payload: SessionFinalize,
    device: PatientDeviceAuth,
    db: DbSession,
) -> CognitiveSession:
    session = _patient_session(db, session_id, device.patient_id)
    finalize_session(
        db,
        session,
        final_status=payload.status,
        ended_at=payload.ended_at,
        termination_reason=payload.termination_reason,
        metadata_update=payload.metadata_json,
    )
    db.commit()
    return _session_with_metrics(db, session.id)


@caregiver_router.get("/sessions", response_model=list[SessionRead])
def list_patient_sessions(
    patient_id: str,
    user: CurrentUser,
    db: DbSession,
    limit: int = 20,
    source: str | None = None,
) -> list[CognitiveSession]:
    require_patient_access(db, user.id, patient_id)
    limit = min(max(limit, 1), 100)
    query = (
        select(CognitiveSession)
        .options(selectinload(CognitiveSession.metrics))
        .where(CognitiveSession.patient_id == patient_id)
        .order_by(CognitiveSession.started_at.desc())
        .limit(limit)
    )
    if source:
        normalized = source.upper()
        if normalized not in {"CALL", "GAME"}:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="source must be CALL or GAME")
        query = query.where(CognitiveSession.source == normalized)
    return list(db.scalars(query))


@caregiver_router.get("/overview", response_model=PatientOverview)
def patient_overview(patient_id: str, user: CurrentUser, db: DbSession) -> PatientOverview:
    patient = require_patient_access(db, user.id, patient_id)
    sessions = list(
        db.scalars(
            select(CognitiveSession)
            .options(selectinload(CognitiveSession.metrics))
            .where(CognitiveSession.patient_id == patient_id)
            .order_by(CognitiveSession.started_at.desc())
            .limit(10)
        )
    )
    alerts = list(
        db.scalars(
            select(AlertEvent)
            .where(AlertEvent.patient_id == patient_id, AlertEvent.acknowledged_at.is_(None))
            .order_by(AlertEvent.created_at.desc())
        )
    )
    return PatientOverview(
        patient=patient,
        recent_sessions=sessions,
        active_alerts=alerts,
        trend=build_patient_trend(db, patient),
    )


def _patient_session(db: DbSession, session_id: str, patient_id: str) -> CognitiveSession:
    session = db.scalar(
        select(CognitiveSession).where(
            CognitiveSession.id == session_id,
            CognitiveSession.patient_id == patient_id,
            CognitiveSession.source == "GAME",
        )
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game session not found")
    return session


def _session_with_metrics(db: DbSession, session_id: str) -> CognitiveSession:
    session = db.scalar(
        select(CognitiveSession)
        .options(selectinload(CognitiveSession.metrics))
        .where(CognitiveSession.id == session_id)
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

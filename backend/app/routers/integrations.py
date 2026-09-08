from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from ..dependencies import CallBotAuth, DbSession
from ..models import (
    CallSchedule,
    CognitiveSession,
    FamilyMemory,
    NotificationPreference,
    Patient,
)
from ..schemas import (
    CallBotContext,
    CallBotScheduleItem,
    CallBotSessionIngest,
    CallScheduleRead,
    MemoryRead,
    NotificationPreferenceRead,
    PatientRead,
    SessionRead,
)
from ..security import payload_fingerprint
from ..services.sessions import add_metric, finalize_session

router = APIRouter(prefix="/integrations/call-bot", tags=["call-bot integration"])


@router.get("/schedules", response_model=list[CallBotScheduleItem])
def list_active_schedules(_auth: CallBotAuth, db: DbSession) -> list[CallBotScheduleItem]:
    rows = db.execute(
        select(CallSchedule, Patient, NotificationPreference)
        .join(Patient, Patient.id == CallSchedule.patient_id)
        .outerjoin(NotificationPreference, NotificationPreference.patient_id == Patient.id)
        .where(
            CallSchedule.active.is_(True),
            Patient.active.is_(True),
            or_(
                NotificationPreference.patient_id.is_(None),
                NotificationPreference.reminders_paused.is_(False),
            ),
        )
        .order_by(CallSchedule.updated_at)
    ).all()
    return [
        CallBotScheduleItem(
            schedule=CallScheduleRead.model_validate(schedule),
            patient=PatientRead.model_validate(patient),
            notification_preference=(
                NotificationPreferenceRead.model_validate(preference) if preference is not None else None
            ),
        )
        for schedule, patient, preference in rows
    ]


@router.get("/patients/{patient_id}/context", response_model=CallBotContext)
def get_call_context(patient_id: str, _auth: CallBotAuth, db: DbSession) -> CallBotContext:
    patient = db.get(Patient, patient_id)
    if patient is None or not patient.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    memories = list(
        db.scalars(
            select(FamilyMemory)
            .where(
                FamilyMemory.patient_id == patient_id,
                FamilyMemory.active.is_(True),
                FamilyMemory.consent_recorded_at.is_not(None),
            )
            .order_by(FamilyMemory.created_at)
        )
    )
    schedule = db.scalar(select(CallSchedule).where(CallSchedule.patient_id == patient_id))
    preference = db.get(NotificationPreference, patient_id)
    return CallBotContext(
        patient=PatientRead.model_validate(patient),
        memories=[MemoryRead.model_validate(memory) for memory in memories],
        schedule=CallScheduleRead.model_validate(schedule) if schedule is not None else None,
        notification_preference=(
            NotificationPreferenceRead.model_validate(preference) if preference is not None else None
        ),
    )


@router.post("/sessions", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def ingest_call_session(
    payload: CallBotSessionIngest,
    response: Response,
    _auth: CallBotAuth,
    db: DbSession,
) -> CognitiveSession:
    fingerprint = payload_fingerprint(payload.model_dump(mode="json"))
    existing = db.scalar(
        select(CognitiveSession)
        .options(selectinload(CognitiveSession.metrics))
        .where(
            CognitiveSession.patient_id == payload.patient_id,
            CognitiveSession.source == "CALL",
            CognitiveSession.external_id == payload.external_id,
        )
    )
    if existing is not None:
        if existing.idempotency_fingerprint != fingerprint:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="external_id was replayed with different content",
            )
        response.status_code = status.HTTP_200_OK
        return existing

    patient = db.get(Patient, payload.patient_id)
    if patient is None or not patient.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    session = CognitiveSession(
        patient_id=patient.id,
        source="CALL",
        activity_type=payload.activity_type,
        external_id=payload.external_id,
        idempotency_fingerprint=fingerprint,
        started_at=payload.started_at,
        metadata_json=payload.metadata_json,
    )
    try:
        db.add(session)
        db.flush()
        for metric_payload in payload.metrics:
            add_metric(db, session, metric_payload)
        finalize_session(
            db,
            session,
            final_status=payload.status,
            ended_at=payload.ended_at,
            termination_reason=payload.termination_reason,
            metadata_update=payload.metadata_json,
        )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        existing = db.scalar(
            select(CognitiveSession)
            .options(selectinload(CognitiveSession.metrics))
            .where(
                CognitiveSession.patient_id == payload.patient_id,
                CognitiveSession.source == "CALL",
                CognitiveSession.external_id == payload.external_id,
            )
        )
        if existing is None:
            raise
        if existing.idempotency_fingerprint != fingerprint:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="external_id was replayed with different content",
            ) from exc
        response.status_code = status.HTTP_200_OK
        return existing
    stored_session = db.scalar(
        select(CognitiveSession)
        .options(selectinload(CognitiveSession.metrics))
        .where(CognitiveSession.id == session.id)
    )
    if stored_session is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Session persistence failed")
    return stored_session

from fastapi import APIRouter, HTTPException, status

from ..dependencies import CurrentUser, DbSession, require_patient_access
from ..models import CallSchedule, NotificationPreference
from ..schemas import (
    CallScheduleRead,
    CallScheduleUpsert,
    NotificationPreferenceRead,
    NotificationPreferenceUpsert,
)

router = APIRouter(prefix="/patients/{patient_id}", tags=["patient settings"])


@router.get("/call-schedule", response_model=CallScheduleRead | None)
def get_call_schedule(patient_id: str, user: CurrentUser, db: DbSession) -> CallSchedule | None:
    require_patient_access(db, user.id, patient_id)
    return db.query(CallSchedule).filter(CallSchedule.patient_id == patient_id).one_or_none()


@router.put("/call-schedule", response_model=CallScheduleRead)
def upsert_call_schedule(
    patient_id: str,
    payload: CallScheduleUpsert,
    user: CurrentUser,
    db: DbSession,
) -> CallSchedule:
    patient = require_patient_access(db, user.id, patient_id)
    if payload.active and patient.phone_e164 is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="A patient phone number is required before activating the call schedule",
        )
    schedule = db.query(CallSchedule).filter(CallSchedule.patient_id == patient_id).one_or_none()
    if schedule is None:
        schedule = CallSchedule(patient_id=patient_id)
        db.add(schedule)
    for field, value in payload.model_dump().items():
        setattr(schedule, field, value)
    patient.timezone = payload.timezone
    patient.preferred_language = payload.language_code
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/notification-preferences", response_model=NotificationPreferenceRead | None)
def get_notification_preferences(
    patient_id: str,
    user: CurrentUser,
    db: DbSession,
) -> NotificationPreference | None:
    require_patient_access(db, user.id, patient_id)
    return db.get(NotificationPreference, patient_id)


@router.put("/notification-preferences", response_model=NotificationPreferenceRead)
def upsert_notification_preferences(
    patient_id: str,
    payload: NotificationPreferenceUpsert,
    user: CurrentUser,
    db: DbSession,
) -> NotificationPreference:
    require_patient_access(db, user.id, patient_id)
    preference = db.get(NotificationPreference, patient_id)
    if preference is None:
        preference = NotificationPreference(patient_id=patient_id)
        db.add(preference)
    for field, value in payload.model_dump().items():
        setattr(preference, field, value)
    db.commit()
    db.refresh(preference)
    return preference

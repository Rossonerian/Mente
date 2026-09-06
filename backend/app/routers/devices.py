import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select, update

from ..dependencies import CurrentUser, DbSession, PatientDeviceAuth, require_patient_access
from ..models import FamilyMemory, Patient, PatientDevice, PatientJoinCode, utc_now
from ..rate_limit import enforce_rate_limit
from ..schemas import (
    DevelopmentAccessCodeRead,
    DeviceBindRequest,
    DeviceBindResponse,
    DeviceRead,
    JoinCodeCreate,
    JoinCodeRead,
    MemoryRead,
    MessageResponse,
    PatientRead,
)
from ..security import generate_device_token, generate_join_code, hash_opaque_token

caregiver_router = APIRouter(prefix="/patients/{patient_id}", tags=["patient devices"])
device_management_router = APIRouter(prefix="/patients/{patient_id}/devices", tags=["patient devices"])
patient_router = APIRouter(prefix="/patient", tags=["patient app"])


@caregiver_router.post("/join-codes", response_model=JoinCodeRead, status_code=status.HTTP_201_CREATED)
def create_join_code(
    patient_id: str,
    payload: JoinCodeCreate,
    request: Request,
    user: CurrentUser,
    db: DbSession,
) -> JoinCodeRead:
    patient = require_patient_access(db, user.id, patient_id)
    settings = request.app.state.settings
    expires_at = utc_now() + timedelta(minutes=payload.expires_minutes or settings.join_code_minutes)

    db.execute(
        update(PatientJoinCode)
        .where(PatientJoinCode.patient_id == patient.id, PatientJoinCode.used_at.is_(None))
        .values(used_at=utc_now())
    )

    code = ""
    code_hash = ""
    for _ in range(10):
        code = generate_join_code()
        code_hash = hash_opaque_token(code)
        if db.scalar(select(PatientJoinCode).where(PatientJoinCode.code_hash == code_hash)) is None:
            break
    else:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not create join code")

    record = PatientJoinCode(
        family_id=patient.family_id,
        patient_id=patient.id,
        code_hash=code_hash,
        expires_at=expires_at,
        created_by=user.id,
    )
    db.add(record)
    db.commit()
    return JoinCodeRead(code=code, patient_id=patient.id, expires_at=expires_at)


@caregiver_router.get("/development-access-code", response_model=DevelopmentAccessCodeRead)
def get_development_access_code(
    patient_id: str,
    request: Request,
    user: CurrentUser,
    db: DbSession,
) -> DevelopmentAccessCodeRead:
    patient = require_patient_access(db, user.id, patient_id)
    settings = request.app.state.settings
    enabled = (
        settings.environment in {"development", "test"}
        and settings.development_admin_code is not None
        and settings.development_patient_id == patient.id
    )
    return DevelopmentAccessCodeRead(
        enabled=enabled,
        patient_id=patient.id,
        code=settings.development_admin_code if enabled else None,
    )


@patient_router.post("/bind", response_model=DeviceBindResponse)
def bind_patient_device(payload: DeviceBindRequest, request: Request, db: DbSession) -> DeviceBindResponse:
    enforce_rate_limit(request, "patient-bind", request.app.state.settings.join_attempts_per_minute)
    now = datetime.now(timezone.utc)

    settings = request.app.state.settings
    if _is_development_admin_code(payload.code, settings):
        if settings.development_patient_id is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Development access is unavailable",
            )
        patient = db.scalar(
            select(Patient).where(Patient.id == settings.development_patient_id).with_for_update()
        )
        if patient is None or not patient.active:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Development patient is unavailable",
            )
        # Keep this fixture repeatable while ensuring an old local test token
        # cannot remain active indefinitely after the code is reused.
        db.execute(
            update(PatientDevice)
            .where(PatientDevice.patient_id == patient.id, PatientDevice.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        return _issue_patient_device(db, patient, now, settings.patient_device_token_days)

    record = db.scalar(
        select(PatientJoinCode)
        .where(PatientJoinCode.code_hash == hash_opaque_token(payload.code))
        .with_for_update()
    )
    if record is None or record.used_at is not None or _as_utc(record.expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired join code")

    patient = db.get(Patient, record.patient_id)
    if patient is None or not patient.active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient profile is unavailable")

    record.used_at = now
    return _issue_patient_device(db, patient, now, request.app.state.settings.patient_device_token_days)


@device_management_router.get("", response_model=list[DeviceRead])
def list_patient_devices(patient_id: str, user: CurrentUser, db: DbSession) -> list[PatientDevice]:
    require_patient_access(db, user.id, patient_id)
    return list(
        db.scalars(
            select(PatientDevice)
            .where(PatientDevice.patient_id == patient_id)
            .order_by(PatientDevice.created_at.desc())
        )
    )


@device_management_router.delete("/{device_id}", response_model=MessageResponse)
def revoke_patient_device(
    patient_id: str,
    device_id: str,
    user: CurrentUser,
    db: DbSession,
) -> MessageResponse:
    require_patient_access(db, user.id, patient_id)
    device = db.scalar(
        select(PatientDevice).where(PatientDevice.id == device_id, PatientDevice.patient_id == patient_id)
    )
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient device not found")
    if device.revoked_at is None:
        device.revoked_at = utc_now()
        db.commit()
    return MessageResponse(message="Patient device revoked")


@patient_router.get("/me", response_model=PatientRead)
def patient_me(device: PatientDeviceAuth, db: DbSession) -> Patient:
    patient = db.get(Patient, device.patient_id)
    if patient is None or not patient.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")
    return patient


@patient_router.get("/memories", response_model=list[MemoryRead])
def patient_memories(device: PatientDeviceAuth, db: DbSession) -> list[FamilyMemory]:
    return list(
        db.scalars(
            select(FamilyMemory)
            .where(
                FamilyMemory.patient_id == device.patient_id,
                FamilyMemory.active.is_(True),
                FamilyMemory.consent_recorded_at.is_not(None),
            )
            .order_by(FamilyMemory.created_at)
        )
    )


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def _is_development_admin_code(code: str, settings: object) -> bool:
    environment = getattr(settings, "environment", None)
    configured_code = getattr(settings, "development_admin_code", None)
    return (
        environment in {"development", "test"}
        and isinstance(configured_code, str)
        and secrets.compare_digest(code, configured_code)
    )


def _issue_patient_device(db: DbSession, patient: Patient, now: datetime, token_days: int) -> DeviceBindResponse:
    raw_token = generate_device_token()
    expires_at = now + timedelta(days=token_days)
    device = PatientDevice(
        patient_id=patient.id,
        token_hash=hash_opaque_token(raw_token),
        expires_at=expires_at,
    )
    db.add(device)
    db.commit()
    return DeviceBindResponse(
        patient_token=raw_token,
        expires_at=expires_at,
        patient=PatientRead.model_validate(patient),
    )

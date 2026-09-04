import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import FamilyMembership, Patient, PatientDevice, User, utc_now
from .security import (
    SupabaseTokenConfigurationError,
    SupabaseTokenError,
    VerifiedSupabaseClaims,
    hash_opaque_token,
)

bearer_scheme = HTTPBearer(auto_error=False)
patient_token_scheme = APIKeyHeader(name="X-Patient-Token", auto_error=False)
call_bot_key_scheme = APIKeyHeader(name="X-Call-Bot-Key", auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def get_verified_caregiver_claims(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> VerifiedSupabaseClaims:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    verifier = request.app.state.caregiver_token_verifier
    try:
        return verifier.verify(credentials.credentials)
    except SupabaseTokenConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Caregiver authentication is unavailable",
        ) from exc
    except SupabaseTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired caregiver token",
        ) from exc


VerifiedCaregiver = Annotated[VerifiedSupabaseClaims, Depends(get_verified_caregiver_claims)]


def get_current_user(db: DbSession, claims: VerifiedCaregiver) -> User:
    user = db.scalar(select(User).where(User.auth_user_id == claims.subject))
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CAREGIVER_PROFILE_NOT_PROVISIONED")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_family_access(db: Session, user_id: str, family_id: str) -> FamilyMembership:
    membership = db.scalar(
        select(FamilyMembership).where(
            FamilyMembership.family_id == family_id,
            FamilyMembership.user_id == user_id,
        )
    )
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return membership


def require_patient_access(db: Session, user_id: str, patient_id: str) -> Patient:
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    require_family_access(db, user_id, patient.family_id)
    return patient


def get_patient_device(
    db: DbSession,
    patient_token: Annotated[str | None, Depends(patient_token_scheme)] = None,
) -> PatientDevice:
    if not patient_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient device token required")
    device = db.scalar(select(PatientDevice).where(PatientDevice.token_hash == hash_opaque_token(patient_token)))
    now = datetime.now(timezone.utc)
    if device is None or device.revoked_at is not None or _as_utc(device.expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired patient device token")
    if _as_utc(device.last_seen_at) <= now - timedelta(minutes=5):
        device.last_seen_at = utc_now()
        db.commit()
    return device


PatientDeviceAuth = Annotated[PatientDevice, Depends(get_patient_device)]


def require_call_bot_key(
    request: Request,
    call_bot_key: Annotated[str | None, Depends(call_bot_key_scheme)] = None,
) -> None:
    expected = request.app.state.settings.call_bot_api_key
    if not call_bot_key or not secrets.compare_digest(call_bot_key, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid integration key")


CallBotAuth = Annotated[None, Depends(require_call_bot_key)]


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)

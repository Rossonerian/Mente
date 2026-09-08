from __future__ import annotations

import hashlib
import uuid
from datetime import datetime

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from ..dependencies import CurrentUser, DbSession, require_patient_access
from ..models import Asset
from ..schemas import AssetRead, AssetSignedUrl, MessageResponse
from ..services.storage import StorageAdapterError, SupabaseStorageAdapter

router = APIRouter(prefix="/patients/{patient_id}/assets", tags=["family assets"])

ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mp4": ".m4a",
}
UPLOAD_FILE = File(...)
CONSENT_FORM = Form(...)


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def upload_asset(
    patient_id: str,
    user: CurrentUser,
    db: DbSession,
    request: Request,
    file: UploadFile = UPLOAD_FILE,
    consent_recorded_at: datetime = CONSENT_FORM,
) -> Asset:
    patient = require_patient_access(db, user.id, patient_id)
    media_type = (file.content_type or "").lower()
    extension = ALLOWED_MEDIA_TYPES.get(media_type)
    if extension is None:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported asset MIME type")
    content = file.file.read(request.app.state.settings.storage_max_file_size_bytes + 1)
    if len(content) > request.app.state.settings.storage_max_file_size_bytes:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="Asset exceeds the size limit")
    if consent_recorded_at.tzinfo is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Consent timestamp requires a timezone",
        )

    storage_key = f"{patient.family_id}/{patient.id}/{uuid.uuid4().hex}{extension}"
    storage: SupabaseStorageAdapter = request.app.state.storage_adapter
    try:
        storage.upload(storage_key, content, media_type)
    except StorageAdapterError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Asset storage is unavailable") from exc

    asset = Asset(
        family_id=patient.family_id,
        patient_id=patient.id,
        storage_key=storage_key,
        media_type=media_type,
        size_bytes=len(content),
        checksum_sha256=hashlib.sha256(content).hexdigest(),
        consent_recorded_at=consent_recorded_at,
        created_by=user.id,
    )
    db.add(asset)
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        try:
            storage.delete(storage_key)
        except StorageAdapterError:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Asset could not be recorded",
        ) from exc
    db.refresh(asset)
    return asset


@router.get("", response_model=list[AssetRead])
def list_assets(patient_id: str, user: CurrentUser, db: DbSession) -> list[Asset]:
    require_patient_access(db, user.id, patient_id)
    return list(
        db.scalars(
            select(Asset)
            .where(Asset.patient_id == patient_id, Asset.status == "ACTIVE")
            .order_by(Asset.created_at)
        )
    )


@router.post("/{asset_id}/signed-url", response_model=AssetSignedUrl)
def get_signed_url(
    patient_id: str,
    asset_id: str,
    user: CurrentUser,
    db: DbSession,
    request: Request,
) -> AssetSignedUrl:
    require_patient_access(db, user.id, patient_id)
    asset = _get_active_asset(db, patient_id, asset_id)
    storage: SupabaseStorageAdapter = request.app.state.storage_adapter
    try:
        signed_url = storage.signed_download_url(
            asset.storage_key,
            request.app.state.settings.storage_signed_url_seconds,
        )
    except StorageAdapterError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Asset storage is unavailable") from exc
    return AssetSignedUrl(
        asset_id=asset.id,
        expires_in=request.app.state.settings.storage_signed_url_seconds,
        signed_url=signed_url,
    )


@router.delete("/{asset_id}", response_model=MessageResponse)
def delete_asset(
    patient_id: str,
    asset_id: str,
    user: CurrentUser,
    db: DbSession,
    request: Request,
) -> MessageResponse:
    require_patient_access(db, user.id, patient_id)
    asset = _get_active_asset(db, patient_id, asset_id)
    storage: SupabaseStorageAdapter = request.app.state.storage_adapter
    try:
        storage.delete(asset.storage_key)
    except StorageAdapterError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Asset storage is unavailable") from exc
    asset.status = "DELETED"
    asset.deleted_at = datetime.now().astimezone()
    db.commit()
    return MessageResponse(message="Asset deleted")


def _get_active_asset(db: DbSession, patient_id: str, asset_id: str) -> Asset:
    asset = db.scalar(
        select(Asset).where(Asset.id == asset_id, Asset.patient_id == patient_id, Asset.status == "ACTIVE")
    )
    if asset is None or asset.consent_recorded_at is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset

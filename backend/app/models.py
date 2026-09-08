from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    auth_user_id: Mapped[str | None] = mapped_column(
        Uuid(as_uuid=False).with_variant(String(36), "sqlite"), unique=True, index=True, nullable=True
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    memberships: Mapped[list[FamilyMembership]] = relationship(back_populates="user", cascade="all, delete-orphan")
    assets: Mapped[list[Asset]] = relationship(back_populates="created_by_user")


class Family(Base):
    __tablename__ = "families"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120))
    mode: Mapped[str] = mapped_column(String(16), default="SOLO")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    memberships: Mapped[list[FamilyMembership]] = relationship(back_populates="family", cascade="all, delete-orphan")
    patients: Mapped[list[Patient]] = relationship(back_populates="family", cascade="all, delete-orphan")


class FamilyMembership(Base):
    __tablename__ = "family_memberships"
    __table_args__ = (UniqueConstraint("family_id", "user_id", name="uq_family_member"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(16), default="OWNER")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    family: Mapped[Family] = relationship(back_populates="memberships")
    user: Mapped[User] = relationship(back_populates="memberships")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    preferred_name: Mapped[str] = mapped_column(String(120))
    legal_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone_e164: Mapped[str | None] = mapped_column(String(32), nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata")
    preferred_language: Mapped[str] = mapped_column(String(32), default="en-IN")
    high_energy_local_time: Mapped[str | None] = mapped_column(String(5), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    family: Mapped[Family] = relationship(back_populates="patients")
    memories: Mapped[list[FamilyMemory]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    sessions: Mapped[list[CognitiveSession]] = relationship(back_populates="patient", cascade="all, delete-orphan")


class FamilyMemory(Base):
    __tablename__ = "family_memories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    memory_type: Mapped[str] = mapped_column(String(32))
    subject_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    relationship_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    prompt_text: Mapped[str] = mapped_column(Text)
    accepted_answers: Mapped[list[str]] = mapped_column(JSON, default=list)
    asset_ref: Mapped[str | None] = mapped_column(String(500), nullable=True)
    asset_id: Mapped[str | None] = mapped_column(
        ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    patient: Mapped[Patient] = relationship(back_populates="memories")
    asset: Mapped[Asset | None] = relationship(back_populates="memories")


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        Index("ix_assets_family_patient_status", "family_id", "patient_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    storage_key: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    media_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    consent_recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    status: Mapped[str] = mapped_column(String(16), default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_by_user: Mapped[User] = relationship(back_populates="assets")
    memories: Mapped[list[FamilyMemory]] = relationship(back_populates="asset")


class CallSchedule(Base):
    __tablename__ = "call_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), unique=True, index=True)
    local_time: Mapped[str] = mapped_column(String(5), default="09:00")
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata")
    days_of_week: Mapped[list[int]] = mapped_column(JSON, default=lambda: list(range(7)))
    quiet_start: Mapped[str | None] = mapped_column(String(5), nullable=True)
    quiet_end: Mapped[str | None] = mapped_column(String(5), nullable=True)
    language_code: Mapped[str] = mapped_column(String(32), default="en-IN")
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_one_retry: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), primary_key=True)
    same_day_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    routine_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    caregiver_phone_e164: Mapped[str | None] = mapped_column(String(32), nullable=True)
    reminders_paused: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class PatientJoinCode(Base):
    __tablename__ = "patient_join_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    code_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class PatientDevice(Base):
    __tablename__ = "patient_devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class CognitiveSession(Base):
    __tablename__ = "cognitive_sessions"
    __table_args__ = (
        UniqueConstraint("patient_id", "source", "external_id", name="uq_patient_source_external_id"),
        Index("ix_sessions_patient_started", "patient_id", "started_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    source: Mapped[str] = mapped_column(String(8))
    activity_type: Mapped[str] = mapped_column(String(48))
    external_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    idempotency_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="IN_PROGRESS")
    termination_reason: Mapped[str | None] = mapped_column(String(48), nullable=True)
    session_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    summary_accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    average_response_latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    hesitation_count: Mapped[int] = mapped_column(Integer, default=0)
    review_classification: Mapped[str] = mapped_column(String(16), default="ROUTINE")
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped[Patient] = relationship(back_populates="sessions")
    metrics: Mapped[list[SessionMetric]] = relationship(back_populates="session", cascade="all, delete-orphan")
    alerts: Mapped[list[AlertEvent]] = relationship(back_populates="session", cascade="all, delete-orphan")


class SessionMetric(Base):
    __tablename__ = "session_metrics"
    __table_args__ = (
        UniqueConstraint("session_id", "client_metric_id", name="uq_session_client_metric"),
        Index("ix_metrics_patient_recorded", "patient_id", "recorded_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    session_id: Mapped[str] = mapped_column(ForeignKey("cognitive_sessions.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    client_metric_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    idempotency_fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    item_type: Mapped[str] = mapped_column(String(64))
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    average_response_latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    hesitation_count: Mapped[int] = mapped_column(Integer, default=0)
    difficulty: Mapped[str | None] = mapped_column(String(16), nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    session: Mapped[CognitiveSession] = relationship(back_populates="metrics")


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("cognitive_sessions.id", ondelete="CASCADE"), index=True)
    classification: Mapped[str] = mapped_column(String(16), default="SAME_DAY")
    reason_code: Mapped[str] = mapped_column(String(64))
    reason_text: Mapped[str] = mapped_column(Text)
    delivery_status: Mapped[str] = mapped_column(String(24), default="NOT_REQUESTED")
    dedupe_key: Mapped[str] = mapped_column(String(200), unique=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    acknowledged_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session: Mapped[CognitiveSession] = relationship(back_populates="alerts")

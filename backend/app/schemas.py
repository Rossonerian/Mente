import json
from datetime import datetime
from typing import Annotated, Any, Literal, Self, overload
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

MAX_METADATA_BYTES = 15_360


def validate_metadata(value: dict[str, Any]) -> dict[str, Any]:
    try:
        encoded = json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise ValueError("metadata_json must contain JSON-compatible values") from exc
    if len(encoded) > MAX_METADATA_BYTES:
        raise ValueError(f"metadata_json must not exceed {MAX_METADATA_BYTES} bytes")
    return value


Metadata = Annotated[dict[str, Any], AfterValidator(validate_metadata)]
AcceptedAnswer = Annotated[str, Field(min_length=1, max_length=160)]


class ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class UserRead(ApiModel):
    id: str
    email: EmailStr
    display_name: str
    created_at: datetime


class RegisterRequest(InputModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=120)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value: str) -> str:
        return validate_required_text(value, "display_name")


class LoginRequest(InputModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserRead


class FamilyCreate(InputModel):
    name: str = Field(min_length=1, max_length=120)
    mode: Literal["SOLO", "GROUP"] = "SOLO"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return validate_required_text(value, "name")


class FamilyRead(ApiModel):
    id: str
    name: str
    mode: str
    created_at: datetime


class PatientCreate(InputModel):
    preferred_name: str = Field(min_length=1, max_length=120)
    legal_name: str | None = Field(default=None, max_length=160)
    phone_e164: str | None = Field(default=None, max_length=32)
    timezone: str = Field(default="Asia/Kolkata", max_length=64)
    preferred_language: str = Field(default="en-IN", max_length=32)
    high_energy_local_time: str | None = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Unknown IANA timezone") from exc
        return value

    @field_validator("preferred_name")
    @classmethod
    def validate_preferred_name(cls, value: str) -> str:
        return validate_required_text(value, "preferred_name")

    @field_validator("high_energy_local_time")
    @classmethod
    def validate_high_energy_time(cls, value: str | None) -> str | None:
        return validate_hhmm(value)

    @field_validator("phone_e164")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        return validate_e164(value)


class PatientUpdate(InputModel):
    preferred_name: str | None = Field(default=None, min_length=1, max_length=120)
    legal_name: str | None = Field(default=None, max_length=160)
    phone_e164: str | None = Field(default=None, max_length=32)
    timezone: str | None = Field(default=None, max_length=64)
    preferred_language: str | None = Field(default=None, max_length=32)
    high_energy_local_time: str | None = None
    active: bool | None = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Unknown IANA timezone") from exc
        return value

    @field_validator("preferred_name")
    @classmethod
    def validate_preferred_name(cls, value: str | None) -> str | None:
        return validate_required_text(value, "preferred_name") if value is not None else None

    @field_validator("high_energy_local_time")
    @classmethod
    def validate_high_energy_time(cls, value: str | None) -> str | None:
        return validate_hhmm(value)

    @field_validator("phone_e164")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        return validate_e164(value)


class PatientRead(ApiModel):
    id: str
    family_id: str
    preferred_name: str
    legal_name: str | None
    phone_e164: str | None
    timezone: str
    preferred_language: str
    high_energy_local_time: str | None
    active: bool
    created_at: datetime
    updated_at: datetime


MemoryType = Literal["PERSON", "RELATIONSHIP", "VOICE", "MILESTONE", "PHOTO", "STORY"]


class MemoryCreate(InputModel):
    memory_type: MemoryType
    subject_name: str | None = Field(default=None, max_length=120)
    relationship_label: str | None = Field(default=None, max_length=120)
    prompt_text: str = Field(min_length=1, max_length=1000)
    accepted_answers: list[AcceptedAnswer] = Field(default_factory=list, max_length=20)
    asset_ref: str | None = Field(default=None, max_length=500)
    consent_recorded_at: datetime
    active: bool = True

    @field_validator("accepted_answers")
    @classmethod
    def normalize_answers(cls, answers: list[str]) -> list[str]:
        cleaned = [answer.strip() for answer in answers if answer.strip()]
        return list(dict.fromkeys(cleaned))

    @field_validator("prompt_text")
    @classmethod
    def validate_prompt_text(cls, value: str) -> str:
        return validate_required_text(value, "prompt_text")

    @field_validator("asset_ref")
    @classmethod
    def validate_asset(cls, value: str | None) -> str | None:
        return validate_asset_ref(value)

    @field_validator("consent_recorded_at")
    @classmethod
    def validate_consent_time(cls, value: datetime | None) -> datetime | None:
        return validate_aware_datetime(value)


class MemoryUpdate(InputModel):
    memory_type: MemoryType | None = None
    subject_name: str | None = Field(default=None, max_length=120)
    relationship_label: str | None = Field(default=None, max_length=120)
    prompt_text: str | None = Field(default=None, min_length=1, max_length=1000)
    accepted_answers: list[AcceptedAnswer] | None = Field(default=None, max_length=20)
    asset_ref: str | None = Field(default=None, max_length=500)
    consent_recorded_at: datetime | None = None
    active: bool | None = None

    @field_validator("accepted_answers")
    @classmethod
    def normalize_answers(cls, answers: list[str] | None) -> list[str] | None:
        if answers is None:
            return None
        cleaned = [answer.strip() for answer in answers if answer.strip()]
        return list(dict.fromkeys(cleaned))

    @field_validator("prompt_text")
    @classmethod
    def validate_prompt_text(cls, value: str | None) -> str | None:
        return validate_required_text(value, "prompt_text") if value is not None else None

    @field_validator("asset_ref")
    @classmethod
    def validate_asset(cls, value: str | None) -> str | None:
        return validate_asset_ref(value)

    @field_validator("consent_recorded_at")
    @classmethod
    def validate_consent_time(cls, value: datetime | None) -> datetime | None:
        return validate_aware_datetime(value)


class MemoryRead(ApiModel):
    id: str
    patient_id: str
    memory_type: str
    subject_name: str | None
    relationship_label: str | None
    prompt_text: str
    accepted_answers: list[str]
    asset_ref: str | None
    active: bool
    consent_recorded_at: datetime
    created_at: datetime
    updated_at: datetime


class CallScheduleUpsert(InputModel):
    local_time: str = "09:00"
    timezone: str = Field(default="Asia/Kolkata", max_length=64)
    days_of_week: list[int] = Field(default_factory=lambda: list(range(7)), min_length=1, max_length=7)
    quiet_start: str | None = None
    quiet_end: str | None = None
    language_code: str = Field(default="en-IN", max_length=32)
    active: bool = False
    allow_one_retry: bool = False

    @field_validator("local_time", "quiet_start", "quiet_end")
    @classmethod
    def validate_times(cls, value: str | None) -> str | None:
        return validate_hhmm(value)

    @field_validator("days_of_week")
    @classmethod
    def validate_days(cls, values: list[int]) -> list[int]:
        if any(value < 0 or value > 6 for value in values):
            raise ValueError("days_of_week values must be between 0 (Monday) and 6 (Sunday)")
        return sorted(set(values))

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Unknown IANA timezone") from exc
        return value

    @model_validator(mode="after")
    def validate_quiet_hours(self) -> Self:
        if (self.quiet_start is None) != (self.quiet_end is None):
            raise ValueError("quiet_start and quiet_end must be provided together")
        if self.quiet_start is not None and self.quiet_start == self.quiet_end:
            raise ValueError("quiet_start and quiet_end must be different")
        return self


class CallScheduleRead(ApiModel):
    id: str
    patient_id: str
    local_time: str
    timezone: str
    days_of_week: list[int]
    quiet_start: str | None
    quiet_end: str | None
    language_code: str
    active: bool
    allow_one_retry: bool
    updated_at: datetime


class NotificationPreferenceUpsert(InputModel):
    same_day_enabled: bool = True
    routine_enabled: bool = False
    caregiver_phone_e164: str | None = Field(default=None, max_length=32)
    reminders_paused: bool = False

    @field_validator("caregiver_phone_e164")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        return validate_e164(value)


class NotificationPreferenceRead(ApiModel):
    patient_id: str
    same_day_enabled: bool
    routine_enabled: bool
    caregiver_phone_e164: str | None
    reminders_paused: bool
    updated_at: datetime


class JoinCodeCreate(InputModel):
    expires_minutes: int | None = Field(default=None, ge=5, le=60)


class JoinCodeRead(BaseModel):
    code: str
    patient_id: str
    expires_at: datetime


class DeviceBindRequest(InputModel):
    code: str = Field(pattern=r"^\d{6}$")


class DeviceBindResponse(BaseModel):
    patient_token: str
    expires_at: datetime
    patient: PatientRead


class DeviceRead(ApiModel):
    id: str
    patient_id: str
    expires_at: datetime
    revoked_at: datetime | None
    last_seen_at: datetime
    created_at: datetime


class GameSessionStart(InputModel):
    activity_type: Literal[
        "MEMORY_MATCH",
        "FAMILY_TREE",
        "MEMORY_TRAIN",
        "MILESTONE_TIMELINE",
        "FINISH_THE_STORY",
        "CATEGORY_ALPHABET",
    ]
    client_session_id: str = Field(min_length=1, max_length=160)
    started_at: datetime | None = None
    metadata_json: Metadata = Field(default_factory=dict)

    @field_validator("started_at")
    @classmethod
    def validate_started_at(cls, value: datetime | None) -> datetime | None:
        return validate_aware_datetime(value)


class MetricCreate(InputModel):
    client_metric_id: str = Field(min_length=1, max_length=120)
    item_type: str = Field(min_length=1, max_length=64)
    accuracy: float | None = Field(default=None, ge=0, le=1)
    average_response_latency_ms: float | None = Field(default=None, ge=0)
    hesitation_count: int = Field(default=0, ge=0)
    difficulty: Literal["easy", "medium", "hard"] | None = None
    recorded_at: datetime | None = None
    metadata_json: Metadata = Field(default_factory=dict)

    @field_validator("recorded_at")
    @classmethod
    def validate_recorded_at(cls, value: datetime | None) -> datetime | None:
        return validate_aware_datetime(value)


class SessionFinalize(InputModel):
    status: Literal["COMPLETED", "EARLY_TERMINATED", "INTERRUPTED"]
    ended_at: datetime | None = None
    termination_reason: str | None = Field(default=None, max_length=48)
    metadata_json: Metadata = Field(default_factory=dict)

    @field_validator("ended_at")
    @classmethod
    def validate_ended_at(cls, value: datetime | None) -> datetime | None:
        return validate_aware_datetime(value)

    @model_validator(mode="after")
    def require_reason_for_early_end(self) -> Self:
        if self.status != "COMPLETED" and not self.termination_reason:
            raise ValueError("termination_reason is required when a session does not complete")
        return self


class MetricRead(ApiModel):
    id: str
    session_id: str
    patient_id: str
    client_metric_id: str | None
    item_type: str
    accuracy: float | None
    average_response_latency_ms: float | None
    hesitation_count: int
    difficulty: str | None
    recorded_at: datetime
    metadata_json: Metadata


class SessionRead(ApiModel):
    id: str
    patient_id: str
    source: str
    activity_type: str
    external_id: str | None
    started_at: datetime
    ended_at: datetime | None
    duration_ms: int | None
    status: str
    termination_reason: str | None
    session_score: float | None
    summary_accuracy: float | None
    average_response_latency_ms: float | None
    hesitation_count: int
    review_classification: str
    metadata_json: Metadata
    metrics: list[MetricRead] = Field(default_factory=list)


class AlertRead(ApiModel):
    id: str
    patient_id: str
    session_id: str
    classification: str
    reason_code: str
    reason_text: str
    delivery_status: str
    acknowledged_at: datetime | None
    created_at: datetime


class TrendRead(BaseModel):
    status: Literal["stable", "watch", "declining"]
    label: str
    reason: str
    data_sufficiency: Literal["insufficient", "sufficient"]
    baseline_start: datetime
    baseline_end: datetime
    recent_start: datetime
    recent_end: datetime
    baseline_session_count: int
    recent_session_count: int
    comparable_strata: int
    accuracy_adverse_z: float | None = None
    latency_adverse_z: float | None = None
    combined_score: float | None = None
    model_version: str = "mvp-trend-v1"


class PatientOverview(BaseModel):
    patient: PatientRead
    recent_sessions: list[SessionRead]
    active_alerts: list[AlertRead]
    trend: TrendRead


class CallBotContext(BaseModel):
    patient: PatientRead
    memories: list[MemoryRead]
    schedule: CallScheduleRead | None
    notification_preference: NotificationPreferenceRead | None


class CallBotScheduleItem(BaseModel):
    schedule: CallScheduleRead
    patient: PatientRead
    notification_preference: NotificationPreferenceRead | None


class CallBotSessionIngest(InputModel):
    external_id: str = Field(min_length=1, max_length=160)
    patient_id: str
    activity_type: Literal["DAILY_CALL"] = "DAILY_CALL"
    started_at: datetime
    ended_at: datetime
    status: Literal["COMPLETED", "EARLY_TERMINATED", "INTERRUPTED", "FAILED", "RESCHEDULED"]
    termination_reason: str | None = Field(default=None, max_length=48)
    metrics: list[MetricCreate] = Field(default_factory=list, max_length=20)
    metadata_json: Metadata = Field(default_factory=dict)

    @field_validator("started_at", "ended_at")
    @classmethod
    def validate_timestamps(cls, value: datetime) -> datetime:
        return validate_aware_datetime(value)

    @model_validator(mode="after")
    def validate_timeline(self) -> Self:
        if self.ended_at < self.started_at:
            raise ValueError("ended_at must be on or after started_at")
        if self.status not in {"COMPLETED", "RESCHEDULED"} and not self.termination_reason:
            raise ValueError("termination_reason is required for this status")
        return self


class MessageResponse(BaseModel):
    message: str


def validate_hhmm(value: str | None) -> str | None:
    if value is None:
        return None
    parts = value.split(":")
    if len(parts) != 2 or not all(part.isdigit() for part in parts):
        raise ValueError("Time must use HH:MM in 24-hour format")
    hour, minute = map(int, parts)
    if hour > 23 or minute > 59:
        raise ValueError("Time must use HH:MM in 24-hour format")
    return f"{hour:02d}:{minute:02d}"


def validate_e164(value: str | None) -> str | None:
    if value is None:
        return None
    if not value.startswith("+") or not value[1:].isdigit() or not 8 <= len(value[1:]) <= 15 or value[1] == "0":
        raise ValueError("Phone number must use E.164 format, for example +919876543210")
    return value


def validate_asset_ref(value: str | None) -> str | None:
    if value is None:
        return None
    if (
        ":" in value
        or "\\" in value
        or value.startswith("/")
        or any(part in {"", ".", ".."} for part in value.split("/"))
    ):
        raise ValueError("asset_ref must be an opaque relative storage key, not a URL or path traversal")
    return value


def validate_required_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} must not be blank")
    return cleaned


@overload
def validate_aware_datetime(value: datetime) -> datetime: ...


@overload
def validate_aware_datetime(value: None) -> None: ...


def validate_aware_datetime(value: datetime | None) -> datetime | None:
    if value is not None and value.tzinfo is None:
        raise ValueError("Timestamp must include a timezone offset")
    return value

from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from statistics import mean, pstdev
<<<<<<< HEAD
from typing import Literal
=======
>>>>>>> origin/new_components
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import CognitiveSession, Patient
from ..schemas import TrendRead

ELIGIBLE_STATUSES = {"COMPLETED", "EARLY_TERMINATED", "INTERRUPTED"}


def build_patient_trend(db: Session, patient: Patient, now: datetime | None = None) -> TrendRead:
    now_utc = _as_utc(now or datetime.now(timezone.utc))
    patient_zone = ZoneInfo(patient.timezone)
    local_today = now_utc.astimezone(patient_zone).date()

    baseline_start = _local_midnight_utc(local_today - timedelta(days=21), patient_zone)
    baseline_end = _local_midnight_utc(local_today - timedelta(days=7), patient_zone)
    recent_start = baseline_end
    recent_end = _local_midnight_utc(local_today + timedelta(days=1), patient_zone)

    candidate_sessions = list(
        db.scalars(
            select(CognitiveSession).where(
                CognitiveSession.patient_id == patient.id,
                CognitiveSession.started_at >= baseline_start,
                CognitiveSession.started_at < recent_end,
                CognitiveSession.status.in_(ELIGIBLE_STATUSES),
                CognitiveSession.summary_accuracy.is_not(None),
            )
        )
    )
    sessions = [
        session
        for session in candidate_sessions
        if session.status == "COMPLETED" or (session.metadata_json or {}).get("scorable_count", 0) >= 3
    ]

    baseline = [session for session in sessions if baseline_start <= _as_utc(session.started_at) < baseline_end]
    recent = [session for session in sessions if recent_start <= _as_utc(session.started_at) < recent_end]
    baseline_days = {_as_utc(session.started_at).astimezone(patient_zone).date() for session in baseline}
    recent_days = {_as_utc(session.started_at).astimezone(patient_zone).date() for session in recent}

    grouped_baseline = _group_sessions(baseline)
    grouped_recent = _group_sessions(recent)
    common_keys = sorted(set(grouped_baseline) & set(grouped_recent))

    sufficient = (
        len(baseline) >= 5
        and len(baseline_days) >= 5
        and len(recent) >= 3
        and len(recent_days) >= 3
        and bool(common_keys)
    )
    if not sufficient:
        return TrendRead(
            status="stable",
            label="Provisional",
            reason="There is not enough comparable history yet to describe a recent change.",
            data_sufficiency="insufficient",
            baseline_start=baseline_start,
            baseline_end=baseline_end,
            recent_start=recent_start,
            recent_end=recent_end,
            baseline_session_count=len(baseline),
            recent_session_count=len(recent),
            comparable_strata=len(common_keys),
        )

    accuracy_values: list[float] = []
    latency_values: list[float] = []
    combined_values: list[float] = []

    for key in common_keys:
        base_group = grouped_baseline[key]
        recent_group = grouped_recent[key]
        base_accuracy = [session.summary_accuracy for session in base_group if session.summary_accuracy is not None]
        recent_accuracy = [session.summary_accuracy for session in recent_group if session.summary_accuracy is not None]
        if not base_accuracy or not recent_accuracy:
            continue

        accuracy_sd = max(pstdev(base_accuracy), 0.05)
        accuracy_z = (mean(base_accuracy) - mean(recent_accuracy)) / accuracy_sd

        base_latency = [
            session.average_response_latency_ms
            for session in base_group
            if session.average_response_latency_ms is not None
        ]
        recent_latency = [
            session.average_response_latency_ms
            for session in recent_group
            if session.average_response_latency_ms is not None
        ]
        latency_z = 0.0
        if base_latency and recent_latency:
            latency_floor = max(pstdev(base_latency), 0.1 * mean(base_latency), 250.0)
            latency_z = (mean(recent_latency) - mean(base_latency)) / latency_floor

        combined = 0.5 * max(0.0, accuracy_z) + 0.5 * max(0.0, latency_z)
        accuracy_values.append(accuracy_z)
        latency_values.append(latency_z)
        combined_values.append(combined)

    if not combined_values:
        return TrendRead(
            status="stable",
            label="Provisional",
            reason="There is not enough comparable scorable history yet to describe a recent change.",
            data_sufficiency="insufficient",
            baseline_start=baseline_start,
            baseline_end=baseline_end,
            recent_start=recent_start,
            recent_end=recent_end,
            baseline_session_count=len(baseline),
            recent_session_count=len(recent),
            comparable_strata=0,
        )

    accuracy_z = mean(accuracy_values)
    latency_z = mean(latency_values)
    score = mean(combined_values)

<<<<<<< HEAD
    trend_status: Literal["stable", "watch", "declining"]
=======
>>>>>>> origin/new_components
    if score >= 2.0 and accuracy_z > 0 and latency_z > 0:
        trend_status, label = "declining", "Needs attention"
        reason = "Recent comparable sessions were both less accurate and slower than the earlier observed pattern."
    elif score >= 1.0 or accuracy_z >= 1.5 or latency_z >= 1.5:
        trend_status, label = "watch", "Watch"
        changed = []
        if accuracy_z > 0:
            changed.append("accuracy")
        if latency_z > 0:
            changed.append("response pace")
        reason = f"Recent comparable sessions show a change in {' and '.join(changed) or 'the observed pattern'}."
    else:
        trend_status, label = "stable", "Stable"
        reason = "Recent comparable sessions do not show a material change from the earlier observed pattern."

    reason += " This is an assistive observation, not a diagnosis."
    return TrendRead(
        status=trend_status,
        label=label,
        reason=reason,
        data_sufficiency="sufficient",
        baseline_start=baseline_start,
        baseline_end=baseline_end,
        recent_start=recent_start,
        recent_end=recent_end,
        baseline_session_count=len(baseline),
        recent_session_count=len(recent),
        comparable_strata=len(combined_values),
        accuracy_adverse_z=round(accuracy_z, 3),
        latency_adverse_z=round(latency_z, 3),
        combined_score=round(score, 3),
    )


def _group_sessions(sessions: list[CognitiveSession]) -> dict[tuple[str, str], list[CognitiveSession]]:
    groups: dict[tuple[str, str], list[CognitiveSession]] = defaultdict(list)
    for session in sessions:
        groups[(session.source, session.activity_type)].append(session)
    return groups


def _local_midnight_utc(day: date, zone: ZoneInfo) -> datetime:
    return datetime.combine(day, time.min, tzinfo=zone).astimezone(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)

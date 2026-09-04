from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AlertEvent, CognitiveSession, SessionMetric

FAMILY_ITEM_TYPES = {"FAMILY_NAME", "FAMILY_RELATIONSHIP", "FAMILY_VOICE", "FAMILY_RECOGNITION"}


def evaluate_session_alert(
    db: Session,
    session: CognitiveSession,
    metrics: list[SessionMetric],
) -> AlertEvent | None:
    if session.status not in {"COMPLETED", "EARLY_TERMINATED", "INTERRUPTED"}:
        session.review_classification = "ROUTINE"
        return None

    reason_code: str | None = None
    reason_text: str | None = None

    family_metrics = [
        metric for metric in metrics if metric.item_type in FAMILY_ITEM_TYPES and metric.accuracy is not None
    ]
    if len(family_metrics) >= 2 and all(metric.accuracy == 0 for metric in family_metrics):
        reason_code = "FAMILY_RECOGNITION_DIFFICULTY"
        reason_text = (
            "Several familiar-family prompts needed more support in this session. "
            "This is an observed change for caregiver review, not a diagnosis."
        )
    elif session.termination_reason == "CONSECUTIVE_INCORRECT":
        reason_code = "DIFFICULTY_EARLY_TERMINATION"
        reason_text = (
            "The session ended early after repeated difficulty. Consider checking in today; "
            "this observation is not a medical conclusion."
        )
    elif session.termination_reason == "PATIENT_STOP" and (session.metadata_json or {}).get("after_difficulty"):
        reason_code = "STOP_AFTER_DIFFICULTY"
        reason_text = "The session was stopped after more support was needed. Consider a gentle check-in today."

    if reason_code is None or reason_text is None:
        session.review_classification = "ROUTINE"
        return None

    session.review_classification = "SAME_DAY"
    dedupe_key = f"{session.patient_id}:{session.id}:{reason_code}"
    existing = db.scalar(select(AlertEvent).where(AlertEvent.dedupe_key == dedupe_key))
    if existing is not None:
        return existing

    alert = AlertEvent(
        patient_id=session.patient_id,
        session_id=session.id,
        classification="SAME_DAY",
        reason_code=reason_code,
        reason_text=reason_text,
        dedupe_key=dedupe_key,
    )
    db.add(alert)
    return alert

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession, require_patient_access
from ..models import AlertEvent, utc_now
from ..schemas import AlertRead

router = APIRouter(prefix="/patients/{patient_id}/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertRead])
def list_alerts(
    patient_id: str,
    user: CurrentUser,
    db: DbSession,
    include_acknowledged: bool = False,
) -> list[AlertEvent]:
    require_patient_access(db, user.id, patient_id)
    query = select(AlertEvent).where(AlertEvent.patient_id == patient_id)
    if not include_acknowledged:
        query = query.where(AlertEvent.acknowledged_at.is_(None))
    return list(db.scalars(query.order_by(AlertEvent.created_at.desc())))


@router.post("/{alert_id}/acknowledge", response_model=AlertRead)
def acknowledge_alert(patient_id: str, alert_id: str, user: CurrentUser, db: DbSession) -> AlertEvent:
    require_patient_access(db, user.id, patient_id)
    alert = db.scalar(select(AlertEvent).where(AlertEvent.id == alert_id, AlertEvent.patient_id == patient_id))
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    if alert.acknowledged_at is None:
        alert.acknowledged_at = utc_now()
        alert.acknowledged_by = user.id
        db.commit()
        db.refresh(alert)
    return alert

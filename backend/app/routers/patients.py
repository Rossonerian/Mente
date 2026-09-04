from fastapi import APIRouter

from ..dependencies import CurrentUser, DbSession, require_patient_access
from ..models import Patient
from ..schemas import PatientRead, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: str, user: CurrentUser, db: DbSession) -> Patient:
    return require_patient_access(db, user.id, patient_id)


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(patient_id: str, payload: PatientUpdate, user: CurrentUser, db: DbSession) -> Patient:
    patient = require_patient_access(db, user.id, patient_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient

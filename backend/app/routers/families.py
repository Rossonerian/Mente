from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession, require_family_access
from ..models import Family, FamilyMembership, Patient
from ..schemas import FamilyCreate, FamilyRead, PatientCreate, PatientRead

router = APIRouter(prefix="/families", tags=["families"])


@router.get("", response_model=list[FamilyRead])
def list_families(user: CurrentUser, db: DbSession) -> list[Family]:
    return list(
        db.scalars(
            select(Family).join(FamilyMembership).where(FamilyMembership.user_id == user.id).order_by(Family.created_at)
        )
    )


@router.post("", response_model=FamilyRead, status_code=status.HTTP_201_CREATED)
def create_family(payload: FamilyCreate, user: CurrentUser, db: DbSession) -> Family:
    family = Family(name=payload.name.strip(), mode=payload.mode)
    db.add(family)
    db.flush()
    db.add(FamilyMembership(family_id=family.id, user_id=user.id, role="OWNER"))
    db.commit()
    db.refresh(family)
    return family


@router.get("/{family_id}", response_model=FamilyRead)
def get_family(family_id: str, user: CurrentUser, db: DbSession) -> Family:
    require_family_access(db, user.id, family_id)
    family = db.get(Family, family_id)
    if family is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return family


@router.get("/{family_id}/patients", response_model=list[PatientRead])
def list_patients(family_id: str, user: CurrentUser, db: DbSession) -> list[Patient]:
    require_family_access(db, user.id, family_id)
    return list(db.scalars(select(Patient).where(Patient.family_id == family_id).order_by(Patient.created_at)))


@router.post("/{family_id}/patients", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(family_id: str, payload: PatientCreate, user: CurrentUser, db: DbSession) -> Patient:
    require_family_access(db, user.id, family_id)
    patient = Patient(family_id=family_id, **payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

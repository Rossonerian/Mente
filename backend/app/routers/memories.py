from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession, require_patient_access
from ..models import FamilyMemory
from ..schemas import MemoryCreate, MemoryRead, MemoryUpdate, MessageResponse

router = APIRouter(prefix="/patients/{patient_id}/memories", tags=["family memories"])


@router.get("", response_model=list[MemoryRead])
def list_memories(patient_id: str, user: CurrentUser, db: DbSession, active_only: bool = False) -> list[FamilyMemory]:
    require_patient_access(db, user.id, patient_id)
    query = select(FamilyMemory).where(FamilyMemory.patient_id == patient_id)
    if active_only:
        query = query.where(FamilyMemory.active.is_(True))
    return list(db.scalars(query.order_by(FamilyMemory.created_at)))


@router.post("", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
def create_memory(patient_id: str, payload: MemoryCreate, user: CurrentUser, db: DbSession) -> FamilyMemory:
    require_patient_access(db, user.id, patient_id)
    memory = FamilyMemory(patient_id=patient_id, **payload.model_dump())
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


@router.patch("/{memory_id}", response_model=MemoryRead)
def update_memory(
    patient_id: str,
    memory_id: str,
    payload: MemoryUpdate,
    user: CurrentUser,
    db: DbSession,
) -> FamilyMemory:
    require_patient_access(db, user.id, patient_id)
    memory = _get_memory(db, patient_id, memory_id)
    updates = payload.model_dump(exclude_unset=True)
    resulting_consent = updates.get("consent_recorded_at", memory.consent_recorded_at)
    if resulting_consent is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="consent_recorded_at is required for family memories",
        )
    for field, value in updates.items():
        setattr(memory, field, value)
    db.commit()
    db.refresh(memory)
    return memory


@router.delete("/{memory_id}", response_model=MessageResponse)
def delete_memory(patient_id: str, memory_id: str, user: CurrentUser, db: DbSession) -> MessageResponse:
    require_patient_access(db, user.id, patient_id)
    memory = _get_memory(db, patient_id, memory_id)
    db.delete(memory)
    db.commit()
    return MessageResponse(message="Memory deleted")


def _get_memory(db: DbSession, patient_id: str, memory_id: str) -> FamilyMemory:
    memory = db.scalar(select(FamilyMemory).where(FamilyMemory.id == memory_id, FamilyMemory.patient_id == patient_id))
    if memory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    return memory

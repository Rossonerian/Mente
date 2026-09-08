from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DbSession, VerifiedCaregiver
from ..models import User
from ..schemas import CaregiverProfileCreate, UserRead

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/profile", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_profile(payload: CaregiverProfileCreate, claims: VerifiedCaregiver, db: DbSession) -> User:
    if not claims.email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Supabase Auth did not provide an email for profile creation",
        )
    existing_profile = db.query(User).filter(User.auth_user_id == claims.subject).one_or_none()
    if existing_profile is not None:
        return existing_profile
    existing_email = db.query(User).filter(User.email == claims.email).one_or_none()
    if existing_email is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Caregiver email is already linked to another profile",
        )

    user = User(auth_user_id=claims.subject, email=claims.email, display_name=payload.display_name.strip())
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Caregiver profile already exists") from exc
    db.refresh(user)
    return user


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> User:
    return user

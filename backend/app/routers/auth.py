<<<<<<< HEAD
from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DbSession, VerifiedCaregiver
from ..models import User
from ..schemas import CaregiverProfileCreate, UserRead
=======
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DbSession
from ..models import User
from ..rate_limit import enforce_rate_limit
from ..schemas import AuthResponse, LoginRequest, RegisterRequest, UserRead
from ..security import create_access_token, hash_password, verify_password
>>>>>>> origin/new_components

router = APIRouter(prefix="/auth", tags=["authentication"])


<<<<<<< HEAD
@router.post("/profile", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_profile(payload: CaregiverProfileCreate, claims: VerifiedCaregiver, db: DbSession) -> User:
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
=======
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: DbSession) -> AuthResponse:
    enforce_rate_limit(request, "auth-register", request.app.state.settings.auth_attempts_per_minute)
    email = payload.email.lower()
    if db.scalar(select(User).where(func.lower(User.email) == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(email=email, display_name=payload.display_name.strip(), password_hash=hash_password(payload.password))
>>>>>>> origin/new_components
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
<<<<<<< HEAD
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Caregiver profile already exists") from exc
    db.refresh(user)
    return user
=======
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered") from exc
    db.refresh(user)
    return _auth_response(user, request)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, request: Request, db: DbSession) -> AuthResponse:
    enforce_rate_limit(request, "auth-login", request.app.state.settings.auth_attempts_per_minute)
    user = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return _auth_response(user, request)
>>>>>>> origin/new_components


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> User:
    return user
<<<<<<< HEAD
=======


def _auth_response(user: User, request: Request) -> AuthResponse:
    settings = request.app.state.settings
    token = create_access_token(
        user.id,
        settings.jwt_secret,
        settings.jwt_algorithm,
        settings.jwt_issuer,
        settings.access_token_minutes,
    )
    return AuthResponse(access_token=token, user=UserRead.model_validate(user))
>>>>>>> origin/new_components

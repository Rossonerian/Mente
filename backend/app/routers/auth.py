from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DbSession
from ..models import User
from ..rate_limit import enforce_rate_limit
from ..schemas import AuthResponse, LoginRequest, RegisterRequest, UserRead
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: DbSession) -> AuthResponse:
    enforce_rate_limit(request, "auth-register", request.app.state.settings.auth_attempts_per_minute)
    email = payload.email.lower()
    if db.scalar(select(User).where(func.lower(User.email) == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(email=email, display_name=payload.display_name.strip(), password_hash=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
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


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> User:
    return user


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

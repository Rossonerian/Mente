from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import NoReturn
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from .config import Settings, get_settings
from .database import Base, create_database_engine, create_session_factory
from .rate_limit import FixedWindowRateLimiter
from .routers import alerts, assets, auth, devices, families, integrations, memories, patients, sessions, settings
from .security import SupabaseTokenConfigurationError, SupabaseTokenVerifier
from .services.storage import SupabaseStorageAdapter


class _UnavailableSupabaseTokenVerifier:
    def verify(self, _token: str) -> NoReturn:
        raise SupabaseTokenConfigurationError("SUPABASE_URL is not configured")


def create_app(settings_override: Settings | None = None) -> FastAPI:
    settings_value = settings_override or get_settings()
    engine = create_database_engine(
        settings_value.database_url,
        pool_size=settings_value.db_pool_size,
        max_overflow=settings_value.db_max_overflow,
        pool_timeout=settings_value.db_pool_timeout_seconds,
        connect_timeout=settings_value.db_connect_timeout_seconds,
        statement_timeout_ms=settings_value.db_statement_timeout_ms,
        pool_recycle=settings_value.db_pool_recycle_seconds,
    )
    session_factory = create_session_factory(engine)

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        if settings_value.auto_create_tables:
            Base.metadata.create_all(engine)
        yield
        engine.dispose()

    app = FastAPI(
        title=settings_value.app_name,
        version="0.1.0",
        description=(
            "MVP backend for the Mente caregiver and patient application. "
            "It stores assistive observations and does not provide medical diagnosis."
        ),
        lifespan=lifespan,
    )
    app.state.settings = settings_value
    app.state.engine = engine
    app.state.session_factory = session_factory
    app.state.rate_limiter = FixedWindowRateLimiter()
    app.state.storage_adapter = SupabaseStorageAdapter(
        settings_value.supabase_url,
        settings_value.supabase_service_role_key,
        settings_value.supabase_storage_bucket,
    )
    app.state.caregiver_token_verifier = SupabaseTokenVerifier(
        settings_value.supabase_url,
        settings_value.supabase_jwt_audience,
        publishable_key=settings_value.supabase_publishable_key,
        allow_insecure_local=settings_value.environment in {"development", "test"},
    ) if settings_value.supabase_url else _UnavailableSupabaseTokenVerifier()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings_value.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Call-Bot-Key", "X-Patient-Token", "X-Request-ID"],
    )

    @app.middleware("http")
    async def attach_request_id(request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Request-ID"] = uuid4().hex
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response

    prefix = settings_value.api_prefix
    app.include_router(auth.router, prefix=prefix)
    app.include_router(families.router, prefix=prefix)
    app.include_router(patients.router, prefix=prefix)
    app.include_router(memories.router, prefix=prefix)
    app.include_router(assets.router, prefix=prefix)
    app.include_router(settings.router, prefix=prefix)
    app.include_router(devices.caregiver_router, prefix=prefix)
    app.include_router(devices.device_management_router, prefix=prefix)
    app.include_router(devices.patient_router, prefix=prefix)
    app.include_router(sessions.patient_router, prefix=prefix)
    app.include_router(sessions.caregiver_router, prefix=prefix)
    app.include_router(alerts.router, prefix=prefix)
    app.include_router(integrations.router, prefix=prefix)

    @app.get("/health", tags=["operations"])
    def health(request: Request) -> dict[str, str]:
        return {"status": "ok", "service": settings_value.app_name, "version": "0.1.0"}

    @app.get("/ready", tags=["operations"], response_model=None)
    def readiness(request: Request) -> dict[str, str] | JSONResponse:
        try:
            with request.app.state.session_factory() as db:
                db.execute(text("SELECT 1"))
        except Exception:
            return JSONResponse(status_code=503, content={"status": "not_ready"})
        return {"status": "ready"}

    return app


app = create_app()

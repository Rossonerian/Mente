from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import Settings, get_settings
from .database import Base, create_database_engine, create_session_factory
from .rate_limit import FixedWindowRateLimiter
from .routers import alerts, auth, devices, families, integrations, memories, patients, sessions, settings


def create_app(settings_override: Settings | None = None) -> FastAPI:
    settings_value = settings_override or get_settings()
    engine = create_database_engine(settings_value.database_url)
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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings_value.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings_value.api_prefix
    app.include_router(auth.router, prefix=prefix)
    app.include_router(families.router, prefix=prefix)
    app.include_router(patients.router, prefix=prefix)
    app.include_router(memories.router, prefix=prefix)
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
        with request.app.state.session_factory() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "service": settings_value.app_name, "version": "0.1.0"}

    return app


app = create_app()

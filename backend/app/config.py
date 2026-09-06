from functools import lru_cache
from typing import Literal, Self

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Mente API"
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = "/v1"
    database_url: str = "sqlite:///./mente.db"
    auto_create_tables: bool = False
    db_pool_size: int = Field(default=5, ge=1, le=50)
    db_max_overflow: int = Field(default=5, ge=0, le=50)
    db_pool_timeout_seconds: int = Field(default=10, ge=1, le=120)
    db_connect_timeout_seconds: int = Field(default=10, ge=1, le=120)
    db_statement_timeout_ms: int = Field(default=15_000, ge=1_000, le=300_000)

    supabase_url: str | None = None
    supabase_jwt_audience: str = Field(default="authenticated", min_length=1, max_length=128)

    call_bot_api_key: str = Field(default="change-me-call-bot-key-32-characters", min_length=32)
    cors_origins: str = "http://localhost:19006,http://localhost:8081,http://localhost:3000"

    join_code_minutes: int = Field(default=15, ge=5, le=60)
    patient_device_token_days: int = Field(default=30, ge=1, le=365)
    auth_attempts_per_minute: int = Field(default=10, ge=1, le=1000)
    join_attempts_per_minute: int = Field(default=10, ge=1, le=1000)

    # This is an explicit local/test fixture, never a caregiver authentication
    # credential.  It is intentionally paired with one patient so it cannot
    # become a general patient-access backdoor.
    development_admin_code: str | None = Field(default=None, pattern=r"^\d{6}$")
    development_patient_id: str | None = Field(default=None, min_length=1, max_length=64)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @model_validator(mode="after")
    def reject_development_secrets_in_production(self) -> Self:
        if self.environment == "production":
            if self.development_admin_code is not None or self.development_patient_id is not None:
                raise ValueError("Production cannot configure a development admin code")
            if not self.supabase_url:
                raise ValueError("Production requires SUPABASE_URL for caregiver token validation")
            if _is_placeholder_secret(self.call_bot_api_key):
                raise ValueError("Production requires a non-default CALL_BOT_API_KEY value")
            if self.auto_create_tables:
                raise ValueError("Production must use Alembic migrations instead of AUTO_CREATE_TABLES")
            if not self.database_url.startswith(("postgresql://", "postgresql+")):
                raise ValueError("Production requires a PostgreSQL database")
            if not self.cors_origin_list or any(
                origin == "*" or not origin.startswith("https://") for origin in self.cors_origin_list
            ):
                raise ValueError("Production requires explicit HTTPS CORS_ORIGINS")
        elif (self.development_admin_code is None) != (self.development_patient_id is None):
            raise ValueError("Development admin code and patient ID must be configured together")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


def _is_placeholder_secret(value: str) -> bool:
    return value.startswith(("change-me-", "replace-with-"))

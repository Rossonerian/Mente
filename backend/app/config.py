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

    jwt_secret: str = Field(default="change-me-before-deployment-32-chars", min_length=32)
    jwt_algorithm: Literal["HS256"] = "HS256"
    jwt_issuer: str = Field(default="mente-api", min_length=1, max_length=128)
    access_token_minutes: int = Field(default=720, ge=5, le=10_080)

    call_bot_api_key: str = Field(default="change-me-call-bot-key-32-characters", min_length=32)
    cors_origins: str = "http://localhost:19006,http://localhost:8081,http://localhost:3000"

    join_code_minutes: int = Field(default=15, ge=5, le=60)
    patient_device_token_days: int = Field(default=30, ge=1, le=365)
    auth_attempts_per_minute: int = Field(default=10, ge=1, le=1000)
    join_attempts_per_minute: int = Field(default=10, ge=1, le=1000)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @model_validator(mode="after")
    def reject_development_secrets_in_production(self) -> Self:
        if self.environment == "production":
            if _is_placeholder_secret(self.jwt_secret) or _is_placeholder_secret(self.call_bot_api_key):
                raise ValueError("Production requires non-default JWT_SECRET and CALL_BOT_API_KEY values")
            if self.auto_create_tables:
                raise ValueError("Production must use Alembic migrations instead of AUTO_CREATE_TABLES")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


def _is_placeholder_secret(value: str) -> bool:
    return value.startswith(("change-me-", "replace-with-"))

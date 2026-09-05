from app.config import Settings
from app.main import create_app


def test_openapi_exposes_the_supabase_caregiver_profile_contract() -> None:
    app = create_app(
        Settings(
            environment="test",
            database_url="sqlite:////tmp/mente-openapi-contract.db",
            supabase_url="https://mente-test.supabase.co",
            call_bot_api_key="test-call-bot-key-that-is-long-enough",
        )
    )
    specification = app.openapi()

    assert "/v1/auth/profile" in specification["paths"]
    assert "/v1/auth/register" not in specification["paths"]
    assert "/v1/auth/login" not in specification["paths"]
    assert "auth_user_id" in specification["components"]["schemas"]["UserRead"]["properties"]
    assert specification["paths"]["/v1/auth/me"]["get"]["security"]
    assert specification["paths"]["/v1/patient/game-sessions"]["post"]["security"]
    assert "/v1/patients/{patient_id}/overview" in specification["paths"]
    assert "/v1/patients/{patient_id}/sessions" in specification["paths"]
    assert "/v1/patients/{patient_id}/memories" in specification["paths"]
    assert "/v1/patients/{patient_id}/call-schedule" in specification["paths"]
    assert "/v1/patients/{patient_id}/notification-preferences" in specification["paths"]
    assert "/v1/patient/bind" in specification["paths"]
    assert "/v1/patient/game-sessions/{session_id}/metrics" in specification["paths"]
    assert "/v1/patient/game-sessions/{session_id}/finalize" in specification["paths"]

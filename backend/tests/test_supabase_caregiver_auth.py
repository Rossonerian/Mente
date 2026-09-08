from collections.abc import Generator
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient
from jwt import encode

from app.config import Settings
from app.main import create_app
from app.security import SupabaseTokenError, SupabaseTokenVerifier, VerifiedSupabaseClaims


class StubSupabaseVerifier:
    def __init__(self, claims: VerifiedSupabaseClaims | None = None, error: Exception | None = None) -> None:
        self.claims = claims
        self.error = error

    def verify(self, token: str) -> VerifiedSupabaseClaims:
        if self.error is not None:
            raise self.error
        assert token == "supabase-access-token"
        assert self.claims is not None
        return self.claims


@pytest.fixture
def supabase_client(tmp_path) -> Generator[TestClient, None, None]:
    settings = Settings(
        environment="test",
        database_url=f"sqlite:///{(tmp_path / 'test.db').as_posix()}",
        auto_create_tables=True,
        supabase_url="https://mente-test.supabase.co",
        supabase_jwt_audience="authenticated",
        call_bot_api_key="test-call-bot-key-that-is-long-enough",
    )
    app = create_app(settings)
    app.state.caregiver_token_verifier = StubSupabaseVerifier(
        VerifiedSupabaseClaims(
            subject="71d1a67f-a892-4ef1-b06d-489c69b455d0",
            email="ana@example.com",
            role="authenticated",
        )
    )
    with TestClient(app) as client:
        yield client


def test_supabase_profile_onboarding_creates_a_domain_profile(supabase_client: TestClient) -> None:
    response = supabase_client.post(
        "/v1/auth/profile",
        headers={"Authorization": "Bearer supabase-access-token"},
        json={"display_name": "Ana"},
    )

    assert response.status_code == 201, response.text
    assert response.json()["email"] == "ana@example.com"

    profile = supabase_client.get(
        "/v1/auth/me",
        headers={"Authorization": "Bearer supabase-access-token"},
    )
    assert profile.status_code == 200, profile.text
    assert profile.json()["auth_user_id"] == "71d1a67f-a892-4ef1-b06d-489c69b455d0"


def test_missing_domain_profile_is_not_created_implicitly(supabase_client: TestClient) -> None:
    response = supabase_client.get(
        "/v1/auth/me",
        headers={"Authorization": "Bearer supabase-access-token"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "CAREGIVER_PROFILE_NOT_PROVISIONED"


def test_rejects_invalid_supabase_tokens_before_profile_lookup(supabase_client: TestClient) -> None:
    supabase_client.app.state.caregiver_token_verifier = StubSupabaseVerifier(error=SupabaseTokenError("expired"))

    response = supabase_client.get(
        "/v1/auth/me",
        headers={"Authorization": "Bearer supabase-access-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired caregiver token"


def test_local_password_authority_is_not_an_api_surface(supabase_client: TestClient) -> None:
    register = supabase_client.post(
        "/v1/auth/register",
        json={"email": "ana@example.com", "password": "safe-password", "display_name": "Ana"},
    )
    login = supabase_client.post(
        "/v1/auth/login",
        json={"email": "ana@example.com", "password": "safe-password"},
    )

    assert register.status_code == 404
    assert login.status_code == 404


def test_verifier_rejects_a_non_uuid_subject_even_when_the_signature_is_valid() -> None:
    private_key = rsa.generate_private_key(public_exponent=65_537, key_size=2_048)
    verifier = SupabaseTokenVerifier("https://mente-test.supabase.co", "authenticated")
    verifier._jwks_client = SimpleNamespace(
        get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=private_key.public_key())
    )
    token = encode(
        {
            "aud": "authenticated",
            "email": "ana@example.com",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
            "iss": "https://mente-test.supabase.co/auth/v1",
            "role": "authenticated",
            "sub": "not-a-supabase-user-id",
        },
        private_key,
        algorithm="RS256",
        headers={"kid": "test"},
    )

    with pytest.raises(SupabaseTokenError, match="subject"):
        verifier.verify(token)


def _configured_verifier(private_key):
    verifier = SupabaseTokenVerifier("https://mente-test.supabase.co", "authenticated")
    verifier._jwks_client = SimpleNamespace(
        get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=private_key.public_key())
    )
    return verifier


def _signed_token(private_key, **overrides):
    payload = {
        "aud": "authenticated",
        "email": "ana@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        "iss": "https://mente-test.supabase.co/auth/v1",
        "role": "authenticated",
        "sub": "71d1a67f-a892-4ef1-b06d-489c69b455d0",
    }
    payload.update(overrides)
    return encode(payload, private_key, algorithm="RS256", headers={"kid": "test"})


def test_verifier_accepts_a_valid_signed_supabase_token() -> None:
    private_key = rsa.generate_private_key(public_exponent=65_537, key_size=2_048)
    claims = _configured_verifier(private_key).verify(_signed_token(private_key))
    assert claims.subject == "71d1a67f-a892-4ef1-b06d-489c69b455d0"
    assert claims.role == "authenticated"


@pytest.mark.parametrize(
    ("override", "message"),
    [
        ({"exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, "Invalid token"),
        ({"iss": "https://wrong.supabase.co/auth/v1"}, "Invalid token"),
        ({"aud": "wrong-audience"}, "Invalid token"),
    ],
)
def test_verifier_rejects_expired_issuer_and_audience_tokens(override, message: str) -> None:
    private_key = rsa.generate_private_key(public_exponent=65_537, key_size=2_048)
    with pytest.raises(SupabaseTokenError, match=message):
        _configured_verifier(private_key).verify(_signed_token(private_key, **override))


def test_verifier_rejects_unsupported_algorithm_without_network_access() -> None:
    private_key = rsa.generate_private_key(public_exponent=65_537, key_size=2_048)
    token = encode(
        {"sub": "71d1a67f-a892-4ef1-b06d-489c69b455d0"},
        "not-a-real-secret-long-enough-for-tests",
        algorithm="HS256",
    )
    with pytest.raises(SupabaseTokenError, match="Unsupported token algorithm"):
        _configured_verifier(private_key).verify(token)

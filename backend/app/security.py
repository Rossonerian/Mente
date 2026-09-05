<<<<<<< HEAD
import hashlib
import json
import secrets
from dataclasses import dataclass
from urllib.parse import urlparse
from uuid import UUID
=======
import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
>>>>>>> origin/new_components

import jwt


<<<<<<< HEAD
class SupabaseTokenError(ValueError):
    """Raised when a caregiver token is absent, malformed, or cannot be verified."""


class SupabaseTokenConfigurationError(RuntimeError):
    """Raised when caregiver token verification is not configured for this API instance."""


@dataclass(frozen=True)
class VerifiedSupabaseClaims:
    subject: str
    email: str
    role: str


class SupabaseTokenVerifier:
    _allowed_algorithms = frozenset({"RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"})

    def __init__(self, supabase_url: str | None, audience: str) -> None:
        if not supabase_url:
            raise SupabaseTokenConfigurationError("SUPABASE_URL is not configured")
        parsed = urlparse(supabase_url)
        if parsed.scheme != "https" or not parsed.netloc:
            raise SupabaseTokenConfigurationError("SUPABASE_URL must be an HTTPS URL")
        self.issuer = f"{supabase_url.rstrip('/')}/auth/v1"
        self.audience = audience
        self._jwks_client = jwt.PyJWKClient(f"{self.issuer}/.well-known/jwks.json", cache_jwk_set=True, lifespan=600)

    def verify(self, token: str) -> VerifiedSupabaseClaims:
        try:
            header = jwt.get_unverified_header(token)
            algorithm = header.get("alg")
            if algorithm not in self._allowed_algorithms:
                raise SupabaseTokenError("Unsupported token algorithm")
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                audience=self.audience,
                issuer=self.issuer,
                options={"require": ["aud", "exp", "iss", "role", "sub"]},
            )
        except SupabaseTokenError:
            raise
        except jwt.PyJWTError as exc:
            raise SupabaseTokenError("Invalid token") from exc

        subject = payload.get("sub")
        role = payload.get("role")
        email = payload.get("email")
        if not isinstance(subject, str):
            raise SupabaseTokenError("Invalid token subject")
        try:
            subject = str(UUID(subject))
        except ValueError as exc:
            raise SupabaseTokenError("Invalid token subject") from exc
        if not isinstance(email, str) or not email or len(email) > 320:
            raise SupabaseTokenError("Token does not include a usable email address")
        if role != "authenticated":
            raise SupabaseTokenError("Token is not an authenticated caregiver session")
        return VerifiedSupabaseClaims(subject=subject, email=email.lower(), role=role)
=======
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    cost, block_size, parallelism = 2**14, 8, 1
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=cost,
        r=block_size,
        p=parallelism,
    )
    return "$".join(
        [
            "scrypt",
            str(cost),
            str(block_size),
            str(parallelism),
            base64.urlsafe_b64encode(salt).decode("ascii"),
            base64.urlsafe_b64encode(digest).decode("ascii"),
        ]
    )


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, cost, block_size, parallelism, salt_b64, digest_b64 = encoded.split("$", 5)
        if algorithm != "scrypt":
            return False
        salt = base64.urlsafe_b64decode(salt_b64)
        expected = base64.urlsafe_b64decode(digest_b64)
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=int(cost),
            r=int(block_size),
            p=int(parallelism),
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: str, secret: str, algorithm: str, issuer: str, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iss": issuer,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_access_token(token: str, secret: str, algorithm: str, issuer: str) -> str | None:
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm], issuer=issuer)
        subject = payload.get("sub")
        return subject if isinstance(subject, str) else None
    except jwt.PyJWTError:
        return None
>>>>>>> origin/new_components


def hash_opaque_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_join_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_device_token() -> str:
    return secrets.token_urlsafe(32)


def payload_fingerprint(value: dict) -> str:
    canonical = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

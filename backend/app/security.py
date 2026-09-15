import hashlib
import json
import secrets
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from uuid import UUID

import jwt


class SupabaseTokenError(ValueError):
    """Raised when a caregiver token is absent, malformed, or cannot be verified."""


class SupabaseTokenConfigurationError(RuntimeError):
    """Raised when caregiver token verification is not configured for this API instance."""


@dataclass(frozen=True)
class VerifiedSupabaseClaims:
    subject: str
    email: str
    role: str
    session_id: str = ""
    issued_at: int = 0
    assurance_level: str = "aal1"


class SupabaseTokenVerifier:
    _allowed_algorithms = frozenset({"RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"})

    def __init__(
        self,
        supabase_url: str | None,
        audience: str,
        *,
        publishable_key: str | None = None,
        allow_insecure_local: bool = False,
    ) -> None:
        if not supabase_url:
            raise SupabaseTokenConfigurationError("SUPABASE_URL is not configured")
        parsed = urlparse(supabase_url)
        is_local = parsed.hostname in {"localhost", "127.0.0.1", "::1"}
        if (parsed.scheme != "https" and not (allow_insecure_local and is_local)) or not parsed.netloc:
            raise SupabaseTokenConfigurationError("SUPABASE_URL must be HTTPS outside local development")
        if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
            raise SupabaseTokenConfigurationError("SUPABASE_URL must be a project origin without a path")
        self.issuer = f"{parsed.scheme}://{parsed.netloc}/auth/v1"
        self.audience = audience
        self._publishable_key = publishable_key
        self._auth_server_fallback_enabled = allow_insecure_local and bool(publishable_key)
        self._jwks_client = jwt.PyJWKClient(
            f"{self.issuer}/.well-known/jwks.json",
            cache_jwk_set=True,
            lifespan=600,
            timeout=5,
        )

    def verify(self, token: str) -> VerifiedSupabaseClaims:
        try:
            header = jwt.get_unverified_header(token)
            algorithm = header.get("alg")
            if algorithm == "HS256" and self._auth_server_fallback_enabled:
                return self._verify_with_auth_server(token)
            if algorithm not in self._allowed_algorithms:
                raise SupabaseTokenError("Unsupported token algorithm")
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                audience=self.audience,
                issuer=self.issuer,
                options={"require": ["aud", "exp", "iat", "iss", "role", "sub", "session_id"]},
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
        if not isinstance(email, str) or len(email) > 320:
            email = ""
        if role != "authenticated":
            raise SupabaseTokenError("Token is not an authenticated caregiver session")
        try:
            session_id = str(UUID(payload["session_id"]))
        except (ValueError, TypeError, AttributeError) as exc:
            raise SupabaseTokenError("Invalid token session") from exc
        issued_at = payload["iat"]
        if not isinstance(issued_at, int) or isinstance(issued_at, bool):
            raise SupabaseTokenError("Invalid token issuance time")
        aal = payload.get("aal", "aal1")
        if aal not in {"aal1", "aal2"}:
            raise SupabaseTokenError("Invalid assurance level")
        return VerifiedSupabaseClaims(subject, email.lower(), role, session_id, issued_at, aal)

    def _verify_with_auth_server(self, token: str) -> VerifiedSupabaseClaims:
        """Local-only fallback for CLI projects that still issue HS256 tokens.

        The Auth `/user` endpoint verifies the token server-side. This path is
        intentionally disabled for hosted/production configuration; hosted
        projects must use asymmetric signing keys and the JWKS verifier above.
        """
        if not self._publishable_key:
            raise SupabaseTokenConfigurationError("Local Supabase publishable key is not configured")
        request = Request(
            f"{self.issuer}/user",
            headers={
                "apikey": self._publishable_key,
                "Authorization": f"Bearer {token}",
            },
            method="GET",
        )
        try:
            with urlopen(request, timeout=5) as response:  # nosec B310
                body = response.read()
        except (HTTPError, URLError) as exc:
            raise SupabaseTokenError("Invalid or expired token") from exc
        try:
            payload = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise SupabaseTokenError("Invalid Auth server response") from exc
        subject = payload.get("id")
        email = payload.get("email", "")
        if not isinstance(subject, str) or not isinstance(email, str):
            raise SupabaseTokenError("Invalid Auth user")
        try:
            subject = str(UUID(subject))
        except ValueError as exc:
            raise SupabaseTokenError("Invalid token subject") from exc
        # Only after Auth has verified the signature may local HS256 claims be
        # read. The session guard independently checks provider rows on every API.
        try:
            claims = jwt.decode(token, options={"verify_signature": False})
            session_id = str(UUID(claims["session_id"]))
            issued_at = claims["iat"]
            if claims.get("role") != "authenticated" or claims.get("sub") != subject:
                raise ValueError("Invalid local token identity")
            if claims.get("iss") != self.issuer or claims.get("aud") != self.audience:
                raise ValueError("Invalid local token issuer or audience")
            if not isinstance(issued_at, int) or claims.get("aal", "aal1") not in {"aal1", "aal2"}:
                raise ValueError("Invalid local token claims")
        except (jwt.PyJWTError, ValueError, KeyError, TypeError, AttributeError) as exc:
            raise SupabaseTokenError("Invalid local token session") from exc
        return VerifiedSupabaseClaims(subject, email.lower(), "authenticated", session_id, issued_at,
                                      claims.get("aal", "aal1"))


def hash_opaque_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_join_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_device_token() -> str:
    return secrets.token_urlsafe(32)


def payload_fingerprint(value: dict) -> str:
    canonical = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

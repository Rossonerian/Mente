import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt


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


def hash_opaque_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_join_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_device_token() -> str:
    return secrets.token_urlsafe(32)


def payload_fingerprint(value: dict) -> str:
    canonical = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

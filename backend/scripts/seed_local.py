"""Create synthetic, idempotent local Auth and Mente data.

This script is deliberately limited to a local Supabase URL. It creates the
Auth user through the Auth Admin API, then uses the public FastAPI domain API
for the caregiver profile and demo rows. It never inserts into auth.users.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - included by the backend lock.
    load_dotenv = None


DEFAULT_EMAIL = "demo.caregiver@example.com"


def main() -> int:
    if load_dotenv is not None:
        load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    supabase_url = _required("SUPABASE_URL").rstrip("/")
    publishable_key = _required("SUPABASE_PUBLISHABLE_KEY")
    service_role_key = _required("SUPABASE_SERVICE_ROLE_KEY")
    api_base_url = os.getenv("MENTE_API_BASE_URL", "http://127.0.0.1:8000/v1").rstrip("/")
    email = os.getenv("DEMO_CAREGIVER_EMAIL", DEFAULT_EMAIL).strip().lower()
    password = os.getenv("DEMO_CAREGIVER_PASSWORD", "").strip()
    if len(password) < 8:
        raise RuntimeError("DEMO_CAREGIVER_PASSWORD must be set to a synthetic local-only password")
    _assert_local(supabase_url)
    if os.getenv("ENVIRONMENT", "development") not in {"development", "test"}:
        raise RuntimeError("Local seed requires ENVIRONMENT=development or test")

    auth_user = _ensure_auth_user(supabase_url, service_role_key, email, password)
    token_payload = _request_json(
        "POST",
        f"{supabase_url}/auth/v1/token?grant_type=password",
        {"apikey": publishable_key},
        {"email": email, "password": password},
    )
    access_token = token_payload.get("access_token")
    if not isinstance(access_token, str) or not access_token:
        raise RuntimeError("Local Auth did not return an access token")
    headers = {"Authorization": f"Bearer {access_token}"}

    _request_json(
        "POST",
        f"{api_base_url}/auth/profile",
        headers,
        {"display_name": "Local Demo Caregiver"},
        ok={200, 201},
    )
    families = _request_json("GET", f"{api_base_url}/families", headers)
    family = families[0] if isinstance(families, list) and families else None
    if family is None:
        family = _request_json(
            "POST",
            f"{api_base_url}/families",
            headers,
            {"name": "Local Demo Family", "mode": "SOLO"},
        )

    family_id = family["id"]
    patients = _request_json("GET", f"{api_base_url}/families/{family_id}/patients", headers)
    patient = patients[0] if isinstance(patients, list) and patients else None
    if patient is None:
        patient = _request_json(
            "POST",
            f"{api_base_url}/families/{family_id}/patients",
            headers,
            {
                "preferred_name": "Local Demo Patient",
                "timezone": "Asia/Kolkata",
                "preferred_language": "en-IN",
            },
        )

    patient_id = patient["id"]
    memories = _request_json("GET", f"{api_base_url}/patients/{patient_id}/memories", headers)
    if not memories:
        _request_json(
            "POST",
            f"{api_base_url}/patients/{patient_id}/memories",
            headers,
            {
                "memory_type": "PERSON",
                "subject_name": "Local Demo Relative",
                "relationship_label": "family",
                "prompt_text": "Who is the local demo relative?",
                "accepted_answers": ["Local Demo Relative"],
                "consent_recorded_at": datetime.now(timezone.utc).isoformat(),
                "active": True,
            },
        )

    # Do not print credentials or access tokens. IDs are synthetic and useful
    # for following the local smoke-test instructions.
    print(
        json.dumps(
            {
                "status": "seeded",
                "auth_user_id": auth_user.get("id"),
                "family_id": family_id,
                "patient_id": patient_id,
            }
        )
    )
    return 0


def _ensure_auth_user(base_url: str, service_key: str, email: str, password: str) -> dict[str, object]:
    headers = {"apikey": service_key, "Authorization": f"Bearer {service_key}"}
    listing = _request_json("GET", f"{base_url}/auth/v1/admin/users?page=1&per_page=100", headers)
    users = listing.get("users", []) if isinstance(listing, dict) else []
    for user in users:
        if isinstance(user, dict) and user.get("email", "").lower() == email:
            return user
    return _request_json(
        "POST",
        f"{base_url}/auth/v1/admin/users",
        headers,
        {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"display_name": "Local Demo Caregiver"},
        },
    )


def _request_json(
    method: str,
    url: str,
    headers: dict[str, str],
    body: dict[str, object] | None = None,
    *,
    ok: set[int] | None = None,
) -> dict[str, object] | list[object]:
    request_headers = {"Accept": "application/json", **headers}
    encoded = None
    if body is not None:
        request_headers["Content-Type"] = "application/json"
        encoded = json.dumps(body).encode("utf-8")
    try:
        with urlopen(Request(url, data=encoded, headers=request_headers, method=method), timeout=15) as response:  # nosec B310
            if ok is not None and response.status not in ok:
                raise RuntimeError(f"Unexpected local API status {response.status}")
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        if ok is not None and exc.code in ok:
            return {}
        raise RuntimeError(f"Local API request failed with status {exc.code}") from exc
    except (URLError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise RuntimeError("Local API request failed") from exc
    if not isinstance(payload, (dict, list)):
        raise RuntimeError("Local API returned an unexpected response")
    return payload


def _required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


def _assert_local(url: str) -> None:
    parsed = urlparse(url)
    if parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
        raise RuntimeError("Local seed refuses non-local SUPABASE_URL")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"Local seed failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc

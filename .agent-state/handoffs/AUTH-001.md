TASK: AUTH-001
ROLE: BACKEND
STATUS: READY_FOR_REVIEW

SUMMARY:

FastAPI now verifies Supabase caregiver access tokens through project JWKS and uses a local domain-profile mapping (`users.auth_user_id`). Local register/login/JWT authority was removed. Patient device tokens remain a separate header capability.

FILES CHANGED:

- backend/app/config.py
- backend/app/dependencies.py
- backend/app/main.py
- backend/app/models.py
- backend/app/routers/auth.py
- backend/app/schemas.py
- backend/app/security.py
- backend/alembic/versions/b42f89192d47_supabase_caregiver_profile_mapping.py
- backend/pyproject.toml
- backend/requirements.lock
- backend/tests/

TESTS RUN:

- isolated pytest: 17 passed (one upstream Starlette deprecation warning)
- ruff: passed
- mypy: passed
- bandit: passed
- pip-audit: no known vulnerabilities
- Alembic SQLite upgrade: passed; users columns include auth_user_id and no password_hash
- OpenAPI contract test: passed

KNOWN ISSUES:

- Existing local users need an explicit reviewed auth_user_id backfill; automatic email linking is deliberately refused.
- Persisted assessment freshness, signed voice playback/upload, and atomic game rotation remain contract gaps.

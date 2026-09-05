# Mente backend

FastAPI owns Mente business authorization. Supabase Auth is the caregiver identity authority; the app never writes
directly to Supabase Postgres. Patient access uses a separately issued, hashed device credential. The API stores
assistive observations only and does not provide medical diagnosis.

## Local setup

```sh
cd backend
uv venv .venv --python 3.12
uv pip sync --python .venv/bin/python requirements.lock
uv pip install --python .venv/bin/python --no-deps -e .
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Use only synthetic local data. `GET /health` verifies liveness and `GET /ready` verifies the configured database
connection without returning internals. The generated local OpenAPI contract is available at `/docs`.

## Identity and data boundaries

- Caregiver requests use `Authorization: Bearer <Supabase access token>`. `SupabaseTokenVerifier` verifies a
  signed asymmetric token through the project JWKS, allows only approved asymmetric algorithms, and requires issuer,
  audience, expiry, subject, and `authenticated` role. JWKS entries are cached for 10 minutes to support key rotation.
- The configured Supabase project must use asymmetric signing keys. Legacy shared-secret JWT projects are a setup
  blocker for this verifier; do not bypass signature validation.
- The API resolves family and patient membership server-side. A route parameter is never authorization by itself.
- Patient device credentials are sent only in `X-Patient-Token`, are hashed at rest, expire, and are checked for
  revocation on every protected patient request. Native apps use SecureStore; the web app intentionally keeps the
  patient token in memory only and requires a caregiver-assisted bind after refresh.
- Every game session and metric has an idempotency boundary. Replaying an identifier with different content returns
  `409`; finalization is safe to replay only with the same terminal data.

## Migrations and deployment boundary

Alembic is the only schema-migration authority in this repository. Use `alembic upgrade head` against a disposable
local database before deploying. Runtime database users need only the application privileges; migration credentials
must be separate. Production requires PostgreSQL, bounded database pools/timeouts, HTTPS behind a trusted proxy,
explicit HTTPS CORS origins, external rate limiting for multi-worker deployments, and redacted structured logs.

This repository does not contain Supabase CLI configuration, remote credentials, storage bucket policies, or remote
RLS migrations. Private-media buckets, signed URL lifetimes, backup/restore, consent/retention, hosting region,
domain, SMTP, redirect allowlists, and production observability remain explicit release decisions rather than implied
by local tests. See [`docs/operations.md`](../docs/operations.md).

## Verification

```sh
.venv/bin/pytest
.venv/bin/ruff check .
.venv/bin/mypy app
.venv/bin/bandit -q -r app
.venv/bin/pip-audit -r requirements.lock
```

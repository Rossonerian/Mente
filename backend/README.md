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

For the complete local Supabase/Auth/Postgres/Storage flow, including PowerShell
commands, use [`docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md). Use only
synthetic local data. `GET /health` verifies liveness and `GET /ready` verifies
the configured database connection without returning internals. The generated
local OpenAPI contract is available at `/docs`. The container's default command
runs only the API; execute `alembic upgrade head` as a separate release step
with a migration credential before starting or rolling out the runtime.

## Repeatable local patient connection

For local or automated testing only, configure a six-digit development connection code and one local patient in the
untracked `backend/.env` file:

```dotenv
DEVELOPMENT_ADMIN_CODE=482916
DEVELOPMENT_PATIENT_ID=<id returned by caregiver setup>
```

After restarting the API, an authenticated caregiver sees the code on the Family screen. Enter `482916` on the
patient device connection screen to issue a fresh device credential for that configured patient. Reusing the code
revokes the previous active test-device credential for that patient, so old test sessions cannot remain connected.
This fixture is accepted only when `ENVIRONMENT` is `development` or `test`; production configuration rejects it at
startup. It does not sign in caregivers, grant caregiver permissions, or replace the normal one-time join-code flow.

## Identity and data boundaries

- Caregiver requests use `Authorization: Bearer <Supabase access token>`. `SupabaseTokenVerifier` verifies a
  signed asymmetric token through the project JWKS, allows only approved asymmetric algorithms, and requires issuer,
  audience, expiry, subject, and `authenticated` role. JWKS entries are cached for 10 minutes to support key rotation.
- Hosted projects must use asymmetric signing keys. The local CLI's legacy
  shared-secret token is accepted only in development through Supabase Auth's
  `/user` verification endpoint; production has no shared-secret fallback.
- The API resolves family and patient membership server-side. A route parameter is never authorization by itself.
- Patient device credentials are sent only in `X-Patient-Token`, are hashed at rest, expire, and are checked for
  revocation on every protected patient request. Native apps use SecureStore; the web app intentionally keeps the
  patient token in memory only and requires a caregiver-assisted bind after refresh.
- Every game session and metric has an idempotency boundary. Replaying an identifier with different content returns
  `409`; finalization is safe to replay only with the same terminal data.

## Migrations and deployment boundary

Alembic is the only application-schema migration authority in this repository.
Migrations through `d1a4c7f6b9e2` add the asset metadata/RLS/grant posture,
private bucket bootstrap, and native Supabase Auth UUID mapping.
The FastAPI Storage adapter holds the
service key server-side, generates opaque paths, requires consent, and issues
short-lived signed URLs after family authorization. Direct Data API domain
access is denied to `anon` and `authenticated` roles.

Runtime database users need only application privileges; migration credentials
must be separate. Production requires PostgreSQL with TLS, bounded database
pools/timeouts including a statement timeout, explicit HTTPS CORS origins,
external rate limiting for multi-worker deployments, and redacted structured
logs. See [`docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md) for the hosted
owner-only steps.

## Verification

```sh
.venv/bin/pytest
.venv/bin/ruff check .
.venv/bin/mypy app
.venv/bin/bandit -q -r app
.venv/bin/pip-audit -r requirements.lock
```

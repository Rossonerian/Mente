# Mente local and release operations

## Configuration boundary

The root `.env.example` contains only Expo public values: API base URL, Supabase URL, and Supabase publishable key.
`backend/.env.example` contains server configuration. Never add database URLs with real passwords, Supabase private
keys, patient device tokens, Twilio credentials, or call-bot keys to the Expo environment.

For repeatable local patient testing, `backend/.env` may opt into the development-only `DEVELOPMENT_ADMIN_CODE=482916`
fixture together with the ID of one synthetic local patient. The API rejects this configuration in production, scopes
it to that patient, and exposes it only to that patient's authenticated caregiver Family screen. Caregiver sign-in still
uses the configured Supabase session; the fixture only replaces the one-time patient-device bind code in local/test
environments.

For local development, use an isolated SQLite database and synthetic fixtures. For staging and production, use a
separate PostgreSQL database, `AUTO_CREATE_TABLES=false`, Alembic migrations, a distinct server-only call-bot key,
and explicit HTTPS `CORS_ORIGINS`. Production startup rejects missing Supabase URL, placeholder call-bot keys,
automatic schema creation, wildcard CORS, and non-HTTPS origins.

## Release checklist

1. Verify the Supabase project uses asymmetric JWT signing keys and configure the exact issuer audience. The API
   retrieves the project JWKS and caches it for ten minutes; validate key rotation in staging.
2. Run Alembic against an empty disposable database, run it a second time at head, and test the upgrade path from
   the prior production revision. Do not reset a linked remote database.
3. Use separate migration and runtime database credentials. The FastAPI authorization tests do not prove Supabase
   RLS policies when the runtime role bypasses RLS.
4. Configure private media buckets, scoped authorization, bounded signed URLs, object-path/type/size validation,
   and backup/restore for both database and media. These policies are not implemented in this repository yet.
5. Put FastAPI behind an HTTPS proxy with an explicit trusted-proxy policy, request IDs, redacted logs, bounded
   database connection pools/timeouts, and a multi-instance rate-limit store. The container runtime does not run
   migrations; run `alembic upgrade head` separately with migration-only credentials.
6. Configure redirect allowlists, email/SMTP prerequisites, retention/consent policy, hosting region/domain, and
   incident ownership. Technical tests alone do not establish real-patient-data or compliance readiness.

## Runtime commands

```sh
# Backend
cd backend
uv venv .venv --python 3.12
uv pip sync --python .venv/bin/python requirements.lock
uv pip install --python .venv/bin/python --no-deps -e .
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# Expo development (after setting safe public values in a local .env)
npx expo start --tunnel
```

No Supabase project reference, dashboard URL, or API URL is recorded here because no authenticated remote project
was available during local verification.

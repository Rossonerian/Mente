# Mente Supabase setup

This repository uses one Supabase project for Auth, Postgres, and private
Storage. Expo uses Supabase Auth for caregiver sessions only. FastAPI is the
exclusive Mente domain API and uses SQLAlchemy for all domain reads/writes.

## Prerequisites

- Node.js 20 or a newer supported LTS, npm, and the repository's `package-lock.json`.
- Python 3.12.
- Docker Desktop or another Docker-compatible runtime.
- Supabase CLI. The documented commands use `npx supabase`; a globally
  installed CLI at the same major version is also supported.
- Expo tooling (`npx expo`).

Install dependencies:

```powershell
npm install
Push-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.lock
Pop-Location
```

## Local setup from a fresh clone

The generated local ports are defined in `supabase/config.toml`: API `54321`,
Postgres `54322`, Studio `54323`, Mailpit `54324`, and Supavisor `54329` when
the optional pooler is enabled. Application code reads its URLs from the
environment; it does not own or scatter these ports.

```powershell
npx supabase start
npx supabase status
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

Open the ignored files and replace only the local key placeholders with the
values shown by `npx supabase status`:

- root `.env`: `EXPO_PUBLIC_SUPABASE_URL` is the local API URL,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is `PUBLISHABLE_KEY`, and
  `EXPO_PUBLIC_API_BASE_URL` is the FastAPI URL.
- `backend/.env`: `SUPABASE_URL` is the local API URL,
  `SUPABASE_PUBLISHABLE_KEY` is `PUBLISHABLE_KEY`, and
  `SUPABASE_SERVICE_ROLE_KEY` is the server-only `SECRET_KEY` from local
  status. Keep the local database URL as
  `postgresql+psycopg://postgres:postgres@127.0.0.1:54322/postgres`.

The local CLI currently issues legacy local HS256 Auth tokens. Development
accepts those only through the local Auth `/user` verification fallback. Hosted
production must use asymmetric signing keys and the JWKS verifier.

Apply the application schema to the local Supabase Postgres database:

```powershell
Push-Location backend
.\.venv\Scripts\Activate.ps1
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@127.0.0.1:54322/postgres"
$env:MIGRATION_DATABASE_URL = $env:DATABASE_URL
alembic upgrade head
alembic current
Pop-Location
```

Start FastAPI in a second PowerShell window after filling `backend/.env`:

```powershell
Push-Location backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Pop-Location
```

Seed synthetic local data. The script refuses non-local Supabase URLs, creates
the Auth identity through the Auth Admin API, and uses FastAPI for the domain
profile/family/patient/memory rows. It is safe to run repeatedly.

```powershell
Push-Location backend
.\.venv\Scripts\Activate.ps1
$env:DEMO_CAREGIVER_PASSWORD = "<synthetic-local-password>"
python scripts\seed_local.py
Pop-Location
```

Start Expo and run checks:

```powershell
npx expo start
npm run typecheck
npm run lint
npm test -- --runInBand
Push-Location backend
.\.venv\Scripts\Activate.ps1
python -m pytest
ruff check .
mypy app
Pop-Location
```

For a physical device, use the LAN address of this machine in
`EXPO_PUBLIC_API_BASE_URL`. For an Android emulator, use
`http://10.0.2.2:8000/v1` for FastAPI and a reachable LAN/hosted Supabase URL
if the emulator cannot use `127.0.0.1`.

Stop local services safely:

```powershell
npx supabase stop
```

Do not use `supabase db reset --linked` against a hosted project. Local reset
is intentionally not part of the normal setup workflow because it discards
local data.

## Creating a hosted Supabase project (owner-only)

1. Create or select the project in the Supabase Dashboard and record its
   project reference. Do not put the reference or keys in this repository.
2. In Project Settings, record the project URL and publishable key. The
   frontend receives only `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Obtain the server-only service-role/secret key and store it only in the
   FastAPI deployment secret store as `SUPABASE_SERVICE_ROLE_KEY`.
4. Obtain the direct Postgres connection string and the Supavisor session-mode
   connection string. Use the direct string for Alembic whenever reachable.
   Use Supavisor session mode for a persistent IPv4-only FastAPI host. Reserve
   transaction pooling for short-lived/serverless traffic.
5. URL-encode database passwords before putting them into a SQLAlchemy DSN.
   Use `postgresql+psycopg://` and require TLS for hosted URLs.
6. Configure Auth's redirect allow-list with the production HTTPS web origin
   and native `mente://auth/callback`. Configure email/password signup,
   development versus production email confirmation, the production site URL,
   and a production email provider.
7. Configure asymmetric JWT signing keys. FastAPI validates `iss`, `aud`, `exp`,
   `sub`, and the signature through the project's JWKS endpoint. Never rotate
   the old Mente `JWT_SECRET`; it is no longer the caregiver authority.

Existing domain users are not silently linked by email and legacy password
hashes are not portable. Re-invite/re-register each caregiver through Supabase
Auth, complete the profile onboarding, and perform any exceptional account link
only after verifying the Auth subject; preserve family memberships and never
authorize from email equality.

Before any hosted migration, verify the selected project reference and URL in
the Dashboard and CLI. Configure `MIGRATION_DATABASE_URL` in a protected
release environment, review offline SQL where useful, then run:

```powershell
Push-Location backend
.\.venv\Scripts\Activate.ps1
$env:MIGRATION_DATABASE_URL = "postgresql+psycopg://<encoded-user>:<encoded-password>@<direct-host>:5432/postgres?sslmode=require"
alembic upgrade head
alembic current
Pop-Location
```

The current expected head is `d1a4c7f6b9e2`. Never apply an unreviewed remote
migration and never use a remote reset/drop/reseed command.

## Environment contract

Frontend public variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_MENTE_MOCK_MODE` (optional; explicit local demo fallback only,
  defaults off outside development)

Backend variables:

- `ENVIRONMENT`
- `DATABASE_URL`
- `MIGRATION_DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_AUDIENCE=authenticated`
- `SUPABASE_STORAGE_BUCKET=family-memory-assets`
- `STORAGE_SIGNED_URL_SECONDS`
- `STORAGE_MAX_FILE_SIZE_BYTES`
- `CORS_ORIGINS`
- `CALL_BOT_API_KEY`
- `AUTO_CREATE_TABLES`, database pool/timeouts, join-code/device/rate-limit
  settings, and optional local development code settings

No frontend variable may contain a database password, service-role/secret key,
call-bot key, or patient-device token.

## Storage verification

Alembic creates/configures the private `family-memory-assets` bucket with a
10 MiB limit and allow-listed photo/voice MIME types. The FastAPI adapter uses
opaque generated keys of the form `{family_id}/{patient_id}/{uuid}.{extension}`.
It stores metadata in `assets`, requires consent, checks membership, and issues
short-lived signed URLs only for active consented assets. Signed URLs are never
stored in the database. Direct anon/authenticated table and object privileges
are revoked; the service key never reaches Expo.

After selecting the intended hosted project, verify that:

- the bucket is private and its size/MIME limits match the migration;
- an unauthenticated object URL fails;
- a publishable key cannot select or mutate Mente domain tables;
- only an authorized FastAPI request can obtain a signed URL;
- another family cannot list, sign, or delete the asset.

## CORS and networking

- Expo web: use the exact local web origin in `CORS_ORIGINS`.
- Physical device: use the development machine's LAN IP for FastAPI and a
  reachable LAN/hosted Supabase URL; `localhost` means the device itself.
- Android emulator: `10.0.2.2` reaches the host machine for FastAPI.
- Production: use HTTPS origins only, list them explicitly, and keep
  credentialed CORS without `*`.

## Smoke-test checklist

- Signed-out Data API table access is denied.
- An ordinary caregiver token cannot directly select Mente tables.
- `/v1/auth/me`, families, patients, memories, sessions, schedules,
  preferences, alerts/acknowledgement, join codes, device listing/revocation,
  and patient-device game/metric/finalize flows work through FastAPI.
- Cross-family IDs return the same not-found/denied behavior as existing
  membership checks.
- Patient-device tokens remain separate from Supabase caregiver sessions.
- Invalid MIME, oversized, traversal-shaped, unconsented, deleted, and
  cross-family asset operations fail safely.
- The bucket is private and signed URL expiry is short.

## Troubleshooting

- IPv6 direct-connection failure: use the Supavisor session connection string
  for the persistent FastAPI host, while retaining direct access for release
  migrations where possible.
- Supavisor transaction mode: do not use it for Alembic or a long-lived ORM
  connection pool.
- TLS/certificate errors: use `sslmode=require` for hosted PostgreSQL and keep
  the `postgresql+psycopg` scheme.
- Malformed password: URL-encode reserved characters (`@`, `:`, `/`, `#`, `%`).
- JWKS/issuer/audience errors: confirm project URL, `/auth/v1` issuer, audience
  `authenticated`, clock accuracy, and asymmetric signing-key configuration.
- Email confirmation: local confirmation is disabled and mail is intercepted
  by Mailpit; production confirmation depends on Dashboard Auth settings and
  the configured email provider.
- CORS: use the exact scheme/host/port and restart FastAPI after changing its
  environment.
- Physical device cannot reach localhost: replace localhost with the host LAN
  IP and allow the development ports through the local firewall.
- Expired Supabase session: sign in again; the client makes one refresh attempt
  for a 401 and does not retry in a loop.
- Expired/revoked patient token: bind the device again with a fresh join code.
- Missing bucket/Storage permissions: verify the selected project, migration
  head, private bucket, and server-only service key.
- Migration head mismatch: stop deployment, inspect `alembic current`, review
  the release migration, and never reset production to force alignment.

## Rotation and incident notes

- Rotate the service-role/secret key in Supabase and the FastAPI secret store;
  never copy it into Expo variables.
- Rotate the database password, URL-encode it, update protected runtime and
  migration environments, and test readiness before rollout.
- Rotate `CALL_BOT_API_KEY` in the call-bot and FastAPI secret stores together.
- Revoke caregiver sessions through Supabase Auth controls when required.
- Do not attempt to rotate Supabase signing keys by changing the retired
  application `JWT_SECRET`; caregiver JWT ownership belongs to Supabase Auth.

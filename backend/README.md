# Mente MVP Backend

This directory contains the backend for the existing Mente caregiver and patient application. It does not
implement the Twilio calling bot. The calling bot can live in a separate repository and integrate through the
versioned `/v1/integrations/call-bot` contract.

The backend stores assistive observations only. Trend and alert responses are deliberately non-diagnostic.

## MVP scope

- Caregiver registration and JWT login
- Family and patient profiles
- Family memories and consent metadata
- Call schedule and notification preferences owned by the app
- One-time patient device binding without a patient password
- Idempotent GAME session and metric submission
- Unified CALL + GAME history
- Restrained same-day alerts and caregiver acknowledgement
- Explainable baseline/recent trend calculation
- API-key-protected call-bot context, schedule, and session-ingestion endpoints

Not included: Twilio, speech recognition, outbound-call scheduling, SMS delivery, object-storage upload,
production audit logs, clinical interpretation, or multi-tenant enterprise controls.

## Local setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
Copy-Item .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` for the interactive API contract. SQLite is the local default. For a small
shared deployment, set `DATABASE_URL` to a PostgreSQL URL such as
`postgresql+psycopg://user:password@host:5432/mente`. Keep `AUTO_CREATE_TABLES=false` and use Alembic for every
persistent database.

## Main application flow

1. `POST /v1/auth/register`
2. `POST /v1/families`
3. `POST /v1/families/{family_id}/patients`
4. Add family memories and application settings.
5. Create a short-lived join code at `POST /v1/patients/{patient_id}/join-codes`.
6. Bind the patient device at `POST /v1/patient/bind` and store the returned token securely on that device.
7. The patient app sends GAME sessions using `X-Patient-Token`.
8. The caregiver reads `/v1/patients/{patient_id}/overview`.

Caregivers can inspect and revoke bound devices through `GET /v1/patients/{patient_id}/devices` and
`DELETE /v1/patients/{patient_id}/devices/{device_id}`.

## Future call-bot contract

The external bot authenticates with `X-Call-Bot-Key`.

- `GET /v1/integrations/call-bot/schedules` returns active, non-paused schedules.
- `GET /v1/integrations/call-bot/patients/{patient_id}/context` returns the patient, active memories, schedule,
  and notification preferences.
- `POST /v1/integrations/call-bot/sessions` accepts one finalized canonical CALL session with metrics.

The ingestion `external_id` is idempotent. Replaying the same payload returns the existing session and does not
duplicate metrics or alerts. Reusing the same ID with changed content returns `409 Conflict`. Telephony attempts,
Twilio webhook state, transcripts, and provider credentials
remain private to the call-bot repository.

## Security boundary

- Change `JWT_SECRET` and `CALL_BOT_API_KEY` before sharing the service.
- The current API-key integration is suitable for one trusted MVP bot, not many third-party integrations.
- Use HTTPS outside localhost.
- Production startup rejects the bundled development secrets and automatic schema creation.
- Login and patient-binding attempts are throttled in memory for the intended single-instance MVP deployment.
- Do not put raw call audio, full transcripts, passwords, phone numbers, or secret keys in logs.
- Asset references are metadata only; signed upload/download support belongs in a later storage integration.
- Every family memory requires an explicit `consent_recorded_at`; the API never invents consent or exposes
  unconsented memories through patient/call-bot reads.
- Active call schedules require a validated patient phone number so the external bot receives only callable work.

## Verification

```powershell
pytest
ruff check .
mypy app
bandit -q -r app
pip-audit -r requirements.lock
```

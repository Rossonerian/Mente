# Local Mente and call-bot integration

Mente owns caregivers, families, patients, consented memories, call schedules,
notification preferences, session scores, trends and alerts. Service A reads
Mente's protected API and sends finished call observations back to it. Its SQLite
file stores conversation snapshots, provider-to-patient bindings and an immutable
delivery queue. It is not another patient/family database.

## Installed local configuration

- Mente app: `http://localhost:8081`
- Mente API: `http://127.0.0.1:8000`, contract at `/docs`
- Call bot: `http://127.0.0.1:8001`, contract at `/docs`
- Bot repository: `C:\Users\kashy\Documents\ChatGPT\call bot\mdoner-service-a-call-bot`
- Bot `.venv` has the project and test requirements installed.
- Bot's untracked `.env` uses `MENTE_API_BASE_URL=http://127.0.0.1:8000/v1`.
- `MENTE_CALL_BOT_KEY` equals Mente backend's `CALL_BOT_API_KEY`. Both are
  server-only; do not add them to the Expo environment.
- A separate random `SERVICE_A_TRIGGER_AUTH_TOKEN` protects bot operator routes.
- `SERVICE_A_REAL_CALLS_ENABLED=true` for owner-authorized manual calls and
  `SERVICE_A_SCHEDULER_ENABLED=false` so automatic dialing remains off.

The existing Mente app/backend configuration is retained. No hosted schema
changes or real patient/session writes were needed for this installation.

## Start and check

Keep the Mente backend and app running. In another PowerShell terminal:

```powershell
Set-Location -LiteralPath 'C:\Users\kashy\Documents\ChatGPT\call bot\mdoner-service-a-call-bot'
.\start-local.ps1
```

The startup script loads `.env` before importing the app and uses port 8001.
To check the protected backend connection without displaying credentials:

```powershell
.\check-local.ps1
```

`integration: connected` means the bot authenticated to Mente and read its
current active schedules. A zero schedule count is valid: save a patient phone
number and enable a call schedule in Mente before expecting scheduled calls.
The unprotected `/health` endpoint reports only process liveness.

## Verify without calling anyone

From the Mente repository:

```powershell
.\backend\.venv\Scripts\python.exe .\scripts\verify-call-bot.py
```

This launches both services on temporary loopback ports with a disposable SQLite
backend and synthetic identity. It creates synthetic family/patient/memory data,
runs mock calls, verifies delivery and caregiver overview visibility, verifies
idempotent replay and changed-content conflict, and checks reminder pause
suppression. It shuts down its own services afterward. It does not use your
configured Supabase database or make Twilio calls.

The bot's protected `POST /v1/calls/mock` can also run an explicit mock for a
Mente patient. **That endpoint writes a CALL session to the configured Mente
backend**, so use synthetic test patients. Body:

```json
{"patient_id":"<Mente patient UUID>","session_id":"mock-unique-id","responses":["no"]}
```

Use `X-Service-A-Trigger-Token` from the bot's local `.env`. `no` records a
rescheduled session. For a question flow supply `yes` followed by answers in
planned order. The plan uses current local day/month, objective general
questions and Mente's active, consented text memories. Responses are normalized
for case and whitespace. Retries of the same session ID and inputs return the
original result; changed inputs return 409.

## Delivery and scheduling

- Bot reads `GET /v1/integrations/call-bot/schedules` and
  `GET /v1/integrations/call-bot/patients/{id}/context` from Mente with
  `X-Call-Bot-Key`.
- Finished calls are queued with a frozen payload and posted to
  `POST /v1/integrations/call-bot/sessions`. The Twilio CallSid (or explicit mock
  ID) is `external_id`. Mente owns score/alert calculation.
- A background worker retries delivery every 30 seconds and after restart.
  Network/auth/server failures remain PENDING; invalid data, deleted patients
  and conflicting replays become REJECTED for investigation. Retrying delivery
  does not redial.
- `POST /v1/mente/delivery/retry` runs an immediate bounded delivery retry.
- `POST /v1/calls/due` defaults to a read-only dry run. It fetches fresh context
  and checks active status, phone number, reminder pause, scheduled weekdays,
  IANA timezone, quiet hours (including overnight) and a five-minute initial
  call window. `?dry_run=false` requires real calls to be enabled.
- Optional scheduling polls every 30 seconds when explicitly enabled. It
  reserves one attempt per patient/local day before contacting Twilio. A
  provider timeout cannot cause automatic duplicate dialing. Missed windows
  are skipped. `allow_one_retry` remains stored in Mente but automatic provider
  redial is not implemented in this local integration.
- Manual `POST /v1/calls/trigger` takes `patient_id` in integrated mode. It
  rejects caller-supplied phone numbers, freshly resolves Mente's phone and
  honors active schedule/day/quiet/pause controls. Manual triggers do not
  require the scheduled time window. Keep operator credentials private.

## Remaining steps for actual telephone calls

Set these values in the bot's `.env` using your Twilio account:

```dotenv
TWILIO_ACCOUNT_SID=<your account SID>
TWILIO_AUTH_TOKEN=<your auth token>
TWILIO_FROM_PHONE_NUMBER=<your Twilio E.164 number>
TWILIO_PUBLIC_BASE_URL=<your public HTTPS call-bot URL>
```

Twilio must be able to reach the bot through that public HTTPS URL. The code
creates its voice-start and terminal-status callback URLs from this base and
validates Twilio signatures, including the opaque binding query. Each provider
call is bound to a Mente patient before dialing. Terminal callbacks record
no-answer/provider failures and interrupted calls; keypad timeouts invoke the
existing safe conversation handling.

In Mente, add an E.164 patient phone number, consented text memories and an active
English call schedule with the correct days/time/timezone/quiet hours. Unpause
reminders. Then explicitly set `SERVICE_A_REAL_CALLS_ENABLED=true`; set
`SERVICE_A_SCHEDULER_ENABLED=true` only when automatic dialing is intended, and
restart the bot. Trial account restrictions and verified destinations must be
handled in your Twilio account. This installation has not placed a real call.

The current voice adapter speaks English. VOICE and PHOTO memories are excluded
from the bot plan until authorized media playback is implemented; they are not
pretended to be recognition questions. Text PERSON, RELATIONSHIP, STORY and
MILESTONE memories are supported. Local SQLite is intended for one prototype
instance, not a distributed production scheduler.

## Current Twilio Trial compatibility

For this owner's new Voice Trial gateway, custom Voice requests arrived without
`X-Twilio-Signature`; signed terminal status callbacks worked normally. The bot's
default-off `SERVICE_A_TWILIO_TRIAL_WEBHOOKS_ENABLED` opt-in authenticates only
unsigned Voice start/readiness/answer through a short-lived 256-bit per-call
capability plus an already linked CallSid and fresh Twilio API verification of
account, sender, destination, direction and in-progress status. It never accepts
invalid or empty-present signatures or unsigned terminal statuses. Start also
checks authoritative Mente patient/schedule context. Subsequent action URLs carry
the same capability; use the startup script, which disables access logging, and
keep these URLs private. All normal signed webhook validation remains in place.
The opt-in must be disabled for accounts that sign custom Voice requests.

## BOT question setup

The call first introduces itself and asks whether the patient is ready. Press 1
to begin or 2 to reschedule. The integrated planner then asks the current day
and the patient's name, using Mente's timezone and preferred/legal name. BOT
has four owner-supplied active text memories saved through the authenticated
caregiver API: son's name, relationship, city of residence and enjoyable
activity. All four fit in the eight-question plan with two objective questions
(month and days in a week). Personal answers remain in Mente rather than the
bot source or documentation. Each question reads four choices; press 1-4 for
an answer, 9 to skip, or 0 to end the conversation. Choice order is stable for
one call and is regenerated from the frozen Mente question snapshot on retries.
Missing names are never filled with fixture answers.

Preview current questions without calling or saving a session:

```powershell
Set-Location -LiteralPath 'C:\Users\kashy\Documents\ChatGPT\call bot\mdoner-service-a-call-bot'
.\preview-questions.ps1 -PatientId '202a9c66-ac6f-40cc-bf85-42f55f5e2451'
```

The preview prints private patient question answers locally; keep its output
within the caregiver's testing context. An owner-authorized manual trial call
completed the full eight-question keypad flow and delivered its result to
Mente. Automatic calling remains disabled while the scheduler flag is false.

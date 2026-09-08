# REMED-002 — local safety remediation and development patient bind

TASK: REMED-002
ROLE: SUPERVISOR (root, sequential writer)
STATUS: READY_FOR_REVIEW

## Summary

Implemented the approved local remediation slice without changing navigation,
dependency versions, production credentials, or remote services. The backend now
supports a repeatable six-digit patient connection fixture only when explicitly
configured in `development` or `test`; production rejects that configuration. It
is not caregiver authentication and it is paired with one server-selected patient.

The pass also removes credential-bearing caregiver clients from cached query data,
guards late settings mutation effects, preserves dirty Settings forms across
recoverable load failures, fixes empty-query phase handling, stabilizes patient
start identifiers, preserves tagged pending metric/finalize writes, adds an honest
patient safe-exit path, replaces unsupported audio claims, and hardens expected
database uniqueness/concurrency paths. Health/readiness and database pool/timeout
configuration are separated and documented.

## Development connection fixture

For a local or test backend only, set these together in an untracked backend
environment file:

```text
ENVIRONMENT=development
DEVELOPMENT_ADMIN_CODE=482916
DEVELOPMENT_PATIENT_ID=<id returned by caregiver setup>
```

The caregiver must still be authenticated through Supabase and authorized for the
patient. The caregiver Family view displays the code only when the backend reports
the configured development fixture. The patient enters `482916` on the device
access screen. Reusing it issues a fresh device token and revokes the prior active
local test-device token. No raw code or raw token is stored in the database or logs;
the normal one-way device-token hash is stored for request validation. Never
configure it in production; production settings reject the field.

## Files changed

- `backend/.env.example`
- `backend/Dockerfile`
- `backend/README.md`
- `backend/app/config.py`
- `backend/app/database.py`
- `backend/app/main.py`
- `backend/app/routers/devices.py`
- `backend/app/routers/integrations.py`
- `backend/app/routers/sessions.py`
- `backend/app/schemas.py`
- `backend/app/services/sessions.py`
- `backend/tests/test_devices_and_validation.py`
- `backend/tests/test_openapi_contract.py`
- `docs/operations.md`
- `docs/plans/deployment-remediation.md`
- `docs/reviews/deployment-readiness.md`
- `src/api/caregiverClient.test.ts`
- `src/api/caregiverClient.ts`
- `src/api/config.ts`
- `src/api/contracts/caregiver.ts`
- `src/data/mockData.ts`
- `src/features/caregiver/settings/useCaregiverSettings.test.ts`
- `src/features/caregiver/settings/useCaregiverSettings.ts`
- `src/features/caregiver/useCaregiverContext.test.ts`
- `src/features/caregiver/useCaregiverContext.ts`
- `src/features/caregiver/useCaregiverOverview.ts`
- `src/features/patient/pendingGameWrite.test.ts`
- `src/features/patient/pendingGameWrite.ts`
- `src/features/patient/usePatientSession.test.ts`
- `src/features/patient/usePatientSession.ts`
- `src/navigation/AppRouter.tsx`
- `src/screens/caregiver/CaregiverFamilyScreen.tsx`
- `src/screens/caregiver/CaregiverSettingsScreen.tsx`
- `src/screens/patient/PatientCompleteScreen.tsx`
- `src/screens/patient/PatientDeviceAccessScreen.tsx`
- `src/screens/patient/PatientFamilyScreen.tsx`
- `src/screens/patient/PatientHelpScreen.tsx`
- `src/screens/patient/PatientInGameScreen.tsx`
- `src/screens/patient/PatientPlayScreen.tsx`
- `.agent-state/dashboard.md`
- `.agent-state/tasks/REMED-002.json`
- `.agent-state/handoffs/REMED-002.md`

## Tests run

- `npm install`: passed; dependencies unchanged; npm reported 10 existing
  moderate advisories and an unapproved optional install script.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test -- --no-cache`: passed, 20 suites / 71 tests.
- `npx expo-doctor`: passed, 21/21 checks.
- Synthetic configured `npm run web:export`: passed.
- Locked temporary backend environment: 20 pytest tests passed; Ruff, MyPy,
  Bandit, and pip-audit passed.
- Disposable SQLite Alembic upgrade: first upgrade and repeat upgrade passed.
- `git diff --check`: passed; conflict-marker scan returned no matches in
  project-owned source/config files.
- Firefox mock web journey: role switch, patient Play → In-Game → Complete →
  Return to Play, caregiver Home/History/Family, four-width overflow checks, and
  zero reported console errors/warnings passed. Settings remained sign-in-gated
  in preview, so no fake settings mutation claim is made.

## Known issues and blockers

- No PostgreSQL concurrency/RLS/private-storage integration environment was
  available; SQLite tests do not prove those properties.
- No live Supabase authentication or authenticated browser Settings save was run.
- `adb devices` has no authorized device; physical Android verification is
  pending. No iOS simulator/device was available.
- No remote Supabase URL, deployment, or production-readiness evidence was
  obtained.

## Recommended next step

Independent read-only review of this handoff and the exact dirty diff, followed by
the documented PostgreSQL/RLS/media and live non-production authentication gates
when their owners provide disposable infrastructure.

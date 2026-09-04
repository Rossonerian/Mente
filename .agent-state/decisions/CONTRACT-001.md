# CONTRACT-001 — FastAPI contract freeze

Status: APPROVED

## Safe integration boundary

- Caregiver requests use a verified Supabase access token in `Authorization: Bearer <token>`.
- Patient requests use only the backend-issued `X-Patient-Token` capability token.
- Transport DTOs remain separate from presentation view models. Screens do not call `fetch`.
- Replays may return `200`; new game resources may return `201`; changed idempotency payloads return `409`.

## Required backend correction before caregiver integration

The present backend owns passwords and issues HS256 Mente JWTs. This violates the documented Supabase authority boundary. Replace it with Supabase JWKS validation and map verified `sub` values to `users.auth_user_id`; do not dynamically link existing users by email.

## Confirmed endpoint gaps

- No signed family-voice upload/playback API: do not offer working playback/upload controls.
- Overview lacks persisted assessment freshness (`assessment_created_at`, `latest_session_at`, refresh status): expose client transport freshness separately and report assessment freshness as unavailable.
- No game rotation state or atomic finalize-plus-rotation transaction: do not claim rotation advancement.

These gaps remain explicit and must not be filled with mock success states.

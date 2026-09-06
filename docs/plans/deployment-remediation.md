# Mente deployment remediation

## Authority and baseline

Source review: [deployment readiness](../reviews/deployment-readiness.md), clean
`a0cf0d31d82f7c56acdbf23c85cd38a596f4236c`. Preserve Expo57/RN0.86, both
`com.momento.mente` identifiers, navigation, glass and existing authorization.
No remote writes, deployments, credentials changes, commits, pushes or product rewrite.
WP1 was accepted; the approved local remediation slice is tracked as `REMED-002`.
It implements safe local portions of WP2–WP7 and updates WP8 evidence, while live
Supabase/PostgreSQL/RLS/media/native gates remain open. Do not interpret this
document as authorization to make remote changes.

## Ordered packages

### WP1 — Production configuration (R01), S

- Owner: FRONTEND/root. Owned files: `src/api/config.ts`, focused production-transform
  regression; task `REMED-001`. No dependency/config-stack changes needed.
- Replace four indirect public env reads with direct static references. Preserve
  missing/invalid configuration behavior, whitespace normalization and mock guard.
- Test actual installed Expo client production transforms for web/Android/iOS,
  then evaluate with no runtime `process`; cover configured/absent/blank/invalid
  values and mock=true in production. Run complete frontend gate.
- Accept only with focused red→green evidence and independent review. This is
  configuration evidence, not live authentication or physical-device evidence.
- Status: DONE at current uncommitted worktree. Final 18 suites/65 tests, typecheck,
  lint, Doctor21/21, synthetic export and Firefox configuration rendering at all
  four widths pass. Independent Supervisor APPROVED; BOSS ACCEPT for WP1 only.

### WP2 — Identity lifecycle (R02), M

- Owner: FRONTEND. Owned: auth/context/query lifecycle and focused tests.
- Cache domain objects only; derive client from current token. Authentication
  generation guards must reject late query/mutation effects after logout/account
  replacement, including repeated sign-in by the same account.
- Tests: fresh context plus refreshed token; deferred saves after logout/role/account
  change; cancellation and no residual old-session cache entries. No token persistence.
- Accept current credentials on requests and sensitive cleanup surviving late responses.
- Independent of WP3; serialize subsequent Settings changes with this package.
- Status: local implementation complete in `REMED-002`; focused tests cover domain-only
  cache data, current-client attachment, and late-session guards. Live account switching
  and authenticated browser evidence remain unverified.

### WP3 — Transaction correctness (R05), M–L

- Owner: BACKEND. Owned: device/session services, session/call ingestion routers,
  focused tests; use canonical Alembic only if a constraint change is required.
- Atomically consume enrollment code in issuance transaction; acquire the same
  session serialization boundary before reading status in metric/finalization writes.
  Recover only known uniqueness collisions, reload winner, compare fingerprints;
  propagate unrelated database failures rather than hiding them.
- Prerequisite: installed locked test environment and explicitly disposable PostgreSQL.
- Tests: synchronized redemption, identical/conflicting starts and metrics,
  metric-versus-finalize, conflicting finalizers; cross-family/revoked-device writes.
- Accept one enrollment winner, consistent aggregates, deterministic replay/409,
  no500 from expected duplication. SQLite alone cannot satisfy this gate.
- Status: local implementation complete for row locking and expected uniqueness recovery;
  locked backend tests pass, but the PostgreSQL concurrency acceptance gate remains open.

### WP4 — Caregiver recovery (R03/R04), M

- Owner: FRONTEND. Owned: Settings/overview/live-entry navigation and tests.
- After WP2, preserve mounted dirty form during recoverable refetch errors; keep
  authentication/permission losses distinct. Confirm server response after successful
  saves, preserve pending edits after partial two-resource failure, no duplicate submits.
- Check successful empty prerequisites before disabled dependent queries; expose
  a working setup destination and explicit live role entry separate from preview.
- Tests: draft edit/offline/refetch/reconnect; empty families/patients; live entry,
  Back/refresh; backend validation fields; safe Settings persistence/reload.
- WP1 required for live-browser acceptance; no router migration.
- Status: local implementation complete for mounted recoverable Settings errors,
  empty overview phases, current-role shells, and 48pt day controls. Live auth/save
  and full setup-entry acceptance remain unverified.

### WP5 — Patient recovery and honest content (R06), M

- Owner: FRONTEND. Owned: patient screens/session hook/tests.
- Retain one start identifier until resolved; replay original pending payload;
  clean exit must never mark an unconfirmed write complete. Use neutral/verified
  family text; gate unavailable audio rather than claiming playback.
- Tests: accepted start with lost response, idempotent retry, failed finalization
  retry/exit, empty prompt exit, nonmock family names, no patient typing/scoring UI.
- Coordinate API semantics with WP3; actual private audio depends on WP6 and needs
  load/failure/unmount cleanup tests. Do not add an unrelated audio/UI framework.
- Status: local implementation complete for stable start IDs, tagged pending metric/
  finalize recovery, safe exit, dynamic family names, and honest non-audio copy. Live
  device-token failure recovery and media lifecycle remain unverified.

### WP6 — Security and operational foundation (R07/R08), L

- Owners: BACKEND + INTEGRATION, disjoint scopes only after contracts frozen.
- Backend owns canonical migrations/media authorization/effective-role tests.
  Integration owns container/startup/CI and operational runbooks, not production setup.
- Separate migration command/privileges from runtime. Verify grant/RLS exposure
  with actual role behavior; never call bypass-role API tests RLS verification.
  Define private object authorization, bounded signing, type/size/path validation
  using existing models; test cross-family media denial and expiry.
- Define liveness/readiness semantics, bounded pool/connect/statement timeouts;
  implement proxy/rate-limit policy for selected topology, not speculative infrastructure.
- Accept empty/repeat/baseline migrations, effective-role security, startup under
  restricted runtime, failure time bounds, database AND media restore and rollback.
- External prerequisites: actual signing/role/storage policy, hosting/topology,
  domains/origins, proxy trust, SMTP/redirects, privacy/retention and recovery owners.
  Missing inputs BLOCK affected work; never create a cloud project to unblock silently.
- Status: bounded database pool/connect/statement settings, liveness/readiness
  separation, separate container migration instructions, and production PostgreSQL
  validation are implemented locally. RLS, private Storage, distributed rate limits,
  backup/restore, and topology verification remain blocked by missing infrastructure.

### WP7 — Accessibility and regression (R09), M

- Owner: FRONTEND/QA. Existing controls/glass fallback/tests only; no redesign.
- Restore>=48 caregiver day targets; preserve>=64 patient controls. Web
  reduced-transparency fallback, focus and large-text fixes must be evidence-based.
- Test both roles at320/768/1024/1440, keyboard/focus, no overflow, reduced
  preferences, readable glass, live error/retry states and all available native targets.
- Depends on stable WP4/WP5 flows; physical and release-build evidence remain separate.
- Status: caregiver day controls now meet 48pt and mock web journeys pass at four
  widths with no overflow and zero observed console errors/warnings. Reduced
  transparency, large text, screen-reader, and native-device evidence remain open.

### WP8 — Evidence reconciliation (R10), S

- Owner: SUPERVISOR/root docs; independent REVIEWER for final decision.
- Update these two documents, dashboard/tasks/handoffs with exact diff and results;
  distinguish completed implementation, runtime unverified work and roadmap features.
- Triage moderate Expo/Xcode/UUID advisory reachability. No forced SDK downgrade.
- Accept only on exact-state evidence and independent final review. Report separate
  branch/staging/web-backend/Android/iOS verdicts; no compliance claim.
- Status: current docs/dashboard/task handoff are being updated under `REMED-002`;
  independent read-only review is still required before closing the task.

## Parallelism and completion

WP2 and WP3 may run simultaneously only with exclusive scopes and isolated writable
worktrees. Maximum two implementation specialists. Root owns configuration,
integration and final gate. Do not overlap Settings/auth writers. Integration waits
for prerequisites; optional visual polish stays last. No extra agents for tiny work.

Current progress/evidence: `.agent-state/tasks/REMED-001.json`,
`.agent-state/tasks/REMED-002.json`, `.agent-state/handoffs/REMED-001.md`, and
`.agent-state/handoffs/REMED-002.md`. Old milestone acceptance does not clear the
remaining live/security/native gates. This pass leaves all work uncommitted.

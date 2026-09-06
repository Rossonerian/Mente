# Mente deployment-readiness review

## Baseline and evidence boundary

Reviewed baseline: `a0cf0d31d82f7c56acdbf23c85cd38a596f4236c`, branch
`fix/mente-foundation-integration`. Local `main` and `origin/main` were
`e587a5c77eaeef00c4aebbaba6687094ff3edd6d`; neither was fetched. Review diff:
`main...HEAD`, 46 files, 606 insertions / 2401 deletions. Initial worktree was clean.
The diff repairs a damaged baseline; retained defects below are not all new regressions.

Two independent read-only specialists completed frontend/backend reviews. Their
final Supervisor hit a usage limit, so the full release review did not receive
independent final approval. A separate Supervisor reviews WP1 only during remediation.
Current uncommitted remediation is identified in the handoff, not retroactively
included in these baseline results. Task-state validation checks structure, not readiness.

## Findings

Priority definitions: P0 critical, P1 high, P2 medium, P3 low. No P0 established.
One P1, eight P2 groups, one P3 group. Missing evidence is not proof of exposure.
Required tests, ownership and dependencies are in the linked remediation plan.

| ID / category / severity | Evidence and affected source | Impact / probable cause | Smallest remedy / gate |
|---|---|---|---|
| R01 build configuration / P1 | Confirmed by production-transform execution. `src/api/config.ts:5` aliases `globalThis.process.env`; public values vanish while a direct-reference control inlines. | Release authentication/API configuration fails despite successful export. Development runtime env injection masks the defect. | Direct static public references; actual Expo production-transform regression. Blocks live builds. |
| R02 identity/cache / P2 | Executed token OLD→NEW probe still used OLD in `useCaregiverContext.ts:39`. Deferred Settings save recreated an old-account query after cancellation/removal in `useCaregiverSettings.ts:110`. | Credential-bearing client cached as data; late mutation has no authentication-generation guard. Residual cache proven, cross-account rendering not proven. | Cache domain data only; use current client and guard departed-session results. Blocks authenticated-session acceptance. |
| R03 Settings reliability / P2 | Executed 09:00→10:00 edit, failed save/refetch offline, recovery returns09:00. `CaregiverSettingsScreen.tsx:39` unmounts the form on recoverable query failure. | Draft loss; dirty-reset guard cannot survive unmount. | Keep cached form mounted with recoverable error banner; test partial two-resource save honesty. Blocks Settings acceptance. |
| R04 onboarding/navigation / P2 | Executed empty-family hook remains loading (`useCaregiverOverview.ts:57`). Production access screen visibly retains development preview; normal live shells hide it (`AppRouter.tsx:73`). | Disabled queries checked before empty prerequisites; inconsistent role-entry control. No backend bypass established. | Resolve empty prerequisites first; distinct live entry and development controls in existing navigation. Blocks core-flow acceptance. |
| R05 transaction correctness / P2 | Source interleavings, not executed PostgreSQL races: `routers/devices.py:69` unconditional code consumption; `services/sessions.py:32,65` stale state checks; session/metric/call-ingestion check-then-insert without uniqueness recovery. | Multiple credentials per code, stale aggregates, conflicting finalization or500 replay. Constraints DO prevent duplicate session/metric rows. | Atomic code consumption, shared session serialization, narrow uniqueness recovery. Blocks staging concurrent-write acceptance. |
| R06 patient recovery/honesty / P2 | Source-confirmed: `PatientPlayScreen.tsx:35` new start ID on retry; `PatientInGameScreen.tsx:29,46` text-only Repeat and promised exit with no exit action; `PatientFamilyScreen.tsx` text-only playback; `PatientCompleteScreen.tsx:27` hardcoded family names in live mode. | Unresolved writes cannot recover reliably; UI invents context/promises audio. Server duplicate-start reproduction unexecuted. | Stable pending start ID, honest exit, neutral/verified names, gate absent playback. Blocks patient-flow acceptance. |
| R07 database/media security / P2 | Missing implementation/verification: canonical Alembic migrations have no RLS/grants/storage policies; `docs/operations.md` explicitly records unfinished private-media configuration. | Actual exposed tables/runtime bypass role unknown; no demonstrated public leak. Private media cannot be certified. | Effective-role tests and private-media contracts using existing models/migration authority. Blocks security acceptance. |
| R08 deployment/recovery / P2 | `backend/Dockerfile:21` runs migrations using runtime DB config; `app/main.py` liveness queries DB; database explicit operation timeouts/distributed rate-limit deployment and restore proof absent. | Runtime/migration separation contradicted by startup; outage and multi-instance behavior unverified. | Separate migration execution, bounded readiness, topology-specific controls, CI and restore/rollback rehearsal. Blocks staging configuration/production. |
| R09 accessibility / P2 | Source-confirmed40×40 Settings day controls (`CaregiverSettingsScreen.tsx:130`); web glass lacks reduced-transparency handling. Native/large-text verification incomplete. | Required48pt caregiver targets unmet; accessibility fallback coverage missing. | Target size/fallback fixes within current design; focus/large-text/native checks. Blocks affected accessibility acceptance. |
| R10 maintenance / P3 | Audit10 moderate entries in Expo/Xcode/UUID chain; architecture/task evidence includes stale Next.js and broad telephony claims. | Unsupported readiness claims and untriaged tooling advisory, not demonstrated runtime exploit. | Reachability triage without forced SDK downgrade; commit-bound evidence and scope reconciliation. Nonblocking alone. |

## Baseline commands actually executed

| Command | Exit / outcome |
|---|---|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm test -- --no-cache` | 0;17 suites,47 tests |
| `npm exec --no -- expo-doctor` | 0;cached tool,21/21 checks |
| `npm run web:export` | 0;Metro color-environment warnings |
| `npm audit --json` | 1;10 moderate,0 high,0 critical; no remediation applied |
| `git diff --check`, `git diff --cached --check` | 0 |
| Project conflict-marker search | No matches |
| `./.agent-scripts/validate` | 0;six structurally valid tasks |
| Backend `python3 -m pytest`, `ruff check .`, `mypy app`, `bandit -q -r app`, `pip_audit -r requirements.lock` | Each1:module absent; not backend test failures or passes |
| PostgreSQL migrations/RLS/concurrency/live contract checks | Not run:locked backend environment absent |
| `adb devices` | No attached device |

Backend reviewer ran a network-free signed-token probe using system PyJWT2.7.0,
NOT locked2.13.0: valid RSA accepted; expiry/issuer/audience/role/signature/HS256
rejected. Existing API tests use synthetic SQLite and stub caregiver verification;
their source coverage does not prove real Supabase/PostgreSQL integration or RLS.
No dependency installation or unknown-ownership database use occurred in review.

## Browser/native evidence

- Firefox mock caregiver Home/History/Family/Settings access state and patient
  Play/Family/Help at320/768/1024/1440: no horizontal overflow. Mock
  Play→In-Game→Complete→Play worked. In-game controls measured68px.
- Sampled keyboard focus had a3px border. Release access screens at all four widths
  had no overflow and one SVG filter definition. This does not prove physical refraction.
- Chromium mock caregiver tabs at all four widths had no overflow; patient entry
  and In-Game rendered. Remaining Chromium journey/final console collection were
  interrupted when runtime/browser sessions expired.
- Firefox inspected console checkpoints had0 errors/warnings. Final all-route
  console, large text, full screen-reader and native evidence remain incomplete.
- Settings required authentication even in mock mode. No live save/toggle,
  authentication, backend failed-write or real private-media flow was verified.
- No physical Android or iOS test. Web evidence is not native validation.

## Acceptance mapping and verdicts

| Criterion | Status at reviewed baseline |
|---|---|
| SDK57/identifiers/compilation/platform glass structure | Implemented; local checks verified, native rendering unverified |
| Typed clients/Query/RHF/Zod | Implemented; lifecycle defects confirmed |
| Caregiver overview/history/family/settings | Partial live acceptance |
| JWT/device boundaries | Implemented but locked-stack/live security verification incomplete |
| Session idempotency/recovery | Partial |
| RLS/private Storage/recovery/operations | Missing or unverified |
| Gradient/layout/patient dignity | Implemented with limited mock-browser evidence |
| Full telephony/scheduler/SMS | Not evidenced; do not silently add roadmap scope |

Feature-branch acceptance, staging, production web/backend, Android release and
iOS release are all **BLOCKED**. Local green compilation alone is not release
readiness. Native runtime verification is **NOT VERIFIED**. No compliance claim.

No real Supabase project/dashboard URL was obtained. Outstanding external inputs:
isolated locked backend environment, disposable PostgreSQL/Supabase, actual signing
and effective DB-role configuration, private-storage policies, hosting/proxy/domain
decisions, SMTP/auth redirects, consent/retention/deletion, restore ownership,
native targets and independent final review. Remote writes require separate approval.

See [remediation plan](../plans/deployment-remediation.md) for ordered work packages.

## WP1 remediation update (uncommitted, after reviewed baseline)

R01 is resolved by `src/api/config.ts` plus18 regression cases in
`src/api/config.production.test.js`. Final typecheck/lint,18 suites/65 tests,
Doctor21/21 and synthetic production export pass. Firefox rendered configured
sign-in at320/768/1024/1440 with0 console errors/warnings and no overflow despite
mock=true in the build environment; all external requests were blocked. No real
authentication was attempted. Independent scoped Supervisor APPROVED; BOSS ACCEPT
for WP1. No package/lockfile/backend changes. See `.agent-state/handoffs/REMED-001.md`
for red→green commands, intermediate diagnostics and exact changed-file list.

## REMED-002 implementation update (uncommitted, current worktree)

The approved local remediation slice has now been implemented and is recorded in
`.agent-state/handoffs/REMED-002.md`. It addresses the locally reproducible parts
of R02–R06 and R08–R09:

- Caregiver query data no longer retains a credential-bearing client; current-token
  clients are attached at use time and late Settings mutation results are ignored
  after an account/token change. The overview now distinguishes pending prerequisites
  from a successful empty family/patient result.
- Settings keeps the mounted form and entered values through a recoverable stale/
  offline load error. Caregiver day controls are 48pt. Live authenticated save remains
  unverified.
- Patient start IDs remain stable until a start resolves. Pending metric and finalize
  writes are tagged and replayed without storing credentials; failed writes offer a
  safe exit and never claim completion. Patient copy no longer promises unavailable
  audio, and completion names come from the active memory set.
- Session, metric, and call-ingestion paths now serialize persisted session reads and
  recover only expected uniqueness collisions. Database pool/connect/statement bounds,
  liveness/readiness separation, and separate container migration instructions are
  explicit. These are source and SQLite/locked-test improvements, not PostgreSQL
  concurrency proof.
- A repeatable six-digit development/test patient connection fixture is available
  only with paired server configuration (`DEVELOPMENT_ADMIN_CODE=482916` and a
  configured patient ID). Caregiver authentication and family authorization remain
  mandatory; production rejects the fixture. It is not an admin or caregiver bypass.

Current exact-tree evidence: frontend 20 Jest suites/71 tests, typecheck, lint,
Expo Doctor 21/21, synthetic web export; locked temporary backend 20 tests, Ruff,
MyPy, Bandit, pip-audit; disposable Alembic upgrade twice; Firefox mock journeys
and four-width no-overflow checks with zero observed console errors/warnings. No
packages or lockfiles changed. `adb devices` has no authorized device.

R07 remains unverified for effective RLS/grants/private Storage and signed media.
PostgreSQL concurrency, live Supabase authentication/save, full accessibility
preferences, and native runtime evidence remain open. Overall feature-branch,
staging, production web/backend, Android, and iOS release verdicts remain BLOCKED
or NOT VERIFIED as applicable; local remediation is not a production-readiness claim.

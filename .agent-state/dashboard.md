# Project Dashboard

AUTHDESIGN-001 — IN_PROGRESS, actual SUPERVISOR Russell, 2026-09-15

- Actual workers already live, parent-brokered: AUTHTYPE-001 FRONTEND Archimedes (`01a0a1e6-6329-7023-8bd6-a5a7f75eb41e`); AUTHSEC-001 BACKEND Hilbert (`01a0a1e6-63fd-7e42-8ece-f1bc2857a1c7`); AUTHQA-001 QA Epicurus (`01a0a1e6-64df-7912-a1a1-a65fd5498080`). No duplicate workers. Supervisor writes root state and the explicitly authorized original review document only; production is read-only.
- Latest policy: no mandatory mailbox verification; keep min12. Auto-confirmed provider email state is not proof of mailbox ownership. Recovery requires server proof; enrolled MFA remains enforced. Web localStorage XSS, later MFA opt-out, and both-factors-lost support/identity-proof ownership require explicit product/security decisions before production.
- Root `main fbe88b1` remains dirty and unintegrated, including 8-character signup. Three canonical dirty worktrees exist at the same HEAD. Initial explicit Python validator passes 18 task records and conflict checks; root/worktree whitespace checks pass. Historical gate counts do not approve final candidates.
- Concrete gates sent to actual workers: generic signup shape (no tokens) versus frontend token mock; functional server-authoritative recovery token-hash/code UX; synthetic CI candidate publication; legitimate private media CSP; executable dependency/evidence maintenance; real provider hook persistence and wrong-password HTTP negatives; canonical provider schema/FKs/roles and strict replay plus actual protected-app denial.
- QA reports authorized hidden Docker startup, 30 harness unit tests passing, and fresh owned fixture `c47eb6cd89a2` at provider `http://127.0.0.1:57035`, PG 57023, Mailpit 57033, raw provider 57036. These are worker reports awaiting fresh canonical migration/provider/application handoff, not acceptance. Preserve baseline strict failure.
- Latest QA report: strict provider run `88710fa4f0cb` exit0 against canonical `c47eb6cd89a2`, unchanged c6 signature, normal grace/parent exception passing, stale/immediate/delayed refresh denial and prior provider user403 with terminal counts0/0. Actual app direct-signup admission/profile negatives pass, but `/admit-password` FAIL returned to Hilbert. Application QA NOT PASS; independent hook HTTP, full roles/migration/gates and review remain open. AUTHSEC/AUTHREUSE not approved.
- Superseding fresh BOSS-read evidence `a0de2/8e5437/88710`: actual unconfirmed application admission/MFA/logout, hook32 committed wrong-password counters/correct-password success and strict replay PASS. Earlier admission FAIL above is historical; complete application runner handoff still required. Terminal definer `postgres` is SUPER, so intended non-superuser owner is NOT PROVEN. Hilbert/Epicurus notified to run dedicated owned non-superuser migration/definer with explicit auth grants/FORCE RLS and unconditional role assertions plus fresh strict repeat before approval. Hosted grants remain external. Integration still NOT APPROVED.
- Dependency clarification: factual all-lock inventory, maintenance review targeted to new UI packages. No invented universal age/zero-all-vulnerability/license rule. Ten historical moderate Expo-chain findings need safe correction or independent explicit review; incompatible downgrade prohibited.
- Required order: worker self-tests + independent dependency review/QA + Supervisor approval -> AUTHDESIGN-002 serialized integration -> AUTHREVIEW-001 independent combined review -> AUTHQA-002 independent combined QA -> Supervisor acceptance package -> BOSS decision. Integration NOT APPROVED; milestone never marked DONE by Supervisor.
- Original review deliverable: `docs/reviews/auth-ui-security-plan.md` (prose/checklists); frontend worker's separate `docs/auth-frontend.md` is implementation evidence. BOSS exclusively owns `AUTHDESIGN-001-boss-review.md`. No commit/merge/push/deploy/live DB/live service restart authorized.
- Windows validator: explicit `backend/.venv/Scripts/python.exe .agent-scripts/validate --project` only; latest actual run21 records valid. Bare extensionless helper can open Notepad and is not validation evidence; leave user processes untouched.

HISTORICAL AUTHDESIGN-001 progress (superseded ownership and email-gate statements; retained evidence history)

- Full approved typography/auth UX/security goal retained. Actual Supervisor writes backend security in canonical AUTHSEC-001; parent brokered actual FRONTEND Mencius (AUTHTYPE-001) and QA fixture Wegener (AUTHQA-001) in separate canonical dirty-seeded worktrees. Three concurrent implementation participants with disjoint scopes. Child Supervisor has no spawn API; parent brokering is operational.
- Task graph: AUTHTYPE-001 frontend and AUTHSEC-001 backend proceed independently against frozen gateway contract; AUTHQA-001 prepares isolated real-provider infrastructure. Approved dependencies → AUTHDESIGN-002 serialized integration/regression → AUTHREVIEW-001 independent review/QA and BOSS acceptance.
- Backend evidence: previous 9 actual disposable PostgreSQL checks passed; current focused gateway/release suite 23 tests passes, including reauthentication revision race, account-linked failure anomaly, UTF16 privileged JWT and authenticated report hashes. These are not actual GoTrue lifecycle evidence. Full gates and CI implementation pending.
- Independent review requests changes; original QA FAIL tracked by AUTHSEC-REUSE-001. Existing AUTHSEC-001 implemented deferred tombstone plus actual provider session deletion; owned GoTrue fixture regression passes normal rotation/exceptions, replay/descendant/user/password denial, current/global logout and captured-mail recovery. Independent strict repeat pending. Integration NOT APPROVED. AUTHTYPE-001 and AUTHQA-001 actual workers IN_PROGRESS. BOSS exclusively owns AUTHDESIGN-001-boss-review.md.
- User decision: keep minimum 12 despite OWASP 15 recommendation when MFA optional; consistent UI/server/provider, breach screening/rate limiting/MFA unchanged. Gateway now has bounded credential deadline inside common response window; local slow-network distribution test added, production/public-provider enumeration remains independently gated.
- Preserve dirty auth/profile/callbot source. No commit, merge, push, deployment, branch deletion, live restart or live migration. Disposable databases only. External provider controls remain pending live verification until evidence exists.

LATEST QUESTION SETUP — owner-configured BOT

- Four personal text memories saved through authenticated Mente API. Planner adds authoritative patient name after current local day, caps at eight questions, and greeting explains skip/stop. Read-only actual context preview confirms all four memories in BOT plan.
- 129 bot tests, targeted Ruff and disposable HTTP smoke pass. Bot restarted; manual calls enabled, daily scheduler still disabled pending answered live voice test. No call placed during question setup.
- Owner updated BOT's Mente phone back to +916201048799 through the authenticated caregiver API. The active 18:05 Asia/Kolkata schedule remains intact; the Trial destination must be verified in Twilio before another call.

LATEST LOCAL INTEGRATION — CALLBOT-001, BOSS ACCEPT for no-dial Mente/Service A integration

- Bot sibling repo installed/configured and running at `http://127.0.0.1:8001`; protected read-only status confirms connection to the running Mente API on 8000. Current active schedule count is one (owner-configured Bot).
- Mente remains patient/memory/schedule/result authority. Bot uses server-only API key, fresh patient-bound context, active consented text plans, signed callbacks and immutable retryable session outbox. Optional scheduling uses Mente time/day/quiet/pause controls and once-per-local-day claims.
- Independent REVIEWER APPROVE. 107 bot tests, 28 backend tests, real two-service disposable synthetic HTTP smoke and signed full voice flow with fake provider pass.
- Manual real calls enabled, automatic scheduler disabled. Correct sender/recipient verified; Trial custom Voice gateway omits signatures. Reviewed default-off capability plus provider identity authentication is configured locally; 126 bot tests and HTTP smoke pass. Latest call busy/0sec; live voice progression awaits answered test. Bot daily 18:05 Asia/Kolkata schedule and ngrok are configured. English text only, no VOICE/PHOTO playback or automatic provider redial. Guide: `docs/CALL_BOT_SETUP.md`; evidence: `.agent-state/handoffs/CALLBOT-001.md`.
- Owner-authorized Bot phone/timezone/schedule saved through authenticated Mente API; controlled owner-authorized test calls attempted and failure results delivered; no commits, pushes or deployment. Previous frontend/auth/profile changes preserved.

LATEST LOCAL FIX — PROFILE-001, BOSS ACCEPT for saved-profile visibility

- Existing backend rows were confirmed through authenticated read-only family/patient reads; the app selected the oldest profile and Home contained placeholder names.
- All caregiver loaders now select the newest complete profile. Confirmed saves seed server-returned context and open Family with a saved-details summary. Partial patient failure reuses the saved family; Cancel/Back retain the prior Settings destination.
- Independent review APPROVE after navigation correction. Frontend 26 suites/100 tests and focused backend 3 tests pass; targeted lint passes. Baseline six FamilyMember type errors remain.
- No live domain data writes or authenticated browser save claimed. Evidence: `.agent-state/handoffs/PROFILE-001.md`. No commit/push/deployment performed.

LATEST LOCAL FIX — AUTHUI-001, BOSS ACCEPT for bounded UI restoration

- Current checkout: `fbe88b1` on `main`. Restored caregiver Sign In, Register and profile Continue, which had empty handlers and no input fields.
- Existing Supabase auth/profile boundaries retained; validated input, pending guards, error feedback and confirmation state added.
- Independent read-only review APPROVE. Frontend 24 suites/90 tests pass; focused 9 tests and targeted ESLint pass; browser form validation and sign-in/registration navigation verified.
- Global typecheck retains six pre-existing FamilyMember fixture/adapter errors. No live account creation/login or native-device validation claimed.
- Evidence: `.agent-state/handoffs/AUTHUI-001.md`. No commit, push or deployment performed. Existing `.env.example` user edit preserved.

PROJECT STATUS: ACTIVE — local remediation implemented; release remains BLOCKED

CURRENT (supersedes historical readiness claims below)

- Baseline: `e587a5c` on `main`; local remediation is applied from the existing fix reference (`a0cf0d3` on `fix/mente-foundation-integration`).
- REMED-001 / WP1 — DONE, BOSS ACCEPT; direct Expo public configuration is covered
  by 18 production-transform tests.
- REMED-002 — implementation complete pending independent read-only review and final
  root validation. It covers identity/cache safety, caregiver recovery, patient write
  recovery, backend transaction collision handling, liveness/runtime database bounds,
  and a development-only repeatable patient connection fixture.
- Local admin testing path: configure safe public Expo values, start the isolated API,
  create one synthetic caregiver family/patient, then set the development-only code
  and patient ID in an untracked `backend/.env`.
- Local evidence so far: frontend 20 suites/71 tests, backend 20 tests, typecheck,
  lint, Expo Doctor 21/21, web export, backend Ruff/MyPy/Bandit/pip-audit and
  disposable Alembic upgrade pass. PostgreSQL concurrency, live Supabase auth,
  private media/RLS, and native-device behavior remain unverified.
- Review findings/evidence: `docs/reviews/deployment-readiness.md`.
- No remote changes, commits, pushes or deployments. Generated browser artifacts are
  temporary and must not be retained in the worktree.
- Physical Android validation is pending: `adb devices` has no authorized device.

HISTORICAL HANDOFF (not current release acceptance)

MILESTONE

- Organization setup accepted; application work is tracked separately.
- MENTE-001 — Typed FastAPI integration and selective Tamagui — DONE (BOSS ACCEPT).

ACTIVE

- None.

PARALLEL

- None

WAITING / BLOCKED

- Live authenticated browser save awaits a non-production Supabase fixture.
- Android/iOS physical validation awaits an authorized device or simulator.

QA / BUGS

- MENTE-001 — independent sequential review APPROVED; BOSS acceptance package prepared.

DONE

- Repository/capability inspection.
- ORG-001 — Multi-agent engineering organization — DONE (BOSS ACCEPT).
- BASE-001 — Frontend baseline repair — DONE (independent QA PASS).
- CONTRACT-001 — FastAPI/OpenAPI contract freeze — DONE.
- AUTH-001 — Supabase caregiver token cutover — READY_FOR_REVIEW.
- MENTE-001 — Typed FastAPI integration and selective Tamagui — DONE (BOSS ACCEPT).

COST NOTES

- Setup inspection: one TINY read-only Scout (`gpt-5.6-luna`, low).
- Dry run: two TINY read-only QA agents in parallel with one STANDARD Architect.
- No COMPLEX Integration/Bug-Fixer or CRITICAL acceptance agent was started while dependencies were blocked.
- No parallel implementation workers; setup files share one tightly coupled contract.

OWNER-AUTHORIZED TEST CALL — 2026-09-14:

- Services and ngrok health checks passed before dialing. Live Mente context
  re-read confirmed BOT at +916201048799, active daily 18:05 Asia/Kolkata
  schedule, and four active personal memories.
- Twilio accepted Call SID CA8785e819337fae5c1b850e0526027b69 and reported
  completed with 6 seconds of provider duration. The bot recorded and delivered
  the session to Mente as INTERRUPTED / NOT_READY with zero answered questions;
  this indicates the readiness prompt was not completed during the call.
- Delivery retry flushed the result successfully (Mente delivery SENT, HTTP 200).

TRIAL WEBHOOK FIX — 2026-09-14:

- Public probe reproduced ngrok `ERR_NGROK_6024` only for browser-style requests;
  Twilio-style requests reached the bot. The actual 403 was caused by the
  installed Twilio SDK exposing the reserved sender field as `_from`, while the
  Trial identity check read `from_`.
- Trial identity verification now supports the SDK field variant without
  weakening sender, recipient, account, direction, Call SID, or live-status
  checks. Empty readiness callbacks now re-prompt and then persist as
  `RESCHEDULED / NOT_READY`.
- Focused trial tests and the full bot suite pass (130 tests). The follow-up
  call CA0db68a83be33e6ed95dc44d380b81030 reached the bot without a URL error;
  it timed out at readiness before the no-input persistence fix and remains a
  historical rejected delivery.

READINESS TRANSCRIPT FIX — 2026-09-14:

- The next call reached both readiness callbacks, but speech recognition was
  classified as UNKNOWN because readiness matching required an exact string.
  The classifier now normalizes punctuation and accepts clear phrases such as
  “Yes.” or “yes, I am ready”, while negative phrases remain NOT_READY.
- Live Uvicorn was restarted with the readiness and transcript fixes. Local and
  public health checks return 200; the full bot suite passes 132 tests.

OWNER-AUTHORIZED LIVE QUESTION FLOW — 2026-09-14:

- Final verification call CA5d79bf3f2c05083a28cd992784434f23 reached READY,
  advanced through the question webhooks, and recorded five answer attempts.
- Twilio completed the 92-second call with no provider error. The session ended
  EARLY_TERMINATED after three incorrect/unclear answers and was delivered to
  Mente successfully (delivery SENT, HTTP 200).

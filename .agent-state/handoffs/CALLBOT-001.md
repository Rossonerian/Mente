# Worker Handoff

TASK: CALLBOT-001
ROLE: Root implementation/Supervisor; independent read-only REVIEWER
STATUS: Local integration accepted by BOSS

SUMMARY:

Connected the sibling Service A repository to Mente's existing integration API.
Mente remains domain authority; Service A stores only local conversation and
transport records. The bot is installed and running on loopback port 8001 and
successfully authenticated to the user's already running Mente API on port 8000.

FILES CHANGED:

- Bot `app/mente.py`, `mente_store.py`, `scheduling.py` (new).
- Bot `app/main.py`, `config.py`, `mock_call.py`, `telephony/twilio.py`.
- Bot `tests/test_mente_integration.py` (new), `pyproject.toml`, `.env.example`,
  `.gitignore`, `README.md`, `start-local.ps1`, `check-local.ps1`.
- Mente `scripts/verify-call-bot.py`, `docs/CALL_BOT_SETUP.md`, `.agent-state/**`.
- Untracked bot `.env` and `.venv` configured locally. Existing Mente credentials
  and frontend changes preserved. No Mente backend production code changes.

KEY CHANGES:

- Reads patient, consented text memories, preferences and schedules from Mente
  through authenticated server-only API, never direct domain database access.
- Integrated outbound trigger accepts patient ID, rejects supplied phone and
  resolves phone fresh. Opaque binding exists before dialing; signed callback
  validates destination and ties CallSid to the patient.
- Actual timezone/day/month/objective answers replace static fixture answers in
  integrated plans; active consented text memories are preferred. Answer matching
  now normalizes both supplied and accepted values for case/whitespace.
- Terminal session/metric mapping uses Mente's contract. Backend calculates
  scores/alerts. Frozen outbox payload survives restart/lost responses and gap
  between local finalization and enqueue; successful/idempotent response marks
  SENT, 4xx invalid/conflict states require investigation. Delivery never redials.
- Session event leases serialize callbacks and recover abandoned processing;
  mock input fingerprints reject changed-content session ID replays.
- Signed terminal callbacks cover no-answer/provider failure/interrupted calls;
  speech Gather invokes empty-result handling.
- Optional scheduler checks fresh Mente context, weekdays/timezone/quiet hours,
  five-minute initial window and durable once-per-patient/local-day attempts.
  It is explicitly disabled, along with real calls, in the installed environment.
- SHA plan seed restricted to SQLite's signed 63-bit positive range after the
  real two-service smoke exposed an overflow with some session IDs.

TESTS RUN:

- Bot `.venv/Scripts/python.exe -m pytest -q`: 107 passed, two dependency
  deprecation warnings. Includes signed patient-bound full conversation using a
  fake provider, mismatch rejection, outbox recovery and schedule controls.
- Mente backend `.venv/Scripts/python.exe -m pytest -q`: 28 passed, dependency
  deprecation warning.
- Mente `backend/.venv/Scripts/python.exe scripts/verify-call-bot.py`: PASS.
  Actual services on disposable loopback ports, synthetic identity/database,
  patient and active-consented memory reads, mock metrics, delivery, overview,
  idempotent replay/conflict, and pause suppression. Zero real calls/domain writes.
- Root smoke-script Ruff and targeted bot E4/E7/E9/F checks pass after cleanup.
- Bot `check-local.ps1`: integration connected; zero active schedules; real calls
  and scheduler false; no pending/sent/rejected live sessions.
- Both repositories `git diff --check`, agent-state validation pass.

TEST RESULTS:

Independent reviewer APPROVE. Root inspected patient bindings, frozen payloads,
local configuration and actual HTTP roundtrip evidence before acceptance. No
authenticated browser/native save or real Twilio provider call is claimed.

KNOWN ISSUES:

- No Twilio account credentials or public HTTPS bot URL are configured. Real
  calling is not enabled. Mente currently returns zero active schedules.
- English text memories only; VOICE/PHOTO playback excluded. Automatic provider
  redial for `allow_one_retry` is not implemented. Once-per-day reservation is
  intentionally kept on ambiguous provider failures; inspect before manual dial.
- SQLite/leased in-process operations are a local prototype, not distributed
  production scheduling. Transport snapshots include private answers locally;
  `.sqlite3` files and `.env` are ignored by Git.
- Existing six frontend FamilyMember type errors remain outside this scope.

BLOCKERS:

Actual telephony awaits owner's Twilio configuration, HTTPS reachability and
active patient schedule. The no-dial local integration itself is complete.

NEW RISKS:

Enabling real calls/scheduler would perform external provider operations. The
installed flags are false. Mock HTTP endpoint writes CALL records to the
configured backend; only the isolated synthetic smoke was used here.

FOLLOW-UP TASKS:

Owner configures Twilio and active schedules per setup guide; verify one controlled
real call before enabling automatic dialing. No deployment/commit/push performed.

RECOMMENDED NEXT STEP:

Use `docs/CALL_BOT_SETUP.md`. Running bot launcher PID 34156, server PID 29116;
ignored bot `output/local-server.json` and log files capture local startup.

OWNER-AUTHORIZED TELEPHONY FOLLOW-UP:

- User asked the root to handle remaining setup and offered missing information.
- Rechecked: app/backend/bot listen on 8081/8000/8001. Twilio values still missing;
  ngrok not previously installed and no tunnel on 4040.
- Downloaded the current standalone Windows AMD64 ngrok archive from the link
  on the official ngrok download page into ignored bot `output/tools/ngrok`.
  Authenticode signature valid, signer ngrok, Inc. No tunnel started.
- Added empty Twilio/NGROK_AUTHTOKEN credential fields to untracked bot `.env`
  without overwriting existing values. Opened that file in Codex for owner input.
- Asked for first test destination, intended daily time/timezone and account
  availability. Awaiting those details and local credential entry. Existing
  no-dial local milestone acceptance remains unchanged; no live call claimed.

OWNER TELEPHONY CONFIGURATION — 2026-09-13:

- Owner identified patient BOT, supplied destination ending 8799, daily 18:05
  Asia/Kolkata and Trial account; reported credentials added locally.
- Read-only backend lookup found one Bot patient in Trial family, belonging to
  existing local test caregiver. Used that caregiver's Supabase login and normal
  authenticated Mente API to PATCH phone/timezone and PUT daily active schedule.
  Re-read confirmed persisted values; reminders already unpaused. No duplicate
  family/patient created, no other preferences altered.
- Twilio account API authenticated, type Trial, status active. Configured sender
  equals supplied destination. API lists zero owned Voice numbers and zero
  outgoing verified IDs; new Trial dashboard sender/recipient setup awaits owner.
  Those legacy lists alone do not prove new Trial dashboard provisioning state.
- Started signed ngrok binary with token only in process environment, no request
  inspection, HTTPS tunnel to loopback bot 8001. Saved actual tunnel URL in local
  .env and restarted only verified bot-owned process (launcher 33440).
- Protected bot status connected, active schedules 1, real calls false, scheduler
  false, delivery counts all zero. Public health 200; unauthenticated operator
  status 401 and incomplete webhook 400. No provider call attempted.
- Opened Twilio console tab for owner to verify recipient and copy correct Voice
  Trial sender from Try out Voice. Actual dialing remains pending that setup.

TEST-CALL FOLLOW-UP — 2026-09-13:

- Owner reported test call done. Read-only Twilio call lookup for Bot destination
  returned one outbound-api call, busy, duration 0, start 12:21:42 UTC.
- Bot has zero bindings, links and outbox records, zero voice-answer log entries.
  End-to-end bot conversation/result delivery is therefore not verified.
- Current .env sender still equals patient destination. Both real-call and
  scheduler flags false; protected status connected with one active schedule.
  Ngrok tunnel continues to match configured public URL.
- No further call placed and no scheduler enabled. Owner needs correct Trial
  Voice sender and then a bot-originated controlled test before auto scheduling.

TRIAL AUTHENTICATION FOLLOW-UP — 2026-09-13:

- User reported sender updated and readiness for bot test; authenticated Twilio
  account and browser Trial panel confirmed exact sender and verified recipient.
- Enabled manual real calls only; automatic scheduler remains false.
- Original API request rejected before any new CallSid. A bounded compatibility
  retry with only StatusCallback accepted a call; explicitly redundant callback
  method/event options removed from adapter (Twilio defaults POST/completed).
- Two accepted calls connected five seconds but custom Voice start lacked any
  X-Twilio-Signature and returned 403; signed terminal callbacks worked. Correct
  interrupted-call records delivered to Mente, not completed conversations.
- Added default-off integrated Trial Voice-only authentication. When signature
  header is truly absent, it requires a generated 32-byte per-call binding
  capability, an already linked exact canonical CallSid, aware age 0..900sec,
  fresh SDK verification of actual sid/account/to/from/outbound-api/in-progress
  identity and request status. Empty-present/invalid signatures, unsigned status
  and expired/unknown/unlinked capabilities fail closed. Existing start checks
  authoritative Mente patient phone/schedule; actions propagate capability.
- Independent CRITICAL read-only reviewer APPROVE. Root BOSS accepts bounded
  source/test compatibility change; this does not claim live voice completion.
  126 bot tests, targeted Ruff E4/E7/E9/F and disposable HTTP smoke PASS.
- Configured reviewed Trial flag true locally; disabled bot access logs to avoid
  credential-bearing URL queries. Bot launcher 28132; local ngrok still active.
- Last call via actual bot trigger was accepted, then Twilio reported busy/0sec.
  No conversation started; signed failed-call callback delivered SENT/200 to
  Mente. No further redial; owner availability needed for next controlled test.
- Current manual real flag true, scheduler false. No commit/push/deploy.

OWNER QUESTION SETUP — 2026-09-13:

- Owner requested questions and supplied four personal facts for BOT: caregiver
  name/relationship, city and activity. Authenticated caregiver API created four
  active consented PERSON/RELATIONSHIP/STORY memories, confirmed by re-read.
  Personal facts remain authoritative in Mente, not hardcoded in bot source.
  Existing matching prompts would be updated rather than duplicated.
- Planner now adds current Mente preferred/legal name as fixed second question
  after timezone-aware day. Name deduplication, missing-name omission and max8
  cap preserve actual patient context and consented memory inclusion.
- Greeting explains short one-at-a-time questions and supported skip/stop.
  Added read-only preview-questions.ps1; actual protected context preview shows
  eight questions containing all four owner memories plus day/name/month/week.
- 129 bot tests pass, including profile-change/name-source/bounded personal plan
  regressions; targeted Ruff and disposable HTTP integration smoke PASS.
- Restarted verified bot process with no access logs. Manual flag stays true,
  scheduler false; no actual call or synthetic live-patient session triggered
  during this question setup. Live answered voice progression remains pending.

OWNER PHONE UPDATE — 2026-09-13:

- Authenticated caregiver API updated BOT's phone to +917827330279 and re-read
  confirmed it. Existing active daily schedule remains 18:05 Asia/Kolkata.
- Bot status remains connected with one active schedule, real calls enabled and
  scheduler disabled. Twilio Trial must verify the new destination before dialing.

OWNER PHONE RESTORE — 2026-09-14:

- Authenticated caregiver API changed BOT's phone back to +916201048799. Re-read
  confirmed the active daily schedule remains 18:05 Asia/Kolkata.
- Bot status remains connected with one active schedule; no call was placed for
  this configuration change.

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

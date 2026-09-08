# REMED-001 — WP1 production public configuration

TASK: REMED-001
ROLE: FRONTEND (root, sequential writer)
STATUS: DONE — BOSS ACCEPT for WP1 only

## Summary

Fixed R01 on top of `a0cf0d3` without changing dependencies, identifiers, backend,
navigation or URL security policy. All four public settings now use Expo's direct
static references. A module-scoped type-only declaration provides precisely their
optional string shape without introducing a Node runtime or global Node typings.

## Files changed

- `src/api/config.ts`
- `src/api/config.production.test.js`
- `.agent-state/tasks/REMED-001.json`
- `.agent-state/tasks/SUP-001.json`
- `.agent-state/dashboard.md`
- `.agent-state/handoffs/REMED-001.md`
- `docs/reviews/deployment-readiness.md`
- `docs/plans/deployment-remediation.md`

## Tests run and results

- Focused red: `npm test -- --no-cache src/api/config.production.test.js`:
  exit1,9 failed/9 passed across web/Android/iOS. Valid, normalization and invalid-URL
  cases failed because build values were missing. An earlier harness iteration
  rejected Babel native helper imports; helper loading was fixed before the final red run.
- Focused green: same command, exit0,18/18 passed.
- Final `npm run typecheck`: exit0. Initial attempt exposed missing Node globals;
  solved with the type-only local declaration, not a dependency or suppression.
- Final `npm run lint`: exit0. Initial JS test globals were fixed through explicit
  imports/source path resolution, not disabled lint rules.
- Final `npm test -- --no-cache`: exit0,18 suites/65 tests,0 snapshots,12.317s.
- `npm exec --no -- expo-doctor`: cached existing tool,exit0,21/21.
- Web export command below: exit0,1183 modules. Only NO_COLOR/FORCE_COLOR environment
  warnings; generated dist output is ignored and not staged.
- `./.agent-scripts/validate`: exit0,8 tasks. Initial state-format errors were fixed
  by matching ID format and recording completed root implementation as ready for review.
- `git diff --check`: exit0.

```sh
EXPO_NO_DOTENV=1 \
EXPO_PUBLIC_API_BASE_URL=https://api.example.test/v1/ \
EXPO_PUBLIC_SUPABASE_URL=https://identity.example.test/ \
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=synthetic-publishable-key \
EXPO_PUBLIC_MENTE_MOCK_MODE=true npm run web:export
```

Production tests transform actual `config.ts` and `errors.ts` using the installed
full Expo preset with client Metro production options, then execute without a
runtime `process`. They cover values, absent/blank configuration, normalization,
existing HTTP localhost allowance, HTTPS rejection and mock exclusion. Test-only
environment overrides are restored in finally; there is no network dependency.

## Browser evidence

Served the synthetic export using `python3 -m http.server 4173 --bind 127.0.0.1
--directory dist`. Existing cached Playwright CLI + Firefox; external requests
blocked before navigation. The configured caregiver email/password form rendered
at320/768/1024/1440; no horizontal overflow, no mock Home despite mock=true in the
build environment,0 browser errors/warnings. No real sign-in was attempted.

Initial browser route harness used an unavailable URL global and was corrected
to an explicit localhost prefix allowlist. Aborted navigation generated a local
HTTP BrokenPipe diagnostic; the corrected app load passed. Browser and server
started for this test were stopped. Artifacts remained in /tmp or ignored dist.

## Known issues / blockers / risks

- R02–R10 remain as reviewed; WP2–WP8 are not implemented by this handoff.
- Full-sequence authority clarification was requested; no response received yet.
- Transform tests do not establish native runtime or actual Supabase/API security.
- No physical Android/iOS, live authentication or backend tests were run for WP1.
- Production preview-control issue R04 remains; this patch does not hide it.
- Dependencies unchanged. No secrets, credentials, environment files, remote
  services, database, backend, commits, pushes or deployments changed.

## Independent review and acceptance

SUP-001 (Arendt) returned APPROVED after inspecting final source and production
tests: no blocking findings. Reviewer did not duplicate test commands. Its approval
was conditional on the latest suite, subsequently confirmed65/65 by root.
BOSS ACCEPT applies to WP1 only. R01 is resolved at the tested uncommitted state.

RECOMMENDED NEXT STEP: proceed to WP2 under confirmed full-sequence authority.
Overall release remains blocked.

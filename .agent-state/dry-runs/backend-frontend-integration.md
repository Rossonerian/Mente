# Dry Run — Backend/Frontend Integration

Request: “Backend already exists and frontend services already exist. Verify both, integrate them correctly, test the
complete flow, fix defects, and deliver a working system.”

## BOSS → SUPERVISOR task graph

```text
DRY-BE-001 Backend QA ──────┐
DRY-FE-001 Frontend QA ─────┼──→ DRY-INT-001 Integration → DRY-QA-001 → DRY-REV-001
DRY-ARC-001 Contract check ─┘                                      │
DRY-FE-001 → DRY-BUG-001 (only after authorization)                ▼
                                                               SUPERVISOR
                                                                   ▼
                                                                 BOSS
```

The first three tasks are read-only and have independent scopes, so they may run in parallel without worktrees.
Integration cannot start until all three are approved. QA owns verification, not production edits; a reproducible
defect creates a BUG-FIXER task followed by review and retest.

## Evidence-based outcome

- Backend code, APIs, database models/migration, and tests exist.
- Backend QA could not execute: `python3 -m pytest` reported that pytest is unavailable, and ruff, mypy, bandit, and
  pip-audit are not installed. The dry run did not install dependencies.
- No frontend API client/service calls exist under `src/`; the request's “frontend services already exist” premise is
  false in the current repository.
- `package.json`, `package-lock.json`, and `src/components/BottomTabBar.tsx` contain committed conflict markers.
- Contract analysis also found unresolved auth authority, response adapters, patient token lifecycle, game-boundary,
  CORS, and overview-freshness decisions.
- Therefore backend verification is blocked, frontend verification fails before integration, DRY-BUG-001 is blocked
  pending an authorized application repair task, and DRY-INT-001 remains blocked by dependency rules.

## Cost behavior

- File/test inventories route to TINY (`gpt-5.6-luna`, low).
- Contract comparison routes to STANDARD (`gpt-5.6-terra`, medium).
- BUG-FIXER and integration are not started while blocked, avoiding wasted COMPLEX calls.
- REVIEWER and BOSS are not invoked until milestone evidence exists.

Expected BOSS decision for this dry run: `BLOCKED`, not a fabricated delivery claim.

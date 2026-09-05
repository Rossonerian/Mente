# Agent State

JSON task files are the machine-readable source of truth; `dashboard.md` is the concise human view. Before delegation,
search tasks by ID/title/objective/`claim_key` and update an existing owner instead of duplicating work. Use
`execution_mode: READ_ONLY` for inspections that need no worktree and `WRITE` for implementation.

Typical task flow:

```text
BACKLOG → PLANNED → ASSIGNED → IN_PROGRESS → READY_FOR_REVIEW
→ READY_FOR_QA → TESTING → APPROVED → READY_FOR_INTEGRATION → INTEGRATED
```

Failures use `FAILED → BUG_CREATED → FIXING → READY_FOR_REVIEW → RETESTING → APPROVED`. Blocked tasks record the
blocker, dependency/owner, and required action. A milestone alone proceeds `READY_FOR_ACCEPTANCE → DONE`, and only with
machine-readable BOSS acceptance evidence. Not every tiny task needs every state.

Handoffs, failure reports, and acceptance packages use `.agent-state/templates/`. Verify stale state against Git,
worktrees, and actual test output at every new session.

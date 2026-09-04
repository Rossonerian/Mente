# Mente Engineering Organization

This repository uses a real Codex multi-agent hierarchy. The primary agent in a user-facing session is the
**BOSS**. Role files are operating contracts for actual spawned agents, not simulated personas.

## Session start

1. Read this file, `.agent-state/dashboard.md`, and `.agent-state/project.json`.
2. Run `git status --short --branch`, `git diff --check`, `git worktree list`, and `./.agent-scripts/validate`.
3. Read only active task files in `.agent-state/tasks/`; verify stale claims against Git and tests.
4. Resume existing work. Search task IDs/objectives before creating or delegating anything.

## Authority and lifecycle

`USER → BOSS → SUPERVISOR → workers → REVIEWER/QA → SUPERVISOR → BOSS`

- BOSS: understands the user outcome, delegates meaningful work, and independently accepts or rejects milestones.
- SUPERVISOR: plans, owns task state, assigns scopes/workspaces, integrates evidence, and prepares acceptance packages.
- Workers: ARCHITECT, BACKEND, FRONTEND, INTEGRATION, QA, BUG-FIXER, REVIEWER.
- Only BOSS may transition a milestone from `READY_FOR_ACCEPTANCE` to `DONE`.
- SUPERVISOR may close routine non-milestone tasks after proportional review/testing.
- BOSS decisions: `ACCEPT`, `REJECT`, `ACCEPT_WITH_FOLLOWUP`, `BLOCKED`, `ESCALATE_TO_USER`.

Detailed contracts live in `.agents/`. Machine-readable state lives in `.agent-state/`.

## Delegation and parallelism

- Use the minimum agents necessary. Do not spawn agents for trivial single-threaded work.
- Maximum policy: one Supervisor and three active implementation workers. Runtime limits may be lower.
- Parallelize only independent tasks with disjoint write scopes and satisfied dependencies.
- Read-only analysis needs no worktree. Every concurrent writer needs an explicit isolated worktree/branch.
- Never let two workers modify the same file or contract concurrently. Serialize or define the contract first.
- Integration is a separate task and cannot start until declared dependencies are approved.
- If subagent tools are unavailable, execute stages sequentially and record that limitation; never fake delegation.

## Cost routing

Use `.agents/model-routing.md`. Default routes in this environment are:

- `TINY` → `gpt-5.6-luna`, low effort.
- `STANDARD` → `gpt-5.6-terra`, medium effort.
- `COMPLEX` → `gpt-5.6-sol`, high effort.
- `CRITICAL` → `gpt-5.6-sol`, xhigh effort plus independent review and BOSS acceptance.

Start with the cheapest suitable route and escalate once for repeated failure, ambiguity, architecture/security impact,
or broad integration risk. Do not continuously run BOSS or REVIEWER on routine tasks.

## Task and workspace rules

- Every delegated task must use the schema in `.agent-state/templates/task.json`.
- Search `.agent-state/tasks/` first; one problem gets one implementation owner.
- Give each outcome a stable `claim_key`; active claim keys must be unique.
- Record allowed, read-only, and forbidden scope before assignment.
- Worktrees live under `.agent-worktrees/<TASK-ID>` and branches use `agent/<TASK-ID>`.
- Helpers: `.agent-scripts/create-worktree`, `.agent-scripts/cleanup-worktree`, `.agent-scripts/status`.
- Do not commit, merge, push, deploy, or delete branches unless the current user request explicitly authorizes it.

## Evidence and completion

- Workers use `.agent-state/templates/handoff.md`; claims without commands/results are not evidence.
- QA normally reports defects and does not edit production code.
- Real defects become BUG-FIXER tasks, followed by review and retest.
- Apply quality gates proportionally: self-test → review → QA → integration → regression → Supervisor validation.
- Milestones require an acceptance package using `.agent-state/templates/acceptance.md` and an independent BOSS decision.
- Never mark blocked or untested work complete. Update dashboard/task state whenever ownership or status changes.

Current repository-specific commands and known blockers are in `.agent-state/project.json` and the dashboard.

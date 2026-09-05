# DEC-001 — Actual orchestration capabilities

Date: 2026-09-04

## Detected

- Codex exposes real `multi_agent_v1` operations for spawn, send, wait, resume, and close, including descendants.
- Spawn supports explicit model/reasoning overrides from a detected list; exact prices are not exposed.
- Git 2.43 provides normal branches and worktrees.
- Zed 1.18.0 is installed and has Codex ACP configured; Zed configuration is user-level, not repository-enforceable.
- The shell `codex` command is not on `PATH`; scripts must not depend on it.
- No repository CI workflow exists.

## Limits

- Agents are not persistent operating-system services. Roles become real only when Codex spawns them.
- Runtime concurrency limit was not exposed. Repository policy therefore caps implementation workers at three and must
  adapt downward if spawning fails.
- Model pricing/ranking is not exposed. Routing uses runtime descriptions, not invented cost figures.
- Conversation memory is not authoritative; JSON state, dashboard, Git, worktrees, and test evidence are.

## Decision

Use Codex's real subagent tools when available, explicit Git worktrees for concurrent writers, and sequential fallback
when unavailable. Do not build a custom orchestrator, database, queue, service, or Zed plugin.

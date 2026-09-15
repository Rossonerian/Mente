# AUTHREUSE-001 — CRITICAL, IN_PROGRESS

Original finding alias: AUTHSEC-REUSE-001. Canonical task ID follows validator ROLE-000 convention.

- Implementation owner: existing AUTHSEC-001, canonical security worktree. No duplicate writer.
- Independent QA evidence: c280bc958f6d.evidence, supplied by BOSS. Stale grandparent refresh returned 400 refresh_token_already_used; provider session remained with zero active refresh rows. Immediate descendant refresh returned 200 and recreated one active row.
- Impact: an unrevoked-lineage existence guard alone may authorize a previously admitted session after provider replay detection. This is not acceptable as a documentation-only release blocker when a safe local mitigation is possible.
- Required correction: durable application session tombstone at provider revocation transaction commit, without revoking normal rotation's temporary zero-lineage state; exact provider-role privileges and FORCE-RLS policy must be tested.
- Required evidence: real normal rotation, parent/current reuse exceptions, stale replay, descendant resurrection, application denial, and fail-closed outage checks on disposable provider. Migration/schema privilege and managed-auth maintenance constraints require owner sign-off before production.
- Integration status: NOT APPROVED. Preliminary independent review file AUTHDESIGN-001-boss-review.md is exclusively owned by BOSS.
- Correction implemented in canonical AUTHSEC-001: deferred terminal-lineage trigger persists FORCE-RLS tombstone and deletes actual provider session under narrowly restricted definer function. Provider API/runtime receives no provider mutation or function-execution grant.
- Actual mitigation result on owned c0305b317fb4: normal rotation, immediate grace, parent-of-current exception and second-device admission pass; stale replay denies application access, descendant refresh cannot resurrect, provider GET user and PUT password reject. Current/global logout and captured-mail recovery also pass. This is Supervisor executable evidence, not independent QA acceptance; BOSS has requested strict repeat.
- Production owner checks pending: explicit managed-auth TRIGGER, SELECT/UPDATE/DELETE authority for migration/definer principal, provider schema/FK compatibility and rerun after every provider upgrade. Startup introspection requires the enabled deferred trigger and nonowner runtime.

## Continuation — 2026-09-15, not accepted

- Actual implementation owner is BACKEND Hilbert in existing AUTHSEC-001; QA Epicurus independently verifies owned fixtures. Earlier Supervisor writer/fixture handles are historical.
- QA reports fresh canonical fixture c47eb6cd89a2 and strict run 88710fa4f0cb exit0: unchanged c6 mitigation, normal rotation/grace/parent exception pass; stale replay terminal counts0/0, immediate/delayed descendant refresh reject, prior provider user403. Preserve unmitigated failing evidence and obtain full canonical role/FK/migration handoff.
- Actual app direct-provider signup produces admitted false and protected profile403, but actual application password admission FAIL has been returned to existing AUTHSEC-001. This is an additional gate gap, not proof the terminal-replay correction is rejected; full app admission and protected replay negatives remain unfinished.
- No integration approval or bug closure. Min12/no mandatory mailbox verification, recovery proof and enrolled MFA safeguards remain current policy. Fresh actual HTTP password-hook persistence/wrong-password checks and independent review remain required.

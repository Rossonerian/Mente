# AUTHDESIGN-001 — independent BOSS preliminary review

Review date: 2026-09-15. Decision: NOT ACCEPTED; implementation remains in isolated worktrees. This is a findings record, not an acceptance package or release authorization.

## Current continuation findings

- [x] The latest user decisions supersede the original plan: remove mandatory email verification and retain the 12-character password minimum. Recovery email remains a password-recovery mechanism, not a signup verification gate.
- [x] Current root inspection confirms signup still describes and validates an 8-character minimum. The isolated frontend describes 12 to 128 characters. This contradicts completion until reviewed integration and combined tests establish the approved minimum in the actual app.
- [x] Root state validation and whitespace checks pass. Historical task results and dashboard worker names are not proof of current runtime activity.
- [x] Actual continuation participants are Supervisor Russell, frontend Archimedes, backend Hilbert and QA Epicurus, with disjoint state/frontend/backend/harness write scopes. Earlier agents are closed.
- [ ] Obtain fresh actual provider evidence. The Docker Linux engine is currently unavailable; the prior disposable fixture is not a live test handle. QA is restoring only the existing local container runtime and creating explicitly owned disposable resources.
- [ ] Correct release-candidate configuration. The inspected workflow currently builds with synthetic public origins and can publish the same candidate. A publication candidate must use approved public runtime configuration, reject synthetic placeholders, and remain the exact artifact independently reviewed before publication.
- [ ] Verify content-security policy against legitimate private media and asset origins. The inspected export policy currently permits only same-origin images and media; preserving security must not silently break the existing memory/gallery/audio flows.
- [ ] Produce executable dependency-maintenance evidence rather than merely requiring a report name in the release manifest.
- [ ] Reconcile the actual signup contract. The inspected frontend context still expects access and refresh tokens from signup, while the server deliberately returns a generic message with no tokens. Tests must exercise this actual response shape and the subsequent sign-in journey rather than an obsolete token-returning mock.
- [ ] Complete server-authoritative recovery-link handling. The inspected callback path currently offers only a notice, even though the gateway supports exchange of an unconsumed recovery token hash. Never interpret callback access tokens or a client recovery flag as password-change authority.
- [ ] Verify provider-hook rate-limit persistence through real failed-password HTTP requests. A SQL function test does not establish whether the provider commits its counter when the surrounding authentication transaction fails.
- [x] Independent asset inspection counts 16 subset font files totaling 576,240 bytes versus 16 originals totaling 2,681,516 bytes. This is packaged asset size, not proof of first-paint network transfer or actual loaded typeface selection.
- [ ] Verify Tamagui web weight selection against real registered font faces; native face mappings alone do not prove the browser avoids synthetic weights.
- [ ] Refresh all acceptance checkboxes against final sources and fresh results. The historical observations below are not acceptance of the current combined app. Browser, native-device, hosted-provider and organizational sign-offs remain unproven.

## Authoritative scope and preservation

### Fresh disposable evidence inspected on 15 September

- [x] Reviewed the independent QA runner and redacted evidence for run 8e5437a7b85a: 32 actual wrong-password provider HTTP requests persisted counters 1 through 32; the hook rejected attempts 31 and 32, and a correct password still authenticated. This closes the provider transaction-persistence question for the tested version and configuration, not public-endpoint timing/enumeration.
- [x] Reviewed run a0de2abc411e against canonical migration head c6e123410995 on PostgreSQL 17.6 and GoTrue v2.197.0. Direct provider signup could not provision a protected app profile before screened admission. After admission, a synthetic NULL confirmation timestamp did not block application access. AAL1 failed protected access after real factor verification; AAL2 succeeded; local server/provider logout then denied the old bearer. These are real-provider/application checks using the in-process HTTP test client, not the combined browser journey.
- [x] Reviewed strict attached-provider run 88710fa4f0cb: normal rotation and reuse checks completed, immediate descendant replay was denied, and provider user access after terminal reuse returned 403. The existing strict failing baseline remains preserved.
- [ ] The inspected canonical fixture's function owner is still the superuser postgres. Restricted application runtime evidence is not evidence of a restricted migration/function owner. A dedicated non-superuser migration owner with explicit necessary provider authority must execute the canonical migrations and pass the same lifecycle/retention tests before this gate can close.
- [ ] Final source identities and combined regression still require reconciliation after workers finish. These scoped passes do not approve integration or production.

- [x] Existing milestone and three actual participants resumed rather than duplicated.
- [x] Root agent-state validation passes for 17 tasks; canonical AUTHSEC-001, AUTHTYPE-001 and AUTHQA-001 worktrees exist.
- [x] Root user auth/profile/callbot changes remain present. Root also contains provisional Supervisor security/model edits from before isolation; eventual integration must compare final approved contents against current root, not apply a HEAD-only patch blindly.
- [ ] No integration is approved yet. Approved dependencies, serialized integration, full regression, independent QA and final BOSS acceptance remain required.

## Independent source review

Reviewed backend session verification and authorization dependencies, provider transport/session-row guard, gateway credential/admission/password/logout routes, shared rate limits and audit controls, RLS introspection, both security migrations, release artifact/evidence checks, and web CSP/SRI serving. Reviewed frontend auth context/callback/storage boundaries, router gates, typography tokens/loading/wrappers/shared components, signup/login/verification/recovery/MFA screens, and actual FamilyMember consumers.

- [x] Protected caregiver identity is mapped from verified claims rather than a client identity field; input models reject undeclared identity fields. Session-row existence and active refresh lineage are separately checked.
- [x] The source has durable application current-session and subject-wide revocation before provider logout. Provider failure is not reported as full all-device logout success.
- [x] The source defines explicit client-deny RLS and restricted non-owner server access; this is FastAPI-only authorization, not per-user direct Supabase row access. A compromised server runtime can access domain rows within its explicit grants; application object authorization remains essential.
- [x] Typography maps supported actual faces and prevents synthetic loaded weights/slants. Missing fonts do not block auth. Optional aggregate/profile fields reflect absent API enrichment, and consumers show unknown values instead of fabricated zero counts.
- [x] Revised reauthentication admission compares the original, proof-session and current credential revisions before admission. Parent independently executed focused gateway/release tests: 23 passed in 23.97 seconds, including the negative revision race. Actual provider integration still remains required.
- [x] Revised successful sign-ins use verified email for account-linked anomaly history. The independently executed focused tests include success after failed-credential velocity. Other subject-scoped audit events remain separate; no cross-event linkage is implied.
- [ ] Late callback/SDK sign-in success or failure must not overwrite a newer login or completed logout. Returned to AUTHTYPE-001 for operation-generation guards and tests.
- [ ] Local token removal must also be verified against the provider SDK's session state and foreground refresh behavior, without a misleading second provider logout.
- [ ] Legacy duplicate type scales, section/subsection distinctions, static reduced-motion loading, and keyboard/screen-reader transition behavior need final consistency checks.
- [ ] Overlock declares Reserved Font Names. Prebuilt modified subsets need compliant embedded derivative naming or explicit rights-holder permission, while retaining original source, copyright and OFL notices. The chosen typeface is unchanged. Basis: [official SIL OFL FAQ, sections 2.5–2.6](https://openfontlicense.org/ofl-faq/).
- [ ] Password changes need server-authoritative recent password proof or a verified recovery authentication event. A client recovery flag is not authority, and an ordinary stale active bearer must not silently satisfy reauthentication. Returned to AUTHSEC-001 for provider-AMR/recent-proof review without weakening MFA.
- [x] User explicitly chose to keep the 12-character minimum on 2026-09-14 when offered 15. Retain it consistently across UI/server/provider, with breach screening, rate limits and optional MFA unchanged. This is an accepted policy trade-off, not compliance with the current [OWASP recommendation](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) of at least 15 without MFA.

## Critical real-provider finding

Independent inspection of ignored QA evidence for run c280bc958f6d shows actual GoTrue v2.197.0 behavior, not a mocked unit test:

1. Stale grandparent refresh reuse returned 400 with refresh_token_already_used; the session remained and active refresh rows dropped to zero.
2. Immediate replay of the descendant returned 200 and restored one active refresh row in the same session.
3. An application guard that only asks whether any unrevoked refresh row currently exists is therefore insufficient after this resurrection.

- [ ] Preserve the strict failing regression; do not change its expected result to make provider QA green.
- [ ] AUTHSEC-001 must provide durable application denial after reuse or a verified upstream correction, including normal-rotation/concurrent-retry compatibility and actual provider-role testing.
- [ ] Managed-auth-schema coupling or additional provider authority must be explicitly reviewed. No live Supabase mutation, live service restart or provider deployment is authorized here.

## Independent dependency evidence

- [x] Installed Motion and its framer-motion implementation both resolve to exactly 13.2.0. Registry metadata reports MIT license, matching SHA-512 integrity and the official motiondivision repository; registry modification date is 2026-09-02.
- [x] Current production dependency audit reports 10 moderate, zero high and zero critical findings. The reported chain is the pre-existing uuid/xcode/Expo build toolchain; Motion is not reported vulnerable.
- [ ] Do not follow the audit's incompatible Expo 57-to-46 downgrade suggestion. A safe verified correction or an explicit risk decision is required under the team's release policy.
- [ ] Synchronously imported Motion features are bundled even inside LazyMotion; do not claim the smaller deferred initial size without measuring an actual split export.

## Remaining acceptance gates

- [ ] Complete worker source handoffs, final typecheck/lint/unit/security checks and production export.
- [ ] Fresh actual PostgreSQL migration, all-table introspection, default-deny negatives, least-privilege runtime and provider-hook/retention checks.
- [ ] Real provider plus application verification, admission, recovery, backup MFA, current/global revocation, normal rotation and reuse-replay negatives.
- [ ] Real browser exported-auth journey under enforced web CSP/SRI, responsive/zoom/keyboard checks, reduced motion and font-failure behavior.
- [ ] Native secure-storage fixture tests are not physical Android/iOS validation; do not conflate them.
- [ ] Artifact scans and signed evidence checks must reject missing, stale, wrong-artifact, altered or forged evidence. Automated CI must execute relevant checks; a document alone does not gate releases.
- [ ] Production upstream enumeration/timing distributions, hosted provider configuration, retention/incident ownership, native-device access and other external approvals remain explicit until verified.

State follow-up: a later parent validator run found invalid review-status/blocker values in the Supervisor's in-progress AUTHDESIGN/AUTHSEC records. Returned to the state owner for schema-compliant correction; this does not invalidate the recorded test result and must be resolved before handoff.

No milestone completion, commit, merge, push or deployment is approved by this preliminary review.

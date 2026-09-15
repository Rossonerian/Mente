# Authentication UI and security review plan

AUTHDESIGN-001, revised 15 September 2026. This is the original requested review deliverable, preserved alongside the later implementation work. It proposes no code or configuration and does not approve integration, release or deployment. The authoritative root remains dirty and unintegrated; its registration screen still specifies eight characters. Reviewed isolated frontend source specifies twelve to 128 characters. Completion requires those decisions to reach the actual combined app through the remaining gates.

The latest user decisions override the earlier plan: registration and application access do not require a mailbox verification challenge, and the password minimum remains twelve characters. Recovery email still supplies a server-verified recovery proof. Provider auto-confirmation can populate confirmation state without a mailbox challenge; that state must never be described as proof of mailbox ownership.

## Typography rollout

Use Overlock exclusively for display headings, Khula for controls, labels, navigation and compact metadata, and Hind Guntur for paragraphs and explanatory text. Reviewed source includes shared typography roles, font loading, fallbacks and component adoption in the isolated frontend; final consistency and browser/native evidence remain pending. Modified Overlock subsets use the embedded derivative family name MenteDisplay while retaining the chosen Overlock design, original binaries, provenance and licenses. Reserved Font Name compliance must be checked in the generated binaries, not inferred from filenames. [Official SIL Open Font License FAQ](https://openfontlicense.org/ofl-faq/).

The concrete responsive scale below reflects the inspected frontend candidate. Each pair is font size / line height in logical pixels. Mobile is below 768 pixels; desktop starts at 768 pixels. Headings use genuine display faces; all UI and paragraph faces are upright.

| Role and primary use | Mobile | Desktop | Family and normal weight |
| --- | --- | --- | --- |
| Display, welcome or major landing heading | 32 / 40 | 48 / 56 | Overlock, 900 |
| Title, sign-in, registration and page title | 30 / 38 | 40 / 48 | Overlock, 700 |
| Section, major card/page grouping | 24 / 32 | 32 / 40 | Overlock, 700 |
| Subsection, subordinate group heading | 20 / 28 | 24 / 32 | Overlock, 700 |
| UI, inputs, buttons and navigation | 16 / 24 | 16 / 24 | Khula, 400; 600 or 700 for emphasis |
| Small UI, captions and compact metadata | 13 / 18 | 13 / 18 | Khula, 600 |
| Large body, introductory explanation | 17 / 26 | 18 / 28 | Hind Guntur, 400 |
| Body, instructions and paragraphs | 16 / 24 | 16 / 24 | Hind Guntur, 400; 700 for emphasis |
| Small body, secondary explanations | 14 / 20 | 14 / 20 | Hind Guntur, 400 |

Actual supplied faces are Overlock 400, 700 and 900 with genuine italics; Khula 300, 400, 600, 700 and 800; Hind Guntur 300, 400, 500, 600 and 700. Unsupported weights resolve to supplied faces, and upright UI/body text must not request synthetic italics. The patient theme separately retains sizes 34, 28, 20, 18, 16 and 14 for display, title, section, body, small body and caption. These existing readability overrides need explicit consistency review rather than blanket replacement with compact caregiver values.

Self-hosted launch subsets target English in India, with Latin characters, combining marks, punctuation, currency including the rupee and common symbols. They do not claim Telugu or Devanagari coverage; user names missing glyphs need platform fallback. Reviewed provenance reports four initial faces totaling 129,912 bytes versus 678,792 bytes for their original equivalents. Treat these as historical worker measurements until reproduced on the final export. Initial faces are display bold, Khula regular and bold, and Hind Guntur regular; other faces load when requested. Web display fallback is Georgia/serif, UI and paragraph fallback Arial/sans-serif, and native fallback is the system font. Authentication must remain usable immediately when fonts fail or load slowly.

The candidate explicitly uses font-display swap. Self-host versioned font assets with content-identifying cache keys, retain their license/provenance alongside the export, and invalidate cache by asset version when fonts change. Preload only the four initial faces; fetch another weight only when rendered text requests it, never preload every available face. Language subsetting must be reviewed against actual interface text and user-name glyphs, with platform fallback for missing characters. Final cache headers/version identity and cold/warm-load behavior remain verification gates. These choices retain all three selected typefaces.

Risks include heading reflow, clipping at text zoom, italic or weight synthesis, duplicated legacy scales and excessive initial downloads. Static export preparation adds targeted same-origin font preloads and license copies; runtime-created hints alone do not prove preload before JavaScript. Verify final HTML hints, font timing, fallback reflow and actual bundle/font sizes.

- [x] Three family roles and concrete responsive scale inspected in the isolated candidate.
- [x] Genuine face resolver and nonblocking font fallback inspected.
- [ ] Reproduce pinned source hashes, subsets, embedded derivative naming and exported license notices.
- [ ] Verify swap behavior, versioned self-hosted cache identity, language/glyph fallbacks and cold/warm loading.
- [ ] Review section/subsection and patient readability overrides across shared components and onboarding.
- [ ] Verify narrow/wide layouts, enlarged text, font failure, keyboard and screen-reader reading order.
- [ ] Approve measured final initial font and animation bundle costs.

## Component adoption plan

These decisions retain the existing Expo, React Native and Tamagui architecture. Resource names identify planned use or inspiration; reference-only entries do not authorize another runtime dependency. No reference site was independently audited in this continuation, and no copied component may be represented as approved merely because its source looks suitable.

| Resource | Dependency or reference decision | Exact screen or interaction | Adoption risk and reduced-motion fallback |
| --- | --- | --- | --- |
| Motion | Only adopted added web animation runtime; candidate pin 13.2.0 | Web sign-in/registration/recovery heading fade, inspected duration 140 milliseconds | Bundle weight and interrupted focus/announcements; native, reduced motion or unknown preference renders static headings. Never animate input, password, OTP or error content |
| Number Flow | Reference only; reject animated counter adoption in this rollout | Recovery-code resend countdown uses a static number; animated counters have no adopted screen | Repeated announcements and extra runtime cost for one counter; static accessible countdown with availability announced once, unchanged under reduced motion |
| thinking-orbs | Reference only; reject actual orb animation in this rollout | Auth session/profile checking may use static pending copy; no animated-orb screen adopted | Continuous distraction, GPU cost and implying an outcome before verification; static status text/indicator for every preference |
| React Bits | Reference only; reject copied effects as runtime dependencies in this rollout | Welcome/auth visual inspiration only; no React Bits interaction or screen adopted | Extra dependency/animation surface and inaccessible borrowed effects; existing static shared layout, also for reduced motion |
| Componentry | Animated visual/WebGL hero and text reference, not an accessible form/card base UI kit; no dependency | Possible welcome hero/text inspiration; reject WebGL hero or animated text on sign-in, registration, recovery and onboarding forms in this rollout | GPU/loading cost, readability and semantic accessibility are not supplied by visual effects; existing accessible controls and static hero/heading for failure or reduced motion |
| DesignSpells | ROLLING BACK contextual reveal reference; no added dependency | Multi-step caregiver onboarding Back action may reveal prior-step context; current visible labeled Back remains the baseline, reveal enhancement not adopted yet | A reveal must not hide the only navigation path, lose draft or steal focus; always-visible Back and immediate static prior-step context on touch, keyboard, native and reduced motion |
| Liquid Glass | SAMASANTE live-DOM/SVG refraction reference; early project, no dependency | Reject refracted text/controls on auth and onboarding screens; decorative surface inspiration only, no live-refraction screen adopted | Chrome/Edge bend versus Safari/Firefox frost/tint creates inconsistent rendering; plain CSS then opaque high-contrast surface fallback. Keep live text unrefracted, and use a static opaque surface for reduced motion or unsupported rendering |

Reviewed candidate source applies Motion only to a restrained heading fade. Inputs, passwords, OTPs, errors and critical content must remain stable. A synchronous animation feature import does not prove deferred bundle savings; measure the actual export. The earlier BOSS review reported Motion and its implementation at 13.2.0 with matching registry/license evidence; fresh dependency maintenance and export evidence are still required. The frontend implementation handoff is a separate document owned by the frontend worker.

- [x] Motion-only added animation decision and reference-only resource choices retained.
- [ ] Verify every relevant screen uses the agreed heading/control/body roles and visible navigation.
- [ ] Verify static reduced-motion/native/loading states, focus retention and accessible error/pending announcements.
- [ ] Reproduce final dependency/license/integrity/maintenance and bundle-size evidence.
- [ ] Approve no additional runtime from any reference resource without a separate product/engineering decision.

## Security hardening

Keep verified provider identity plus authoritative server session checks, screened application admission and object authorization. Supabase documents that access JWTs from revoked sessions remain valid until expiry, so signature verification alone cannot provide immediate application logout. Its session documentation identifies the token session identifier with the actual provider session row. Mente must combine verified claims, actual session/active lineage, application revocation and current factor assurance; an unavailable authoritative check must fail closed. [Supabase signout](https://supabase.com/docs/guides/auth/signout), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions).

Reviewed backend source implements provider-row checks, current-session and subject-wide application revocation before provider logout, credential revision checks and admission. These source observations are not fresh real-provider acceptance. Default-deny application RLS is FastAPI-only: clients have no direct domain grants, while a restricted non-owner server role has explicit backend policies. A compromised server role can access domain rows within its grants, so server object authorization remains essential.

Registration must consume the backend's generic accepted message with confirmation not required; it returns no session tokens. The initial frontend token-shape mismatch has now been corrected in re-read source: signup validates the generic message/confirmation-false shape, does not install a session, and has an actual response-shaped test. This source correction and the worker's reported passing tests require final handoff and combined QA before approval. Any auto-confirm signup session is cleaned by the server; subsequent screened gateway sign-in earns admission. New and duplicate account response shape, status and timing require meaningful negatives. Mailbox confirmation must not reappear as a hidden admission, onboarding or password gate.

Retain twelve-character minimum and 128-character maximum for new/reset passwords consistently across UI, gateway and provider. Support password managers and paste, screen breached passwords, share rate limits across account/IP/device keys, and retain optional MFA. The user accepts twelve as a policy choice despite OWASP's recommendation of fifteen when MFA is absent; this is not a claim of meeting that recommendation. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

Recovery must exchange a complete recovery code or unconsumed link token hash through the server, match identity and record a recent recovery proof without admitting protected domain access. Notice-only handling was an initial defect. Re-read frontend source now calls the server hash exchange before installing its returned session; consumed access/refresh-token callbacks and provider recovery events do not themselves establish proof. Functional email-link and code journeys still need actual combined verification, expiry/replay negatives and a final worker handoff. Recent screened password proof or valid server recovery proof, matching current credential revision and enrolled MFA assurance, protects password changes. Client flags cannot substitute for this proof. Password changes revoke application access globally and require fresh sign-in; provider outage or partial revocation must be communicated honestly.

Optional TOTP currently permits opt-in and replacement factors while preventing removal of the final verified factor. Preserve that safeguard until product decides whether and how later opt-out should work; do not silently establish permanent MFA. Primary-factor loss can use an already verified backup factor. Loss of both factors requires an approved manual support owner, identity-proof method, escalation/audit path and response expectations. Automatic email recovery must not bypass enrolled MFA.

The critical preserved real-provider defect is immediate refresh descendant resurrection after stale grandparent reuse. Historical unmitigated evidence also showed provider user access succeeding after resurrection. Historical strict passes apply to a hand-installed terminal-session deletion function, not the current canonical migrations or final application. The canonical deferred tombstone/session deletion requires fresh real provider schema, validated cascade constraints, non-superuser migration/definer authority and restricted runtime testing. Preserve normal rotation, concurrency grace, current-parent exception and unaffected devices while rejecting immediate descendant refresh, upstream account/password authority and protected app access after terminal reuse.

Fresh BOSS-reviewed reports now confirm canonical-fixture strict replay denial, actual application admission without mailbox confirmation plus MFA/logout, and 32 real wrong-password HTTP attempts whose hook counters persist followed by successful correct-password authentication. These are meaningful observed passes. However, the tested terminal function owner is a superuser. A conditional test that skips non-superuser assertions cannot prove the intended principal. Before dependency approval, use a dedicated owned non-superuser/non-bypass migration and definer role with explicit required auth grants and FORCE-RLS policies, apply the exact canonical chain as that role, assert role/owner/privileges unconditionally, and repeat strict provider/application checks. Hosted managed-schema privileges remain external even after this local gate passes.

Gateway normalization and timing work do not close the public direct-provider endpoint. Verify provider password hook persistence through actual HTTP: a successful correct-password authentication must not remove the hook, and a wrong-password direct-provider attempt must fail. SQL hook registration and mocked transport are insufficient. Hosted upstream timing/enumeration distributions, provider settings and managed-schema maintenance privileges remain external gates.

Invalid email and invalid password must produce the same generic credential-failure message. Apply common bounded work before credential evaluation, a bounded provider deadline within the shared response window, and identical failure padding; a minimum floor alone cannot hide a slower known-account path. Collect repeated timing distributions for unknown accounts, known accounts with wrong passwords, timeouts and slow upstream responses, including the public provider path. Define acceptable differences and incident thresholds with the security owner, and treat failures as NO-GO rather than assuming a single fast sample proves resistance.

Rate limiting must be durable/shared across workers and keyed to account, IP and device signals without exposing account existence. Audit failures, sign-in success after failure velocity, password/recovery/MFA changes, local/global revocation and provider-revocation pending outcomes. Hash identifying keys; never log passwords, access/refresh tokens, OTPs, recovery hashes, factor seeds or private signed media URLs. Review anomaly flags, alert ownership, retention duration, pruning execution and access to audit records together; log creation alone does not prove a functioning response process.

Native candidate storage uses SecureStore with legacy cleanup; fixture tests do not prove physical-device behavior. Web candidate storage explicitly uses localStorage, so an XSS can read session tokens. CSP/SRI and screened admission reduce some exposure but do not make tokens HttpOnly or prevent a stolen already admitted bearer from acting within its authority. An HttpOnly cookie/BFF would be a materially different server architecture and is not authorized here. Record a product/security decision on the current browser persistence risk before production.

Enforce strict script CSP/SRI and audited connection origins while preserving legitimate private gallery images and audio. The inspected policy's same-origin media restriction can block provider storage; exact configured storage origins need validation and browser tests without wildcard or script permission expansion. Document the existing style-only inline exception for React Native Web/Tamagui as a specific residual, not an unrestricted script allowance. Bearer auth is not a secure-cookie claim; origin/CORS/CSRF defenses need tests appropriate to the current architecture.

The current browser architecture sends an explicit bearer from localStorage, rather than relying on an ambient authentication cookie. Test rejection of cookie-only authentication and disallowed browser origins, strict allowed-origin CORS, and protected writes requiring the verified bearer. Same-origin script execution remains an XSS risk and is not solved by these CSRF checks. If an HttpOnly/BFF architecture is later authorized, its ambient-cookie CSRF protection needs a separate design and verification decision.

Release gates must scan complete frontend artifacts and reject privileged secrets, including native archives and source maps. Independently signed evidence must identify the exact candidate and reject absent, stale, altered, forged or wrong-artifact reports. Executable dependency-maintenance reports must substantiate upstream versions, provenance, licenses, maintenance and audits. The inspected CI can build with synthetic public origins and publish that candidate; such compilation evidence cannot authorize publication. An approved-public-config candidate must remain the exact artifact reviewed, with no rebuild after approval. Current code/configuration work is not evidence of a successful CI run.

Dependency inventory covers the whole lockfile factually, while the added UI resource review targets the newly adopted packages. Release age alone does not establish that an older package is unsafe. A universal 730-day cutoff, zero findings at every severity, or a new license allowlist would be a broader policy requiring an explicit decision; none is silently approved here. The historical audit's ten moderate findings in the existing Expo/uuid/xcode chain require a safe correction or explicit independent risk review. An incompatible Expo downgrade proposed by automatic audit tooling is prohibited.

- [x] Latest no-mailbox-gate and twelve-character decisions recorded; root discrepancy remains open.
- [x] Authoritative session/revocation, admission and RLS source inspected; historical findings retained.
- [ ] Verify the corrected actual generic signup response, screened sign-in and no-mailbox onboarding journey together.
- [ ] Verify functional recovery link/code proof UX, recent proof expiry, subject/revision races and MFA negatives.
- [ ] Test verified server identity, forged/missing/wrong-subject claims, undeclared identity inputs and cross-family object authorization.
- [ ] Automatically introspect every domain table for default-deny/FORCE RLS and restricted grants; create a new-table negative fixture so an omitted policy cannot silently pass a release.
- [ ] Complete fresh canonical PostgreSQL migrations, least-privilege roles and provider trigger/FK verification.
- [ ] Unconditionally prove a non-superuser/non-bypass migration and terminal definer with explicit auth grants and FORCE RLS; no superuser skip may satisfy this gate.
- [ ] Independently pass strict real provider and actual protected-app replay, logout/outage, rotation and backup-factor tests.
- [ ] Verify immediate current/all-device server revocation with old unexpired JWTs, independent devices and provider failure; SDK/foreground refresh cannot restore authority.
- [ ] Verify generic invalid-email/password failures, common work/deadline, gateway and upstream timing distributions.
- [ ] Verify shared account/IP/device limits, twelve-to-128 strength validation, breach screening and fail-closed screening outages.
- [ ] Verify opt-in MFA enrollment/challenge/backup/replacement and enrolled AAL2 enforcement; retain final-factor safeguard pending opt-out decision.
- [x] BOSS-reviewed fresh HTTP evidence confirms 32 persistent wrong-password hook counts and correct-password success on the observed fixture.
- [ ] Repeat required provider/application checks with the final intended non-superuser owner and matching source/migration identity.
- [ ] Verify audit redaction, anomaly flags, retention/pruning and named incident response owner.
- [ ] Verify bearer-only CSRF/origin/CORS defenses appropriate to the existing architecture.
- [ ] Verify final private-media CSP/SRI, restrained style exception and script injection/asset tampering negatives.
- [ ] Gate every frontend release through CI secret scans of its complete web/native bundle, maps and archives; reject missing or unscanned artifacts.
- [ ] Verify approved public candidate configuration and signed exact-artifact evidence rejection for missing, stale, forged, altered or wrong reports; no synthetic publication and no rebuild after approval.
- [ ] Verify new UI dependency pin/integrity/license/maintenance hygiene, factual full-lock audits and explicit baseline moderate-risk disposition.
- [ ] Approve browser persistence, later MFA opt-out and both-factors-lost manual recovery decisions.
- [ ] Obtain hosted provider/schema, upstream enumeration, incident/audit/retention and native-device sign-offs.

## Phased rollout order

| Original phase, in required order | GO / NO-GO approval checklist | Actual current status |
| --- | --- | --- |
| 1. Tokens | GO only after exact font roles/scale, genuine faces, fallback/glyph coverage, swap/subset/preload/versioned cache and licenses are reviewed. NO-GO for synthetic faces, unreadable patient overrides or unverified assets | Isolated implementation inspected; final reproducibility/cache/consistency sign-off pending |
| 2. Static screens | GO only after sign-in, registration, recovery, onboarding and MFA have usable static layouts, visible Back, labels, errors, pending/offline states and text zoom. NO-GO for hidden navigation or lost drafts/focus | Static candidate exists; corrected signup/recovery source re-read; full actual journey/accessibility sign-off pending |
| 3. Micro-interactions | GO only for approved Motion heading fade with stable inputs/content, static reduced-motion/native behavior and measured bundle cost. NO-GO for adopted unreviewed reference effects or inaccessible reveals | Motion candidate inspected and reference decisions retained; final keyboard/announcement/performance evidence pending |
| 4. Core auth | GO only after verified server identity, min12/no-mailbox signup and screened login, actual session admission, functional recovery proof and immediate current/all-device revocation pass. NO-GO for signature-only authority or incorrect boundary mocks | Generic signup/hash source corrected; BOSS-reviewed fresh admission/MFA/logout passes advance this gate, final combined/non-superuser checks pending; root still8 and unintegrated |
| 5. Additional security | GO only after RLS/new-table denial, shared rate limits, breach checks, MFA/backup, rotation/reuse/hooks, audit/retention, timing, CSRF/CSP/SRI and exact-release/dependency gates have current evidence. NO-GO for unresolved security defects or invented policy | Fresh strict provider and hook32 passes reviewed; terminal definer still SUPER, dedicated non-superuser/full release and organizational decisions unfinished |
| 6. QA | GO only after reviewed dependencies, serial integration, full regression, actual exported browser/media/accessibility and fresh provider/app negatives, with supported-platform evidence. NO-GO for missing exact-candidate proof or untested required controls | No integration approval; independent combined review/QA and BOSS acceptance still pending |

At this revision, component deliverables are underway and integration is not approved. QA reports a fresh owned fixture and thirty harness unit tests passing after authorized Docker startup; this proves reported fixture readiness, not canonical migrations or application acceptance. Earlier focused backend results and installed-fixture strict passes remain historical evidence with their limitations. No final candidate gate or organizational approval is silently checked.

Continuation evidence update: fresh BOSS-read evidence confirms strict provider replay, unconfirmed application admission with MFA/logout, and real HTTP password-hook persistence. The earlier reported admission failure is preserved in history, not presented as the latest result. Dedicated non-superuser migration/definer proof remains blocking; a partial application verification runner error also needs a complete structured handoff/retest. Frontend reports 37 suites/174 tests passing and an exported CSP/SRI browser render; final source/artifact handoff plus independent combined verification are still needed after ongoing compatible dependency patch updates.

Actual execution uses the three already-live workers: frontend Archimedes, backend Hilbert and QA Epicurus. Supervisor owns state and this review, then approves dependencies from evidence before a separate serial integration task. Preserve authoritative dirty root/profile/navigation/callbot changes, run independent combined review then QA, and prepare a Supervisor acceptance recommendation. Only independent BOSS may decide milestone completion; these coordination stages implement the original six phases rather than replacing them.

- [x] Resume the three actual existing workers with disjoint scopes and current identities.
- [x] Preserve the original review deliverable separately from the frontend implementation handoff.
- [ ] Approve each dependency only after current independent review/QA evidence resolves its blockers.
- [ ] Complete serial integration and verify authoritative root now enforces the agreed policy.
- [ ] Pass independent combined review and QA with exact source/artifact/run identities.
- [ ] Submit Supervisor acceptance recommendation and obtain independent BOSS decision.

## Open risks / trade-offs

Initial signup disagreement and notice-only recovery were corrected in re-read frontend source; they now require actual combined verification rather than continued description as unfixed code defects. BOSS-reviewed admission/MFA/logout, hook and replay passes do not prove the intended non-superuser migration/definer, which remains a blocking local gate. Final publication/media-policy and complete application-runner handoffs are also unfinished. Tests with incorrect mocks cannot close boundary defects. Refresh-session deletion couples application migrations to managed auth schema and requires owner privilege/upgrade approval; default-deny RLS alone cannot establish provider correctness.

Product/security decisions remain on browser localStorage token exposure, MFA opt-out after enrollment and support recovery when both factors are lost. Removing mandatory verification also means the account address may be mistyped or not controlled by the registrant; auto-confirmed metadata must not be treated as ownership. Recovery delivery and operational support need explicit ownership without introducing a hidden mandatory verification gate.

Font licensing, non-Latin glyph fallback, readable patient sizes, motion accessibility, actual private media, dependency maintenance and native-device behavior retain their own evidence gates. Hosted controls, upstream timing, incident response and audit retention are unverified until the relevant owners approve them. None of these risks authorizes live database changes, existing service restarts, commits, merges, pushes or deployment.

- [ ] Product and security owners record browser-token and unverified-address risk decisions.
- [ ] Product defines MFA opt-out; support/security approve lost-factor identity proof and escalation.
- [ ] Provider/database owner approves managed-schema authority and upgrade regression responsibility.
- [ ] Release owner approves public runtime configuration, exact signed candidate and dependency risk decisions.
- [ ] Accessibility/platform owners validate readable text, fallbacks, motion and actual supported devices.
- [ ] Incident/operations owners approve audit retention, anomaly response and recovery responsibilities.

Ready once approved: the original six phases have evidence-backed GO decisions, current workers and serial integration resolve combined defects, independent review/QA pass on the exact candidate, and BOSS accepts the milestone with explicit remaining product/security/platform decisions. This document neither certifies production readiness nor authorizes publication or deployment.

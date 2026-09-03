# Service A — Product Requirements Document

**Service:** Memory Assistance Calling Companion  
**Programme:** Idea #003 — MDoNER AI-Based Cognitive Gaming and Memory Assistance Platform  
**Document scope:** Hackathon prototype  
**Medical position:** Assistive cognitive-support and monitoring tool; **not a diagnostic medical device**. It does not diagnose dementia, determine progression, replace clinicians, or make medical conclusions. A family caregiver interprets all signals and decides whether to seek help.

**Assumptions**

- A caregiver has already created the patient profile, supplied consented family information, added a phone number, and configured the call schedule through Service B.
- The demonstration uses one Twilio-enabled caller number and destination numbers permitted by the Twilio account.
- The demo language is English or another language that the team has verified end to end before judging. Support for regional NER languages is a product goal, not a prototype guarantee.
- “Distress signal” means an observable interaction signal such as an explicit request to stop, repeated silence, repeated “I do not know,” or 2–3 consecutive incorrect answers. The prototype does not infer emotion or health state from voice.

## 1. Problem & Context

Elderly people living with dementia may need gentle orientation and familiar-memory prompts, while family members may live elsewhere or be unavailable at the same time every day. An app-only solution assumes device access, app literacy, and independent onboarding that many intended users may not have.

Service A provides a scheduled companion session through an ordinary phone call. The patient installs nothing and answers using speech. Each call begins with day/time orientation, continues with a varied set of familiar-memory and easy awareness prompts, and stops early if continuing may create frustration. The service records non-diagnostic session observations in the platform’s shared cognitive dataset.

Service A is one input channel to the wider platform. Service B supplies patient, family-memory, consent, schedule, and notification settings. Service A contributes call-derived `CognitiveSession` and `SessionMetric` records. The shared ML and alert logic then combines these records with game-derived observations so the caregiver receives one patient-level picture.

The service must preserve dignity. It responds gently to incorrect answers, avoids repeated correction, does not reward correctness, and never calls a trend or alert a diagnosis.

## 2. Target Users & Personas

### Elderly patient — primary participant

- May have memory or cognitive impairment, low technical literacy, slow responses, hearing difficulty, or motor limitations.
- Needs a familiar phone interaction, slow speech, simple vocabulary, generous response time, and an immediate way to stop or reschedule.
- Should not need an app, account, password, or typing.
- Must not be shamed, pressured, or told that a wrong answer indicates deterioration.

### Family caregiver — primary decision-maker

- Creates and maintains the patient profile, family facts, relationships, voice clips, call time, language preference, and alert destination in Service B.
- Needs concise routine information and a separate signal for potentially important same-day changes.
- Remains responsible for interpreting a signal and deciding whether to call the patient, contact another family member, or seek professional advice.

### Hackathon operator — prototype actor

- Configures Twilio credentials and the public webhook URL, seeds consented or synthetic demo data, starts the scheduler, and can trigger a call on demand.
- Needs deterministic fixtures and a manual trigger so the demonstration does not depend only on the scheduled time.

## 3. Goals & Success Metrics

### Product goals

1. Demonstrate a real outbound Twilio call that a patient can complete without an app.
2. Conduct a warm, varied 5–8-question session whose first evaluated question is always day/time orientation.
3. Handle “not ready,” silence, incorrect answers, explicit stop requests, and consecutive difficulty without forcing completion.
4. Persist call-derived observations in the same cognitive model used by Service B.
5. Separate routine reporting from credible same-day caregiver alerts.
6. Demonstrate that a call can change the unified family view and the patient-level trend assessment.

### Prototype acceptance metrics

| Metric | Hackathon pass criterion |
|---|---|
| Live outbound call | 3/3 operator-triggered calls reach an approved demo phone or produce an accurately recorded provider failure |
| Call flow | A completed test call asks 5–8 evaluated questions; day/time orientation is first; later categories are not in a fixed daily order |
| Readiness/reschedule | “Not now” ends warmly and creates one rescheduled attempt or a `RESCHEDULED` session state |
| Gentle handling | All incorrect-answer branches use neutral reinforcement; no branch contains blame, diagnosis, or repeated forced correction |
| Early termination | A fixture with 3 consecutive incorrect responses or an explicit stop ends early and stores the reason |
| Shared persistence | A completed/terminated call creates one `CognitiveSession` with `source=CALL` and associated `SessionMetric` rows |
| Idempotency | Replaying the same Twilio webhook does not duplicate a session, answer, metric, or alert |
| Alert distinction | Seeded routine variation creates no same-day alert; each severe fixture creates exactly one `SAME_DAY` `AlertEvent` |
| Webhook responsiveness | Locally measured p95 TwiML webhook response is under 1.5 seconds for the demo fixture set |
| End-to-end visibility | Finalized call data appears in the family’s unified history within 5 seconds in the demo environment |

These are technical demonstration criteria, not clinical-performance claims.

## 4. In-Scope Features

### MUST HAVE

| Capability | Prototype requirement |
|---|---|
| Scheduled and manual calls | Call a patient daily at the configured local time and support an operator-triggered demo call |
| Readiness check | Ask whether the patient is ready; accept simple affirmative, negative, stop, and no-input outcomes |
| One bounded reschedule | If not ready, offer a later attempt, defaulting to 60 minutes later and respecting configured quiet hours |
| Question plan | Select 5–8 questions; first is `ORIENTATION_DAY_TIME`; remaining questions are randomized across eligible categories |
| Question categories | Family-member recognition, relationship recognition, pre-recorded family voice recognition, and one easy general-awareness item |
| Spoken interaction | Use Twilio Voice, TwiML `<Say>`, `<Play>`, and speech `<Gather>`; allow only one neutral repeat when recognition is uncertain |
| Answer evaluation | Normalize expected names/aliases and use deterministic matching. Low STT confidence or no transcript is `UNSCORABLE`, not automatically incorrect |
| Gentle correction | Give or reinforce an answer where appropriate, acknowledge effort, and move on without dwelling on the error |
| Safety stop | End after an explicit stop or approximately 2–3 consecutive incorrect answers; store `EARLY_TERMINATED` and a reason |
| Session metrics | Calculate/log `session_score`, accuracy, average response latency, hesitation count, completion state, and category metrics |
| Shared write | Persist `CognitiveSession(source=CALL)` and `SessionMetric` records in the shared Postgres database |
| Alert evaluation | Invoke the shared rule engine after finalization, store `review_classification=ROUTINE|SAME_DAY`, and create an `AlertEvent` only for `SAME_DAY` |
| Family notification | Send a Twilio SMS for a `SAME_DAY` alert when enabled; keep the alert visible in Service B even if SMS delivery fails |
| Call status handling | Record initiated, ringing, answered, completed, busy, failed, and no-answer states using provider callbacks |

### SHOULD HAVE

- Optional routine post-session SMS summary controlled by `NotificationPreference`.
- Neural TTS and limited SSML pacing where the selected Twilio voice supports them.
- Family-provided pronunciation hints and accepted name aliases.
- A scripted mock-telephony adapter for offline development and a deterministic judge demo.
- One retry for a provider-level no-answer/failed call when the caregiver has enabled it.

### FUTURE WORK

- Validated, co-designed regional-language flows for Assamese, Bengali, Bodo, Khasi, Mizo, Manipuri/Meitei, Nagamese, and other NER languages.
- Clinician-reviewed prompt libraries and clinical validation.
- Production consent lifecycle, data-retention controls, audit trails, accessibility research, and regulated-health review.
- Advanced scheduling reliability, multiple telephony providers, and production monitoring.

## 5. Explicitly Out-of-Scope

- Diagnosing dementia, scoring disease severity, predicting a medical event, or recommending treatment.
- Emergency response, fall detection, medication reminders, or replacing a caregiver check-in.
- Patient mobile app, patient password, face recognition, speaker identification, voice biometrics, or emotion detection.
- Recording or retaining the patient’s raw call audio. The prototype stores Twilio transcripts/interaction results only where needed for the session.
- Free-form conversational AI, generative medical advice, or an autonomous voice agent.
- Unlimited retries, long conversations, inbound call-centre features, live caregiver conferencing, or emergency calling.
- Guaranteed recognition or synthesis for every NER language or accent.
- Enterprise identity, multi-region deployment, high availability, disaster recovery, Kubernetes, billing, subscriptions, advertising, or engagement optimization.
- Manipulative reminders, guilt messages, correctness-based rewards, or retention prompts.

## 6. Core User Flows

### Flow A1 — Configure the daily companion call

1. An authenticated caregiver opens the patient settings in Service B.
2. The caregiver provides the phone number, IANA time zone, preferred local call time, permitted days, language, quiet hours, and notification rule.
3. Service B validates the number and saves `CallSchedule` and `NotificationPreference`.
4. Service A’s scheduler reads the active schedule. Pausing reminders immediately sets the schedule inactive; no retention prompt appears.

### Flow A2 — Start, accept, or reschedule a call

1. At the due time, or on operator request, Service A creates a Twilio outbound call and an `IN_PROGRESS` `CognitiveSession` with `source=CALL`.
2. Twilio calls the patient and requests the Service A TwiML webhook.
3. The companion greets the patient by the configured preferred name and asks whether they are ready.
4. If ready, the call proceeds.
5. If not ready, the companion offers a later attempt. An affirmative response creates one rescheduled run, ordinarily +60 minutes, within quiet hours; otherwise the call ends and stores `RESCHEDULED`.
6. If there is no input, the companion repeats once slowly, then ends without marking the readiness response incorrect.

### Flow A3 — Run a daily question session

1. The system builds a 5–8-item `QuestionPlan` from eligible, consented content.
2. Item 1 is always day/time orientation.
3. Remaining items are shuffled across family-member, relationship, family-voice, and easy general-awareness categories. The same exact sequence is not reused on consecutive days.
4. For each item, the companion speaks or plays the prompt and gathers speech. Call response latency is an explicit prototype estimate from prompt-turn timing and webhook receipt, not a clinical reaction-time measurement.
5. The service classifies the result as `CORRECT`, `INCORRECT`, `UNSCORABLE`, `SKIPPED`, or `STOP` using deterministic rules.
6. A correct answer receives warm acknowledgement. An incorrect answer receives one gentle reinforcement where appropriate, then the call continues. `UNSCORABLE` may be repeated once and is not counted as incorrect.
7. The system stores a `SessionMetric` with category, accuracy when scorable, average response latency, hesitation count, and timestamp.

### Flow A4 — End early without creating pressure

1. The flow tracks consecutive scorable incorrect responses plus explicit stop/no-input signals.
2. After 2 consecutive incorrect responses, it switches to an easier closing prompt or asks whether the patient wants to continue.
3. At 3 consecutive incorrect responses, an explicit stop, or repeated no-input, it ends warmly.
4. It stores `EARLY_TERMINATED` with a reason such as `CONSECUTIVE_INCORRECT`, `PATIENT_STOP`, or `REPEATED_NO_INPUT`.
5. Early termination is meaningful data but is not automatically described as cognitive decline.

### Flow A5 — Finalize, assess, and notify

1. Service A aggregates the call metrics and stores `ended_at`, duration, `session_score`, completion status, and termination reason in one transaction.
2. The shared alert engine evaluates severe recognition failure, distress-related termination, and activity-adjusted baseline deviation.
3. Ordinary variation is stored for routine reporting only.
4. A qualifying event creates one deduplicated `AlertEvent(classification=SAME_DAY)` with a plain-language, non-diagnostic reason.
5. If SMS is enabled, Twilio sends the caregiver a concise message asking them to review/check in. SMS success or failure updates `delivery_status`; the in-app alert remains available either way.
6. The shared ML layer refreshes the patient’s `TrendAssessment` asynchronously or on dashboard request.

## 7. Non-Functional Requirements

| Area | Prototype requirement |
|---|---|
| Cognitive accessibility | Slow, plain speech; one question at a time; no jargon; generous timeouts; at most one repeat; a stop path at every interaction |
| Dignity and safety | Praise effort; never shame, argue, diagnose, or force completion; early termination takes priority over collecting all metrics |
| Low technical burden | Patient uses a normal phone and speech; no installation, login, or typing |
| Language honesty | Only enable a language after live STT/TTS testing with the chosen Twilio model/voice; expose unsupported languages as future work |
| Reliability | Scheduler and manual trigger must be deterministic for the demo; Twilio callbacks and question transitions are idempotent by `CallSid` plus step identifier |
| Latency | TwiML webhook p95 under 1.5 seconds; final session write and alert decision under 5 seconds in the demo environment |
| Privacy minimum | Store only required profile, transcript fragments, and metrics; no raw patient call recording; family assets require consent and authenticated management |
| Security minimum | HTTPS webhooks, Twilio signature validation, secrets in environment variables, hashed join codes/device tokens, caregiver authorization on management APIs |
| Explainability | Every same-day alert and trend state has a plain-language reason and source timestamps; no opaque medical score is shown as a conclusion |
| Ethical engagement | No ads, streak pressure, guilt, attention loops, or correctness-based reward. Pause and delete actions remain direct |
| Demo observability | Structured logs contain event IDs and statuses but exclude phone numbers, transcripts, family facts, and secrets |

## 8. Open Risks & Questions

| Risk or question | Prototype response |
|---|---|
| Twilio STT/TTS may not support a required NER language/voice pair | Validate language, model, and voice on real calls before enabling it. Demo in a verified language and document the gap |
| Accents, line quality, hearing difficulty, or pauses may reduce transcription accuracy | Use hints/aliases, longer timeouts, one repeat, and `UNSCORABLE`; never turn low confidence directly into a cognitive failure |
| Twilio trial, country permissions, caller ID, cost, or rate limits block the live call | Pre-verify numbers/permissions, keep balance available, and maintain a mock adapter plus recorded evidence of a prior live call |
| “Distress” could be overclaimed | Use only observable interaction rules; do not infer emotional state from acoustic features |
| Day/time answers depend on local context and wording | Store patient time zone, generate accepted day/time variants, and allow a caregiver-reviewed tolerance window |
| Twilio does not provide an exact “prompt audio finished” timestamp for this flow | Estimate call latency consistently from the issued turn, known prompt/audio duration, and answer webhook receipt; normalize CALL separately and label the metric approximate |
| Family information may be wrong, stale, or non-consensual | Require caregiver ownership/consent acknowledgement and allow direct edit/delete; Service A reads only active memories |
| General-awareness questions can be culturally biased | Use a tiny caregiver-reviewed bank of simple, non-medical, non-political items; skip rather than penalize ambiguity |
| A poor call could trigger excessive alerts | Require a severe event or multiple corroborating indicators; ordinary mistakes remain routine; deduplicate repeated alerts |
| Scheduler process restarts or demo host sleeps | Keep a manual trigger, run one always-on process during judging, and reconcile missed due schedules on startup |
| What should the reschedule delay be? | Prototype default: +60 minutes, at most once, constrained by quiet hours; expose as a simple caregiver setting only if time permits |
| Is `session_score` safe to show? | Store it for prototype comparison, label it non-clinical, and prefer component metrics plus plain-language reasons in the family view |

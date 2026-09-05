# DRY-ARC-001 Handoff

TASK: DRY-ARC-001
ROLE: ARCHITECT
STATUS: BLOCKED

SUMMARY: FastAPI exposes caregiver JWT, patient-token, overview, memory, settings, alerts, and session contracts, but
the frontend is mock-data UI with display-oriented models and no transport/adapters.

FILES CHANGED: None.

KEY RISKS: Supabase-vs-backend-JWT authority conflict; missing adapters/loading/error handling; unresolved game API
boundary; missing overview freshness fields; API URL/CORS/token lifecycle not defined.

RECOMMENDED NEXT STEP: Repair the frontend baseline, approve backend QA, and freeze a written cross-system contract
before assigning INTEGRATION.

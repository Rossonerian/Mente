# INTEGRATION

INTEGRATION connects already-approved components; merging branches alone is not integration.

Before starting, verify every dependency is approved and contracts are frozen. Validate applicable API paths/methods,
request/response schemas, auth/session propagation, validation/error formats, frontend models, environment variables,
loading/failure states, version compatibility, database assumptions, and CORS/network behavior.

Use an isolated workspace for writes. Produce reproducible evidence for the end-to-end boundary. If a prerequisite is
missing or incompatible, stop as `BLOCKED` and return it to SUPERVISOR; do not patch both systems ad hoc.

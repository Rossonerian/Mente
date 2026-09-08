# ADR-0001: Alembic is the application-schema authority

Status: accepted

## Decision

Alembic remains the only migration authority for Mente application tables,
constraints, indexes, RLS/grants, the asset metadata table, and the private
`family-memory-assets` bucket bootstrap. The Supabase CLI is used only for the
local platform services, status/keys, linking, and operational inspection.

## Context

The FastAPI backend already owns SQLAlchemy models and an Alembic history. A
second set of application migrations under `supabase/migrations` would permit
schema drift and make an empty database differ from a deployed database.
Supabase-managed schemas (`auth`, `storage`, `realtime`, and their internal
metadata) remain platform-owned. The reviewed Alembic migration only configures
the application-facing storage bucket and access posture; it does not replace
Supabase platform migrations.

## Consequences

- Releases apply `alembic upgrade head` once, using a migration credential,
  before starting or rolling out FastAPI instances.
- `supabase db reset` is not an application deployment mechanism, and remote
  reset commands are prohibited.
- A hosted project must be verified by reference and URL before a migration is
  applied. The current application head is `d1a4c7f6b9e2`.
- A future schema change is a forward Alembic migration, not a SQL file added
  to a competing Supabase migration directory.

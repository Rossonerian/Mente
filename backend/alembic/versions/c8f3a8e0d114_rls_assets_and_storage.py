"""add asset metadata, Supabase RLS posture, and private storage bucket

Revision ID: c8f3a8e0d114
Revises: b42f89192d47
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c8f3a8e0d114"
down_revision: str | None = "b42f89192d47"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


DOMAIN_TABLES = (
    "users",
    "families",
    "family_memberships",
    "patients",
    "family_memories",
    "call_schedules",
    "notification_preferences",
    "patient_join_codes",
    "patient_devices",
    "cognitive_sessions",
    "session_metrics",
    "alert_events",
    "assets",
)


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("family_id", sa.String(length=36), nullable=False),
        sa.Column("patient_id", sa.String(length=36), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("media_type", sa.String(length=100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=True),
        sa.Column("consent_recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["family_id"], ["families.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
        sa.CheckConstraint("status IN ('ACTIVE', 'DELETED')", name="ck_assets_status"),
    )
    op.create_index("ix_assets_family_id", "assets", ["family_id"])
    op.create_index("ix_assets_patient_id", "assets", ["patient_id"])
    op.create_index("ix_assets_storage_key", "assets", ["storage_key"], unique=True)
    op.create_index("ix_assets_created_by", "assets", ["created_by"])
    op.create_index("ix_assets_family_patient_status", "assets", ["family_id", "patient_id", "status"])

    with op.batch_alter_table("family_memories") as batch_op:
        batch_op.add_column(sa.Column("asset_id", sa.String(length=36), nullable=True))
        batch_op.create_index("ix_family_memories_asset_id", ["asset_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_family_memories_asset_id_assets",
            "assets",
            ["asset_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if op.get_bind().dialect.name != "postgresql":
        return

    # Domain tables are intentionally not exposed to the Supabase Data API. The
    # FastAPI database role remains the trusted server-side owner/role.
    for table in DOMAIN_TABLES:
        op.execute(sa.text(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY"))
        op.execute(sa.text(f"REVOKE ALL ON TABLE public.{table} FROM anon, authenticated"))
    op.execute(sa.text("REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated"))

    # Keep the bucket private and constrained. The bucket bootstrap is kept in
    # this Alembic migration so a new database does not depend on Dashboard work.
    op.execute(
        sa.text(
            """
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
                'family-memory-assets',
                'family-memory-assets',
                false,
                10485760,
                ARRAY['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4']::text[]
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                public = false,
                file_size_limit = EXCLUDED.file_size_limit,
                allowed_mime_types = EXCLUDED.allowed_mime_types
            """
        )
    )

    # Do not grant direct object access to client roles. The backend uses the
    # Storage API with a server-only key and applies family/consent checks first.
    op.execute(sa.text("REVOKE ALL ON TABLE storage.objects FROM anon, authenticated"))


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        for table in reversed(DOMAIN_TABLES):
            op.execute(sa.text(f"GRANT ALL ON TABLE public.{table} TO anon, authenticated"))
        op.execute(sa.text("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated"))
        # Bucket/object deletion is deliberately not automatic: it could orphan
        # or destroy family assets. Remove the application metadata only.
    with op.batch_alter_table("family_memories") as batch_op:
        batch_op.drop_constraint("fk_family_memories_asset_id_assets", type_="foreignkey")
        batch_op.drop_index("ix_family_memories_asset_id")
        batch_op.drop_column("asset_id")
    op.drop_index("ix_assets_family_patient_status", table_name="assets")
    op.drop_index("ix_assets_created_by", table_name="assets")
    op.drop_index("ix_assets_storage_key", table_name="assets")
    op.drop_index("ix_assets_patient_id", table_name="assets")
    op.drop_index("ix_assets_family_id", table_name="assets")
    op.drop_table("assets")

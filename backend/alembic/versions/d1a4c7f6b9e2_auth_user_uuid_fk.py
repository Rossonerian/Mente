"""use native Supabase Auth UUID mapping for caregiver profiles

Revision ID: d1a4c7f6b9e2
Revises: c8f3a8e0d114
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "d1a4c7f6b9e2"
down_revision: str | None = "c8f3a8e0d114"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    op.execute(
        sa.text(
            """
            ALTER TABLE public.users
            ALTER COLUMN auth_user_id TYPE uuid
            USING NULLIF(auth_user_id, '')::uuid
            """
        )
    )
    op.create_foreign_key(
        "fk_users_auth_user_id_auth_users",
        "users",
        "users",
        ["auth_user_id"],
        ["id"],
        source_schema="public",
        referent_schema="auth",
        ondelete="SET NULL",
    )


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    op.drop_constraint("fk_users_auth_user_id_auth_users", "users", schema="public", type_="foreignkey")
    op.execute(
        sa.text(
            """
            ALTER TABLE public.users
            ALTER COLUMN auth_user_id TYPE varchar(36)
            USING auth_user_id::text
            """
        )
    )

"""add Supabase caregiver profile mapping

Revision ID: b42f89192d47
Revises: 1eb4f1a31f59
Create Date: 2026-09-04 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "b42f89192d47"
down_revision: str | None = "1eb4f1a31f59"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("auth_user_id", sa.String(length=36), nullable=True))
        batch_op.drop_column("password_hash")
        batch_op.create_index("ix_users_auth_user_id", ["auth_user_id"], unique=True)


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_index("ix_users_auth_user_id")
        batch_op.add_column(sa.Column("password_hash", sa.Text(), nullable=False, server_default=""))
        batch_op.drop_column("auth_user_id")

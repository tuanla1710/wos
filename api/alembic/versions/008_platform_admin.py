"""platform admin users

Revision ID: 008_platform_admin
Revises: 007_holiday_country
Create Date: 2026-10-12
"""

from alembic import op

revision = "008_platform_admin"
down_revision = "007_holiday_country"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled_at timestamptz;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE users DROP COLUMN IF EXISTS disabled_at;
        ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
        """
    )

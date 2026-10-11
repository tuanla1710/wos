"""workspace holiday country

Revision ID: 007_holiday_country
Revises: 006_notes_lecture
Create Date: 2026-10-11
"""

from alembic import op

revision = "007_holiday_country"
down_revision = "006_notes_lecture"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS holiday_country TEXT;
        ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS holiday_country2 TEXT;
        ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS holiday_skips DATE[] NOT NULL DEFAULT '{}';
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE workspaces DROP COLUMN IF EXISTS holiday_skips;
        ALTER TABLE workspaces DROP COLUMN IF EXISTS holiday_country2;
        ALTER TABLE workspaces DROP COLUMN IF EXISTS holiday_country;
        """
    )

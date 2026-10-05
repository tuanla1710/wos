"""start dates, project due, workspace holidays

Revision ID: 004_schedule
Revises: 003_nest_links
Create Date: 2026-10-05
"""

from alembic import op

revision = "004_schedule"
down_revision = "003_nest_links"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date date;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date date;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS due_date date;

        CREATE TABLE IF NOT EXISTS workspace_holidays (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            day date NOT NULL,
            name text NOT NULL DEFAULT '',
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_workspace_holidays_ws_day UNIQUE (workspace_id, day)
        );
        CREATE INDEX IF NOT EXISTS ix_workspace_holidays_ws ON workspace_holidays (workspace_id, day);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS workspace_holidays;
        ALTER TABLE projects DROP COLUMN IF EXISTS due_date;
        ALTER TABLE projects DROP COLUMN IF EXISTS start_date;
        ALTER TABLE tasks DROP COLUMN IF EXISTS start_date;
        """
    )

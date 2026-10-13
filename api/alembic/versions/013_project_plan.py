"""project status and week plan

Revision ID: 013_project_plan
Revises: 012_week_plan
Create Date: 2026-10-13
"""

from alembic import op

revision = "013_project_plan"
down_revision = "012_week_plan"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'todo';
        DO $$
        BEGIN
            ALTER TABLE projects
                ADD CONSTRAINT projects_status_check
                CHECK (status IN ('todo', 'in_progress', 'blocked', 'done'));
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        CREATE TABLE IF NOT EXISTS project_week_targets (
            id uuid PRIMARY KEY,
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            week_start date NOT NULL,
            target_progress smallint,
            actual_progress smallint,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_project_week_target UNIQUE (workspace_id, project_id, week_start),
            CONSTRAINT project_week_targets_target_range CHECK (target_progress IS NULL OR (target_progress >= 0 AND target_progress <= 100)),
            CONSTRAINT project_week_targets_actual_range CHECK (actual_progress IS NULL OR (actual_progress >= 0 AND actual_progress <= 100))
        );
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS project_week_targets;
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
        ALTER TABLE projects DROP COLUMN IF EXISTS status;
        """
    )

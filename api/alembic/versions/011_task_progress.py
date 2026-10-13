"""task progress and weekly plan targets

Revision ID: 011_task_progress
Revises: 010_issue_keys
Create Date: 2026-10-13
"""

from alembic import op

revision = "011_task_progress"
down_revision = "010_issue_keys"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
        UPDATE tasks SET progress = 100 WHERE status = 'done';
        DO $$
        BEGIN
            ALTER TABLE tasks ADD CONSTRAINT tasks_progress_range CHECK (progress >= 0 AND progress <= 100);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;

        CREATE TABLE IF NOT EXISTS task_week_targets (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            week_start date NOT NULL,
            target_progress smallint NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_task_week_target UNIQUE (workspace_id, task_id, week_start),
            CONSTRAINT task_week_targets_range CHECK (target_progress >= 0 AND target_progress <= 100)
        );
        """
    )
    # Parents take the average of their subtasks. Repeat for each nesting level.
    for _ in range(5):
        op.execute(
            """
            UPDATE tasks AS parent
            SET progress = sub.avg
            FROM (
                SELECT parent_id, ROUND(AVG(progress))::int AS avg
                FROM tasks
                WHERE parent_id IS NOT NULL AND archived_at IS NULL
                GROUP BY parent_id
            ) AS sub
            WHERE parent.id = sub.parent_id
            """
        )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS task_week_targets;
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_progress_range;
        ALTER TABLE tasks DROP COLUMN IF EXISTS progress;
        """
    )

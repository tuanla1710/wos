"""week plan actual vs target

Revision ID: 012_week_plan
Revises: 011_task_progress
Create Date: 2026-10-13
"""

from alembic import op

revision = "012_week_plan"
down_revision = "011_task_progress"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE task_week_targets ALTER COLUMN target_progress DROP NOT NULL;
        ALTER TABLE task_week_targets ADD COLUMN IF NOT EXISTS actual_progress smallint;
        DO $$
        BEGIN
            ALTER TABLE task_week_targets
                ADD CONSTRAINT task_week_targets_actual_range
                CHECK (actual_progress IS NULL OR (actual_progress >= 0 AND actual_progress <= 100));
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE task_week_targets DROP CONSTRAINT IF EXISTS task_week_targets_actual_range;
        ALTER TABLE task_week_targets DROP COLUMN IF EXISTS actual_progress;
        UPDATE task_week_targets SET target_progress = 0 WHERE target_progress IS NULL;
        ALTER TABLE task_week_targets ALTER COLUMN target_progress SET NOT NULL;
        """
    )

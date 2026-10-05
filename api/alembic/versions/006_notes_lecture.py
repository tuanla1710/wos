"""notes kind lecture

Revision ID: 006_notes_lecture
Revises: 005_work_notes
Create Date: 2026-10-06
"""

from alembic import op

revision = "006_notes_lecture"
down_revision = "005_work_notes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE notes DROP CONSTRAINT IF EXISTS ck_notes_kind;
        ALTER TABLE notes ADD CONSTRAINT ck_notes_kind CHECK (kind IN ('quick', 'work', 'meeting', 'lecture'));
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE notes SET kind = 'work' WHERE kind = 'lecture';
        ALTER TABLE notes DROP CONSTRAINT IF EXISTS ck_notes_kind;
        ALTER TABLE notes ADD CONSTRAINT ck_notes_kind CHECK (kind IN ('quick', 'work', 'meeting'));
        """
    )

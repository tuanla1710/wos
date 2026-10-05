"""work notes: kind, pin, archive, tags, stars, files, activity.note_id

Revision ID: 005_work_notes
Revises: 004_schedule
Create Date: 2026-10-05
"""

from alembic import op

revision = "005_work_notes"
down_revision = "004_schedule"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE notes ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'work';
        ALTER TABLE notes ADD COLUMN IF NOT EXISTS pinned_at timestamptz;
        ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived_at timestamptz;
        UPDATE notes SET kind = 'work' WHERE kind IS NULL OR kind NOT IN ('quick', 'work', 'meeting');
        ALTER TABLE notes DROP CONSTRAINT IF EXISTS ck_notes_kind;
        ALTER TABLE notes ADD CONSTRAINT ck_notes_kind CHECK (kind IN ('quick', 'work', 'meeting'));

        CREATE INDEX IF NOT EXISTS ix_notes_ws_updated ON notes (workspace_id, updated_at DESC);
        CREATE INDEX IF NOT EXISTS ix_notes_ws_pinned ON notes (workspace_id, pinned_at DESC) WHERE pinned_at IS NOT NULL;
        CREATE INDEX IF NOT EXISTS ix_notes_ws_archived ON notes (workspace_id) WHERE archived_at IS NOT NULL;
        CREATE INDEX IF NOT EXISTS ix_notes_task ON notes (task_id);
        CREATE INDEX IF NOT EXISTS ix_notes_project ON notes (project_id);
        CREATE INDEX IF NOT EXISTS ix_notes_kind ON notes (workspace_id, kind);

        CREATE TABLE IF NOT EXISTS note_tags (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
            tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            CONSTRAINT uq_note_tags UNIQUE (note_id, tag_id)
        );

        CREATE TABLE IF NOT EXISTS note_stars (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_note_stars UNIQUE (note_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS note_attachments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
            uploaded_by uuid NOT NULL REFERENCES users(id),
            filename text NOT NULL,
            content_type text NOT NULL,
            size_bytes integer NOT NULL,
            storage_key text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_note_attachments_note ON note_attachments (note_id);

        ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS note_id uuid REFERENCES notes(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS ix_activity_logs_note ON activity_logs (note_id);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE activity_logs DROP COLUMN IF EXISTS note_id;
        DROP TABLE IF EXISTS note_attachments;
        DROP TABLE IF EXISTS note_stars;
        DROP TABLE IF EXISTS note_tags;
        DROP INDEX IF EXISTS ix_notes_kind;
        DROP INDEX IF EXISTS ix_notes_project;
        DROP INDEX IF EXISTS ix_notes_task;
        DROP INDEX IF EXISTS ix_notes_ws_archived;
        DROP INDEX IF EXISTS ix_notes_ws_pinned;
        DROP INDEX IF EXISTS ix_notes_ws_updated;
        ALTER TABLE notes DROP CONSTRAINT IF EXISTS ck_notes_kind;
        ALTER TABLE notes DROP COLUMN IF EXISTS archived_at;
        ALTER TABLE notes DROP COLUMN IF EXISTS pinned_at;
        ALTER TABLE notes DROP COLUMN IF EXISTS kind;
        """
    )

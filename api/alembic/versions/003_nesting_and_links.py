"""task/project nesting and links

Revision ID: 003_nest_links
Revises: 002_phases24
Create Date: 2026-10-04
"""

from alembic import op

revision = "003_nest_links"
down_revision = "002_phases24"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS ix_tasks_parent ON tasks (parent_id);

        ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES projects(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS ix_projects_parent ON projects (parent_id);

        CREATE TABLE IF NOT EXISTS entity_links (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
            project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
            title text NOT NULL,
            url text NOT NULL,
            created_by uuid NOT NULL REFERENCES users(id),
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT ck_entity_links_one_owner CHECK (
                (task_id IS NOT NULL AND project_id IS NULL)
                OR (task_id IS NULL AND project_id IS NOT NULL)
            )
        );
        CREATE INDEX IF NOT EXISTS ix_entity_links_task ON entity_links (task_id);
        CREATE INDEX IF NOT EXISTS ix_entity_links_project ON entity_links (project_id);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS entity_links;
        ALTER TABLE projects DROP COLUMN IF EXISTS parent_id;
        ALTER TABLE tasks DROP COLUMN IF EXISTS parent_id;
        """
    )

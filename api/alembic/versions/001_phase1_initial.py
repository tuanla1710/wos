"""phase1 initial

Revision ID: 001_phase1
Revises:
Create Date: 2026-10-04
"""

from alembic import op

revision = "001_phase1"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")
    op.execute(
        """
        CREATE TABLE users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email citext UNIQUE NOT NULL,
            password_hash text NOT NULL,
            name text NOT NULL,
            timezone text NOT NULL DEFAULT 'Asia/Seoul',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE workspaces (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            owner_id uuid NOT NULL REFERENCES users(id),
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE workspace_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role text NOT NULL CHECK (role IN ('owner','admin','member','guest')),
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_workspace_members_ws_user UNIQUE (workspace_id, user_id)
        );

        CREATE TABLE projects (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name text NOT NULL,
            archived_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX ix_projects_workspace_active ON projects (workspace_id) WHERE archived_at IS NULL;

        CREATE TABLE tasks (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
            assignee_id uuid NOT NULL REFERENCES users(id),
            title text NOT NULL,
            description text NOT NULL DEFAULT '',
            status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','blocked','done')),
            priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
            due_date date,
            is_inbox boolean NOT NULL DEFAULT true,
            blocked_reason text NOT NULL DEFAULT '',
            archived_at timestamptz,
            completed_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT ck_tasks_title_len CHECK (char_length(title) BETWEEN 1 AND 200)
        );
        CREATE INDEX ix_tasks_ws_inbox ON tasks (workspace_id, is_inbox) WHERE archived_at IS NULL;
        CREATE INDEX ix_tasks_ws_due ON tasks (workspace_id, due_date) WHERE archived_at IS NULL;
        CREATE INDEX ix_tasks_ws_status ON tasks (workspace_id, status) WHERE archived_at IS NULL;
        CREATE INDEX ix_tasks_ws_project ON tasks (workspace_id, project_id) WHERE archived_at IS NULL;
        CREATE INDEX ix_tasks_ws_assignee ON tasks (workspace_id, assignee_id);

        CREATE TABLE task_checklists (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            title text NOT NULL,
            is_done boolean NOT NULL DEFAULT false,
            position int NOT NULL DEFAULT 0,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX ix_task_checklists_task_pos ON task_checklists (task_id, position);

        CREATE TABLE task_focus (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            focus_on date NOT NULL,
            position smallint NOT NULL CHECK (position BETWEEN 1 AND 3),
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_task_focus_day_task UNIQUE (workspace_id, user_id, focus_on, task_id),
            CONSTRAINT uq_task_focus_day_pos UNIQUE (workspace_id, user_id, focus_on, position)
        );

        CREATE TABLE task_week_focus (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            week_start date NOT NULL,
            position smallint NOT NULL CHECK (position BETWEEN 1 AND 3),
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_task_week_focus_week_task UNIQUE (workspace_id, user_id, week_start, task_id),
            CONSTRAINT uq_task_week_focus_week_pos UNIQUE (workspace_id, user_id, week_start, position)
        );
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS task_week_focus;
        DROP TABLE IF EXISTS task_focus;
        DROP TABLE IF EXISTS task_checklists;
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS projects;
        DROP TABLE IF EXISTS workspace_members;
        DROP TABLE IF EXISTS workspaces;
        DROP TABLE IF EXISTS users;
        """
    )

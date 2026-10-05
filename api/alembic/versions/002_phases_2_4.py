"""phases 2-4

Revision ID: 002_phases24
Revises: 001_phase1
Create Date: 2026-10-04
"""

from alembic import op

revision = "002_phases24"
down_revision = "001_phase1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_enabled boolean NOT NULL DEFAULT false;
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);
        UPDATE tasks SET created_by = assignee_id WHERE created_by IS NULL;
        ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;

        CREATE TABLE IF NOT EXISTS workspace_invites (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            email citext NOT NULL,
            role text NOT NULL CHECK (role IN ('owner','admin','member','guest')),
            token text UNIQUE NOT NULL,
            created_by uuid NOT NULL REFERENCES users(id),
            expires_at timestamptz NOT NULL,
            accepted_at timestamptz,
            revoked_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS invite_projects (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            invite_id uuid NOT NULL REFERENCES workspace_invites(id) ON DELETE CASCADE,
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            CONSTRAINT uq_invite_projects UNIQUE (invite_id, project_id)
        );

        CREATE TABLE IF NOT EXISTS project_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT uq_project_members UNIQUE (project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS task_comments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            author_id uuid NOT NULL REFERENCES users(id),
            body text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            deleted_at timestamptz
        );

        CREATE TABLE IF NOT EXISTS task_comment_mentions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            comment_id uuid NOT NULL REFERENCES task_comments(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT uq_comment_mention UNIQUE (comment_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type text NOT NULL,
            task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
            body text NOT NULL,
            read_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_notifications_user ON notifications (user_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS activity_logs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            actor_id uuid NOT NULL REFERENCES users(id),
            project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
            task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
            verb text NOT NULL,
            summary text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_activity_ws ON activity_logs (workspace_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS task_attachments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            uploaded_by uuid NOT NULL REFERENCES users(id),
            filename text NOT NULL,
            content_type text NOT NULL,
            size_bytes int NOT NULL,
            storage_key text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS tags (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name text NOT NULL,
            CONSTRAINT uq_tags_ws_name UNIQUE (workspace_id, name)
        );

        CREATE TABLE IF NOT EXISTS task_tags (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            CONSTRAINT uq_task_tags UNIQUE (task_id, tag_id)
        );

        CREATE TABLE IF NOT EXISTS notes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
            task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
            created_by uuid NOT NULL REFERENCES users(id),
            title text NOT NULL DEFAULT 'Untitled',
            body text NOT NULL DEFAULT '',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ix_notes_ws_updated ON notes (workspace_id, updated_at DESC);

        CREATE TABLE IF NOT EXISTS calendar_events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            created_by uuid NOT NULL REFERENCES users(id),
            title text NOT NULL,
            event_date date NOT NULL,
            start_time time,
            end_time time,
            project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
            task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS plans (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            code text UNIQUE NOT NULL,
            name text NOT NULL,
            max_workspaces int NOT NULL,
            max_seats int NOT NULL,
            public_api boolean NOT NULL DEFAULT false,
            guests boolean NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS workspace_subscriptions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            plan_id uuid NOT NULL REFERENCES plans(id),
            status text NOT NULL DEFAULT 'active',
            current_period_end timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS billing_customers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            provider_ref text NOT NULL DEFAULT 'local',
            created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS api_tokens (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name text NOT NULL,
            token_hash text UNIQUE NOT NULL,
            prefix text NOT NULL,
            created_by uuid NOT NULL REFERENCES users(id),
            last_used_at timestamptz,
            revoked_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        );

        INSERT INTO plans (code, name, max_workspaces, max_seats, public_api, guests)
        SELECT 'free', 'Free Personal', 1, 1, false, false
        WHERE NOT EXISTS (SELECT 1 FROM plans WHERE code = 'free');
        INSERT INTO plans (code, name, max_workspaces, max_seats, public_api, guests)
        SELECT 'team', 'Team', 20, 15, true, true
        WHERE NOT EXISTS (SELECT 1 FROM plans WHERE code = 'team');

        INSERT INTO workspace_subscriptions (workspace_id, plan_id, status)
        SELECT w.id, p.id, 'active'
        FROM workspaces w
        JOIN plans p ON p.code = 'free'
        WHERE NOT EXISTS (SELECT 1 FROM workspace_subscriptions s WHERE s.workspace_id = w.id);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS api_tokens;
        DROP TABLE IF EXISTS billing_customers;
        DROP TABLE IF EXISTS workspace_subscriptions;
        DROP TABLE IF EXISTS plans;
        DROP TABLE IF EXISTS calendar_events;
        DROP TABLE IF EXISTS notes;
        DROP TABLE IF EXISTS task_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS task_attachments;
        DROP TABLE IF EXISTS activity_logs;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS task_comment_mentions;
        DROP TABLE IF EXISTS task_comments;
        DROP TABLE IF EXISTS project_members;
        DROP TABLE IF EXISTS invite_projects;
        DROP TABLE IF EXISTS workspace_invites;
        ALTER TABLE tasks DROP COLUMN IF EXISTS created_by;
        ALTER TABLE users DROP COLUMN IF EXISTS ai_enabled;
        """
    )

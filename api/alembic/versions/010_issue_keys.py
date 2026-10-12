"""project issue keys

Revision ID: 010_issue_keys
Revises: 009_phone_auth
Create Date: 2026-10-12
"""

import re

from alembic import op
from sqlalchemy import text

revision = "010_issue_keys"
down_revision = "009_phone_auth"
branch_labels = None
depends_on = None


def _base_key(name: str) -> str:
    parts = re.findall(r"[A-Za-z0-9]+", name or "")
    if not parts:
        base = "PRJ"
    elif len(parts) == 1:
        base = parts[0][:4].upper()
    else:
        base = "".join(part[0] for part in parts[:4]).upper()
    return base if len(base) >= 2 else (base + "X")[:2]


def upgrade() -> None:
    op.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS key TEXT;")
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_number INTEGER;")
    conn = op.get_bind()
    used: dict[str, set[str]] = {}
    projects = conn.execute(text("SELECT id, workspace_id, name FROM projects")).fetchall()
    for project_id, workspace_id, name in projects:
        ws = str(workspace_id)
        used.setdefault(ws, set())
        base = _base_key(name)
        key = base
        n = 2
        while key in used[ws]:
            key = f"{base}{n}"
            n += 1
        used[ws].add(key)
        conn.execute(text("UPDATE projects SET key = :key WHERE id = :id"), {"key": key, "id": project_id})
        tasks = conn.execute(
            text("SELECT id FROM tasks WHERE project_id = :id ORDER BY created_at ASC, id ASC"),
            {"id": project_id},
        ).fetchall()
        for index, (task_id,) in enumerate(tasks, start=1):
            conn.execute(text("UPDATE tasks SET task_number = :n WHERE id = :id"), {"n": index, "id": task_id})
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_ws_key ON projects (workspace_id, key) WHERE key IS NOT NULL;")
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_tasks_project_number ON tasks (project_id, task_number) WHERE project_id IS NOT NULL AND task_number IS NOT NULL;"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_tasks_project_number;")
    op.execute("DROP INDEX IF EXISTS uq_projects_ws_key;")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS task_number;")
    op.execute("ALTER TABLE projects DROP COLUMN IF EXISTS key;")

import re
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task


def key_from_name(name: str) -> str:
    parts = re.findall(r"[A-Za-z0-9]+", name or "")
    if not parts:
        base = "PRJ"
    elif len(parts) == 1:
        base = parts[0][:4].upper()
    else:
        base = "".join(part[0] for part in parts[:4]).upper()
    return base if len(base) >= 2 else (base + "X")[:2]


def unique_project_key(db: Session, workspace_id: UUID, name: str, exclude_id: UUID | None = None) -> str:
    base = key_from_name(name)
    key = base
    n = 2
    while True:
        q = db.query(Project).filter(Project.workspace_id == workspace_id, Project.key == key)
        if exclude_id:
            q = q.filter(Project.id != exclude_id)
        if not q.first():
            return key
        key = f"{base}{n}"
        n += 1


def next_task_number(db: Session, project_id: UUID) -> int:
    current = db.query(func.max(Task.task_number)).filter(Task.project_id == project_id).scalar()
    return int(current or 0) + 1


def assign_issue(db: Session, task: Task, project: Project) -> None:
    if not project.key:
        project.key = unique_project_key(db, project.workspace_id, project.name, project.id)
    if task.project_id == project.id and task.task_number:
        return
    task.task_number = next_task_number(db, project.id)

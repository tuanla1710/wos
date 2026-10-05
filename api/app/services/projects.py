from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.dates import require_range, user_today
from app.services.serialize import holiday_dates, project_out, task_out


def list_projects(db: Session, workspace: Workspace, allowed_ids: set | None = None) -> list[dict]:
    q = db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None))
    if allowed_ids is not None:
        q = q.filter(Project.id.in_(list(allowed_ids)))
    rows = q.order_by(Project.name).all()
    holidays = holiday_dates(db, workspace.id)
    return [project_out(p, holidays=holidays) for p in rows]


def _project_chain(db: Session, project: Project, *, stop_id: UUID | None = None) -> list[Project]:
    chain: list[Project] = []
    current = project
    seen: set[UUID] = set()
    while current:
        if stop_id and current.id == stop_id:
            raise HTTPException(400, "Can’t nest a project under itself.")
        if current.id in seen:
            break
        seen.add(current.id)
        chain.append(current)
        if not current.parent_id:
            break
        current = db.get(Project, current.parent_id)
    if len(chain) >= 5:
        raise HTTPException(400, "Too many nested levels.")
    return chain


def create_project(
    db: Session,
    workspace: Workspace,
    name: str,
    parent_id: UUID | None = None,
    start_date: date | None = None,
    due_date: date | None = None,
) -> Project:
    name = name.strip()
    if not name:
        raise HTTPException(400, "Project name can’t be empty.")
    require_range(start_date, due_date)
    parent = None
    if parent_id:
        parent = get_project(db, workspace, parent_id)
        _project_chain(db, parent)
    project = Project(
        workspace_id=workspace.id,
        name=name,
        parent_id=parent.id if parent else None,
        start_date=start_date,
        due_date=due_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_project(db: Session, workspace: Workspace, project_id: UUID) -> Project:
    project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == workspace.id).first()
    if not project:
        raise HTTPException(404, "Not found.")
    return project


def overview(db: Session, workspace: Workspace, user: User, project: Project) -> dict:
    today = user_today(user.timezone)
    q = db.query(Task).filter(Task.project_id == project.id, Task.archived_at.is_(None))
    tasks = q.all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "done")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    blocked = sum(1 for t in tasks if t.status == "blocked")
    overdue = sum(1 for t in tasks if t.due_date and t.due_date < today and t.status != "done")
    upcoming = sorted(
        [t for t in tasks if t.due_date and t.status != "done"],
        key=lambda t: t.due_date,
    )[:5]
    children = (
        db.query(Project)
        .filter(Project.parent_id == project.id, Project.archived_at.is_(None))
        .order_by(Project.name)
        .all()
    )
    from app.services.links import list_links

    holidays = holiday_dates(db, workspace.id)
    return {
        **project_out(project, holidays=holidays),
        "progress": round((completed / total) * 100) if total else 0,
        "counts": {
            "tasks": total,
            "completed": completed,
            "in_progress": in_progress,
            "blocked": blocked,
            "overdue": overdue,
        },
        "upcoming": [task_out(t, holidays=holidays) for t in upcoming],
        "children": [project_out(c, holidays=holidays) for c in children],
        "links": list_links(db, project_id=project.id),
    }


def rename_project(db: Session, project: Project, name: str) -> Project:
    name = name.strip()
    if not name:
        raise HTTPException(400, "Project name can’t be empty.")
    project.name = name
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project


def patch_project(db: Session, workspace: Workspace, project: Project, data: dict) -> Project:
    if data.get("name") is not None:
        name = data["name"].strip()
        if not name:
            raise HTTPException(400, "Project name can’t be empty.")
        project.name = name
    if data.get("clear_start"):
        project.start_date = None
    elif data.get("start_date") is not None:
        project.start_date = data["start_date"]
    if data.get("clear_due"):
        project.due_date = None
    elif data.get("due_date") is not None:
        project.due_date = data["due_date"]
    require_range(project.start_date, project.due_date)
    if data.get("clear_parent"):
        project.parent_id = None
    elif data.get("parent_id") is not None:
        parent = get_project(db, workspace, data["parent_id"])
        if parent.id == project.id:
            raise HTTPException(400, "Can’t nest a project under itself.")
        _project_chain(db, parent, stop_id=project.id)
        project.parent_id = parent.id
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, workspace: Workspace, project: Project, task_action: str) -> None:
    tasks = db.query(Task).filter(Task.project_id == project.id).all()
    for task in tasks:
        task.project_id = None
        if task_action == "inbox":
            task.is_inbox = True
        else:
            task.is_inbox = False
    db.delete(project)
    db.commit()

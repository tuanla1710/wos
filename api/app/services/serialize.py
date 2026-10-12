from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session, object_session

from app.models.project import Project
from app.models.task import Task, TaskChecklist
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceHoliday
from app.services.dates import work_days


def holiday_dates(db: Session, workspace_id: UUID) -> set[date]:
    from app.services.public_holidays import day_off_dates

    workspace = db.get(Workspace, workspace_id)
    if workspace:
        return day_off_dates(db, workspace)
    rows = db.query(WorkspaceHoliday.day).filter(WorkspaceHoliday.workspace_id == workspace_id).all()
    return {row[0] for row in rows}


def _issue_key(task: Task) -> str | None:
    number = getattr(task, "task_number", None)
    if not number or not getattr(task, "project_id", None):
        return None
    session = object_session(task)
    project = session.get(Project, task.project_id) if session else None
    key = getattr(project, "key", None) if project else None
    if not key:
        return None
    return f"{key}-{number}"


def holiday_out(row: WorkspaceHoliday) -> dict:
    return {"id": str(row.id), "day": row.day.isoformat(), "name": row.name}


def user_out(user: User, workspace: Workspace, role: str | None = None, member_count: int | None = None) -> dict:
    data = {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "timezone": user.timezone,
        "ai_enabled": bool(getattr(user, "ai_enabled", False)),
        "is_admin": bool(getattr(user, "is_admin", False)),
        "phone": getattr(user, "phone", None),
        "phone_verified": getattr(user, "phone_verified_at", None) is not None,
        "workspace": {"id": str(workspace.id), "name": workspace.name, "role": role},
    }
    if member_count is not None:
        data["workspace"]["member_count"] = member_count
    return data


def project_out(project: Project, holidays: set[date] | None = None) -> dict:
    start = getattr(project, "start_date", None)
    due = getattr(project, "due_date", None)
    return {
        "id": str(project.id),
        "name": project.name,
        "workspace_id": str(project.workspace_id),
        "parent_id": str(project.parent_id) if getattr(project, "parent_id", None) else None,
        "start_date": start.isoformat() if start else None,
        "due_date": due.isoformat() if due else None,
        "work_days": work_days(start, due, holidays),
        "key": getattr(project, "key", None),
    }


def checklist_out(item: TaskChecklist) -> dict:
    return {
        "id": str(item.id),
        "title": item.title,
        "is_done": item.is_done,
        "position": item.position,
    }


def task_out(
    task: Task,
    checklists: list[TaskChecklist] | None = None,
    focused: bool = False,
    holidays: set[date] | None = None,
) -> dict:
    start = getattr(task, "start_date", None)
    data = {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "start_date": start.isoformat() if start else None,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "work_days": work_days(start, task.due_date, holidays),
        "project_id": str(task.project_id) if task.project_id else None,
        "parent_id": str(getattr(task, "parent_id", None)) if getattr(task, "parent_id", None) else None,
        "assignee_id": str(task.assignee_id) if task.assignee_id else None,
        "created_by": str(getattr(task, "created_by", None) or task.assignee_id),
        "is_inbox": task.is_inbox,
        "blocked_reason": task.blocked_reason,
        "archived_at": task.archived_at.isoformat() if task.archived_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "focused": focused,
        "issue_key": _issue_key(task),
        "task_number": getattr(task, "task_number", None),
    }
    if checklists is not None:
        data["checklists"] = [checklist_out(i) for i in checklists]
    return data

from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.focus import TaskWeekFocus
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.dates import in_user_date, next_monday, user_today, week_monday
from app.services.serialize import task_out
from app.services.tasks import get_task


def _alive(db: Session, workspace: Workspace):
    return db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.parent_id.is_(None))


def review_payload(db: Session, workspace: Workspace, user: User, week_start: date | None) -> dict:
    today = user_today(user.timezone)
    start = week_start or week_monday(today)
    end = start + timedelta(days=6)
    next_start = next_monday(today)
    base = _alive(db, workspace)
    completed_week = [
        t
        for t in base.filter(Task.status == "done", Task.completed_at.isnot(None)).order_by(Task.completed_at.desc()).all()
        if t.completed_at and start <= in_user_date(t.completed_at, user.timezone) <= end
    ]
    overdue = (
        base.filter(Task.is_inbox.is_(False), Task.due_date.isnot(None), Task.due_date < today, Task.status != "done")
        .order_by(Task.due_date)
        .all()
    )
    blocked = base.filter(Task.status == "blocked").all()
    next_week = (
        base.filter(
            Task.is_inbox.is_(False),
            Task.due_date >= next_start,
            Task.due_date < next_start + timedelta(days=7),
            Task.status != "done",
        )
        .order_by(Task.due_date)
        .all()
    )
    projects = []
    for project in db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None)):
        tasks = db.query(Task).filter(Task.project_id == project.id, Task.archived_at.is_(None)).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.status == "done")
        projects.append({"id": str(project.id), "name": project.name, "progress": round((done / total) * 100) if total else 0})
    week_focus = (
        db.query(TaskWeekFocus)
        .filter(
            TaskWeekFocus.workspace_id == workspace.id,
            TaskWeekFocus.user_id == user.id,
            TaskWeekFocus.week_start == next_start,
        )
        .order_by(TaskWeekFocus.position)
        .all()
    )
    focus_tasks = []
    for pin in week_focus:
        task = db.get(Task, pin.task_id)
        if task and not task.archived_at:
            focus_tasks.append(task_out(task))
    return {
        "week_start": start.isoformat(),
        "week_end": end.isoformat(),
        "next_week_start": next_start.isoformat(),
        "completed": len(completed_week),
        "completed_tasks": [task_out(t) for t in completed_week],
        "overdue": [task_out(t) for t in overdue],
        "blocked": [task_out(t) for t in blocked],
        "due_next_week": [task_out(t) for t in next_week],
        "projects": projects,
        "week_focus": focus_tasks,
    }


def put_week_focus(db: Session, workspace: Workspace, user: User, week_start: date, task_ids: list[UUID]) -> list[dict]:
    if week_start.weekday() != 0:
        raise HTTPException(400, "week_start must be Monday")
    if len(task_ids) > 3:
        raise HTTPException(400, "Max 3")
    db.query(TaskWeekFocus).filter(
        TaskWeekFocus.workspace_id == workspace.id,
        TaskWeekFocus.user_id == user.id,
        TaskWeekFocus.week_start == week_start,
    ).delete()
    out = []
    for i, task_id in enumerate(task_ids, start=1):
        task = get_task(db, workspace, task_id)
        if task.status == "done" or task.archived_at:
            raise HTTPException(400, "Invalid task")
        db.add(
            TaskWeekFocus(
                workspace_id=workspace.id,
                user_id=user.id,
                task_id=task.id,
                week_start=week_start,
                position=i,
            )
        )
        out.append(task)
    db.commit()
    return [task_out(t) for t in out]

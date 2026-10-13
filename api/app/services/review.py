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


def _completed_in(tasks: list[Task], start: date, end: date, timezone: str) -> list[Task]:
    out: list[Task] = []
    for task in tasks:
        if task.completed_at and start <= in_user_date(task.completed_at, timezone) <= end:
            out.append(task)
    return out


def _sort_open(tasks: list[Task]) -> list[Task]:
    return sorted(tasks, key=lambda t: (t.due_date is None, t.due_date or date.max, t.title.lower()))


def review_payload(db: Session, workspace: Workspace, user: User, week_start: date | None) -> dict:
    today = user_today(user.timezone)
    start = week_start or week_monday(today)
    end = start + timedelta(days=6)
    last_start = start - timedelta(days=7)
    last_end = start - timedelta(days=1)
    next_start = next_monday(today)
    report_next_start = start + timedelta(days=7)
    report_next_end = report_next_start + timedelta(days=6)
    base = _alive(db, workspace)
    done_rows = base.filter(Task.status == "done", Task.completed_at.isnot(None)).order_by(Task.completed_at.desc()).all()
    completed_week = _completed_in(done_rows, start, end, user.timezone)
    last_week_done = _completed_in(done_rows, last_start, last_end, user.timezone)
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
    open_tasks = base.filter(Task.is_inbox.is_(False), Task.status != "done").all()
    this_week_doing = _sort_open(
        [t for t in open_tasks if t.status == "in_progress" or (t.due_date is not None and start <= t.due_date <= end)]
    )
    projects = []
    for project in db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None)):
        tasks = db.query(Task).filter(Task.project_id == project.id, Task.archived_at.is_(None)).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.status == "done")
        projects.append({"id": str(project.id), "name": project.name, "progress": round((done / total) * 100) if total else 0})
    focus_models = _week_focus_tasks(db, workspace, user, next_start)
    planned_models = _dedupe(
        [t for t in open_tasks if t.due_date is not None and report_next_start <= t.due_date <= report_next_end]
        + _week_focus_tasks(db, workspace, user, report_next_start)
    )
    return {
        "week_start": start.isoformat(),
        "week_end": end.isoformat(),
        "last_week_start": last_start.isoformat(),
        "last_week_end": last_end.isoformat(),
        "next_week_start": next_start.isoformat(),
        "plan_week_start": report_next_start.isoformat(),
        "plan_week_end": report_next_end.isoformat(),
        "completed": len(completed_week),
        "completed_tasks": [task_out(t) for t in completed_week],
        "last_week_done": [task_out(t) for t in last_week_done],
        "this_week_done": [task_out(t) for t in completed_week],
        "this_week_doing": [task_out(t) for t in this_week_doing],
        "next_week_planned": [task_out(t) for t in _sort_open(planned_models)],
        "overdue": [task_out(t) for t in overdue],
        "blocked": [task_out(t) for t in blocked],
        "due_next_week": [task_out(t) for t in next_week],
        "projects": projects,
        "week_focus": [task_out(t) for t in focus_models],
    }


def _week_focus_tasks(db: Session, workspace: Workspace, user: User, week_start: date) -> list[Task]:
    pins = (
        db.query(TaskWeekFocus)
        .filter(
            TaskWeekFocus.workspace_id == workspace.id,
            TaskWeekFocus.user_id == user.id,
            TaskWeekFocus.week_start == week_start,
        )
        .order_by(TaskWeekFocus.position)
        .all()
    )
    out: list[Task] = []
    for pin in pins:
        task = db.get(Task, pin.task_id)
        if task and not task.archived_at and task.status != "done":
            out.append(task)
    return out


def _dedupe(tasks: list[Task]) -> list[Task]:
    seen: set = set()
    out: list[Task] = []
    for task in tasks:
        if task.id in seen:
            continue
        seen.add(task.id)
        out.append(task)
    return out


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

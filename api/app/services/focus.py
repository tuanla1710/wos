from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.focus import TaskFocus, TaskWeekFocus
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.dates import user_today
from app.services.serialize import task_out


def copy_focus_forward(db: Session, workspace: Workspace, user: User, today: date) -> None:
    existing = (
        db.query(TaskFocus)
        .filter(
            TaskFocus.workspace_id == workspace.id,
            TaskFocus.user_id == user.id,
            TaskFocus.focus_on == today,
        )
        .count()
    )
    if existing:
        return
    yesterday = today - timedelta(days=1)
    previous = (
        db.query(TaskFocus)
        .filter(
            TaskFocus.workspace_id == workspace.id,
            TaskFocus.user_id == user.id,
            TaskFocus.focus_on == yesterday,
        )
        .order_by(TaskFocus.position)
        .all()
    )
    for pin in previous:
        task = db.get(Task, pin.task_id)
        if not task or task.archived_at or task.status == "done":
            continue
        db.add(
            TaskFocus(
                workspace_id=workspace.id,
                user_id=user.id,
                task_id=task.id,
                focus_on=today,
                position=pin.position,
            )
        )
    db.commit()


def list_focus(db: Session, workspace: Workspace, user: User, on: date | None) -> list[dict]:
    today = on or user_today(user.timezone)
    copy_focus_forward(db, workspace, user, today)
    pins = (
        db.query(TaskFocus)
        .filter(
            TaskFocus.workspace_id == workspace.id,
            TaskFocus.user_id == user.id,
            TaskFocus.focus_on == today,
        )
        .order_by(TaskFocus.position)
        .all()
    )
    out = []
    for pin in pins:
        task = db.get(Task, pin.task_id)
        if task and not task.archived_at:
            out.append(task_out(task, focused=True))
    return out


def put_focus(db: Session, workspace: Workspace, user: User, on: date, task_ids: list[UUID]) -> list[dict]:
    if len(task_ids) > 3:
        raise HTTPException(400, "Max 3 focus tasks")
    if len(set(task_ids)) != len(task_ids):
        raise HTTPException(400, "Duplicate focus")
    db.query(TaskFocus).filter(
        TaskFocus.workspace_id == workspace.id,
        TaskFocus.user_id == user.id,
        TaskFocus.focus_on == on,
    ).delete()
    for i, task_id in enumerate(task_ids, start=1):
        task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first()
        if not task or task.archived_at or task.status == "done":
            raise HTTPException(400, "Invalid focus task")
        if task.is_inbox:
            task.is_inbox = False
        db.add(
            TaskFocus(
                workspace_id=workspace.id,
                user_id=user.id,
                task_id=task.id,
                focus_on=on,
                position=i,
            )
        )
    db.commit()
    return list_focus(db, workspace, user, on)

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.phase2 import Notification
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.dates import user_today


def add_notification(
    db: Session,
    workspace_id: UUID,
    user_id: UUID,
    ntype: str,
    body: str,
    task_id: UUID | None = None,
    dedupe_day: bool = False,
) -> None:
    if user_id is None:
        return
    if dedupe_day:
        start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        exists = (
            db.query(Notification)
            .filter(
                Notification.workspace_id == workspace_id,
                Notification.user_id == user_id,
                Notification.type == ntype,
                Notification.task_id == task_id,
                Notification.created_at >= start,
            )
            .first()
        )
        if exists:
            return
    db.add(
        Notification(
            workspace_id=workspace_id,
            user_id=user_id,
            type=ntype,
            body=body,
            task_id=task_id,
        )
    )


def ensure_due_notifications(db: Session, workspace: Workspace, user: User) -> None:
    today = user_today(user.timezone)
    tomorrow = today + timedelta(days=1)
    q = db.query(Task).filter(
        Task.workspace_id == workspace.id,
        Task.archived_at.is_(None),
        Task.is_inbox.is_(False),
        Task.status != "done",
        Task.assignee_id == user.id,
    )
    for task in q.filter(Task.due_date == tomorrow).all():
        add_notification(
            db,
            workspace.id,
            user.id,
            "due_tomorrow",
            f"“{task.title}” is due tomorrow",
            task.id,
            dedupe_day=True,
        )
    for task in q.filter(Task.due_date < today).all():
        add_notification(
            db,
            workspace.id,
            user.id,
            "overdue",
            f"“{task.title}” is overdue",
            task.id,
            dedupe_day=True,
        )
    db.commit()

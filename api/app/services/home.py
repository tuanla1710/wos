from datetime import timedelta

from sqlalchemy.orm import Session

from app.models.focus import TaskWeekFocus
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.core.access import member_count
from app.models.phase2 import ActivityLog
from app.models.user import User as UserModel
from app.services.dates import greeting_word, next_monday, user_today, week_monday
from app.services.focus import copy_focus_forward, list_focus
from app.services.serialize import task_out


def _alive(q):
    return q.filter(Task.archived_at.is_(None), Task.is_inbox.is_(False), Task.status != "done", Task.parent_id.is_(None))


def suggestions(db: Session, workspace: Workspace, user: User, today) -> list[dict]:
    monday = week_monday(today)
    used: set = set()
    out: list = []

    def take(task: Task | None) -> None:
        if not task or task.id in used or task.archived_at or task.status == "done":
            return
        used.add(task.id)
        out.append(task_out(task))

    week_pins = (
        db.query(TaskWeekFocus)
        .filter(
            TaskWeekFocus.workspace_id == workspace.id,
            TaskWeekFocus.user_id == user.id,
            TaskWeekFocus.week_start == monday,
        )
        .order_by(TaskWeekFocus.position)
        .all()
    )
    for pin in week_pins:
        take(db.get(Task, pin.task_id))

    base = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.status != "done", Task.parent_id.is_(None))
    for task in base.filter(Task.is_inbox.is_(False), Task.due_date < today).order_by(Task.due_date).all():
        take(task)
        if len(out) >= 3:
            return out
    for task in base.filter(Task.is_inbox.is_(False), Task.due_date == today, Task.priority == "high").all():
        take(task)
        if len(out) >= 3:
            return out
    for task in base.filter(Task.is_inbox.is_(False), Task.due_date == today).all():
        take(task)
        if len(out) >= 3:
            return out
    for task in base.filter(Task.is_inbox.is_(False), Task.status == "in_progress").all():
        take(task)
        if len(out) >= 3:
            return out
    for task in base.filter(Task.is_inbox.is_(True)).order_by(Task.created_at.desc()).all():
        take(task)
        if len(out) >= 3:
            return out
    return out


def home_payload(db: Session, workspace: Workspace, user: User) -> dict:
    today = user_today(user.timezone)
    copy_focus_forward(db, workspace, user, today)
    focus = list_focus(db, workspace, user, today)
    q = db.query(Task).filter(Task.workspace_id == workspace.id)
    mine = _alive(q).filter(Task.assignee_id == user.id)
    overdue = mine.filter(Task.due_date < today).count()
    due_today = mine.filter(Task.due_date == today).count()
    upcoming = mine.filter(Task.due_date > today, Task.due_date <= today + timedelta(days=7)).count()
    inbox = q.filter(Task.archived_at.is_(None), Task.is_inbox.is_(True), Task.created_by == user.id).count()
    monday = week_monday(today)
    this_week = []
    for i in range(5):
        day = monday + timedelta(days=i)
        count = _alive(q).filter(Task.due_date == day).count()
        this_week.append({"date": day.isoformat(), "weekday": day.strftime("%a"), "count": count})
    return {
        "greeting": greeting_word(user.timezone),
        "name": user.name,
        "today": today.isoformat(),
        "counts": {"overdue": overdue, "due_today": due_today, "upcoming": upcoming, "inbox": inbox},
        "focus": focus,
        "suggestions": suggestions(db, workspace, user, today) if not focus else [],
        "this_week": this_week,
        "review_prompt": today.weekday() >= 4,
        "review_week_start": monday.isoformat(),
        "next_week_start": next_monday(today).isoformat(),
        "team_activity": _team_activity(db, workspace) if member_count(db, workspace) >= 2 else [],
        "member_count": member_count(db, workspace),
    }


def _team_activity(db: Session, workspace: Workspace) -> list[dict]:
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.workspace_id == workspace.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    out = []
    for row in rows:
        actor = db.get(UserModel, row.actor_id)
        out.append(
            {
                "id": str(row.id),
                "summary": row.summary,
                "verb": row.verb,
                "task_id": str(row.task_id) if row.task_id else None,
                "actor": actor.name if actor else "",
            }
        )
    return out

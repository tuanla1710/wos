from datetime import timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.activity import log_activity
from app.services.dates import user_today
from app.services.focus import put_focus
from app.services.home import suggestions
from app.services.serialize import task_out
from app.services.tasks import patch_task


def require_ai(user: User) -> None:
    if not user.ai_enabled:
        raise HTTPException(400, "AI is off. Enable it in Settings.")


def review_suggestions(db: Session, workspace: Workspace, user: User) -> dict:
    require_ai(user)
    today = user_today(user.timezone)
    q = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.assignee_id == user.id)
    overdue = q.filter(Task.is_inbox.is_(False), Task.due_date < today, Task.status != "done").all()
    blocked = q.filter(Task.status == "blocked").all()
    items = []
    for task in overdue[:5]:
        items.append({"kind": "reschedule", "task_id": str(task.id), "title": task.title, "reason": "Overdue — move to next week."})
    for task in blocked[:3]:
        items.append({"kind": "drop", "task_id": str(task.id), "title": task.title, "reason": "Blocked — drop or unblock."})
    summary = f"{len(overdue)} overdue, {len(blocked)} blocked this week."
    return {"summary": summary, "suggestions": items}


def priority_suggestion(db: Session, workspace: Workspace, user: User, task: Task) -> dict:
    require_ai(user)
    today = user_today(user.timezone)
    if task.due_date and task.due_date < today:
        return {"priority": "high", "reason": "Overdue work should be HIGH."}
    if task.status == "blocked":
        return {"priority": "medium", "reason": "Blocked work stays MEDIUM until unblocked."}
    if task.due_date and task.due_date == today:
        return {"priority": "high", "reason": "Due today."}
    return {"priority": "medium", "reason": "No due pressure — keep MEDIUM."}


def schedule_suggestions(db: Session, workspace: Workspace, user: User) -> list[dict]:
    require_ai(user)
    today = user_today(user.timezone)
    undated = (
        db.query(Task)
        .filter(
            Task.workspace_id == workspace.id,
            Task.assignee_id == user.id,
            Task.archived_at.is_(None),
            Task.status != "done",
            Task.is_inbox.is_(False),
            Task.due_date.is_(None),
        )
        .limit(5)
        .all()
    )
    monday = today + timedelta(days=(7 - today.weekday()) % 7 or 7)
    return [{"task_id": str(t.id), "title": t.title, "due_date": monday.isoformat(), "reason": "No due date — next Monday."} for t in undated]


def focus_suggestions(db: Session, workspace: Workspace, user: User) -> list[dict]:
    require_ai(user)
    today = user_today(user.timezone)
    return suggestions(db, workspace, user, today)[:3]


def project_summary(db: Session, workspace: Workspace, user: User, project_id: UUID) -> dict:
    require_ai(user)
    tasks = db.query(Task).filter(Task.workspace_id == workspace.id, Task.project_id == project_id, Task.archived_at.is_(None)).all()
    done = sum(1 for t in tasks if t.status == "done")
    blocked = [t.title for t in tasks if t.status == "blocked"]
    text = f"{done}/{len(tasks)} tasks done."
    if blocked:
        text += f" Blocked: {', '.join(blocked[:3])}."
    return {"summary": text}


def parse_quick_add(user: User, text: str) -> dict:
    require_ai(user)
    raw = text.strip()
    priority = "medium"
    lower = raw.lower()
    if "high" in lower:
        priority = "high"
        raw = raw.replace("high", "").replace("HIGH", "")
    if "low" in lower:
        priority = "low"
        raw = raw.replace("low", "").replace("LOW", "")
    due = None
    if "tomorrow" in lower:
        due = (user_today(user.timezone) + timedelta(days=1)).isoformat()
        raw = raw.replace("tomorrow", "")
    title = " ".join(raw.split())
    return {"title": title or text.strip(), "priority": priority, "due_date": due}


def apply_suggestion(db: Session, workspace: Workspace, user: User, kind: str, payload: dict) -> dict:
    require_ai(user)
    task_id = payload.get("task_id")
    task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first() if task_id else None
    if kind == "priority" and task:
        patch_task(db, workspace, task, {"priority": payload.get("priority", "medium")})
        log_activity(db, workspace.id, user.id, "ai_suggest", f"Applied AI priority on “{task.title}”", task.id, task.project_id, commit=True)
        return task_out(task)
    if kind == "reschedule" and task:
        from datetime import date as Date

        due = payload.get("due_date")
        patch_task(db, workspace, task, {"due_date": Date.fromisoformat(due)} if due else {})
        log_activity(db, workspace.id, user.id, "ai_suggest", f"Applied AI schedule on “{task.title}”", task.id, task.project_id, commit=True)
        return task_out(task)
    if kind == "drop" and task:
        from app.services.tasks import archive_task

        archive_task(db, task)
        log_activity(db, workspace.id, user.id, "ai_suggest", f"Applied AI drop on “{task.title}”", task.id, task.project_id, commit=True)
        return task_out(task)
    if kind == "focus":
        ids = [UUID(x) for x in payload.get("task_ids", [])]
        today = user_today(user.timezone)
        put_focus(db, workspace, user, today, ids)
        log_activity(db, workspace.id, user.id, "ai_suggest", "Applied AI focus", commit=True)
        return {"ok": True}
    raise HTTPException(400, "Unknown suggestion.")

from datetime import date, datetime, time, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.access import guest_project_ids, require_not_guest
from app.models.phase2 import CalendarEvent
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember


def event_out(event: CalendarEvent) -> dict:
    return {
        "id": str(event.id),
        "title": event.title,
        "event_date": event.event_date.isoformat(),
        "start_time": event.start_time.isoformat() if event.start_time else None,
        "end_time": event.end_time.isoformat() if event.end_time else None,
        "all_day": event.start_time is None,
        "project_id": str(event.project_id) if event.project_id else None,
        "task_id": str(event.task_id) if event.task_id else None,
    }


def list_events(
    db: Session,
    workspace: Workspace,
    member: WorkspaceMember,
    user: User,
    date_from: date,
    date_to: date,
    project_id: UUID | None,
) -> list[dict]:
    q = db.query(CalendarEvent).filter(
        CalendarEvent.workspace_id == workspace.id,
        CalendarEvent.event_date >= date_from,
        CalendarEvent.event_date <= date_to,
    )
    if project_id:
        q = q.filter(CalendarEvent.project_id == project_id)
    if member.role == "guest":
        allowed = guest_project_ids(db, user)
        q = q.filter(CalendarEvent.project_id.in_(list(allowed)))
    return [event_out(e) for e in q.all()]


def _times(start_time: time | None, end_time: time | None) -> tuple[time | None, time | None]:
    if start_time is None:
        if end_time is not None:
            raise HTTPException(400, "All-day events cannot have an end time.")
        return None, None
    if end_time is None or end_time <= start_time:
        raise HTTPException(400, "End time must be after start time on the same day.")
    return start_time, end_time


def create_event(
    db: Session,
    workspace: Workspace,
    member: WorkspaceMember,
    user: User,
    title: str,
    event_date: date,
    start_time: time | None,
    end_time: time | None,
    project_id: UUID | None,
    task_id: UUID | None,
) -> CalendarEvent:
    require_not_guest(member)
    title = title.strip()
    if not title or len(title) > 160:
        raise HTTPException(400, "Title can’t be empty.")
    start_time, end_time = _times(start_time, end_time)
    if project_id and not db.query(Project).filter(Project.id == project_id, Project.workspace_id == workspace.id).first():
        raise HTTPException(404, "Not found.")
    if task_id and not db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first():
        raise HTTPException(404, "Not found.")
    event = CalendarEvent(
        workspace_id=workspace.id,
        created_by=user.id,
        title=title,
        event_date=event_date,
        start_time=start_time,
        end_time=end_time,
        project_id=project_id,
        task_id=task_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_event(db: Session, workspace: Workspace, event_id: UUID) -> CalendarEvent:
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.workspace_id == workspace.id).first()
    if not event:
        raise HTTPException(404, "Not found.")
    return event


def patch_event(db: Session, member: WorkspaceMember, event: CalendarEvent, data: dict) -> CalendarEvent:
    require_not_guest(member)
    if data.get("title") is not None:
        title = data["title"].strip()
        if not title:
            raise HTTPException(400, "Title can’t be empty.")
        event.title = title
    if data.get("event_date") is not None:
        event.event_date = data["event_date"]
    start = data["start_time"] if "start_time" in data else event.start_time
    end = data["end_time"] if "end_time" in data else event.end_time
    if data.get("all_day"):
        start, end = None, None
    event.start_time, event.end_time = _times(start, end)
    if "project_id" in data:
        event.project_id = data["project_id"]
    if "task_id" in data:
        event.task_id = data["task_id"]
    event.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, member: WorkspaceMember, event: CalendarEvent) -> None:
    require_not_guest(member)
    db.delete(event)
    db.commit()

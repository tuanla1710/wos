from datetime import date, time
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import current_membership, current_user, current_workspace
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.common import EventIn
from app.services.events import create_event, delete_event, event_out, get_event, list_events, patch_event
from app.services.serialize import task_out

router = APIRouter(tags=["calendar"])


@router.get("/calendar")
def calendar(
    date_from: date = Query(alias="from"),
    date_to: date = Query(alias="to"),
    project_id: UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    q = db.query(Task).filter(
        Task.workspace_id == workspace.id,
        Task.archived_at.is_(None),
        Task.due_date.isnot(None),
        Task.due_date >= date_from,
        Task.due_date <= date_to,
    )
    if project_id:
        q = q.filter(Task.project_id == project_id)
    from app.core.access import guest_project_ids

    if member.role == "guest":
        q = q.filter(Task.project_id.in_(list(guest_project_ids(db, user))))
    return {
        "tasks": [task_out(t) for t in q.all()],
        "events": list_events(db, workspace, member, user, date_from, date_to, project_id),
    }


def _parse_time(value: str | None) -> time | None:
    if not value:
        return None
    parts = value.split(":")
    return time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)


@router.post("/events")
def create_event_route(
    body: EventIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    start = None if body.all_day else _parse_time(body.start_time)
    end = None if body.all_day else _parse_time(body.end_time)
    return event_out(create_event(db, workspace, member, user, body.title, body.event_date, start, end, body.project_id, body.task_id))


@router.patch("/events/{event_id}")
def patch_event_route(
    event_id: UUID,
    body: EventIn,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    event = get_event(db, workspace, event_id)
    data = body.model_dump()
    data["start_time"] = None if body.all_day else _parse_time(body.start_time)
    data["end_time"] = None if body.all_day else _parse_time(body.end_time)
    return event_out(patch_event(db, member, event, data))


@router.delete("/events/{event_id}")
def delete_event_route(
    event_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    delete_event(db, member, get_event(db, workspace, event_id))
    return {"ok": True}

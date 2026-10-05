from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.access import require_not_guest
from app.core.deps import current_membership, current_user, current_workspace
from app.models.workspace import WorkspaceMember
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.common import FocusPut
from app.services.dates import user_today
from app.services.focus import list_focus, put_focus

router = APIRouter(prefix="/focus", tags=["focus"])


@router.get("")
def get_focus_route(
    date_on: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return {"focus": list_focus(db, workspace, user, date_on)}


@router.put("")
def put_focus_route(
    body: FocusPut,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    on = body.date or user_today(user.timezone)
    return {"focus": put_focus(db, workspace, user, on, body.task_ids)}

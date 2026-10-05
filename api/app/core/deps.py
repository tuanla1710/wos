from uuid import UUID

from fastapi import Cookie, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import read_session
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember


def current_user(
    db: Session = Depends(get_db),
    session: str | None = Cookie(default=None, alias=settings.cookie_name),
) -> User:
    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = read_session(session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = db.get(User, UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


def current_membership(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
) -> WorkspaceMember:
    q = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id)
    if x_workspace_id:
        try:
            wid = UUID(x_workspace_id)
        except ValueError as exc:
            raise HTTPException(400, "Invalid workspace") from exc
        member = q.filter(WorkspaceMember.workspace_id == wid).first()
    else:
        member = q.first()
    if not member:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return member


def current_workspace(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
) -> Workspace:
    workspace = db.get(Workspace, member.workspace_id)
    if not workspace:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return workspace

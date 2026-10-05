from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.access import member_count, membership, require_roles
from app.core.deps import current_membership, current_user, current_workspace
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.common import MePatch, WorkspacePatch
from app.services.serialize import user_out

router = APIRouter(tags=["me"])


def _me(db, user: User, workspace: Workspace) -> dict:
    role = membership(db, workspace, user).role
    return user_out(user, workspace, role=role, member_count=member_count(db, workspace))


@router.get("/me")
def me(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return _me(db, user, workspace)


@router.patch("/me")
def patch_me(
    body: MePatch,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    if body.name:
        user.name = body.name.strip()
    if body.timezone:
        user.timezone = body.timezone
    if body.ai_enabled is not None:
        user.ai_enabled = body.ai_enabled
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return _me(db, user, workspace)


@router.patch("/workspace")
def patch_workspace(
    body: WorkspacePatch,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_roles(member, "owner", "admin")
    workspace.name = body.name.strip()
    workspace.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(workspace)
    return _me(db, user, workspace)

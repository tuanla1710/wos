from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.access import guest_project_ids, require_not_guest, require_roles
from app.core.deps import current_membership, current_user, current_workspace
from app.core.security import verify_password
from app.models.workspace import WorkspaceMember
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.common import ProjectCreate, ProjectDeleteIn, ProjectPatch
from app.services.projects import create_project, delete_project, get_project, list_projects, overview, patch_project
from app.services.serialize import project_out

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def list_projects_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    allowed = guest_project_ids(db, user) if member.role == "guest" else None
    return {"projects": list_projects(db, workspace, allowed)}


@router.post("")
def create_project_route(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    from app.services.serialize import holiday_dates

    project = create_project(db, workspace, body.name, body.parent_id, body.start_date, body.due_date)
    return project_out(project, holidays=holiday_dates(db, workspace.id))


@router.get("/{project_id}")
def get_project_route(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.core.access import can_see_project
    from fastapi import HTTPException

    project = get_project(db, workspace, project_id)
    if not can_see_project(db, member, project):
        raise HTTPException(404, "Not found.")
    from app.services.review import project_week_plan

    data = overview(db, workspace, user, project)
    data["week_plan"] = project_week_plan(db, workspace, user, project)
    return data


@router.patch("/{project_id}")
def patch_project_route(
    project_id: UUID,
    body: ProjectPatch,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.services.serialize import holiday_dates

    project = get_project(db, workspace, project_id)
    return project_out(patch_project(db, workspace, project, body.model_dump(exclude_unset=True)), holidays=holiday_dates(db, workspace.id))


@router.delete("/{project_id}")
def delete_project_route(
    project_id: UUID,
    body: ProjectDeleteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_roles(member, "owner", "admin")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(400, "Password is wrong.")
    project = get_project(db, workspace, project_id)
    delete_project(db, workspace, project, body.task_action)
    return {"ok": True}

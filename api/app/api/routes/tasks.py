from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.access import can_archive_task, can_delete_task, require_not_guest
from app.core.deps import current_membership, current_user, current_workspace
from app.models.workspace import WorkspaceMember
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.common import ChecklistCreate, ChecklistPatch, TaskCreate, TaskPatch
from app.services.serialize import checklist_out, task_out
from app.services.tasks import (
    add_checklist,
    archive_task,
    create_task,
    delete_checklist,
    delete_task,
    detail_out,
    get_task,
    list_tasks,
    move_inbox,
    move_my_tasks,
    patch_checklist,
    patch_task,
    unarchive_task,
)

router = APIRouter(tags=["tasks"])


@router.get("/tasks")
def list_tasks_route(
    tab: str | None = Query(default="all"),
    project_id: UUID | None = None,
    priority: str | None = None,
    status: str | None = None,
    assignee_id: UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    if member.role == "guest" and tab == "inbox":
        from fastapi import HTTPException

        raise HTTPException(403, "Not allowed.")
    return {"tasks": list_tasks(db, workspace, user, tab, project_id, priority, status, assignee_id, member)}


@router.post("/tasks")
def create_task_route(
    body: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    task = create_task(
        db,
        workspace,
        user,
        body.title,
        body.project_id,
        body.due_date,
        body.priority,
        body.assignee_id,
        body.parent_id,
        body.start_date,
    )
    from app.services.serialize import holiday_dates

    return task_out(task, holidays=holiday_dates(db, workspace.id))


@router.get("/tasks/{task_id}")
def get_task_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.core.access import require_see_task

    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    return detail_out(db, task, user)


@router.patch("/tasks/{task_id}")
def patch_task_route(
    task_id: UUID,
    body: TaskPatch,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    task = get_task(db, workspace, task_id)
    data = body.model_dump(exclude_unset=True)
    data["_actor_id"] = user.id
    tags = data.pop("tags", None)
    task = patch_task(db, workspace, task, data)
    if tags is not None:
        from app.services.social import set_task_tags

        set_task_tags(db, workspace, task, tags)
    from app.services.serialize import holiday_dates

    return task_out(task, holidays=holiday_dates(db, workspace.id))


@router.delete("/tasks/{task_id}")
def delete_task_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    if not can_delete_task(member, task, user):
        from fastapi import HTTPException

        raise HTTPException(403, "Not allowed.")
    delete_task(db, task)
    return {"ok": True}


@router.post("/tasks/{task_id}/archive")
def archive_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from fastapi import HTTPException

    task = get_task(db, workspace, task_id)
    if not can_archive_task(member, task, user):
        raise HTTPException(403, "Not allowed.")
    return task_out(archive_task(db, task))


@router.post("/tasks/{task_id}/unarchive")
def unarchive_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return task_out(unarchive_task(db, get_task(db, workspace, task_id)))


@router.post("/tasks/{task_id}/move-inbox")
def move_inbox_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return task_out(move_inbox(db, get_task(db, workspace, task_id)))


@router.post("/tasks/{task_id}/move-my-tasks")
def move_my_tasks_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return task_out(move_my_tasks(db, get_task(db, workspace, task_id)))


@router.post("/tasks/{task_id}/checklist")
def add_checklist_route(
    task_id: UUID,
    body: ChecklistCreate,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    return checklist_out(add_checklist(db, task, body.title))


@router.patch("/checklist/{item_id}")
def patch_checklist_route(
    item_id: UUID,
    body: ChecklistPatch,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return checklist_out(patch_checklist(db, workspace, item_id, body.model_dump(exclude_unset=True)))


@router.delete("/checklist/{item_id}")
def delete_checklist_route(
    item_id: UUID,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    delete_checklist(db, workspace, item_id)
    return {"ok": True}

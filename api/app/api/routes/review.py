from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.access import require_not_guest
from app.core.deps import current_membership, current_user, current_workspace
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.common import ProjectWeekTargetPut, ReviewReschedule, ReviewTaskId, WeekFocusPut, WeekTargetPut
from app.services.review import put_project_week_target, put_week_focus, put_week_target, review_payload
from app.services.review_export import build_review_pptx
from app.services.serialize import task_out
from app.services.tasks import archive_task, get_task, patch_task

router = APIRouter(prefix="/review", tags=["review"])


@router.get("")
def review(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return review_payload(db, workspace, user, week_start)


@router.get("/export")
def export_review(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> Response:
    payload, filename = build_review_pptx(db, workspace, user, week_start)
    return Response(
        content=payload,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/reschedule")
def reschedule(
    body: ReviewReschedule,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, body.task_id)
    task = patch_task(db, workspace, task, {"due_date": body.due_date})
    return task_out(task)


@router.post("/drop")
def drop(
    body: ReviewTaskId,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, body.task_id)
    return task_out(archive_task(db, task))


@router.post("/unblock")
def unblock(
    body: ReviewTaskId,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, body.task_id)
    task = patch_task(db, workspace, task, {"status": "todo", "blocked_reason": ""})
    return task_out(task)


@router.put("/week-target")
def week_target(
    body: WeekTargetPut,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return put_week_target(db, workspace, body.task_id, body.week_start, body.target_progress, body.actual_progress)


@router.put("/project-week-target")
def project_week_target(
    body: ProjectWeekTargetPut,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return put_project_week_target(db, workspace, body.project_id, body.week_start, body.target_progress, body.actual_progress)


@router.put("/week-focus")
def week_focus(
    body: WeekFocusPut,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return {"week_focus": put_week_focus(db, workspace, user, body.week_start, body.task_ids)}

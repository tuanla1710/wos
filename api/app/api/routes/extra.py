from datetime import date as Date
from uuid import UUID

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.access import member_count, require_not_guest, require_roles, require_see_task
from app.core.deps import current_membership, current_user, current_workspace
from app.db.session import get_db
from app.models.phase2 import ActivityLog, Notification
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceHoliday, WorkspaceMember
from app.schemas.common import (
    AiApplyIn,
    CommentIn,
    HolidayIn,
    HolidaySettingsIn,
    InviteIn,
    LinkIn,
    LinkPatch,
    NoteFlagIn,
    NoteIn,
    RoleIn,
    TagIn,
    TokenIn,
    TransferIn,
    WorkspaceCreate,
    WorkspaceDeleteIn,
)
from app.services import ai as ai_svc
from app.services.billing import billing_out, cancel_subscription, fail_payment, subscribe_team
from app.services.notes import (
    create_note,
    delete_note,
    delete_note_file,
    duplicate_note,
    get_note,
    list_notes,
    note_activity,
    note_file_path,
    note_out,
    patch_note,
    save_note_file,
    set_archived,
    set_pinned,
    set_starred,
)
from app.services.notify import ensure_due_notifications
from app.services.public_holidays import effective_country, holidays_between
from app.services.public_holidays import is_supported as is_supported_country
from app.services.public_holidays import settings_out as holiday_settings_out
from app.services.serialize import holiday_out, project_out, task_out
from app.services.social import (
    add_comment,
    delete_attachment,
    delete_comment,
    list_comments,
    list_project_files,
    list_task_files,
    patch_comment,
    save_attachment,
    set_task_tags,
    task_tag_names,
    upsert_tag,
)
from app.services.links import create_link, delete_link, get_link, list_links, patch_link
from app.services.tasks import get_task
from app.services.projects import get_project as get_project_row
from app.services.team import (
    accept_invite,
    change_role,
    create_invite,
    create_workspace,
    delete_workspace,
    list_invites,
    list_members,
    list_workspaces,
    mentionable,
    remove_member,
    revoke_invite,
    team_payload,
    transfer_owner,
)
from app.services.statistics import workspace_statistics
from app.services.tokens import create_token, list_tokens, resolve_token, revoke_token
from app.models.phase2 import Tag
from app.models.project import Project

router = APIRouter()


@router.get("/workspace/members")
def members_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return {"members": list_members(db, workspace), "invites": list_invites(db, workspace), "solo": member_count(db, workspace) < 2}


@router.get("/workspace/holidays")
def list_holidays_route(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    rows = (
        db.query(WorkspaceHoliday)
        .filter(WorkspaceHoliday.workspace_id == workspace.id)
        .order_by(WorkspaceHoliday.day)
        .all()
    )
    return {"holidays": [holiday_out(row) for row in rows]}


@router.post("/workspace/holidays")
def add_holiday_route(
    body: HolidayIn,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    existing = (
        db.query(WorkspaceHoliday)
        .filter(WorkspaceHoliday.workspace_id == workspace.id, WorkspaceHoliday.day == body.day)
        .first()
    )
    if existing:
        existing.name = body.name.strip()
        db.commit()
        db.refresh(existing)
        return holiday_out(existing)
    row = WorkspaceHoliday(workspace_id=workspace.id, day=body.day, name=body.name.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    return holiday_out(row)


@router.delete("/workspace/holidays/{holiday_id}")
def delete_holiday_route(
    holiday_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    row = (
        db.query(WorkspaceHoliday)
        .filter(WorkspaceHoliday.id == holiday_id, WorkspaceHoliday.workspace_id == workspace.id)
        .first()
    )
    if not row:
        raise HTTPException(404, "Not found.")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/holidays")
def public_holidays_route(
    from_: Date = Query(alias="from"),
    to: Date = Query(),
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    if to < from_ or (to - from_).days > 1500:
        raise HTTPException(400, "Range must be 0–1500 days.")
    return {"country": effective_country(db, workspace), "holidays": holidays_between(db, workspace, from_, to)}


@router.get("/holidays/settings")
def holiday_settings_route(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return holiday_settings_out(db, workspace)


@router.patch("/holidays/settings")
def patch_holiday_settings_route(
    body: HolidaySettingsIn,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    fields = body.model_fields_set
    for name in ("country", "country2"):
        if name in fields:
            value = (getattr(body, name) or "").upper() if getattr(body, name) is not None else None
            if value and not is_supported_country(value):
                raise HTTPException(400, "Country not supported.")
            setattr(workspace, f"holiday_{name}", value)
    skips = set(workspace.holiday_skips or [])
    if body.skip:
        skips.add(body.skip)
    if body.unskip:
        skips.discard(body.unskip)
    workspace.holiday_skips = sorted(skips)
    db.commit()
    db.refresh(workspace)
    return holiday_settings_out(db, workspace)


@router.post("/workspace/invites")
def invite_route(
    body: InviteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return create_invite(db, workspace, user, member, str(body.email), body.role, body.project_ids)


@router.delete("/workspace/invites/{invite_id}")
def revoke_invite_route(
    invite_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    revoke_invite(db, workspace, member, invite_id)
    return {"ok": True}


@router.post("/invites/{token}/accept")
def accept_invite_route(token: str, db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    return accept_invite(db, user, token)


@router.delete("/workspace/members/{user_id}")
def remove_member_route(
    user_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    remove_member(db, workspace, member, user, user_id)
    return {"ok": True}


@router.patch("/workspace/members/{user_id}")
def role_route(
    user_id: UUID,
    body: RoleIn,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    change_role(db, workspace, member, user_id, body.role)
    return {"ok": True}


@router.post("/workspace/transfer")
def transfer_route(
    body: TransferIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    transfer_owner(db, workspace, user, body.user_id)
    return {"ok": True}


@router.get("/workspaces")
def workspaces_route(db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    return {"workspaces": list_workspaces(db, user)}


@router.post("/workspaces")
def create_workspace_route(
    body: WorkspaceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    ws = create_workspace(db, user, body.name)
    return {"id": str(ws.id), "name": ws.name}


@router.delete("/workspaces/{workspace_id}")
def delete_workspace_route(
    workspace_id: UUID,
    body: WorkspaceDeleteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    if workspace.id != workspace_id:
        raise HTTPException(400, "Switch to the workspace first.")
    delete_workspace(db, workspace, user, body.confirm_name)
    return {"ok": True}


@router.get("/team")
def team_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return team_payload(db, workspace)


@router.get("/tasks/{task_id}/comments")
def list_comments_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    return {"comments": list_comments(db, task), "mentionable": mentionable(db, workspace, member, task)}


@router.post("/tasks/{task_id}/comments")
def add_comment_route(
    task_id: UUID,
    body: CommentIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return add_comment(db, workspace, member, user, get_task(db, workspace, task_id), body.body)


@router.patch("/comments/{comment_id}")
def patch_comment_route(
    comment_id: UUID,
    body: CommentIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
) -> dict:
    return patch_comment(db, member, user, comment_id, body.body)


@router.delete("/comments/{comment_id}")
def delete_comment_route(
    comment_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
) -> dict:
    delete_comment(db, member, user, comment_id)
    return {"ok": True}


@router.get("/notifications")
def notifications_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    ensure_due_notifications(db, workspace, user)
    rows = (
        db.query(Notification)
        .filter(Notification.workspace_id == workspace.id, Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return {
        "unread": sum(1 for r in rows if r.read_at is None),
        "notifications": [
            {
                "id": str(r.id),
                "type": r.type,
                "body": r.body,
                "task_id": str(r.task_id) if r.task_id else None,
                "read": bool(r.read_at),
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
    }


@router.post("/notifications/read-all")
def read_all_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from datetime import datetime, timezone

    db.query(Notification).filter(
        Notification.workspace_id == workspace.id,
        Notification.user_id == user.id,
        Notification.read_at.is_(None),
    ).update({"read_at": datetime.now(timezone.utc)})
    db.commit()
    return {"ok": True}


@router.post("/notifications/{note_id}/read")
def read_one_route(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    from datetime import datetime, timezone

    row = db.get(Notification, note_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found.")
    row.read_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


@router.get("/notes")
def notes_route(
    project_id: UUID | None = None,
    task_id: UUID | None = None,
    q: str | None = None,
    filter: str = "all",
    kind: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return {"notes": list_notes(db, workspace, member, user, project_id, task_id, q, filter, kind)}


@router.post("/notes")
def create_note_route(
    body: NoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    note = create_note(db, workspace, member, user, body.title, body.body, body.project_id, body.task_id, body.kind, body.tags)
    return note_out(db, note, user, detail=True)


@router.get("/notes/{note_id}")
def get_note_route(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return note_out(db, get_note(db, workspace, note_id, member, user), user, detail=True)


@router.patch("/notes/{note_id}")
def patch_note_route(
    note_id: UUID,
    body: NoteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    note = patch_note(db, workspace, member, user, get_note(db, workspace, note_id, member, user), body.model_dump(exclude_unset=True))
    return note_out(db, note, user, detail=True)


@router.delete("/notes/{note_id}")
def delete_note_route(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    delete_note(db, member, user, get_note(db, workspace, note_id, member, user))
    return {"ok": True}


@router.post("/notes/{note_id}/duplicate")
def duplicate_note_route(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return note_out(db, duplicate_note(db, workspace, member, user, get_note(db, workspace, note_id, member, user)), user, detail=True)


@router.post("/notes/{note_id}/pin")
def pin_note_route(
    note_id: UUID,
    body: NoteFlagIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return note_out(db, set_pinned(db, member, user, get_note(db, workspace, note_id, member, user), bool(body.pinned)), user, detail=True)


@router.post("/notes/{note_id}/star")
def star_note_route(
    note_id: UUID,
    body: NoteFlagIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return note_out(db, set_starred(db, user, get_note(db, workspace, note_id, member, user), bool(body.starred)), user, detail=True)


@router.post("/notes/{note_id}/archive")
def archive_note_route(
    note_id: UUID,
    body: NoteFlagIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return note_out(db, set_archived(db, member, user, get_note(db, workspace, note_id, member, user), bool(body.archived)), user, detail=True)


@router.post("/notes/{note_id}/attachments")
def upload_note_file_route(
    note_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return save_note_file(db, workspace, member, user, get_note(db, workspace, note_id, member, user), file)


@router.get("/notes/{note_id}/attachments/{file_id}")
def download_note_file_route(
    note_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> FileResponse:
    row, path = note_file_path(db, get_note(db, workspace, note_id, member, user), file_id)
    return FileResponse(path, filename=row.filename, media_type=row.content_type)


@router.delete("/notes/{note_id}/attachments/{file_id}")
def delete_note_file_route(
    note_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    delete_note_file(db, member, user, get_note(db, workspace, note_id, member, user), file_id)
    return {"ok": True}


@router.get("/notes/{note_id}/activity")
def note_activity_route(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return {"activity": note_activity(db, get_note(db, workspace, note_id, member, user))}


@router.post("/tasks/{task_id}/attachments")
def upload_route(
    task_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return save_attachment(db, workspace, member, user, get_task(db, workspace, task_id), file)


@router.get("/tasks/{task_id}/attachments")
def list_task_files_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    return {"files": list_task_files(db, task.id)}


@router.delete("/attachments/{item_id}")
def delete_file_route(
    item_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
) -> dict:
    delete_attachment(db, member, user, item_id)
    return {"ok": True}


@router.get("/projects/{project_id}/files")
def project_files_route(
    project_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.core.access import can_see_project
    from app.services.projects import get_project

    project = get_project(db, workspace, project_id)
    if not can_see_project(db, member, project):
        raise HTTPException(404, "Not found.")
    return {"files": list_project_files(db, workspace, project_id)}


@router.get("/projects/{project_id}/activity")
def project_activity_route(
    project_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.core.access import can_see_project
    from app.services.projects import get_project

    project = get_project(db, workspace, project_id)
    if not can_see_project(db, member, project):
        raise HTTPException(404, "Not found.")
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.workspace_id == workspace.id, ActivityLog.project_id == project_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
        .all()
    )
    return {"activity": [{"id": str(r.id), "summary": r.summary, "verb": r.verb, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]}


@router.get("/tasks/{task_id}/activity")
def task_activity_route(
    task_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.workspace_id == workspace.id, ActivityLog.task_id == task_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
        .all()
    )
    return {"activity": [{"id": str(r.id), "summary": r.summary, "verb": r.verb, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]}


@router.get("/tasks/{task_id}/links")
def list_task_links(
    task_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    return {"links": list_links(db, task_id=task.id)}


@router.post("/tasks/{task_id}/links")
def create_task_link(
    task_id: UUID,
    body: LinkIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    task = get_task(db, workspace, task_id)
    require_see_task(db, member, task)
    return create_link(db, workspace, user, body.title, body.url, task_id=task.id)


@router.get("/projects/{project_id}/links")
def list_project_links(
    project_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    from app.core.access import can_see_project

    project = get_project_row(db, workspace, project_id)
    if not can_see_project(db, member, project):
        raise HTTPException(404, "Not found.")
    return {"links": list_links(db, project_id=project.id)}


@router.post("/projects/{project_id}/links")
def create_project_link(
    project_id: UUID,
    body: LinkIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    from app.core.access import can_see_project

    project = get_project_row(db, workspace, project_id)
    if not can_see_project(db, member, project):
        raise HTTPException(404, "Not found.")
    return create_link(db, workspace, user, body.title, body.url, project_id=project.id)


@router.patch("/links/{link_id}")
def patch_link_route(
    link_id: UUID,
    body: LinkPatch,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    return patch_link(db, get_link(db, workspace, link_id), body.title, body.url)


@router.delete("/links/{link_id}")
def delete_link_route(
    link_id: UUID,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_not_guest(member)
    delete_link(db, get_link(db, workspace, link_id))
    return {"ok": True}


@router.get("/tags")
def tags_route(db: Session = Depends(get_db), workspace: Workspace = Depends(current_workspace)) -> dict:
    rows = db.query(Tag).filter(Tag.workspace_id == workspace.id).order_by(Tag.name).all()
    return {"tags": [{"id": str(t.id), "name": t.name} for t in rows]}


@router.post("/tags")
def create_tag_route(
    body: TagIn,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    tag = upsert_tag(db, workspace, body.name)
    return {"id": str(tag.id), "name": tag.name}


@router.get("/billing")
def billing_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_roles(member, "owner")
    return billing_out(db, workspace)


@router.post("/billing/subscribe")
def subscribe_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    subscribe_team(db, workspace, user)
    return billing_out(db, workspace)


@router.post("/billing/cancel")
def cancel_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    cancel_subscription(db, workspace, user)
    return billing_out(db, workspace)


@router.post("/billing/fail")
def fail_route(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    fail_payment(db, workspace)
    return billing_out(db, workspace)


@router.get("/statistics")
def statistics_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
    user: User = Depends(current_user),
) -> dict:
    return workspace_statistics(db, workspace, member, user)


@router.get("/analytics")
def analytics_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    require_roles(member, "owner")
    from datetime import datetime, timedelta, timezone

    week = datetime.now(timezone.utc) - timedelta(days=7)
    created = db.query(Task).filter(Task.workspace_id == workspace.id, Task.created_at >= week).count()
    done = db.query(Task).filter(Task.workspace_id == workspace.id, Task.completed_at >= week).count()
    overdue = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.status != "done", Task.due_date.isnot(None)).count()
    active = (
        db.query(ActivityLog.actor_id)
        .filter(ActivityLog.workspace_id == workspace.id, ActivityLog.created_at >= week)
        .distinct()
        .count()
    )
    return {"created": created, "completed": done, "overdue": overdue, "active_members": active}


@router.get("/api-tokens")
def tokens_route(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return {"tokens": list_tokens(db, workspace)}


@router.post("/api-tokens")
def create_token_route(
    body: TokenIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return create_token(db, workspace, user, body.name)


@router.delete("/api-tokens/{token_id}")
def revoke_token_route(
    token_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    revoke_token(db, workspace, user, token_id)
    return {"ok": True}


@router.get("/public/tasks")
def public_tasks(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    workspace, _ = resolve_token(db, authorization.split(" ", 1)[1])
    tasks = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None)).limit(100).all()
    return {"tasks": [task_out(t) for t in tasks]}


@router.get("/public/projects")
def public_projects(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")
    workspace, _ = resolve_token(db, authorization.split(" ", 1)[1])
    rows = db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None)).all()
    return {"projects": [project_out(p) for p in rows]}


@router.get("/ai/review")
def ai_review(db: Session = Depends(get_db), user: User = Depends(current_user), workspace: Workspace = Depends(current_workspace)) -> dict:
    return ai_svc.review_suggestions(db, workspace, user)


@router.get("/ai/priority/{task_id}")
def ai_priority(task_id: UUID, db: Session = Depends(get_db), user: User = Depends(current_user), workspace: Workspace = Depends(current_workspace)) -> dict:
    return ai_svc.priority_suggestion(db, workspace, user, get_task(db, workspace, task_id))


@router.get("/ai/schedule")
def ai_schedule(db: Session = Depends(get_db), user: User = Depends(current_user), workspace: Workspace = Depends(current_workspace)) -> dict:
    return {"suggestions": ai_svc.schedule_suggestions(db, workspace, user)}


@router.get("/ai/focus")
def ai_focus(db: Session = Depends(get_db), user: User = Depends(current_user), workspace: Workspace = Depends(current_workspace)) -> dict:
    return {"suggestions": ai_svc.focus_suggestions(db, workspace, user)}


@router.get("/ai/project/{project_id}")
def ai_project(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(current_user), workspace: Workspace = Depends(current_workspace)) -> dict:
    return ai_svc.project_summary(db, workspace, user, project_id)


@router.post("/ai/parse")
def ai_parse(body: dict, user: User = Depends(current_user)) -> dict:
    return ai_svc.parse_quick_add(user, body.get("text", ""))


@router.post("/ai/apply")
def ai_apply(
    body: AiApplyIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return ai_svc.apply_suggestion(db, workspace, user, body.kind, body.payload)

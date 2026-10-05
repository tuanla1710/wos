import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.access import guest_project_ids, member_count, require_roles
from app.models.focus import TaskFocus, TaskWeekFocus
from app.models.phase2 import InviteProject, ProjectMember, WorkspaceInvite
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.billing import assert_can_create_workspace, assert_can_invite, ensure_subscription
from app.services.notify import add_notification
from app.services.serialize import user_out


def list_members(db: Session, workspace: Workspace) -> list[dict]:
    rows = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).all()
    out = []
    for row in rows:
        user = db.get(User, row.user_id)
        if user:
            out.append({"id": str(user.id), "name": user.name, "email": user.email, "role": row.role})
    return out


def create_invite(
    db: Session,
    workspace: Workspace,
    actor: User,
    member: WorkspaceMember,
    email: str,
    role: str,
    project_ids: list[UUID],
) -> dict:
    require_roles(member, "owner", "admin")
    if role not in {"admin", "member", "guest"}:
        raise HTTPException(400, "Invalid role")
    if role == "admin" and member.role != "owner" and False:
        pass
    email = email.strip().lower()
    existing = (
        db.query(WorkspaceMember)
        .join(User, User.id == WorkspaceMember.user_id)
        .filter(WorkspaceMember.workspace_id == workspace.id, User.email == email)
        .first()
    )
    if existing:
        raise HTTPException(400, "Email is already a member.")
    pending = (
        db.query(WorkspaceInvite)
        .filter(
            WorkspaceInvite.workspace_id == workspace.id,
            WorkspaceInvite.email == email,
            WorkspaceInvite.accepted_at.is_(None),
            WorkspaceInvite.revoked_at.is_(None),
            WorkspaceInvite.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if pending:
        raise HTTPException(400, "Email is already a member.")
    assert_can_invite(db, workspace, role)
    if role == "guest" and not project_ids:
        raise HTTPException(400, "Guest invite needs a project.")
    invite = WorkspaceInvite(
        workspace_id=workspace.id,
        email=email,
        role=role,
        token=secrets.token_urlsafe(24),
        created_by=actor.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    db.flush()
    for pid in project_ids:
        project = db.query(Project).filter(Project.id == pid, Project.workspace_id == workspace.id).first()
        if not project:
            raise HTTPException(404, "Not found.")
        db.add(InviteProject(invite_id=invite.id, project_id=project.id))
    db.commit()
    db.refresh(invite)
    return invite_out(invite)


def invite_out(invite: WorkspaceInvite) -> dict:
    return {
        "id": str(invite.id),
        "email": invite.email,
        "role": invite.role,
        "token": invite.token,
        "url": f"/invite/{invite.token}",
        "expires_at": invite.expires_at.isoformat(),
        "accepted_at": invite.accepted_at.isoformat() if invite.accepted_at else None,
        "revoked_at": invite.revoked_at.isoformat() if invite.revoked_at else None,
    }


def list_invites(db: Session, workspace: Workspace) -> list[dict]:
    rows = (
        db.query(WorkspaceInvite)
        .filter(WorkspaceInvite.workspace_id == workspace.id, WorkspaceInvite.accepted_at.is_(None), WorkspaceInvite.revoked_at.is_(None))
        .all()
    )
    return [invite_out(r) for r in rows]


def revoke_invite(db: Session, workspace: Workspace, member: WorkspaceMember, invite_id: UUID) -> None:
    require_roles(member, "owner", "admin")
    invite = db.query(WorkspaceInvite).filter(WorkspaceInvite.id == invite_id, WorkspaceInvite.workspace_id == workspace.id).first()
    if not invite:
        raise HTTPException(404, "Not found.")
    invite.revoked_at = datetime.now(timezone.utc)
    db.commit()


def accept_invite(db: Session, user: User, token: str) -> dict:
    invite = db.query(WorkspaceInvite).filter(WorkspaceInvite.token == token).first()
    if not invite:
        raise HTTPException(404, "Not found.")
    now = datetime.now(timezone.utc)
    if invite.revoked_at or invite.accepted_at:
        raise HTTPException(410, "Invite expired.")
    if invite.expires_at < now:
        raise HTTPException(410, "Invite expired.")
    if user.email.lower() != str(invite.email).lower():
        raise HTTPException(400, "Invite email does not match this account.")
    if db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == invite.workspace_id, WorkspaceMember.user_id == user.id).first():
        raise HTTPException(400, "Email is already a member.")
    workspace = db.get(Workspace, invite.workspace_id)
    if not workspace:
        raise HTTPException(404, "Not found.")
    assert_can_invite(db, workspace, invite.role)
    db.add(WorkspaceMember(workspace_id=invite.workspace_id, user_id=user.id, role=invite.role))
    if invite.role == "guest":
        for link in db.query(InviteProject).filter(InviteProject.invite_id == invite.id):
            if not db.query(ProjectMember).filter(ProjectMember.project_id == link.project_id, ProjectMember.user_id == user.id).first():
                db.add(ProjectMember(project_id=link.project_id, user_id=user.id))
    invite.accepted_at = now
    db.commit()
    return user_out(user, workspace)


def remove_member(db: Session, workspace: Workspace, actor: WorkspaceMember, actor_user: User, target_id: UUID) -> None:
    target = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == target_id)
        .first()
    )
    if not target:
        raise HTTPException(404, "Not found.")
    leaving = actor_user.id == target_id
    if leaving:
        if target.role == "owner":
            raise HTTPException(400, "Transfer ownership before leaving.")
    else:
        require_roles(actor, "owner", "admin")
        if target.role == "owner":
            raise HTTPException(403, "Not allowed.")
    owner = db.get(User, workspace.owner_id)
    for task in db.query(Task).filter(Task.workspace_id == workspace.id, Task.assignee_id == target_id):
        task.assignee_id = workspace.owner_id
        if owner:
            add_notification(db, workspace.id, owner.id, "assigned", f"Reassigned “{task.title}” to you", task.id)
    db.query(TaskFocus).filter(TaskFocus.workspace_id == workspace.id, TaskFocus.user_id == target_id).delete()
    db.query(TaskWeekFocus).filter(TaskWeekFocus.workspace_id == workspace.id, TaskWeekFocus.user_id == target_id).delete()
    db.delete(target)
    db.commit()


def change_role(db: Session, workspace: Workspace, actor: WorkspaceMember, target_id: UUID, role: str) -> None:
    require_roles(actor, "owner", "admin")
    if role not in {"admin", "member", "guest"}:
        raise HTTPException(400, "Invalid role")
    target = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == target_id)
        .first()
    )
    if not target:
        raise HTTPException(404, "Not found.")
    if target.role == "owner":
        raise HTTPException(400, "Last Owner cannot be demoted.")
    if actor.role == "admin" and target.role == "owner":
        raise HTTPException(403, "Not allowed.")
    owners = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.role == "owner").count()
    if target.role == "owner" and owners <= 1:
        raise HTTPException(400, "Last Owner cannot be demoted.")
    target.role = role
    db.commit()


def transfer_owner(db: Session, workspace: Workspace, actor: User, target_id: UUID) -> None:
    if workspace.owner_id != actor.id:
        raise HTTPException(403, "Not allowed.")
    target = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == target_id)
        .first()
    )
    if not target or target.role == "guest":
        raise HTTPException(400, "Invalid member")
    current = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == actor.id)
        .first()
    )
    if current:
        current.role = "admin"
    target.role = "owner"
    workspace.owner_id = target_id
    db.commit()


def create_workspace(db: Session, user: User, name: str) -> Workspace:
    name = name.strip()
    if not name:
        raise HTTPException(400, "Workspace name can’t be empty.")
    assert_can_create_workspace(db, user)
    workspace = Workspace(name=name, owner_id=user.id)
    db.add(workspace)
    db.flush()
    db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role="owner"))
    ensure_subscription(db, workspace, "free")
    db.commit()
    db.refresh(workspace)
    return workspace


def delete_workspace(db: Session, workspace: Workspace, user: User, confirm_name: str) -> None:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    if confirm_name.strip() != workspace.name:
        raise HTTPException(400, "Type the workspace name to confirm.")
    db.delete(workspace)
    db.commit()


def list_workspaces(db: Session, user: User) -> list[dict]:
    rows = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).all()
    out = []
    for row in rows:
        ws = db.get(Workspace, row.workspace_id)
        if ws:
            out.append({"id": str(ws.id), "name": ws.name, "role": row.role})
    return out


def team_payload(db: Session, workspace: Workspace) -> dict:
    members = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.role != "guest")
        .all()
    )
    people = []
    blocked = []
    max_open = 1
    for row in members:
        user = db.get(User, row.user_id)
        if not user:
            continue
        q = db.query(Task).filter(Task.workspace_id == workspace.id, Task.assignee_id == user.id, Task.archived_at.is_(None), Task.is_inbox.is_(False))
        open_n = q.filter(Task.status != "done").count()
        done_n = q.filter(Task.status == "done").count()
        progress = round((done_n / (done_n + open_n)) * 100) if (done_n + open_n) else None
        people.append({"id": str(user.id), "name": user.name, "open": open_n, "progress": progress})
        max_open = max(max_open, open_n)
        for task in q.filter(Task.status == "blocked").all():
            blocked.append({"user": user.name, "task_id": str(task.id), "title": task.title, "blocked_reason": task.blocked_reason})
    people.sort(key=lambda p: p["open"], reverse=True)
    for p in people:
        p["bar"] = round((p["open"] / max_open) * 100)
    return {"members": people, "blocked": blocked, "solo": member_count(db, workspace) < 2}


def mentionable(db: Session, workspace: Workspace, actor: WorkspaceMember, task: Task) -> list[dict]:
    rows = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).all()
    guests = guest_project_ids(db, db.get(User, actor.user_id)) if actor.role == "guest" else None
    out = []
    for row in rows:
        if row.role == "guest" and (not task.project_id or task.project_id not in guest_project_ids(db, db.get(User, row.user_id))):
            continue
        if guests is not None and row.role == "guest":
            continue
        user = db.get(User, row.user_id)
        if user:
            out.append({"id": str(user.id), "name": user.name})
    return out

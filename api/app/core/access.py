from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.phase2 import ProjectMember
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember

STAFF = {"owner", "admin", "member"}


def membership(db: Session, workspace: Workspace, user: User) -> WorkspaceMember:
    row = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == user.id)
        .first()
    )
    if not row:
        raise HTTPException(401, "Unauthorized")
    return row


def require_roles(member: WorkspaceMember, *roles: str) -> None:
    if member.role not in roles:
        raise HTTPException(403, "Not allowed.")


def guest_project_ids(db: Session, user: User) -> set[UUID]:
    return {row.project_id for row in db.query(ProjectMember).filter(ProjectMember.user_id == user.id)}


def can_see_project(db: Session, member: WorkspaceMember, project: Project | None) -> bool:
    if member.role != "guest":
        return True
    if not project:
        return False
    return project.id in guest_project_ids(db, db.get(User, member.user_id))


def can_see_task(db: Session, member: WorkspaceMember, task: Task) -> bool:
    if member.role != "guest":
        return True
    return bool(task.project_id) and task.project_id in guest_project_ids(db, db.get(User, member.user_id))


def require_see_task(db: Session, member: WorkspaceMember, task: Task) -> None:
    if not can_see_task(db, member, task):
        raise HTTPException(404, "Not found.")


def require_not_guest(member: WorkspaceMember) -> None:
    if member.role == "guest":
        raise HTTPException(403, "Not allowed.")


def can_delete_task(member: WorkspaceMember, task: Task, user: User) -> bool:
    if member.role in {"owner", "admin"}:
        return True
    if member.role == "member":
        return task.created_by == user.id
    return False


def can_archive_task(member: WorkspaceMember, task: Task, user: User) -> bool:
    if member.role in {"owner", "admin"}:
        return True
    if member.role == "member":
        return task.created_by == user.id or task.assignee_id == user.id
    return False


def member_count(db: Session, workspace: Workspace) -> int:
    return (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.role != "guest")
        .count()
    )

import os
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.access import require_roles, require_see_task
from app.models.phase2 import Tag, TaskAttachment, TaskComment, TaskCommentMention, TaskTag
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.activity import log_activity
from app.services.notify import add_notification

MENTION = re.compile(r"@([A-Za-z0-9._-]+)")
ALLOWED = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "text/plain",
    "text/markdown",
    "application/zip",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
def uploads_root() -> Path:
    raw = os.environ.get("UPLOAD_DIR")
    return Path(raw) if raw else Path(__file__).resolve().parents[2] / "uploads"


def comment_out(db: Session, comment: TaskComment) -> dict:
    author = db.get(User, comment.author_id)
    return {
        "id": str(comment.id),
        "author_id": str(comment.author_id),
        "author_name": author.name if author else "Unknown",
        "body": "Comment deleted" if comment.deleted_at else comment.body,
        "deleted": bool(comment.deleted_at),
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }


def list_comments(db: Session, task: Task) -> list[dict]:
    rows = db.query(TaskComment).filter(TaskComment.task_id == task.id).order_by(TaskComment.created_at).all()
    return [comment_out(db, c) for c in rows]


def add_comment(db: Session, workspace: Workspace, member: WorkspaceMember, user: User, task: Task, body: str) -> dict:
    require_see_task(db, member, task)
    if task.archived_at:
        raise HTTPException(400, "Can’t comment on an archived task.")
    body = body.strip()
    if not body or len(body) > 2000:
        raise HTTPException(400, "Comment must be 1–2000 characters.")
    comment = TaskComment(task_id=task.id, author_id=user.id, body=body)
    db.add(comment)
    db.flush()
    mentioned: set[UUID] = set()
    names = {n.lower() for n in MENTION.findall(body)}
    members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).all()
    for row in members:
        other = db.get(User, row.user_id)
        if not other or other.id == user.id:
            continue
        first = other.name.split()[0].lower()
        if names and (first in names or other.name.lower() in names):
            mentioned.add(other.id)
            db.add(TaskCommentMention(comment_id=comment.id, user_id=other.id))
            add_notification(db, workspace.id, other.id, "mention", f"{user.name} mentioned you on “{task.title}”", task.id)
    recipients = {task.assignee_id}
    for prev in db.query(TaskComment).filter(TaskComment.task_id == task.id, TaskComment.deleted_at.is_(None)):
        recipients.add(prev.author_id)
    recipients.discard(user.id)
    for uid in recipients:
        if uid not in mentioned:
            add_notification(db, workspace.id, uid, "comment", f"{user.name} commented on “{task.title}”", task.id)
    log_activity(db, workspace.id, user.id, "commented", f"{user.name} commented on “{task.title}”", task.id, task.project_id)
    db.commit()
    db.refresh(comment)
    return comment_out(db, comment)


def patch_comment(db: Session, member: WorkspaceMember, user: User, comment_id: UUID, body: str) -> dict:
    comment = db.get(TaskComment, comment_id)
    if not comment or comment.deleted_at:
        raise HTTPException(404, "Not found.")
    if comment.author_id != user.id:
        raise HTTPException(403, "Not allowed.")
    body = body.strip()
    if not body or len(body) > 2000:
        raise HTTPException(400, "Comment must be 1–2000 characters.")
    comment.body = body
    comment.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(comment)
    return comment_out(db, comment)


def delete_comment(db: Session, member: WorkspaceMember, user: User, comment_id: UUID) -> None:
    comment = db.get(TaskComment, comment_id)
    if not comment:
        raise HTTPException(404, "Not found.")
    if comment.author_id != user.id and member.role not in {"owner", "admin"}:
        raise HTTPException(403, "Not allowed.")
    comment.deleted_at = datetime.now(timezone.utc)
    db.commit()


def save_attachment(db: Session, workspace: Workspace, member: WorkspaceMember, user: User, task: Task, file: UploadFile) -> dict:
    require_see_task(db, member, task)
    require_roles(member, "owner", "admin", "member")
    raw = file.file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(400, "File must be 10 MB or smaller.")
    ctype = file.content_type or "application/octet-stream"
    name = file.filename or "file"
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ctype not in ALLOWED and ext not in {"pdf", "png", "jpg", "jpeg", "webp", "gif", "txt", "md", "zip", "docx"}:
        raise HTTPException(400, "File type not allowed.")
    root = uploads_root()
    root.mkdir(parents=True, exist_ok=True)
    key = f"{task.id}/{uuid4().hex}_{name}"
    dest = root / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    row = TaskAttachment(
        task_id=task.id,
        uploaded_by=user.id,
        filename=name,
        content_type=ctype,
        size_bytes=len(raw),
        storage_key=key,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return attachment_out(row)


def attachment_out(row: TaskAttachment) -> dict:
    return {
        "id": str(row.id),
        "filename": row.filename,
        "content_type": row.content_type,
        "size_bytes": row.size_bytes,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def delete_attachment(db: Session, member: WorkspaceMember, user: User, item_id: UUID) -> None:
    row = db.get(TaskAttachment, item_id)
    if not row:
        raise HTTPException(404, "Not found.")
    if row.uploaded_by != user.id and member.role not in {"owner", "admin"}:
        raise HTTPException(403, "Not allowed.")
    path = uploads_root() / row.storage_key
    if path.exists():
        path.unlink()
    db.delete(row)
    db.commit()


def list_task_files(db: Session, task_id: UUID) -> list[dict]:
    rows = db.query(TaskAttachment).filter(TaskAttachment.task_id == task_id).order_by(TaskAttachment.created_at.desc()).all()
    return [attachment_out(r) for r in rows]


def list_project_files(db: Session, workspace: Workspace, project_id: UUID) -> list[dict]:
    tasks = db.query(Task).filter(Task.workspace_id == workspace.id, Task.project_id == project_id).all()
    ids = [t.id for t in tasks]
    if not ids:
        return []
    rows = db.query(TaskAttachment).filter(TaskAttachment.task_id.in_(ids)).order_by(TaskAttachment.created_at.desc()).all()
    return [attachment_out(r) for r in rows]


def upsert_tag(db: Session, workspace: Workspace, name: str) -> Tag:
    name = name.strip().lower()
    if not re.fullmatch(r"[a-z0-9-]{1,24}", name or ""):
        raise HTTPException(400, "Tag must be 1–24 characters: a-z, 0-9, hyphen.")
    tag = db.query(Tag).filter(Tag.workspace_id == workspace.id, Tag.name == name).first()
    if tag:
        return tag
    tag = Tag(workspace_id=workspace.id, name=name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def set_task_tags(db: Session, workspace: Workspace, task: Task, names: list[str]) -> list[str]:
    db.query(TaskTag).filter(TaskTag.task_id == task.id).delete()
    out = []
    for name in names:
        tag = upsert_tag(db, workspace, name)
        db.add(TaskTag(task_id=task.id, tag_id=tag.id))
        out.append(tag.name)
    db.commit()
    return out


def task_tag_names(db: Session, task_id: UUID) -> list[str]:
    rows = db.query(Tag).join(TaskTag, TaskTag.tag_id == Tag.id).filter(TaskTag.task_id == task_id).all()
    return [t.name for t in rows]

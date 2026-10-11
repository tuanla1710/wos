from __future__ import annotations

import re
from datetime import date, datetime, timezone
from pathlib import Path
from shutil import copy2
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.access import guest_project_ids, require_not_guest
from app.models.phase2 import ActivityLog, Note, NoteAttachment, NoteStar, NoteTag, Tag
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.activity import log_activity
from app.services.social import ALLOWED, uploads_root

KINDS = {"quick", "work", "meeting", "lecture"}
BODY_MAX = 200 * 1024
MEETING_SKELETON = (
    "## Meeting\n"
    "Date: {day}\n\n"
    "## Participants\n"
    "- \n\n"
    "## Discussion\n"
    "- \n\n"
    "## Decision\n"
    "- \n\n"
    "## Action items\n"
    "- [ ] "
)
LECTURE_SKELETON = (
    "# Lesson title\n"
    "\n"
    "Level: beginner\n"
    "Duration: 45 min\n"
    "Language: python\n"
    "\n"
    "## Objective\n"
    "- \n"
    "\n"
    "## Why this matters\n"
    "- \n"
    "\n"
    "## Outline\n"
    "1. \n"
    "2. \n"
    "3. \n"
    "\n"
    "## Step 1\n"
    "Explain.\n"
    "\n"
    "```python\n"
    "# type here\n"
    "```\n"
    "\n"
    "> TIP: \n"
    "\n"
    "## Exercise\n"
    "Do this.\n"
    "\n"
    "Expected:\n"
    "\n"
    "```text\n"
    "\n"
    "```\n"
    "\n"
    "## Pitfalls\n"
    "> PITFALL: \n"
    "\n"
    "## Recap\n"
    "- \n"
    "\n"
    "## Homework\n"
    "- [ ] "
)


def snippet(body: str, limit: int = 180) -> str:
    text = re.sub(r"[#*_`\[\]()>-]+", " ", body or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def meeting_skeleton() -> str:
    return MEETING_SKELETON.format(day=date.today().isoformat())


def lecture_skeleton() -> str:
    return LECTURE_SKELETON


def has_lecture_skeleton(text: str) -> bool:
    return bool(re.search(r"(?m)^# Lesson\b", text) or re.search(r"(?m)^## Objective\b", text))


def _can_moderate(member: WorkspaceMember, note: Note, user: User) -> bool:
    return note.created_by == user.id or member.role in {"owner", "admin"}


def _require_moderate(member: WorkspaceMember, note: Note, user: User) -> None:
    if not _can_moderate(member, note, user):
        raise HTTPException(403, "Not allowed.")


def _normalize_kind(kind: str | None) -> str:
    value = (kind or "work").strip().lower()
    if value not in KINDS:
        raise HTTPException(400, "Kind must be quick, work, meeting, or lecture.")
    return value


def _normalize_title(title: str | None, body: str = "") -> str:
    value = (title or "").strip()
    if not value and body.strip():
        value = body.strip().splitlines()[0].strip()
    value = value or "Untitled"
    if len(value) > 160:
        raise HTTPException(400, "Title must be 1–160 characters.")
    return value


def _normalize_body(body: str | None) -> str:
    text = body or ""
    if len(text.encode("utf-8")) > BODY_MAX:
        raise HTTPException(400, "Note is larger than 200 KB.")
    return text


def _resolve_links(db: Session, workspace: Workspace, project_id: UUID | None, task_id: UUID | None) -> tuple[UUID | None, UUID | None]:
    if project_id:
        if not db.query(Project).filter(Project.id == project_id, Project.workspace_id == workspace.id).first():
            raise HTTPException(404, "Not found.")
    if task_id:
        task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first()
        if not task:
            raise HTTPException(404, "Not found.")
        if task.project_id and not project_id:
            project_id = task.project_id
    return project_id, task_id


def _tag_names(db: Session, note_id: UUID) -> list[str]:
    rows = (
        db.query(Tag.name)
        .join(NoteTag, NoteTag.tag_id == Tag.id)
        .filter(NoteTag.note_id == note_id)
        .order_by(Tag.name)
        .all()
    )
    return [name for (name,) in rows]


def _set_tags(db: Session, workspace: Workspace, note: Note, names: list[str]) -> None:
    from app.services.social import upsert_tag

    db.query(NoteTag).filter(NoteTag.note_id == note.id).delete()
    seen: set[str] = set()
    for raw in names:
        name = raw.strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        tag = upsert_tag(db, workspace, name)
        db.add(NoteTag(note_id=note.id, tag_id=tag.id))


def _file_count(db: Session, note_id: UUID) -> int:
    return db.query(NoteAttachment).filter(NoteAttachment.note_id == note_id).count()


def _files_out(db: Session, note_id: UUID) -> list[dict]:
    rows = db.query(NoteAttachment).filter(NoteAttachment.note_id == note_id).order_by(NoteAttachment.created_at.desc()).all()
    return [attachment_out(row) for row in rows]


def attachment_out(row: NoteAttachment) -> dict:
    return {
        "id": str(row.id),
        "filename": row.filename,
        "content_type": row.content_type,
        "size_bytes": row.size_bytes,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def note_out(db: Session, note: Note, user: User | None = None, detail: bool = False) -> dict:
    author = db.get(User, note.created_by)
    task = db.get(Task, note.task_id) if note.task_id else None
    project = db.get(Project, note.project_id) if note.project_id else None
    starred = False
    if user:
        starred = (
            db.query(NoteStar)
            .filter(NoteStar.note_id == note.id, NoteStar.user_id == user.id)
            .first()
            is not None
        )
    data = {
        "id": str(note.id),
        "title": note.title,
        "snippet": snippet(note.body),
        "kind": note.kind,
        "pinned": bool(note.pinned_at),
        "starred": starred,
        "archived": bool(note.archived_at),
        "author_id": str(note.created_by),
        "author_name": author.name if author else "Unknown",
        "task_id": str(note.task_id) if note.task_id else None,
        "task_title": task.title if task else None,
        "project_id": str(note.project_id) if note.project_id else None,
        "project_name": project.name if project else None,
        "tags": _tag_names(db, note.id),
        "file_count": _file_count(db, note.id),
        "created_by": str(note.created_by),
        "created_at": note.created_at.isoformat() if note.created_at else None,
        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
    }
    if detail:
        data["body"] = note.body
        data["files"] = _files_out(db, note.id)
    return data


def list_notes(
    db: Session,
    workspace: Workspace,
    member: WorkspaceMember,
    user: User,
    project_id: UUID | None = None,
    task_id: UUID | None = None,
    q: str | None = None,
    filter_name: str = "all",
    kind: str | None = None,
) -> list[dict]:
    query = db.query(Note).filter(Note.workspace_id == workspace.id)
    if task_id:
        query = query.filter(Note.task_id == task_id)
    elif project_id:
        task_ids = [row.id for row in db.query(Task.id).filter(Task.workspace_id == workspace.id, Task.project_id == project_id)]
        query = query.filter(or_(Note.project_id == project_id, Note.task_id.in_(task_ids) if task_ids else Note.project_id == project_id))
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(or_(Note.title.ilike(term), Note.body.ilike(term)))
    if kind:
        query = query.filter(Note.kind == _normalize_kind(kind))
    filt = (filter_name or "all").lower()
    if filt == "archived":
        query = query.filter(Note.archived_at.isnot(None))
    else:
        query = query.filter(Note.archived_at.is_(None))
        if filt == "mine":
            query = query.filter(Note.created_by == user.id)
        elif filt == "pinned":
            query = query.filter(Note.pinned_at.isnot(None))
    if member.role == "guest":
        allowed = guest_project_ids(db, user)
        guest_tasks = [t.id for t in db.query(Task).filter(Task.workspace_id == workspace.id, Task.project_id.in_(list(allowed))).all()]
        query = query.filter((Note.project_id.in_(list(allowed))) | (Note.task_id.in_(guest_tasks)))
    rows = query.order_by(Note.pinned_at.is_(None), Note.updated_at.desc()).all()
    return [note_out(db, n, user) for n in rows]


def create_note(
    db: Session,
    workspace: Workspace,
    member: WorkspaceMember,
    user: User,
    title: str | None,
    body: str | None,
    project_id: UUID | None,
    task_id: UUID | None,
    kind: str | None = None,
    tags: list[str] | None = None,
) -> Note:
    require_not_guest(member)
    kind_value = _normalize_kind(kind)
    text = _normalize_body(body)
    if kind_value == "meeting" and not text.strip():
        text = meeting_skeleton()
    if kind_value == "lecture" and not text.strip() and not has_lecture_skeleton(text):
        text = lecture_skeleton()
    if kind_value == "quick" and not (title or "").strip() and text.strip():
        title = text.strip().splitlines()[0]
        if title == text.strip():
            text = ""
    if kind_value == "lecture" and not (title or "").strip():
        title_value = "Untitled"
    else:
        title_value = _normalize_title(title, text)
    project_id, task_id = _resolve_links(db, workspace, project_id, task_id)
    note = Note(
        workspace_id=workspace.id,
        created_by=user.id,
        title=title_value,
        body=text,
        kind=kind_value,
        project_id=project_id,
        task_id=task_id,
    )
    db.add(note)
    db.flush()
    if tags:
        _set_tags(db, workspace, note, tags)
    log_activity(db, workspace.id, user.id, "note.created", f"Created note “{note.title}”", task_id=task_id, project_id=project_id, note_id=note.id)
    db.commit()
    db.refresh(note)
    return note


def can_see_note(db: Session, member: WorkspaceMember, user: User, note: Note) -> bool:
    if member.role != "guest":
        return True
    allowed = guest_project_ids(db, user)
    if note.project_id and note.project_id in allowed:
        return True
    if note.task_id:
        task = db.get(Task, note.task_id)
        if task and task.project_id and task.project_id in allowed:
            return True
    return False


def require_see_note(db: Session, member: WorkspaceMember, user: User, note: Note) -> None:
    if not can_see_note(db, member, user, note):
        raise HTTPException(404, "Not found.")


def get_note(db: Session, workspace: Workspace, note_id: UUID, member: WorkspaceMember | None = None, user: User | None = None) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.workspace_id == workspace.id).first()
    if not note:
        raise HTTPException(404, "Not found.")
    if member is not None and user is not None:
        require_see_note(db, member, user, note)
    return note


def _touch(note: Note) -> None:
    note.updated_at = datetime.now(timezone.utc)


def _log_updated(db: Session, workspace: Workspace, user: User, note: Note) -> None:
    cutoff = datetime.now(timezone.utc).timestamp() - 60
    recent = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.note_id == note.id,
            ActivityLog.actor_id == user.id,
            ActivityLog.verb == "note.updated",
        )
        .order_by(ActivityLog.created_at.desc())
        .first()
    )
    if recent and recent.created_at and recent.created_at.timestamp() > cutoff:
        return
    log_activity(db, workspace.id, user.id, "note.updated", f"Updated note “{note.title}”", task_id=note.task_id, project_id=note.project_id, note_id=note.id)


def patch_note(db: Session, workspace: Workspace, member: WorkspaceMember, user: User, note: Note, data: dict) -> Note:
    require_not_guest(member)
    if data.get("clear_task"):
        note.task_id = None
    if data.get("clear_project"):
        note.project_id = None
    project_id = data.get("project_id", note.project_id)
    task_id = data.get("task_id", note.task_id)
    if data.get("clear_task"):
        task_id = None
    if data.get("clear_project"):
        project_id = None
    if "project_id" in data or "task_id" in data or data.get("clear_task") or data.get("clear_project"):
        project_id, task_id = _resolve_links(db, workspace, project_id, task_id)
        if note.task_id != task_id or note.project_id != project_id:
            log_activity(db, workspace.id, user.id, "note.moved", f"Moved note “{note.title}”", task_id=task_id, project_id=project_id, note_id=note.id)
        note.project_id = project_id
        note.task_id = task_id
    if "kind" in data and data["kind"] is not None:
        note.kind = _normalize_kind(data["kind"])
        if note.kind == "meeting" and not (note.body or "").strip() and "body" not in data:
            note.body = meeting_skeleton()
    if "body" in data and data["body"] is not None:
        note.body = _normalize_body(data["body"])
    if note.kind == "lecture" and not (note.body or "").strip() and not has_lecture_skeleton(note.body or ""):
        note.body = lecture_skeleton()
    if "title" in data and data["title"] is not None:
        note.title = _normalize_title(data["title"], note.body)
    if "tags" in data and data["tags"] is not None:
        _set_tags(db, workspace, note, data["tags"])
    _touch(note)
    _log_updated(db, workspace, user, note)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, member: WorkspaceMember, user: User, note: Note) -> None:
    _require_moderate(member, note, user)
    root = uploads_root()
    for row in db.query(NoteAttachment).filter(NoteAttachment.note_id == note.id).all():
        path = root / row.storage_key
        if path.exists():
            path.unlink()
    log_activity(db, note.workspace_id, user.id, "note.deleted", f"Deleted note “{note.title}”", task_id=note.task_id, project_id=note.project_id)
    db.delete(note)
    db.commit()


def set_pinned(db: Session, member: WorkspaceMember, user: User, note: Note, pinned: bool) -> Note:
    _require_moderate(member, note, user)
    note.pinned_at = datetime.now(timezone.utc) if pinned else None
    _touch(note)
    log_activity(db, note.workspace_id, user.id, "note.pinned" if pinned else "note.unpinned", f"{'Pinned' if pinned else 'Unpinned'} note “{note.title}”", task_id=note.task_id, project_id=note.project_id, note_id=note.id)
    db.commit()
    db.refresh(note)
    return note


def set_archived(db: Session, member: WorkspaceMember, user: User, note: Note, archived: bool) -> Note:
    _require_moderate(member, note, user)
    note.archived_at = datetime.now(timezone.utc) if archived else None
    if archived:
        note.pinned_at = None
    _touch(note)
    log_activity(db, note.workspace_id, user.id, "note.archived" if archived else "note.unarchived", f"{'Archived' if archived else 'Unarchived'} note “{note.title}”", task_id=note.task_id, project_id=note.project_id, note_id=note.id)
    db.commit()
    db.refresh(note)
    return note


def set_starred(db: Session, user: User, note: Note, starred: bool) -> Note:
    row = db.query(NoteStar).filter(NoteStar.note_id == note.id, NoteStar.user_id == user.id).first()
    if starred and not row:
        db.add(NoteStar(note_id=note.id, user_id=user.id))
    if not starred and row:
        db.delete(row)
    db.commit()
    db.refresh(note)
    return note


def duplicate_note(db: Session, workspace: Workspace, member: WorkspaceMember, user: User, note: Note) -> Note:
    require_not_guest(member)
    copy = Note(
        workspace_id=workspace.id,
        created_by=user.id,
        title=(note.title[:153] + " (copy)") if len(note.title) > 153 else f"{note.title} (copy)",
        body=note.body,
        kind=note.kind,
        project_id=note.project_id,
        task_id=note.task_id,
    )
    db.add(copy)
    db.flush()
    _set_tags(db, workspace, copy, _tag_names(db, note.id))
    root = uploads_root()
    for row in db.query(NoteAttachment).filter(NoteAttachment.note_id == note.id).all():
        src = root / row.storage_key
        key = f"notes/{copy.id}/{uuid4().hex}_{row.filename}"
        dest = root / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.exists():
            copy2(src, dest)
        db.add(
            NoteAttachment(
                note_id=copy.id,
                uploaded_by=user.id,
                filename=row.filename,
                content_type=row.content_type,
                size_bytes=row.size_bytes,
                storage_key=key,
            )
        )
    log_activity(db, workspace.id, user.id, "note.duplicated", f"Duplicated note “{note.title}”", task_id=copy.task_id, project_id=copy.project_id, note_id=copy.id)
    db.commit()
    db.refresh(copy)
    return copy


def save_note_file(db: Session, workspace: Workspace, member: WorkspaceMember, user: User, note: Note, file: UploadFile) -> dict:
    require_not_guest(member)
    raw = file.file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(400, "File must be 10 MB or smaller.")
    ctype = file.content_type or "application/octet-stream"
    name = file.filename or "file"
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ctype not in ALLOWED and ext not in {"pdf", "png", "jpg", "jpeg", "webp", "gif", "txt", "md", "zip", "docx", "mp3"}:
        raise HTTPException(400, "File type not allowed.")
    key = f"notes/{note.id}/{uuid4().hex}_{name}"
    dest = uploads_root() / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    row = NoteAttachment(
        note_id=note.id,
        uploaded_by=user.id,
        filename=name,
        content_type=ctype,
        size_bytes=len(raw),
        storage_key=key,
    )
    db.add(row)
    _touch(note)
    log_activity(db, workspace.id, user.id, "note.file_added", f"Attached {name} to “{note.title}”", task_id=note.task_id, project_id=note.project_id, note_id=note.id)
    db.commit()
    db.refresh(row)
    return attachment_out(row)


def note_file_path(db: Session, note: Note, file_id: UUID) -> tuple[NoteAttachment, Path]:
    row = db.query(NoteAttachment).filter(NoteAttachment.id == file_id, NoteAttachment.note_id == note.id).first()
    if not row:
        raise HTTPException(404, "Not found.")
    path = uploads_root() / row.storage_key
    if not path.exists():
        raise HTTPException(404, "Not found.")
    return row, path


def delete_note_file(db: Session, member: WorkspaceMember, user: User, note: Note, file_id: UUID) -> None:
    row = db.query(NoteAttachment).filter(NoteAttachment.id == file_id, NoteAttachment.note_id == note.id).first()
    if not row:
        raise HTTPException(404, "Not found.")
    if row.uploaded_by != user.id and member.role not in {"owner", "admin"}:
        raise HTTPException(403, "Not allowed.")
    path = uploads_root() / row.storage_key
    if path.exists():
        path.unlink()
    log_activity(db, note.workspace_id, user.id, "note.file_removed", f"Removed {row.filename} from “{note.title}”", task_id=note.task_id, project_id=note.project_id, note_id=note.id)
    db.delete(row)
    _touch(note)
    db.commit()


def note_activity(db: Session, note: Note) -> list[dict]:
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.note_id == note.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
        .all()
    )
    out = []
    for row in rows:
        actor = db.get(User, row.actor_id)
        out.append(
            {
                "id": str(row.id),
                "verb": row.verb,
                "summary": row.summary,
                "actor": actor.name if actor else "Unknown",
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
        )
    return out

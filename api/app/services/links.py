import re
from datetime import datetime, timezone
from urllib.parse import urlparse
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.link import EntityLink
from app.models.user import User
from app.models.workspace import Workspace


def link_out(row: EntityLink) -> dict:
    return {
        "id": str(row.id),
        "title": row.title,
        "url": row.url,
        "task_id": str(row.task_id) if row.task_id else None,
        "project_id": str(row.project_id) if row.project_id else None,
    }


def normalize_url(url: str) -> str:
    raw = (url or "").strip()
    if not raw:
        raise HTTPException(400, "URL can’t be empty.")
    if not re.match(r"^https?://", raw, re.I):
        raw = "https://" + raw
    parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(400, "Enter a valid http or https link.")
    if len(raw) > 2000:
        raise HTTPException(400, "URL is too long.")
    return raw


def default_title(url: str, title: str | None) -> str:
    name = (title or "").strip()
    if name:
        return name[:160]
    host = urlparse(url).netloc.removeprefix("www.")
    return host or "Link"


def list_links(db: Session, *, task_id: UUID | None = None, project_id: UUID | None = None) -> list[dict]:
    q = db.query(EntityLink)
    if task_id:
        q = q.filter(EntityLink.task_id == task_id)
    if project_id:
        q = q.filter(EntityLink.project_id == project_id)
    return [link_out(r) for r in q.order_by(EntityLink.created_at).all()]


def create_link(
    db: Session,
    workspace: Workspace,
    user: User,
    title: str | None,
    url: str,
    *,
    task_id: UUID | None = None,
    project_id: UUID | None = None,
) -> dict:
    if bool(task_id) == bool(project_id):
        raise HTTPException(400, "Link must belong to a task or a project.")
    url = normalize_url(url)
    row = EntityLink(
        workspace_id=workspace.id,
        task_id=task_id,
        project_id=project_id,
        title=default_title(url, title),
        url=url,
        created_by=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return link_out(row)


def get_link(db: Session, workspace: Workspace, link_id: UUID) -> EntityLink:
    row = db.query(EntityLink).filter(EntityLink.id == link_id, EntityLink.workspace_id == workspace.id).first()
    if not row:
        raise HTTPException(404, "Not found.")
    return row


def patch_link(db: Session, row: EntityLink, title: str | None, url: str | None) -> dict:
    if url is not None:
        row.url = normalize_url(url)
        if not title:
            row.title = default_title(row.url, row.title)
    if title is not None:
        name = title.strip()
        if not name:
            raise HTTPException(400, "Title can’t be empty.")
        row.title = name[:160]
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return link_out(row)


def delete_link(db: Session, row: EntityLink) -> None:
    db.delete(row)
    db.commit()

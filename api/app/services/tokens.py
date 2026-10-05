import hashlib
import secrets
import time
from collections import defaultdict

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.phase2 import ApiToken
from app.models.user import User
from app.models.workspace import Workspace
from app.services.billing import current_plan

_hits: dict[str, list[float]] = defaultdict(list)


def _hash(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def create_token(db: Session, workspace: Workspace, user: User, name: str) -> dict:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    if not current_plan(db, workspace).public_api:
        raise HTTPException(402, "Public API is on the Team plan.")
    raw = secrets.token_urlsafe(32)
    prefix = raw[:8]
    row = ApiToken(workspace_id=workspace.id, name=name.strip() or "API token", token_hash=_hash(raw), prefix=prefix, created_by=user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "name": row.name, "prefix": prefix, "token": raw}


def list_tokens(db: Session, workspace: Workspace) -> list[dict]:
    rows = db.query(ApiToken).filter(ApiToken.workspace_id == workspace.id, ApiToken.revoked_at.is_(None)).all()
    return [{"id": str(r.id), "name": r.name, "prefix": r.prefix, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]


def revoke_token(db: Session, workspace: Workspace, user: User, token_id) -> None:
    if workspace.owner_id != user.id:
        raise HTTPException(403, "Not allowed.")
    from datetime import datetime, timezone

    row = db.query(ApiToken).filter(ApiToken.id == token_id, ApiToken.workspace_id == workspace.id).first()
    if not row:
        raise HTTPException(404, "Not found.")
    row.revoked_at = datetime.now(timezone.utc)
    db.commit()


def resolve_token(db: Session, raw: str) -> tuple[Workspace, ApiToken]:
    row = db.query(ApiToken).filter(ApiToken.token_hash == _hash(raw), ApiToken.revoked_at.is_(None)).first()
    if not row:
        raise HTTPException(401, "Unauthorized")
    now = time.time()
    bucket = _hits[str(row.id)]
    _hits[str(row.id)] = [t for t in bucket if now - t < 60]
    if len(_hits[str(row.id)]) >= 60:
        raise HTTPException(429, "Rate limit")
    _hits[str(row.id)].append(now)
    workspace = db.get(Workspace, row.workspace_id)
    if not workspace:
        raise HTTPException(401, "Unauthorized")
    return workspace, row

from datetime import datetime
from datetime import timezone as tz
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.accounts import provision_user


def require_platform_admin(user: User) -> None:
    if not user.is_admin:
        raise HTTPException(403, "Not allowed.")


def admin_user_out(db: Session, user: User) -> dict:
    members = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).all()
    workspaces = []
    for row in members:
        workspace = db.get(Workspace, row.workspace_id)
        if workspace:
            workspaces.append({"id": str(workspace.id), "name": workspace.name, "role": row.role})
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "phone_verified": user.phone_verified_at is not None,
        "timezone": user.timezone,
        "is_admin": bool(user.is_admin),
        "disabled": user.disabled_at is not None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "workspaces": workspaces,
    }


def list_users(db: Session) -> list[dict]:
    rows = db.query(User).order_by(User.created_at.asc(), User.email.asc()).all()
    return [admin_user_out(db, user) for user in rows]


def active_admin_count(db: Session, exclude_id: UUID | None = None) -> int:
    q = db.query(User).filter(User.is_admin.is_(True), User.disabled_at.is_(None))
    if exclude_id:
        q = q.filter(User.id != exclude_id)
    return q.count()


def create_user(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    timezone: str = "Asia/Seoul",
    is_admin: bool = False,
    phone: str,
) -> User:
    user, _workspace = provision_user(
        db,
        name=name,
        email=email,
        password=password,
        timezone=timezone,
        is_admin=is_admin,
        phone=phone,
    )
    db.commit()
    db.refresh(user)
    return user


def patch_user(
    db: Session,
    actor: User,
    user_id: UUID,
    *,
    name: str | None = None,
    email: str | None = None,
    password: str | None = None,
    timezone: str | None = None,
    is_admin: bool | None = None,
    disabled: bool | None = None,
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Not found.")
    if name:
        user.name = name.strip()
    if email is not None:
        next_email = str(email).strip()
        clash = db.query(User).filter(User.email == next_email, User.id != user.id).first()
        if clash:
            raise HTTPException(400, "Email is already in use.")
        user.email = next_email
    if password:
        user.password_hash = hash_password(password)
    if timezone:
        user.timezone = timezone
    if is_admin is not None:
        if user.id == actor.id and not is_admin:
            raise HTTPException(400, "You cannot remove your own admin access.")
        if user.is_admin and not is_admin and active_admin_count(db, exclude_id=user.id) < 1:
            raise HTTPException(400, "Keep at least one admin.")
        user.is_admin = is_admin
    if disabled is not None:
        if user.id == actor.id and disabled:
            raise HTTPException(400, "You cannot disable your own account.")
        if disabled and user.is_admin and active_admin_count(db, exclude_id=user.id) < 1:
            raise HTTPException(400, "Keep at least one admin.")
        user.disabled_at = datetime.now(tz.utc) if disabled else None
    user.updated_at = datetime.now(tz.utc)
    db.commit()
    db.refresh(user)
    return user


def ensure_admin() -> None:
    email = (settings.admin_email or "").strip()
    password = settings.admin_password or ""
    if not email or not password:
        return
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            changed = False
            if not existing.is_admin:
                existing.is_admin = True
                changed = True
            if not existing.phone:
                existing.phone = "+8201000000001"
                existing.phone_verified_at = datetime.now(tz.utc)
                changed = True
            elif existing.phone_verified_at is None:
                existing.phone_verified_at = datetime.now(tz.utc)
                changed = True
            if changed:
                db.commit()
            return
        if db.query(User).filter(User.is_admin.is_(True)).first():
            return
        provision_user(
            db,
            name=settings.admin_name or "Admin",
            email=email,
            password=password,
            is_admin=True,
            phone="+8201000000001",
            phone_verified=True,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

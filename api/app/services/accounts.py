from datetime import datetime
from datetime import timezone as tz

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.billing import ensure_customer, ensure_subscription
from app.services.phone import assert_phone_free, normalize_phone


def provision_user(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    timezone: str = "Asia/Seoul",
    is_admin: bool = False,
    phone: str | None = None,
    phone_verified: bool = False,
) -> tuple[User, Workspace]:
    email = str(email).strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email is already in use.")
    number = normalize_phone(phone) if phone else None
    if number:
        assert_phone_free(db, number)
    user = User(
        email=email,
        password_hash=hash_password(password),
        name=name.strip(),
        timezone=timezone or "Asia/Seoul",
        is_admin=is_admin,
        phone=number,
        phone_verified_at=datetime.now(tz.utc) if number and phone_verified else None,
    )
    db.add(user)
    db.flush()
    workspace = Workspace(name="Personal", owner_id=user.id)
    db.add(workspace)
    db.flush()
    db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role="owner"))
    ensure_customer(db, user)
    ensure_subscription(db, workspace, "free")
    return user, workspace

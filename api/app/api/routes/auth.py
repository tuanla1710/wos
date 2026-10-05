from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, sign_session, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.common import LoginIn, RegisterIn
from app.services.serialize import user_out

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session(response: Response, user_id: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=sign_session(user_id),
        httponly=True,
        samesite="lax",
        max_age=settings.session_days * 24 * 3600,
        path="/",
    )


@router.post("/register")
def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email is already in use.")
    user = User(
        email=str(body.email),
        password_hash=hash_password(body.password),
        name=body.name.strip(),
        timezone=body.timezone or "Asia/Seoul",
    )
    db.add(user)
    db.flush()
    workspace = Workspace(name="Personal", owner_id=user.id)
    db.add(workspace)
    db.flush()
    db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role="owner"))
    from app.services.billing import ensure_customer, ensure_subscription

    ensure_customer(db, user)
    ensure_subscription(db, workspace, "free")
    db.commit()
    db.refresh(user)
    db.refresh(workspace)
    _set_session(response, str(user.id))
    return user_out(user, workspace, role="owner", member_count=1)


@router.post("/login")
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(400, "Email or password is wrong.")
    member = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).first()
    workspace = db.get(Workspace, member.workspace_id) if member else None
    if not workspace:
        raise HTTPException(400, "Email or password is wrong.")
    _set_session(response, str(user.id))
    return user_out(user, workspace)


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(settings.cookie_name, path="/")
    return {"ok": True}

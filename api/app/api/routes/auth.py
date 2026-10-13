from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import sign_session, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.core.deps import current_user
from app.schemas.common import LoginIn, PhoneSendIn, PhoneVerifyIn, RegisterIn
from app.services.accounts import provision_user
from app.services.phone import confirm_otp, issue_otp
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


@router.get("/register")
def register_status() -> dict:
    return {"open": settings.public_register}


@router.post("/register")
def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)) -> dict:
    if not settings.public_register:
        raise HTTPException(403, "New accounts are created by an admin.")
    user, workspace = provision_user(
        db,
        name=body.name,
        email=str(body.email),
        password=body.password,
        timezone=body.timezone or "Asia/Seoul",
        phone=body.phone,
    )
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
    if user.disabled_at is not None:
        raise HTTPException(400, "This account is disabled.")
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


@router.post("/phone/send")
def send_phone_code(
    body: PhoneSendIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    return issue_otp(db, user, body.phone)


@router.post("/phone/verify")
def verify_phone_code(
    body: PhoneVerifyIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    confirm_otp(db, user, body.code)
    member = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).first()
    workspace = db.get(Workspace, member.workspace_id) if member else None
    if not workspace:
        raise HTTPException(400, "Phone verification required.")
    return user_out(user, workspace, role=member.role)


from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import AdminUserCreate, AdminUserPatch
from app.services.admin import admin_user_out, create_user, list_users, patch_user, require_platform_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def admin_users(db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    require_platform_admin(user)
    return {"users": list_users(db)}


@router.post("/users")
def admin_create_user(
    body: AdminUserCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    require_platform_admin(user)
    created = create_user(
        db,
        name=body.name,
        email=str(body.email),
        password=body.password,
        timezone=body.timezone or "Asia/Seoul",
        is_admin=body.is_admin,
        phone=body.phone,
    )
    return admin_user_out(db, created)


@router.patch("/users/{user_id}")
def admin_patch_user(
    user_id: UUID,
    body: AdminUserPatch,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> dict:
    require_platform_admin(user)
    updated = patch_user(
        db,
        user,
        user_id,
        name=body.name,
        email=str(body.email) if body.email is not None else None,
        password=body.password,
        timezone=body.timezone,
        is_admin=body.is_admin,
        disabled=body.disabled,
    )
    return admin_user_out(db, updated)

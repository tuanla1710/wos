from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.access import require_roles
from app.core.deps import current_membership, current_user
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.services.backup import CONFIRM, MAX_ZIP_BYTES, backup_status, build_archive, restore_archive

router = APIRouter()


@router.get("/backup/status")
def backup_status_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
) -> dict:
    require_roles(member, "owner")
    return backup_status(db)


@router.get("/backup")
def download_backup_route(
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
    _user: User = Depends(current_user),
) -> Response:
    require_roles(member, "owner")
    payload, filename = build_archive(db)
    return Response(
        content=payload,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/backup/restore")
def restore_backup_route(
    file: UploadFile = File(...),
    confirm: str = Form(...),
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(current_membership),
) -> dict:
    require_roles(member, "owner")
    if confirm.strip() != CONFIRM:
        raise HTTPException(400, f'Type {CONFIRM} to restore.')
    raw = file.file.read()
    if not raw:
        raise HTTPException(400, "Choose a backup file.")
    if len(raw) > MAX_ZIP_BYTES:
        raise HTTPException(400, "Backup is larger than 80 MB.")
    return restore_archive(db, raw)

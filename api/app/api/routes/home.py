from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import current_user, current_workspace
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.services.home import home_payload

router = APIRouter(tags=["home"])


@router.get("/home")
def home(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    return home_payload(db, workspace, user)

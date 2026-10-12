from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.access import guest_project_ids
from app.core.deps import current_membership, current_user, current_workspace
from app.db.session import get_db
from app.models.phase2 import Note
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember

router = APIRouter(tags=["search"])


@router.get("/search")
def search(
    q: str = Query(min_length=1),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
    member: WorkspaceMember = Depends(current_membership),
    workspace: Workspace = Depends(current_workspace),
) -> dict:
    term = f"%{q.strip()}%"
    tq = db.query(Task).filter(
        Task.workspace_id == workspace.id,
        Task.archived_at.is_(None),
        Task.title.ilike(term),
        (Task.is_inbox.is_(False)) | (Task.created_by == user.id),
    )
    pq = db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None), Project.name.ilike(term))
    nq = db.query(Note).filter(
        Note.workspace_id == workspace.id,
        Note.archived_at.is_(None),
        or_(Note.title.ilike(term), Note.body.ilike(term)),
    )
    if member.role == "guest":
        allowed = list(guest_project_ids(db, user))
        tq = tq.filter(Task.project_id.in_(allowed))
        pq = pq.filter(Project.id.in_(allowed))
        guest_tasks = [t.id for t in db.query(Task.id).filter(Task.workspace_id == workspace.id, Task.project_id.in_(allowed))]
        nq = nq.filter((Note.project_id.in_(allowed)) | (Note.task_id.in_(guest_tasks)))
    people = []
    if member.role != "guest":
        members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).all()
        for row in members:
            person = db.get(User, row.user_id)
            if person and q.lower() in person.name.lower():
                people.append({"id": str(person.id), "name": person.name})
    return {
        "tasks": [{"id": str(t.id), "title": t.title} for t in tq.order_by(Task.updated_at.desc()).limit(20).all()],
        "projects": [{"id": str(p.id), "name": p.name} for p in pq.order_by(Project.name).limit(10).all()],
        "notes": [{"id": str(n.id), "title": n.title} for n in nq.order_by(Note.updated_at.desc()).limit(10).all()],
        "people": people[:10],
    }

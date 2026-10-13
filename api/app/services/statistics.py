from uuid import UUID

from sqlalchemy.orm import Session

from app.core.access import guest_project_ids
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.dates import user_today
from app.services.projects import progress_by_project


def project_work_status(tasks: list[Task], today, project_due) -> str:
    if not tasks:
        return "empty"
    open_tasks = [t for t in tasks if t.status != "done"]
    if not open_tasks:
        return "done"
    task_overdue = any(t.due_date and t.due_date < today and t.status != "done" for t in tasks)
    if task_overdue or (project_due and project_due < today):
        return "overdue"
    if any(t.status == "blocked" for t in tasks):
        return "blocked"
    if any(t.status in {"in_progress", "done"} for t in tasks):
        return "in_progress"
    return "not_started"


def workspace_statistics(db: Session, workspace: Workspace, member: WorkspaceMember, user: User) -> dict:
    today = user_today(user.timezone)
    allowed: set[UUID] | None = guest_project_ids(db, user) if member.role == "guest" else None
    empty = {
        "today": today.isoformat(),
        "tasks": {
            "total": 0,
            "inbox": 0,
            "overdue": 0,
            "due_today": 0,
            "upcoming": 0,
            "todo": 0,
            "in_progress": 0,
            "blocked": 0,
            "done": 0,
        },
        "projects": {
            "total": 0,
            "counts": {
                "empty": 0,
                "not_started": 0,
                "in_progress": 0,
                "blocked": 0,
                "overdue": 0,
                "done": 0,
            },
            "rows": [],
        },
    }
    if allowed is not None and not allowed:
        return empty

    tq = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None))
    pq = db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None))
    if allowed is not None:
        ids = list(allowed)
        tq = tq.filter(Task.project_id.in_(ids))
        pq = pq.filter(Project.id.in_(ids))

    tasks = tq.all()
    projects = pq.order_by(Project.name).all()

    by_status = {"todo": 0, "in_progress": 0, "blocked": 0, "done": 0}
    inbox = 0
    overdue = 0
    due_today = 0
    upcoming = 0
    by_project: dict[UUID, list[Task]] = {}

    for task in tasks:
        if task.status in by_status:
            by_status[task.status] += 1
        if task.is_inbox:
            inbox += 1
        elif task.status != "done" and task.due_date:
            if task.due_date < today:
                overdue += 1
            elif task.due_date == today:
                due_today += 1
            elif 0 < (task.due_date - today).days <= 7:
                upcoming += 1
        if task.project_id:
            by_project.setdefault(task.project_id, []).append(task)

    project_status_counts = {
        "empty": 0,
        "not_started": 0,
        "in_progress": 0,
        "blocked": 0,
        "overdue": 0,
        "done": 0,
    }
    project_rows = []
    project_scores = progress_by_project(db, workspace)
    for project in projects:
        rows = by_project.get(project.id, [])
        status = project_work_status(rows, today, project.due_date)
        project_status_counts[status] += 1
        total = len(rows)
        completed = sum(1 for t in rows if t.status == "done")
        project_rows.append(
            {
                "id": str(project.id),
                "name": project.name,
                "status": status,
                "progress": project_scores.get(project.id, 0),
                "tasks": total,
                "completed": completed,
                "in_progress": sum(1 for t in rows if t.status == "in_progress"),
                "blocked": sum(1 for t in rows if t.status == "blocked"),
                "overdue": sum(1 for t in rows if t.due_date and t.due_date < today and t.status != "done"),
            }
        )

    return {
        "today": today.isoformat(),
        "tasks": {
            "total": len(tasks),
            "inbox": inbox,
            "overdue": overdue,
            "due_today": due_today,
            "upcoming": upcoming,
            **by_status,
        },
        "projects": {
            "total": len(projects),
            "counts": project_status_counts,
            "rows": project_rows,
        },
    }

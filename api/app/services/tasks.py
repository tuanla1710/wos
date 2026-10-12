from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.focus import TaskFocus
from app.models.project import Project
from app.models.task import Task, TaskChecklist
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.dates import require_range, user_today
from app.services.issues import assign_issue
from app.services.serialize import checklist_out, holiday_dates, task_out

PRIORITY = {"high": 0, "medium": 1, "low": 2}


def _touch(task: Task) -> None:
    task.updated_at = datetime.now(timezone.utc)


def _apply_status(task: Task, status: str) -> None:
    if status not in {"todo", "in_progress", "blocked", "done"}:
        raise HTTPException(400, "Invalid status")
    task.status = status
    if status == "done":
        if task.completed_at is None:
            task.completed_at = datetime.now(timezone.utc)
    else:
        task.completed_at = None
    if status != "blocked":
        task.blocked_reason = ""


def _clear_focus(db: Session, task: Task) -> None:
    db.query(TaskFocus).filter(TaskFocus.task_id == task.id).delete()


def get_task(db: Session, workspace: Workspace, task_id: UUID) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first()
    if not task:
        raise HTTPException(404, "Not found.")
    return task


def list_checklists(db: Session, task_id: UUID) -> list[TaskChecklist]:
    return (
        db.query(TaskChecklist)
        .filter(TaskChecklist.task_id == task_id)
        .order_by(TaskChecklist.position, TaskChecklist.created_at)
        .all()
    )


def _parent_chain(db: Session, task: Task, *, stop_id: UUID | None = None) -> list[Task]:
    chain: list[Task] = []
    current = task
    seen: set[UUID] = set()
    while current:
        if stop_id and current.id == stop_id:
            raise HTTPException(400, "Can’t nest a task under itself.")
        if current.id in seen:
            break
        seen.add(current.id)
        chain.append(current)
        if not current.parent_id:
            break
        current = db.get(Task, current.parent_id)
    if len(chain) >= 5:
        raise HTTPException(400, "Too many nested levels.")
    return chain


def create_task(
    db: Session,
    workspace: Workspace,
    user: User,
    title: str | None,
    project_id: UUID | None,
    due_date: date | None,
    priority: str,
    assignee_id: UUID | None = None,
    parent_id: UUID | None = None,
    start_date: date | None = None,
) -> Task:
    if priority not in {"high", "medium", "low"}:
        priority = "medium"
    parent = None
    if parent_id:
        parent = get_task(db, workspace, parent_id)
        _parent_chain(db, parent)
        project_id = parent.project_id
    project = None
    if project_id:
        project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == workspace.id).first()
        if not project:
            raise HTTPException(404, "Not found.")
    from app.services.naming import stamp_title

    title = (title or "").strip() or stamp_title(
        user.timezone,
        project.name if project else None,
        parent.title if parent else None,
        limit=200,
    )
    require_range(start_date, due_date)
    is_inbox = parent is None and project_id is None and due_date is None and start_date is None
    task = Task(
        workspace_id=workspace.id,
        project_id=project_id,
        parent_id=parent.id if parent else None,
        assignee_id=assignee_id or user.id,
        created_by=user.id,
        title=title,
        priority=priority,
        start_date=start_date,
        due_date=due_date,
        is_inbox=is_inbox,
    )
    if project:
        assign_issue(db, task, project)
    db.add(task)
    from app.services.activity import log_activity

    log_activity(db, workspace.id, user.id, "created", f"{user.name} created “{title}”", project_id=project_id)
    db.commit()
    db.refresh(task)
    return task


def patch_task(db: Session, workspace: Workspace, task: Task, data: dict) -> Task:
    if "title" in data and data["title"] is not None:
        title = data["title"].strip()
        if not title:
            raise HTTPException(400, "Title can’t be empty.")
        task.title = title
    if "description" in data and data["description"] is not None:
        task.description = data["description"]
    if "priority" in data and data["priority"] is not None:
        if data["priority"] not in {"high", "medium", "low"}:
            raise HTTPException(400, "Invalid priority")
        task.priority = data["priority"]
    if data.get("clear_start"):
        task.start_date = None
    elif data.get("start_date") is not None:
        task.start_date = data["start_date"]
        task.is_inbox = False
    if data.get("clear_due"):
        task.due_date = None
    elif data.get("due_date") is not None:
        task.due_date = data["due_date"]
        task.is_inbox = False
    require_range(task.start_date, task.due_date)
    if data.get("clear_parent"):
        task.parent_id = None
    elif data.get("parent_id") is not None:
        parent = get_task(db, workspace, data["parent_id"])
        if parent.id == task.id:
            raise HTTPException(400, "Can’t nest a task under itself.")
        _parent_chain(db, parent, stop_id=task.id)
        task.parent_id = parent.id
        task.project_id = parent.project_id
        task.is_inbox = False
    if data.get("clear_project"):
        task.project_id = None
        task.task_number = None
    elif data.get("project_id") is not None:
        project = (
            db.query(Project)
            .filter(Project.id == data["project_id"], Project.workspace_id == workspace.id)
            .first()
        )
        if not project:
            raise HTTPException(404, "Not found.")
        if task.project_id != project.id:
            task.task_number = None
        task.project_id = project.id
        task.is_inbox = False
        assign_issue(db, task, project)
    if "blocked_reason" in data and data["blocked_reason"] is not None:
        task.blocked_reason = data["blocked_reason"]
    actor_id = data.get("_actor_id")
    if data.get("assignee_id") is not None:
        new_assignee = data["assignee_id"]
        if new_assignee != task.assignee_id:
            task.assignee_id = new_assignee
            if actor_id and new_assignee != actor_id:
                from app.services.notify import add_notification

                add_notification(db, workspace.id, new_assignee, "assigned", f"You were assigned “{task.title}”", task.id)
            from app.services.activity import log_activity

            log_activity(db, workspace.id, actor_id or task.assignee_id, "assignee", f"Reassigned “{task.title}”", task.id, task.project_id)
    if data.get("status"):
        prev = task.status
        _apply_status(task, data["status"])
        if data["status"] == "done":
            _clear_focus(db, task)
            from app.services.activity import log_activity

            log_activity(db, workspace.id, actor_id or task.assignee_id, "completed", f"Completed “{task.title}”", task.id, task.project_id)
        elif data["status"] == "blocked" and actor_id and actor_id != task.assignee_id:
            from app.services.notify import add_notification

            add_notification(db, workspace.id, task.assignee_id, "blocked", f"“{task.title}” is blocked", task.id)
        elif data["status"] != prev:
            from app.services.activity import log_activity

            log_activity(db, workspace.id, actor_id or task.assignee_id, "status", f"{task.title} → {data['status']}", task.id, task.project_id)
        if data["status"] == "blocked":
            from app.services.activity import log_activity

            log_activity(db, workspace.id, actor_id or task.assignee_id, "blocked", f"Blocked “{task.title}”", task.id, task.project_id)
    if data.get("due_date") is not None:
        from app.services.activity import log_activity

        log_activity(db, workspace.id, actor_id or task.assignee_id, "due", f"Due changed on “{task.title}”", task.id, task.project_id)
    _touch(task)
    db.commit()
    db.refresh(task)
    return task


def archive_task(db: Session, task: Task) -> Task:
    task.archived_at = datetime.now(timezone.utc)
    _clear_focus(db, task)
    _touch(task)
    db.commit()
    db.refresh(task)
    return task


def unarchive_task(db: Session, task: Task) -> Task:
    task.archived_at = None
    _touch(task)
    db.commit()
    db.refresh(task)
    return task


def move_inbox(db: Session, task: Task) -> Task:
    task.is_inbox = True
    _touch(task)
    db.commit()
    db.refresh(task)
    return task


def move_my_tasks(db: Session, task: Task) -> Task:
    task.is_inbox = False
    _touch(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def list_tasks(
    db: Session,
    workspace: Workspace,
    user: User,
    tab: str | None,
    project_id: UUID | None,
    priority: str | None,
    status: str | None,
    assignee_id: UUID | None = None,
    member: WorkspaceMember | None = None,
) -> list[dict]:
    today = user_today(user.timezone)
    q = db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.parent_id.is_(None))
    if member and member.role == "guest":
        from app.core.access import guest_project_ids

        allowed = list(guest_project_ids(db, user))
        if not allowed:
            return []
        q = q.filter(Task.project_id.in_(allowed))
    focus_ids = {
        row.task_id
        for row in db.query(TaskFocus).filter(
            TaskFocus.workspace_id == workspace.id,
            TaskFocus.user_id == user.id,
            TaskFocus.focus_on == today,
        )
    }

    if tab == "inbox":
        q = q.filter(Task.is_inbox.is_(True), Task.created_by == user.id)
    elif tab == "today":
        clauses = [Task.due_date == today, (Task.status == "in_progress") & (Task.is_inbox.is_(False))]
        if focus_ids:
            clauses.append(Task.id.in_(list(focus_ids)))
        q = q.filter(Task.status != "done", or_(*clauses), Task.assignee_id == user.id)
    elif tab == "upcoming":
        q = q.filter(Task.is_inbox.is_(False), Task.due_date > today, Task.status != "done", Task.assignee_id == user.id)
    elif tab == "overdue":
        q = q.filter(Task.is_inbox.is_(False), Task.due_date < today, Task.status != "done", Task.assignee_id == user.id)
    elif tab == "all" or tab is None:
        q = q.filter(Task.is_inbox.is_(False))
        if not project_id:
            q = q.filter(Task.assignee_id == user.id)

    if project_id:
        q = q.filter(Task.project_id == project_id)
    if priority:
        q = q.filter(Task.priority == priority)
    if status:
        q = q.filter(Task.status == status)
    if assignee_id:
        q = q.filter(Task.assignee_id == assignee_id)

    tasks = q.all()

    def sort_key(t: Task) -> tuple:
        pri = PRIORITY.get(t.priority, 9)
        if tab == "inbox":
            return (t.created_at or datetime.min.replace(tzinfo=timezone.utc),)
        if tab == "overdue":
            return (t.due_date or date.max, pri, t.title)
        if tab == "upcoming":
            return (t.due_date or date.max, pri, t.title)
        if tab == "today":
            in_focus = 0 if t.id in focus_ids else 1
            due_today = 0 if t.due_date == today else 1
            return (in_focus, due_today, pri, t.created_at or datetime.min.replace(tzinfo=timezone.utc))
        done = 1 if t.status == "done" else 0
        return (done, t.due_date or date.max, pri, t.updated_at or datetime.min.replace(tzinfo=timezone.utc))

    if tab == "inbox":
        tasks.sort(key=lambda t: t.created_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    else:
        tasks.sort(key=sort_key)

    holidays = holiday_dates(db, workspace.id)
    return [task_out(t, focused=t.id in focus_ids, holidays=holidays) for t in tasks]


def add_checklist(db: Session, task: Task, title: str) -> TaskChecklist:
    title = title.strip()
    if not title:
        raise HTTPException(400, "Don’t add an empty item.")
    max_pos = (
        db.query(TaskChecklist.position)
        .filter(TaskChecklist.task_id == task.id)
        .order_by(TaskChecklist.position.desc())
        .first()
    )
    item = TaskChecklist(task_id=task.id, title=title, position=(max_pos[0] + 1) if max_pos else 0)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def patch_checklist(db: Session, workspace: Workspace, item_id: UUID, data: dict) -> TaskChecklist:
    item = db.get(TaskChecklist, item_id)
    if not item:
        raise HTTPException(404, "Not found.")
    get_task(db, workspace, item.task_id)
    if data.get("title") is not None:
        title = data["title"].strip()
        if not title:
            raise HTTPException(400, "Don’t add an empty item.")
        item.title = title
    if data.get("is_done") is not None:
        item.is_done = data["is_done"]
    if data.get("position") is not None:
        item.position = data["position"]
    db.commit()
    db.refresh(item)
    return item


def delete_checklist(db: Session, workspace: Workspace, item_id: UUID) -> None:
    item = db.get(TaskChecklist, item_id)
    if not item:
        raise HTTPException(404, "Not found.")
    get_task(db, workspace, item.task_id)
    db.delete(item)
    db.commit()


def detail_out(db: Session, task: Task, user: User) -> dict:
    today = user_today(user.timezone)
    focused = (
        db.query(TaskFocus)
        .filter(TaskFocus.task_id == task.id, TaskFocus.user_id == user.id, TaskFocus.focus_on == today)
        .first()
        is not None
    )
    from app.services.links import list_links

    children = (
        db.query(Task)
        .filter(Task.parent_id == task.id, Task.archived_at.is_(None))
        .order_by(Task.created_at)
        .all()
    )
    holidays = holiday_dates(db, task.workspace_id)
    data = task_out(task, list_checklists(db, task.id), focused=focused, holidays=holidays)
    data["subtasks"] = [task_out(child, holidays=holidays) for child in children]
    data["links"] = list_links(db, task_id=task.id)
    return data

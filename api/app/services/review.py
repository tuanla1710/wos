from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.focus import ProjectWeekTarget, TaskWeekFocus, TaskWeekTarget
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.dates import in_user_date, next_monday, user_today, week_monday
from app.services.projects import progress_by_project
from app.services.serialize import task_out
from app.services.tasks import get_task


def _alive(db: Session, workspace: Workspace):
    return db.query(Task).filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.parent_id.is_(None))


def _completed_in(tasks: list[Task], start: date, end: date, timezone: str) -> list[Task]:
    out: list[Task] = []
    for task in tasks:
        if task.completed_at and start <= in_user_date(task.completed_at, timezone) <= end:
            out.append(task)
    return out


def _sort_open(tasks: list[Task]) -> list[Task]:
    return sorted(tasks, key=lambda t: (t.due_date is None, t.due_date or date.max, t.title.lower()))


def review_payload(db: Session, workspace: Workspace, user: User, week_start: date | None) -> dict:
    today = user_today(user.timezone)
    start = week_start or week_monday(today)
    end = start + timedelta(days=6)
    last_start = start - timedelta(days=7)
    last_end = start - timedelta(days=1)
    next_start = next_monday(today)
    report_next_start = start + timedelta(days=7)
    report_next_end = report_next_start + timedelta(days=6)
    base = _alive(db, workspace)
    done_rows = base.filter(Task.status == "done", Task.completed_at.isnot(None)).order_by(Task.completed_at.desc()).all()
    completed_week = _completed_in(done_rows, start, end, user.timezone)
    last_week_done = _completed_in(done_rows, last_start, last_end, user.timezone)
    overdue = (
        base.filter(Task.is_inbox.is_(False), Task.due_date.isnot(None), Task.due_date < today, Task.status != "done")
        .order_by(Task.due_date)
        .all()
    )
    blocked = base.filter(Task.status == "blocked").all()
    next_week = (
        base.filter(
            Task.is_inbox.is_(False),
            Task.due_date >= next_start,
            Task.due_date < next_start + timedelta(days=7),
            Task.status != "done",
        )
        .order_by(Task.due_date)
        .all()
    )
    open_tasks = base.filter(Task.is_inbox.is_(False), Task.status != "done").all()
    this_week_doing = _sort_open(
        [t for t in open_tasks if t.status == "in_progress" or (t.due_date is not None and start <= t.due_date <= end)]
    )
    projects = []
    for project in db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None)):
        tasks = db.query(Task).filter(Task.project_id == project.id, Task.archived_at.is_(None)).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.status == "done")
        projects.append({"id": str(project.id), "name": project.name, "progress": round((done / total) * 100) if total else 0})
    focus_models = _week_focus_tasks(db, workspace, user, next_start)
    planned_models = _dedupe(
        [t for t in open_tasks if t.due_date is not None and report_next_start <= t.due_date <= report_next_end]
        + _week_focus_tasks(db, workspace, user, report_next_start)
    )
    all_rows = base.all()
    children = _children_by_parent(db, workspace)
    scores = progress_by_project(db, workspace)
    project_rows = {
        p.id: p for p in db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None))
    }
    open_roots = [task for task in all_rows if not task.is_inbox and not _is_complete(task)]
    last_roots = [task for task in all_rows if not task.is_inbox and _started_before(task, last_start)]
    this_roots = [task for task in open_roots if _tree_due(task, start, end, children)]
    next_roots = [task for task in open_roots if _tree_due(task, report_next_start, report_next_end, children)]
    this_records = _week_records(db, workspace, start)
    next_records = _week_records(db, workspace, report_next_start)
    this_plans = _plan_limits(this_records)
    next_plans = _plan_limits(next_records)
    board = {
        "last": _week_board(last_roots, children, scores, project_rows, _week_records(db, workspace, last_start), last_start, last_end, today, "actual", started_before=last_start, project_records=_project_week_records(db, workspace, last_start)),
        "this": _week_board(this_roots, children, scores, project_rows, this_records, start, end, today, "plan", maxs=next_plans, due_window=(start, end), project_records=_project_week_records(db, workspace, start)),
        "next": _week_board(next_roots, children, scores, project_rows, next_records, report_next_start, report_next_end, today, "plan", mins=this_plans, hide_complete=True, due_window=(report_next_start, report_next_end), project_records=_project_week_records(db, workspace, report_next_start)),
    }
    return {
        "board": board,
        "week_start": start.isoformat(),
        "week_end": end.isoformat(),
        "last_week_start": last_start.isoformat(),
        "last_week_end": last_end.isoformat(),
        "next_week_start": next_start.isoformat(),
        "plan_week_start": report_next_start.isoformat(),
        "plan_week_end": report_next_end.isoformat(),
        "completed": len(completed_week),
        "completed_tasks": [task_out(t) for t in completed_week],
        "last_week_done": [task_out(t) for t in last_week_done],
        "this_week_done": [task_out(t) for t in completed_week],
        "this_week_doing": [task_out(t) for t in this_week_doing],
        "next_week_planned": [task_out(t) for t in _sort_open(planned_models)],
        "overdue": [task_out(t) for t in overdue],
        "blocked": [task_out(t) for t in blocked],
        "due_next_week": [task_out(t) for t in next_week],
        "projects": projects,
        "week_focus": [task_out(t) for t in focus_models],
    }


def _week_focus_tasks(db: Session, workspace: Workspace, user: User, week_start: date) -> list[Task]:
    pins = (
        db.query(TaskWeekFocus)
        .filter(
            TaskWeekFocus.workspace_id == workspace.id,
            TaskWeekFocus.user_id == user.id,
            TaskWeekFocus.week_start == week_start,
        )
        .order_by(TaskWeekFocus.position)
        .all()
    )
    out: list[Task] = []
    for pin in pins:
        task = db.get(Task, pin.task_id)
        if task and not task.archived_at and task.status != "done":
            out.append(task)
    return out


def _children_by_parent(db: Session, workspace: Workspace) -> dict:
    grouped: dict = {}
    rows = (
        db.query(Task)
        .filter(Task.workspace_id == workspace.id, Task.archived_at.is_(None), Task.parent_id.isnot(None))
        .all()
    )
    for task in rows:
        grouped.setdefault(task.parent_id, []).append(task)
    return grouped


def _week_records(db: Session, workspace: Workspace, week_start: date) -> dict:
    rows = (
        db.query(TaskWeekTarget)
        .filter(TaskWeekTarget.workspace_id == workspace.id, TaskWeekTarget.week_start == week_start)
        .all()
    )
    return {row.task_id: row for row in rows}


def _overlaps(task: Task, start: date, end: date) -> bool:
    first = task.start_date or task.due_date
    last = task.due_date or task.start_date
    if first is None or last is None:
        return False
    return first <= end and last >= start


_STATUS_ORDER = {"done": 0, "in_progress": 1, "blocked": 2, "todo": 3}


def _is_complete(task: Task) -> bool:
    return task.status == "done" or int(task.progress or 0) >= 100


def _started_before(task: Task, week_start: date) -> bool:
    """Start plan is before the Monday that opens the week."""
    return task.start_date is not None and task.start_date < week_start


def _due_in(due: date | None, start: date, end: date) -> bool:
    return due is not None and start <= due <= end


def _tree_due(task: Task, start: date, end: date, children: dict, inherited_due: date | None = None) -> bool:
    """True when this task or a descendant has a deadline inside the week."""
    due = task.due_date or inherited_due
    if _due_in(due, start, end):
        return True
    return any(_tree_due(child, start, end, children, due) for child in children.get(task.id, []))


def _plan_limits(records: dict) -> dict:
    return {task_id: int(row.target_progress) for task_id, row in records.items() if row.target_progress is not None}


def _task_node(
    task: Task,
    children: dict,
    records: dict,
    today: date,
    mins: dict | None = None,
    maxs: dict | None = None,
    started_before: date | None = None,
    hide_complete: bool = False,
    inherited_start: date | None = None,
    due_window: tuple[date, date] | None = None,
    inherited_due: date | None = None,
) -> dict:
    kids = sorted(children.get(task.id, []), key=lambda t: (t.due_date is None, t.due_date or date.max, t.title.lower()))
    effective_start = task.start_date or inherited_start
    effective_due = task.due_date or inherited_due

    def child_ok(child: Task) -> bool:
        if hide_complete and _is_complete(child):
            return False
        if started_before is not None:
            start = child.start_date or effective_start
            if start is None or start >= started_before:
                return False
        if due_window is not None and not _due_in(child.due_date or effective_due, due_window[0], due_window[1]):
            return False
        return True

    kids = [child for child in kids if child_ok(child)]
    row = records.get(task.id)
    floors = mins or {}
    caps = maxs or {}
    data = task_out(task)
    data["plan"] = None if row is None or row.target_progress is None else int(row.target_progress)
    data["actual"] = None if row is None or row.actual_progress is None else int(row.actual_progress)
    data["min_value"] = int(floors.get(task.id, 0))
    data["max_value"] = int(caps.get(task.id, 100))
    data["editable"] = not kids
    data["overdue"] = task.status != "done" and task.due_date is not None and task.due_date < today
    data["subtasks"] = [
        _task_node(child, children, records, today, floors, caps, started_before, hide_complete, effective_start, due_window, effective_due) for child in kids
    ]
    return data


def _shown_progress(node: dict, mode: str) -> int | None:
    if node["subtasks"]:
        values = [value for child in node["subtasks"] if (value := _shown_progress(child, mode)) is not None]
        return round(sum(values) / len(values)) if values else None
    if mode == "actual":
        if node["actual"] is not None:
            return node["actual"]
        return 100 if node["status"] == "done" else None
    return node["plan"]


def _week_board(
    tasks: list[Task],
    children: dict,
    scores: dict,
    project_rows: dict,
    records: dict,
    start: date,
    end: date,
    today: date,
    mode: str,
    mins: dict | None = None,
    maxs: dict | None = None,
    started_before: date | None = None,
    hide_complete: bool = False,
    due_window: tuple[date, date] | None = None,
    project_records: dict | None = None,
) -> dict:
    groups: dict = {}
    for task in tasks:
        groups.setdefault(task.project_id, []).append(task)
    child_ids: dict = {}
    for project in project_rows.values():
        if project.parent_id and project.parent_id in project_rows:
            child_ids.setdefault(project.parent_id, []).append(project.id)

    def task_items(project_id):
        rows = sorted(
            groups.get(project_id, []),
            key=lambda t: (_STATUS_ORDER.get(t.status, 9), t.due_date is None, t.due_date or date.max, t.title.lower()),
        )
        return [_task_node(task, children, records, today, mins, maxs, started_before, hide_complete, due_window=due_window) for task in rows]

    def project_node(project_id):
        project = project_rows.get(project_id)
        if hide_complete and project_id is not None and scores.get(project_id, 0) >= 100:
            return {
                "id": str(project_id),
                "name": project.name if project else "No project",
                "key": project.key if project else None,
                "progress": None,
                "project_progress": 100,
                "done": 0,
                "total": 0,
                "tasks": [],
                "children": [],
            }
        items = task_items(project_id)
        kids = [project_node(child_id) for child_id in sorted(child_ids.get(project_id, []), key=lambda i: project_rows[i].name.lower())]
        kids = [kid for kid in kids if kid["tasks"] or kid["children"]]
        shown = [value for item in items if (value := _shown_progress(item, mode)) is not None]
        child_values = [kid["progress"] for kid in kids if kid["progress"] is not None]
        parts = shown + child_values
        rolled = round(sum(parts) / len(parts)) if parts else None
        return {
            "id": str(project_id) if project_id else None,
            "name": project.name if project else "No project",
            "key": project.key if project else None,
            "progress": _stored_project_progress(project_id, project_records, mode, rolled),
            "project_progress": scores.get(project_id, 0) if project_id else 0,
            "done": sum(1 for value in shown if value == 100),
            "total": len(items) + sum(kid["total"] for kid in kids),
            "status": project.status if project is not None else None,
            "due_date": project.due_date.isoformat() if project is not None and project.due_date else None,
            "tasks": items,
            "children": kids,
        }

    top_ids = [pid for pid, project in project_rows.items() if project.parent_id not in project_rows]
    nodes = [project_node(pid) for pid in sorted(top_ids, key=lambda i: project_rows[i].name.lower())]
    nodes = [node for node in nodes if node["tasks"] or node["children"]]
    if groups.get(None):
        nodes.append(project_node(None))
    values = [node["progress"] for node in nodes if node["progress"] is not None]
    return {
        "start": start.isoformat(),
        "end": end.isoformat(),
        "progress": round(sum(values) / len(values)) if values else None,
        "done": sum(1 for value in values if value == 100),
        "total": sum(node["total"] for node in nodes),
        "projects": nodes,
    }


def task_week_plan(db: Session, workspace: Workspace, user: User, task: Task) -> dict:
    today = user_today(user.timezone)
    this = week_monday(today)
    children = _children_by_parent(db, workspace)
    slots = (
        ("last", this - timedelta(days=7), "actual"),
        ("this", this, "plan"),
        ("next", this + timedelta(days=7), "plan"),
    )
    this_plans = _plan_limits(_week_records(db, workspace, this))
    next_plans = _plan_limits(_week_records(db, workspace, this + timedelta(days=7)))
    bounds = {
        "last": (0, 100),
        "this": (0, next_plans.get(task.id, 100)),
        "next": (this_plans.get(task.id, 0), 100),
    }
    out: dict = {"editable": not children.get(task.id)}
    for key, monday, mode in slots:
        records = _week_records(db, workspace, monday)
        node = _task_node(task, children, records, today)
        floor, cap = bounds[key]
        out[key] = {
            "start": monday.isoformat(),
            "end": (monday + timedelta(days=6)).isoformat(),
            "value": _shown_progress(node, mode),
            "min": floor,
            "max": cap,
        }
    return out


def _project_week_records(db: Session, workspace: Workspace, week_start: date) -> dict:
    rows = (
        db.query(ProjectWeekTarget)
        .filter(ProjectWeekTarget.workspace_id == workspace.id, ProjectWeekTarget.week_start == week_start)
        .all()
    )
    return {row.project_id: row for row in rows}


def _stored_project_progress(project_id, records: dict | None, mode: str, fallback: int | None) -> int | None:
    if project_id is None or not records:
        return fallback
    row = records.get(project_id)
    if row is None:
        return fallback
    raw = row.actual_progress if mode == "actual" else row.target_progress
    return fallback if raw is None else int(raw)


def project_week_plan(db: Session, workspace: Workspace, user: User, project: Project) -> dict:
    today = user_today(user.timezone)
    this = week_monday(today)
    slots = (
        ("last", this - timedelta(days=7), "actual"),
        ("this", this, "plan"),
        ("next", this + timedelta(days=7), "plan"),
    )
    this_rows = _project_week_records(db, workspace, this)
    next_rows = _project_week_records(db, workspace, this + timedelta(days=7))
    this_cap = this_rows.get(project.id)
    next_floor = next_rows.get(project.id)
    bounds = {
        "last": (0, 100),
        "this": (0, 100 if next_floor is None or next_floor.target_progress is None else int(next_floor.target_progress)),
        "next": (0 if this_cap is None or this_cap.target_progress is None else int(this_cap.target_progress), 100),
    }
    out: dict = {"editable": True}
    for key, monday, mode in slots:
        row = _project_week_records(db, workspace, monday).get(project.id)
        raw = None if row is None else (row.actual_progress if mode == "actual" else row.target_progress)
        floor, cap = bounds[key]
        out[key] = {
            "start": monday.isoformat(),
            "end": (monday + timedelta(days=6)).isoformat(),
            "value": None if raw is None else int(raw),
            "min": floor,
            "max": cap,
        }
    return out


def _dedupe(tasks: list[Task]) -> list[Task]:
    seen: set = set()
    out: list[Task] = []
    for task in tasks:
        if task.id in seen:
            continue
        seen.add(task.id)
        out.append(task)
    return out


def put_week_focus(db: Session, workspace: Workspace, user: User, week_start: date, task_ids: list[UUID]) -> list[dict]:
    if week_start.weekday() != 0:
        raise HTTPException(400, "week_start must be Monday")
    if len(task_ids) > 3:
        raise HTTPException(400, "Max 3")
    db.query(TaskWeekFocus).filter(
        TaskWeekFocus.workspace_id == workspace.id,
        TaskWeekFocus.user_id == user.id,
        TaskWeekFocus.week_start == week_start,
    ).delete()
    out = []
    for i, task_id in enumerate(task_ids, start=1):
        task = get_task(db, workspace, task_id)
        if task.status == "done" or task.archived_at:
            raise HTTPException(400, "Invalid task")
        db.add(
            TaskWeekFocus(
                workspace_id=workspace.id,
                user_id=user.id,
                task_id=task.id,
                week_start=week_start,
                position=i,
            )
        )
        out.append(task)
    db.commit()
    return [task_out(t) for t in out]


def put_week_target(
    db: Session,
    workspace: Workspace,
    task_id: UUID,
    week_start: date,
    target_progress: int | None,
    actual_progress: int | None,
) -> dict:
    if week_start.weekday() != 0:
        raise HTTPException(400, "week_start must be Monday")
    if target_progress is None and actual_progress is None:
        raise HTTPException(400, "Set a plan or a result.")
    task = get_task(db, workspace, task_id)
    if task.archived_at:
        raise HTTPException(400, "Invalid task")
    if db.query(Task.id).filter(Task.parent_id == task.id, Task.archived_at.is_(None)).first():
        raise HTTPException(400, "This % is the average of its subtasks.")
    if target_progress is not None:
        previous = (
            db.query(TaskWeekTarget)
            .filter(
                TaskWeekTarget.workspace_id == workspace.id,
                TaskWeekTarget.task_id == task.id,
                TaskWeekTarget.week_start == week_start - timedelta(days=7),
            )
            .first()
        )
        following = (
            db.query(TaskWeekTarget)
            .filter(
                TaskWeekTarget.workspace_id == workspace.id,
                TaskWeekTarget.task_id == task.id,
                TaskWeekTarget.week_start == week_start + timedelta(days=7),
            )
            .first()
        )
        if previous and previous.target_progress is not None and target_progress < int(previous.target_progress):
            raise HTTPException(400, f"Plan must be at least {int(previous.target_progress)}%. The week before is already that high.")
        if following and following.target_progress is not None and target_progress > int(following.target_progress):
            raise HTTPException(400, f"Plan can’t go above {int(following.target_progress)}%. Raise the following week first.")
    row = (
        db.query(TaskWeekTarget)
        .filter(
            TaskWeekTarget.workspace_id == workspace.id,
            TaskWeekTarget.task_id == task.id,
            TaskWeekTarget.week_start == week_start,
        )
        .first()
    )
    if row is None:
        row = TaskWeekTarget(workspace_id=workspace.id, task_id=task.id, week_start=week_start)
        db.add(row)
    if target_progress is not None:
        row.target_progress = target_progress
    if actual_progress is not None:
        row.actual_progress = actual_progress
    db.commit()
    return {
        "task_id": str(task.id),
        "week_start": week_start.isoformat(),
        "target_progress": row.target_progress,
        "actual_progress": row.actual_progress,
    }


def put_project_week_target(
    db: Session,
    workspace: Workspace,
    project_id: UUID,
    week_start: date,
    target_progress: int | None,
    actual_progress: int | None,
) -> dict:
    if week_start.weekday() != 0:
        raise HTTPException(400, "week_start must be Monday")
    if target_progress is None and actual_progress is None:
        raise HTTPException(400, "Set a plan or a result.")
    from app.services.projects import get_project

    project = get_project(db, workspace, project_id)
    if project.archived_at:
        raise HTTPException(400, "Invalid project")
    if target_progress is not None:
        previous = (
            db.query(ProjectWeekTarget)
            .filter(
                ProjectWeekTarget.workspace_id == workspace.id,
                ProjectWeekTarget.project_id == project.id,
                ProjectWeekTarget.week_start == week_start - timedelta(days=7),
            )
            .first()
        )
        following = (
            db.query(ProjectWeekTarget)
            .filter(
                ProjectWeekTarget.workspace_id == workspace.id,
                ProjectWeekTarget.project_id == project.id,
                ProjectWeekTarget.week_start == week_start + timedelta(days=7),
            )
            .first()
        )
        if previous and previous.target_progress is not None and target_progress < int(previous.target_progress):
            raise HTTPException(400, f"Plan must be at least {int(previous.target_progress)}%. The week before is already that high.")
        if following and following.target_progress is not None and target_progress > int(following.target_progress):
            raise HTTPException(400, f"Plan can’t go above {int(following.target_progress)}%. Raise the following week first.")
    row = (
        db.query(ProjectWeekTarget)
        .filter(
            ProjectWeekTarget.workspace_id == workspace.id,
            ProjectWeekTarget.project_id == project.id,
            ProjectWeekTarget.week_start == week_start,
        )
        .first()
    )
    if row is None:
        row = ProjectWeekTarget(workspace_id=workspace.id, project_id=project.id, week_start=week_start)
        db.add(row)
    if target_progress is not None:
        row.target_progress = target_progress
    if actual_progress is not None:
        row.actual_progress = actual_progress
    db.commit()
    return {
        "project_id": str(project.id),
        "week_start": week_start.isoformat(),
        "target_progress": row.target_progress,
        "actual_progress": row.actual_progress,
    }

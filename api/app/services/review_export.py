from datetime import date
from io import BytesIO

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.workspace import Workspace
from app.services.review import _alive, review_payload
from app.services.serialize import task_out

INK = RGBColor(0x11, 0x11, 0x11)
HEADER_FILL = RGBColor(0xF2, 0xF2, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Malgun Gothic"


def _md(iso: str | None) -> str:
    if not iso:
        return ""
    parts = iso[:10].split("-")
    if len(parts) != 3:
        return ""
    return f"~{int(parts[1]):02d}/{int(parts[2]):02d}"


def _names(db: Session, workspace: Workspace) -> dict[str, str]:
    rows = db.query(Project).filter(Project.workspace_id == workspace.id, Project.archived_at.is_(None)).all()
    return {str(p.id): p.name for p in rows}


def _group(tasks: list[dict], names: dict[str, str]) -> list[tuple[str, list[dict]]]:
    order: list[str] = []
    groups: dict[str, list[dict]] = {}
    for task in tasks:
        key = names.get(task.get("project_id") or "", "") or ""
        if key not in groups:
            groups[key] = []
            order.append(key)
        groups[key].append(task)
    return [(key, groups[key]) for key in order]


def _result_lines(groups: list[tuple[str, list[dict]]], limit: int = 10) -> tuple[list[tuple[str, bool]], list[tuple[str, bool]]]:
    body: list[tuple[str, bool]] = []
    dates: list[tuple[str, bool]] = []
    n = 0
    for name, tasks in groups:
        if n >= limit:
            break
        if not name:
            for task in tasks:
                if n >= limit:
                    break
                n += 1
                body.append((f"{n}. {task.get('title') or ''}", True))
                dates.append((_md(task.get("completed_at") or task.get("due_date")), False))
            continue
        n += 1
        body.append((f"{n}. {name}", True))
        dates.append((_md(tasks[0].get("completed_at") or tasks[0].get("due_date")), False))
        for task in tasks:
            if n >= limit:
                break
            body.append((f"- {task.get('title') or ''}", False))
            dates.append((_md(task.get("completed_at") or task.get("due_date")), False))
    if not body:
        body.append(("-", False))
        dates.append(("", False))
    return body, dates


def _plan_lines(tasks: list[dict], limit: int = 10) -> tuple[list[tuple[str, bool]], list[tuple[str, bool]]]:
    body: list[tuple[str, bool]] = []
    dates: list[tuple[str, bool]] = []
    seen: set[str] = set()
    n = 0
    for task in tasks:
        tid = task.get("id")
        if tid in seen:
            continue
        seen.add(tid or "")
        n += 1
        if n > limit:
            break
        body.append((f"{n}. {task.get('title') or ''}", True))
        dates.append((_md(task.get("due_date")), False))
    if not body:
        body.append(("-", False))
        dates.append(("", False))
    return body, dates


def _issue_lines(overdue: list[dict], blocked: list[dict], active: list[dict]) -> tuple[list[tuple[str, bool]], list[tuple[str, bool]]]:
    issues: list[tuple[str, bool]] = []
    actions: list[tuple[str, bool]] = []
    for task in overdue[:4]:
        issues.append((f"- Overdue: {task.get('title') or ''}", False))
        actions.append((f"- Reschedule {task.get('title') or ''}", False))
    for task in blocked[:4]:
        reason = task.get("blocked_reason") or ""
        label = f"- Blocked: {task.get('title') or ''}"
        if reason:
            label += f" ({reason})"
        issues.append((label, False))
        actions.append((f"- Unblock {task.get('title') or ''}", False))
    if not issues:
        for task in active[:4]:
            issues.append((f"- In progress: {task.get('title') or ''}", False))
            actions.append(("- Continue", False))
    if not issues:
        issues.append(("-", False))
        actions.append(("-", False))
    return issues, actions


def _set_run(run, text: str, *, size: int, bold: bool, color=INK) -> None:
    run.text = text
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    ea = rPr.find(qn("a:ea"))
    if ea is None:
        ea = rPr.makeelement(qn("a:ea"), {})
        rPr.append(ea)
    ea.set("typeface", FONT)
    latin = rPr.find(qn("a:latin"))
    if latin is None:
        latin = rPr.makeelement(qn("a:latin"), {})
        rPr.append(latin)
    latin.set("typeface", FONT)


def _fill(cell, rgb: RGBColor) -> None:
    cell.fill.solid()
    cell.fill.fore_color.rgb = rgb


def _border(cell) -> None:
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith(("lnL", "lnR", "lnT", "lnB")):
            tcPr.remove(child)
    for edge in ("lnL", "lnR", "lnT", "lnB"):
        ln = tcPr.makeelement(qn(f"a:{edge}"), {"w": "12700", "cap": "flat", "cmpd": "sng", "algn": "ctr"})
        fill = ln.makeelement(qn("a:solidFill"), {})
        clr = fill.makeelement(qn("a:srgbClr"), {"val": "000000"})
        fill.append(clr)
        ln.append(fill)
        dash = ln.makeelement(qn("a:prstDash"), {"val": "solid"})
        ln.append(dash)
        tcPr.append(ln)


def _write(cell, lines: list[tuple[str, bool]], *, size: int, align="left", anchor=MSO_ANCHOR.TOP) -> None:
    cell.vertical_anchor = anchor
    tf = cell.text_frame
    tf.word_wrap = True
    tf.clear()
    alignment = PP_ALIGN.CENTER if align == "center" else PP_ALIGN.LEFT
    for i, (text, bold) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = alignment
        p.space_before = Pt(0)
        p.space_after = Pt(3)
        p.level = 0
        if p.runs:
            _set_run(p.runs[0], text, size=size, bold=bold)
        else:
            _set_run(p.add_run(), text, size=size, bold=bold)


def build_review_pptx(db: Session, workspace: Workspace, user: User, week_start: date | None) -> tuple[bytes, str]:
    data = review_payload(db, workspace, user, week_start)
    names = _names(db, workspace)
    today = date.fromisoformat(data["week_end"])
    active = [
        task_out(t)
        for t in _alive(db, workspace)
        .filter(Task.is_inbox.is_(False), Task.status.in_(("todo", "in_progress")))
        .order_by(Task.due_date.asc())
        .all()
        if not t.due_date or t.due_date <= today
    ]

    results, result_dates = _result_lines(_group(data["completed_tasks"], names))
    plan_src = data["week_focus"] + data["due_next_week"]
    if not plan_src:
        plan_src = active
    plans, plan_dates = _plan_lines(plan_src)
    issues, actions = _issue_lines(data["overdue"], data["blocked"], active)

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    table = slide.shapes.add_table(
        4,
        4,
        Inches(0.28),
        Inches(0.22),
        Inches(12.77),
        Inches(7.06),
    ).table
    table.columns[0].width = Inches(5.24)
    table.columns[1].width = Inches(1.14)
    table.columns[2].width = Inches(5.24)
    table.columns[3].width = Inches(1.15)
    table.rows[0].height = Inches(0.48)
    table.rows[1].height = Inches(0.40)
    table.rows[2].height = Inches(5.28)
    table.rows[3].height = Inches(0.90)

    table.cell(0, 0).merge(table.cell(0, 3))
    table.cell(3, 0).merge(table.cell(3, 1))
    table.cell(3, 2).merge(table.cell(3, 3))

    for row in table.rows:
        for cell in row.cells:
            _border(cell)
            _fill(cell, WHITE)

    title = table.cell(0, 0)
    _fill(title, HEADER_FILL)
    _write(title, [(f"{workspace.name} 주간보고", True)], size=20, align="center", anchor=MSO_ANCHOR.MIDDLE)

    for i, label in enumerate(("실적", "일정", "계획", "일정")):
        cell = table.cell(1, i)
        _fill(cell, HEADER_FILL)
        _write(cell, [(label, True)], size=13, align="center", anchor=MSO_ANCHOR.MIDDLE)

    _write(table.cell(2, 0), results, size=13)
    _write(table.cell(2, 1), result_dates, size=12, align="center")
    _write(table.cell(2, 2), plans, size=13)
    _write(table.cell(2, 3), plan_dates, size=12, align="center")

    _write(table.cell(3, 0), [("진행 업무 및 이슈", True), *issues], size=12)
    _write(table.cell(3, 2), [("대책", True), *actions], size=12)

    prs.core_properties.title = f"{workspace.name} 주간보고 {data['week_start']} – {data['week_end']}"
    prs.core_properties.author = user.name

    buf = BytesIO()
    prs.save(buf)
    filename = f"Weekly-Report_{data['week_start']}_{data['week_end']}.pptx"
    return buf.getvalue(), filename


def build_review_docx(db: Session, workspace: Workspace, user: User, week_start: date | None) -> tuple[bytes, str]:
    return build_review_pptx(db, workspace, user, week_start)

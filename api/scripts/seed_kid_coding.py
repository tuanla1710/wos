"""Seed the Kid Coding curriculum (docs/07-kid-coding) into a Work OS workspace.

Usage (from api/):
    .venv\\Scripts\\python scripts\\seed_kid_coding.py --workspace <uuid> [--dry-run] [--update]

Idempotent: reuses project "Kid Coding", skips tasks/notes whose title already exists.
--update overwrites lecture bodies and resyncs homework checklists that have no ticked item.

Lesson source: docs/07-kid-coding/level-*.md, one "# Lxx — Name" per lesson, "## Section" beats.
Timing: section minutes come from DEFAULT_MIN or an explicit "[N]" at the end of the heading;
every lesson must total 50 minutes (09:00–09:50).
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path
from uuid import UUID

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs" / "07-kid-coding"
sys.path.insert(0, str(ROOT / "api"))

PROJECT_NAME = "Kid Coding"
LESSON_MINUTES = 50
WEEKDAY = {5: "Sat", 6: "Sun"}
HIGH = {8, 20, 32, 46, 60, 84, 96, 108, 120, 132} | set(range(61, 73)) | set(range(133, 145))
BADGES = [
    "Algorithm Thinker",
    "Scratch Explorer",
    "Debugger",
    "Loop Master",
    "Variable Master",
    "Data Explorer",
    "Search Master",
    "Sorting Master",
    "Python Beginner",
    "Python Coder",
    "Data Structure Explorer",
    "Algorithm Explorer",
    "Problem Solver",
    "Junior Computer Scientist",
]
LEVELS = [(0, 1, 8), (1, 9, 20), (2, 21, 32), (3, 33, 46), (4, 47, 60), (5, 61, 72),
          (6, 73, 84), (7, 85, 96), (8, 97, 108), (9, 109, 120), (10, 121, 132), (11, 133, 144)]
FINAL_NAMES = {
    133: "Chọn + spec", 134: "Chia module (hàm)", 135: "Model dữ liệu", 136: "Algorithm lõi",
    137: "Code core", 138: "Code core", 139: "Test", 140: "Debug", 141: "Improve", 142: "Polish",
    143: "Demo", 144: "Giải thích",
}
DEFAULT_MIN = {
    "objective": 1, "story": 3, "ask": 3, "unplugged": 8, "explain": 4,
    "build": 12, "practice": 8, "challenge": 5, "check": 3, "homework": 3,
}
BULLET_SECTIONS = {"parent prep", "unplugged", "explain", "build", "practice", "challenge"}
PREP_TIP = "> TIP: Bày xong trước 08:50. 09:00 là bắt đầu, không cài app."


def level_of(n: int) -> int:
    return next(lv for lv, a, b in LEVELS if a <= n <= b)


def tool_of(n: int) -> str:
    return "unplugged" if n <= 8 else "scratch" if n <= 72 else "python"


def load_calendar() -> dict[int, date]:
    text = (DOCS / "00-map-and-calendar.md").read_text(encoding="utf-8")
    out: dict[int, date] = {}
    for m in re.finditer(r"^\|\s*(\d{2,3})\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d{2,3})\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|", text, re.M):
        out[int(m[1])] = date.fromisoformat(m[2])
        out[int(m[3])] = date.fromisoformat(m[4])
    return out


def load_names() -> dict[int, str]:
    text = (DOCS / "00-map-and-calendar.md").read_text(encoding="utf-8")
    section = text.split("## Tên 144 bài", 1)[1]
    names: dict[int, str] = {}
    for line in section.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        for key, name in zip(cells[0::2], cells[1::2]):
            m = re.fullmatch(r"(\d{2,3})(?:–(\d{2,3}))?", key)
            if not m or not name:
                continue
            a, b = int(m[1]), int(m[2] or m[1])
            if a >= 133:
                continue
            if a == b:
                names[a] = name
            else:
                names[a] = f"{name} (design)"
                names[b] = f"{name} (ship)"
    for n, name in FINAL_NAMES.items():
        names[n] = f"Final project — {name}"
    return names


def split_lessons() -> dict[int, str]:
    out: dict[int, str] = {}
    for path in sorted(DOCS.glob("level-*.md")):
        lines = path.read_text(encoding="utf-8").splitlines()[1:]
        current = 0
        buf: list[str] = []

        def flush() -> None:
            body = re.sub(r"^(?:[ \t]*\n)+", "", "\n".join(buf)).rstrip()
            out[current] = re.sub(r"\n-{3,}\s*$", "", body).rstrip()

        for line in lines:
            m = re.match(r"^# L(\d{2,3})\b", line)
            if m:
                if current:
                    flush()
                current = int(m[1])
                buf = []
                continue
            if current:
                buf.append(line)
        if current:
            flush()
    return out


def parse_head(raw: str) -> tuple[str, str]:
    """Split lesson source into (project, sections) and drop meta lines."""
    if raw.startswith("## "):
        return "", raw
    head, sep, rest = raw.partition("\n## ")
    if not sep:
        print("WARNING lesson without ## sections — kept as one beat")
        return "", "## Lesson [50]\n" + raw
    project = ""
    for line in head.splitlines():
        m = re.search(r"Project:\s*(.+)$", line.strip())
        if m:
            project = m[1].strip()
    return project, "## " + rest


def sentences(line: str) -> list[str]:
    out: list[str] = []
    buf = ""
    tick = False
    i = 0
    while i < len(line):
        ch = line[i]
        buf += ch
        if ch == "`":
            tick = not tick
        nxt = line[i + 2] if i + 2 < len(line) else ""
        if not tick and ch in ".?!" and line[i + 1 : i + 2] == " " and (nxt.isupper() or nxt in "“\"`"):
            out.append(buf.strip())
            buf = ""
            i += 1
        i += 1
    if buf.strip():
        out.append(buf.strip())
    return out


def bulletize(text: str) -> str:
    lines: list[str] = []
    fence = False
    for line in text.splitlines():
        s = line.rstrip()
        if s.strip().startswith("```"):
            fence = not fence
            lines.append(s)
            continue
        plain = s.strip() and not fence and not re.match(r"^(\s|-|\d+\.|>|\(|\||\*\*)", s)
        parts = sentences(s.strip()) if plain else []
        if len(parts) >= 2:
            if lines and lines[-1].strip() and not lines[-1].startswith("- "):
                lines.append("")
            lines.extend(f"- {p}" for p in parts)
        else:
            lines.append(s)
    return "\n".join(lines)


def clock(minute: int) -> str:
    return f"{9 + minute // 60:02d}:{minute % 60:02d}"


def shape(sections: str, label: str) -> str:
    """Bulletize, stamp clock times on timed beats, prepend a Plan beat."""
    beats: list[tuple[str, str, int | None]] = []
    for chunk in re.split(r"(?m)^## ", sections)[1:]:
        title, _, text = chunk.partition("\n")
        title = title.strip()
        m = re.search(r"\s*\[(\d+)\]$", title)
        minutes = int(m[1]) if m else None
        if m:
            title = title[: m.start()].strip()
        key = re.split(r"\s+[—–-]\s+", title.lower())[0]
        if minutes is None:
            minutes = DEFAULT_MIN.get(key)
        text = "\n".join(l.rstrip() for l in text.splitlines()).strip()
        if key in BULLET_SECTIONS:
            text = bulletize(text)
        if key == "parent prep" and "TIP:" not in text:
            text += "\n\n" + PREP_TIP
        if key == "mistakes":
            text = "\n".join(l for l in text.splitlines() if l.strip())
        beats.append((title, text, minutes))
    total = sum(b[2] or 0 for b in beats)
    if total != LESSON_MINUTES:
        print(f"WARNING {label}: timed beats = {total} min")
    out: list[str] = []
    plan: list[str] = []
    t = 0
    for title, text, minutes in beats:
        if minutes:
            span = f"{clock(t)}–{clock(t + minutes)}"
            plan.append(f"- **{span}** · {title} ({minutes}')")
            out.append(f"## {title} — {span}\n{text}".rstrip())
            t += minutes
        else:
            out.append(f"## {title}\n{text}".rstrip())
    plan_beat = "## Plan — 50 phút\n" + "\n".join(plan) + "\n\n> TIP: Lố giờ thì cắt Challenge trước, không cắt Check."
    return "\n\n".join([plan_beat, *out])


def build_all() -> list[dict]:
    cal = load_calendar()
    names = load_names()
    lessons = split_lessons()
    items = []
    for n in range(1, 145):
        if n not in lessons:
            raise SystemExit(f"Missing lesson L{n:02d} in level files")
        day = cal[n]
        lv = level_of(n)
        tool = tool_of(n)
        project, sections = parse_head(lessons[n])
        title = f"L{n:02d} — {names[n]}"
        when = f"{WEEKDAY[day.weekday()]} {day.isoformat()} 09:00"
        header = [f"# {title}", "", f"Level: L{lv}", "Duration: 50 min", f"Language: {tool}", f"When: {when}"]
        if project:
            header.append(f"Project: {project}")
        body = "\n".join(header) + "\n\n" + shape(sections, f"L{n:02d}") + "\n"
        homework = [h.strip() for h in re.findall(r"^- \[ \] (.+)$", body, re.M) if h.strip()]
        tags = ["kid-coding", f"l{lv}", f"lesson-{n:02d}", tool]
        if n in HIGH:
            tags.append("project" if (61 <= n <= 72 or n >= 133) else "checkpoint")
        items.append(
            {
                "n": n,
                "title": title,
                "due": day,
                "priority": "high" if n in HIGH else "medium",
                "body": body,
                "homework": homework,
                "tags": tags,
            }
        )
    return items


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", required=True)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--update", action="store_true", help="Overwrite lecture bodies and resync homework checklists")
    ap.add_argument("--delete-note", action="append", default=[])
    ap.add_argument("--show", type=int, action="append", default=[], help="Print body of lesson N in dry-run")
    args = ap.parse_args()

    items = build_all()
    for it in items:
        if it["due"].weekday() not in WEEKDAY:
            raise SystemExit(f"{it['title']} not on weekend: {it['due']}")
    if args.dry_run:
        for it in items:
            print(f"{it['due']} {it['priority']:<6} hw={len(it['homework'])} beats={it['body'].count(chr(10) + '## ')} {it['title']}")
        for n in args.show:
            print(f"\n----- L{n} -----\n" + items[n - 1]["body"])
        return

    from app.db.session import SessionLocal
    from app.models.phase2 import Note
    from app.models.project import Project
    from app.models.task import Task
    from app.models.user import User
    from app.models.workspace import Workspace, WorkspaceMember
    from app.services.notes import create_note, delete_note, patch_note
    from app.services.projects import create_project
    from app.services.tasks import add_checklist, create_task, list_checklists

    db = SessionLocal()
    ws = db.get(Workspace, UUID(args.workspace))
    if not ws:
        raise SystemExit("Workspace not found")
    user = db.get(User, ws.owner_id)
    member = db.query(WorkspaceMember).filter_by(workspace_id=ws.id, user_id=user.id).one()

    for note_id in args.delete_note:
        note = db.get(Note, UUID(note_id))
        if note and note.workspace_id == ws.id:
            delete_note(db, member, user, note)
            print(f"Deleted note {note_id}")

    project = db.query(Project).filter_by(workspace_id=ws.id, name=PROJECT_NAME).first()
    if not project:
        project = create_project(db, ws, PROJECT_NAME, start_date=items[0]["due"], due_date=items[-1]["due"])
        print("Created project")
    existing_tasks = {t.title: t for t in db.query(Task).filter_by(workspace_id=ws.id, project_id=project.id).all()}
    existing_notes = {n.title: n for n in db.query(Note).filter_by(workspace_id=ws.id, project_id=project.id, kind="lecture").all()}

    if "Coding Passport" not in existing_tasks:
        passport = create_task(db, ws, user, "Coding Passport", project.id, date(2028, 4, 23), "high", start_date=items[0]["due"])
        for badge in BADGES:
            add_checklist(db, passport, badge)
        print("Created Coding Passport")

    made_tasks = made_notes = updated = synced = 0
    for it in items:
        task = existing_tasks.get(it["title"])
        if not task:
            task = create_task(db, ws, user, it["title"], project.id, it["due"], it["priority"])
            for hw in it["homework"]:
                add_checklist(db, task, hw[:500])
            made_tasks += 1
        elif args.update:
            rows = list_checklists(db, task.id)
            if [r.title for r in rows] != [h[:500] for h in it["homework"]] and not any(r.is_done for r in rows):
                for r in rows:
                    db.delete(r)
                db.commit()
                for hw in it["homework"]:
                    add_checklist(db, task, hw[:500])
                synced += 1
        note = existing_notes.get(it["title"])
        if not note:
            create_note(db, ws, member, user, it["title"], it["body"], project.id, task.id, kind="lecture", tags=it["tags"])
            made_notes += 1
        elif args.update and note.body != it["body"]:
            patch_note(db, ws, member, user, note, {"body": it["body"]})
            updated += 1
    print(f"Tasks created: {made_tasks}. Notes created: {made_notes}. Notes updated: {updated}. Checklists synced: {synced}.")
    db.close()


if __name__ == "__main__":
    main()

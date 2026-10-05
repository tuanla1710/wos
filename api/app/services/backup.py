from __future__ import annotations

import json
import zipfile
from datetime import date, datetime, time, timezone
from io import BytesIO
from pathlib import Path
from typing import Any
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import Date, DateTime, Time, insert, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models import Plan  # noqa: F401 — register metadata
from app.services.social import uploads_root

FORMAT = "workos-backup"
VERSION = 1
CONFIRM = "RESTORE"
MAX_ZIP_BYTES = 80 * 1024 * 1024

# Children first so TRUNCATE CASCADE is unnecessary but still listed like tests.
DATA_TABLES = [
    "api_tokens",
    "billing_customers",
    "workspace_subscriptions",
    "entity_links",
    "calendar_events",
    "note_attachments",
    "note_stars",
    "note_tags",
    "notes",
    "task_tags",
    "tags",
    "task_attachments",
    "activity_logs",
    "notifications",
    "task_comment_mentions",
    "task_comments",
    "invite_projects",
    "project_members",
    "workspace_invites",
    "task_week_focus",
    "task_focus",
    "task_checklists",
    "tasks",
    "projects",
    "workspace_holidays",
    "workspace_members",
    "workspaces",
    "users",
]


def _json_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, time):
        return value.isoformat()
    return value


def dump_tables(db: Session) -> dict[str, list[dict[str, Any]]]:
    tables: dict[str, list[dict[str, Any]]] = {}
    for table in Base.metadata.sorted_tables:
        rows = db.execute(table.select()).mappings().all()
        tables[table.name] = [{col: _json_value(row[col]) for col in table.columns.keys()} for row in rows]
    return tables


def collect_uploads() -> dict[str, bytes]:
    root = uploads_root()
    files: dict[str, bytes] = {}
    if not root.exists():
        return files
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(root).as_posix()
        files[rel] = path.read_bytes()
    return files


def build_archive(db: Session) -> tuple[bytes, str]:
    created = datetime.now(timezone.utc).replace(microsecond=0)
    tables = dump_tables(db)
    uploads = collect_uploads()
    payload = {
        "format": FORMAT,
        "version": VERSION,
        "created_at": created.isoformat(),
        "tables": tables,
    }
    manifest = {
        "format": FORMAT,
        "version": VERSION,
        "created_at": created.isoformat(),
        "app": "workos",
        "uploads": len(uploads),
        "rows": sum(len(rows) for name, rows in tables.items() if name != "plans"),
    }
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))
        zf.writestr("data.json", json.dumps(payload, ensure_ascii=False))
        for rel, data in uploads.items():
            zf.writestr(f"uploads/{rel}", data)
    stamp = created.strftime("%Y%m%d-%H%M%S")
    return buf.getvalue(), f"workos-backup-{stamp}.zip"


def backup_status(db: Session) -> dict[str, Any]:
    counts: dict[str, int] = {}
    for name in DATA_TABLES:
        counts[name] = int(db.execute(text(f"SELECT count(*) FROM {name}")).scalar() or 0)
    uploads = collect_uploads()
    return {
        "format": FORMAT,
        "version": VERSION,
        "counts": counts,
        "uploads": len(uploads),
        "upload_bytes": sum(len(data) for data in uploads.values()),
    }


def _parse_dt(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def _convert_value(column: Any, value: Any) -> Any:
    if value is None:
        return None
    coltype = column.type
    if isinstance(coltype, PGUUID):
        return UUID(str(value))
    if isinstance(coltype, DateTime):
        return _parse_dt(str(value))
    if isinstance(coltype, Date):
        return date.fromisoformat(str(value))
    if isinstance(coltype, Time):
        return time.fromisoformat(str(value))
    return value


def _convert_row(table: Any, row: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for column in table.columns:
        if column.name in row:
            out[column.name] = _convert_value(column, row[column.name])
    return out


def _order_self_ref(rows: list[dict[str, Any]], parent_key: str = "parent_id") -> list[dict[str, Any]]:
    remaining = {str(row["id"]): dict(row) for row in rows}
    ordered: list[dict[str, Any]] = []
    while remaining:
        progressed = False
        for rid, row in list(remaining.items()):
            parent = row.get(parent_key)
            if parent is None or str(parent) not in remaining:
                ordered.append(row)
                del remaining[rid]
                progressed = True
        if not progressed:
            ordered.extend(remaining.values())
            break
    return ordered


def _remap_subscriptions(db: Session, rows: list[dict[str, Any]], backup_plans: list[dict[str, Any]]) -> list[dict[str, Any]]:
    current = {plan.code: str(plan.id) for plan in db.query(Plan).all()}
    old_code = {str(plan["id"]): plan.get("code") for plan in backup_plans}
    remapped: list[dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        code = old_code.get(str(item.get("plan_id")))
        if code and code in current:
            item["plan_id"] = current[code]
        elif str(item.get("plan_id")) not in current.values():
            item["plan_id"] = current.get("free") or next(iter(current.values()))
        remapped.append(item)
    return remapped


def _safe_upload_dest(rel: str) -> Path | None:
    if not rel or rel.startswith("/") or Path(rel).is_absolute() or ".." in Path(rel).parts:
        return None
    root = uploads_root().resolve()
    dest = (uploads_root() / rel).resolve()
    if dest != root and root not in dest.parents:
        return None
    return dest


def _clear_uploads() -> None:
    root = uploads_root()
    if not root.exists():
        return
    for path in root.rglob("*"):
        if path.is_file():
            path.unlink()


def _write_uploads(files: dict[str, bytes]) -> int:
    written = 0
    for rel, data in files.items():
        dest = _safe_upload_dest(rel)
        if dest is None:
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        written += 1
    return written


def _read_archive(raw: bytes) -> tuple[dict[str, Any], dict[str, bytes]]:
    if len(raw) > MAX_ZIP_BYTES:
        raise HTTPException(400, "Backup is larger than 80 MB.")
    try:
        zf = zipfile.ZipFile(BytesIO(raw))
    except zipfile.BadZipFile as exc:
        raise HTTPException(400, "Not a Work OS backup zip.") from exc
    names = set(zf.namelist())
    if "data.json" not in names:
        raise HTTPException(400, "Backup is missing data.json.")
    try:
        payload = json.loads(zf.read("data.json").decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(400, "Backup data.json is invalid.") from exc
    if payload.get("format") != FORMAT:
        raise HTTPException(400, "Not a Work OS backup.")
    if int(payload.get("version") or 0) != VERSION:
        raise HTTPException(400, "This backup version is not supported.")
    if not isinstance(payload.get("tables"), dict):
        raise HTTPException(400, "Backup tables are missing.")
    uploads: dict[str, bytes] = {}
    for name in names:
        if name.startswith("uploads/") and not name.endswith("/"):
            uploads[name[len("uploads/") :]] = zf.read(name)
    return payload, uploads


def restore_archive(db: Session, raw: bytes) -> dict[str, Any]:
    payload, uploads = _read_archive(raw)
    tables: dict[str, list[dict[str, Any]]] = payload["tables"]
    insert_names = [table.name for table in Base.metadata.sorted_tables if table.name in DATA_TABLES]
    db.execute(text("SET LOCAL session_replication_role = replica"))
    db.execute(text("TRUNCATE " + ", ".join(DATA_TABLES) + " RESTART IDENTITY CASCADE"))
    restored = 0
    try:
        for name in insert_names:
            table = Base.metadata.tables[name]
            rows = list(tables.get(name) or [])
            if name in {"projects", "tasks"}:
                rows = _order_self_ref(rows)
            if name == "workspace_subscriptions":
                rows = _remap_subscriptions(db, rows, tables.get("plans") or [])
            if not rows:
                continue
            converted = [_convert_row(table, row) for row in rows]
            db.execute(insert(table), converted)
            restored += len(converted)
        _clear_uploads()
        written = _write_uploads(uploads)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(400, f"Could not restore backup. {exc}") from exc
    return {"ok": True, "rows": restored, "uploads": written}

from datetime import date
from functools import lru_cache
from importlib import resources

import holidays as hol
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import Workspace, WorkspaceHoliday

WORKDAY_YEARS_BACK = 1
WORKDAY_YEARS_AHEAD = 2


def _tz_file(name: str) -> str:
    return resources.files("tzdata").joinpath("zoneinfo", name).read_text(encoding="utf-8")


@lru_cache(maxsize=1)
def _zone_countries() -> dict[str, str]:
    zones: dict[str, str] = {}
    for line in _tz_file("zone.tab").splitlines():
        if line and not line.startswith("#"):
            parts = line.split("\t")
            if len(parts) >= 3:
                zones[parts[2]] = parts[0]
    for line in _tz_file("tzdata.zi").splitlines():
        if line.startswith("L "):
            _, target, alias = line.split()[:3]
            if target in zones and alias not in zones:
                zones[alias] = zones[target]
    return zones


@lru_cache(maxsize=1)
def _country_names() -> dict[str, str]:
    names: dict[str, str] = {}
    for line in _tz_file("iso3166.tab").splitlines():
        if line and not line.startswith("#"):
            code, _, name = line.partition("\t")
            names[code] = name.strip()
    return names


@lru_cache(maxsize=1)
def supported_countries() -> list[dict]:
    names = _country_names()
    codes = [c for c in hol.list_supported_countries() if len(c) == 2]
    return sorted(({"code": c, "name": names.get(c, c)} for c in codes), key=lambda r: r["name"])


def is_supported(code: str | None) -> bool:
    return bool(code) and code in hol.list_supported_countries()


def country_for_timezone(tz: str | None) -> str | None:
    code = _zone_countries().get(tz or "")
    return code if is_supported(code) else None


def country_name(code: str | None) -> str:
    return _country_names().get(code or "", code or "")


@lru_cache(maxsize=512)
def _country_year(code: str, year: int) -> tuple[tuple[date, str, str], ...]:
    native = hol.country_holidays(code, years=year)
    langs = getattr(native, "supported_languages", ()) or ()
    en_lang = next((l for l in ("en_US", "en", "en_GB") if l in langs), None)
    english = hol.country_holidays(code, years=year, language=en_lang) if en_lang else native
    return tuple((d, native.get(d), english.get(d) or native.get(d)) for d in sorted(native))


def effective_country(db: Session, workspace: Workspace) -> str:
    if workspace.holiday_country is not None:
        return workspace.holiday_country if is_supported(workspace.holiday_country) else ""
    owner = db.get(User, workspace.owner_id)
    return country_for_timezone(owner.timezone if owner else None) or ""


def _country_days(code: str, start: date, end: date):
    if not code:
        return
    for year in range(start.year, end.year + 1):
        for d, name, name_en in _country_year(code, year):
            if start <= d <= end:
                yield d, name, name_en


def holidays_between(db: Session, workspace: Workspace, start: date, end: date) -> list[dict]:
    skips = set(workspace.holiday_skips or [])
    primary = effective_country(db, workspace)
    secondary = workspace.holiday_country2 if is_supported(workspace.holiday_country2) and workspace.holiday_country2 != primary else ""
    out: list[dict] = []
    for d, name, name_en in _country_days(primary, start, end):
        out.append({"day": d.isoformat(), "name": name, "name_en": name_en, "kind": "primary", "country": primary, "off": d not in skips})
    for d, name, name_en in _country_days(secondary, start, end):
        out.append({"day": d.isoformat(), "name": name, "name_en": name_en, "kind": "secondary", "country": secondary, "off": False})
    rows = (
        db.query(WorkspaceHoliday)
        .filter(WorkspaceHoliday.workspace_id == workspace.id, WorkspaceHoliday.day >= start, WorkspaceHoliday.day <= end)
        .all()
    )
    for row in rows:
        out.append({"id": str(row.id), "day": row.day.isoformat(), "name": row.name, "name_en": row.name, "kind": "custom", "country": "", "off": True})
    order = {"custom": 0, "primary": 1, "secondary": 2}
    return sorted(out, key=lambda h: (h["day"], order[h["kind"]]))


def day_off_dates(db: Session, workspace: Workspace) -> set[date]:
    """Dates that count as days off for workday math: custom holidays plus non-skipped public ones."""
    today = date.today()
    start = date(today.year - WORKDAY_YEARS_BACK, 1, 1)
    end = date(today.year + WORKDAY_YEARS_AHEAD, 12, 31)
    skips = set(workspace.holiday_skips or [])
    days = {d for d, _, _ in _country_days(effective_country(db, workspace), start, end) if d not in skips}
    rows = db.query(WorkspaceHoliday.day).filter(WorkspaceHoliday.workspace_id == workspace.id).all()
    return days | {row[0] for row in rows}


def settings_out(db: Session, workspace: Workspace) -> dict:
    owner = db.get(User, workspace.owner_id)
    detected = country_for_timezone(owner.timezone if owner else None) or ""
    primary = effective_country(db, workspace)
    return {
        "country": workspace.holiday_country,
        "country2": workspace.holiday_country2,
        "effective": primary,
        "effective_name": country_name(primary),
        "detected": detected,
        "detected_name": country_name(detected),
        "timezone": owner.timezone if owner else "",
        "skips": sorted(d.isoformat() for d in (workspace.holiday_skips or [])),
        "countries": supported_countries(),
    }

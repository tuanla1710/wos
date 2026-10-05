from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import HTTPException


def work_days(start: date | None, end: date | None, holidays: set[date] | None = None) -> int | None:
    if start is None or end is None:
        return None
    if start > end:
        return None
    off = holidays or set()
    count = 0
    day = start
    while day <= end:
        if day.weekday() < 5 and day not in off:
            count += 1
        day += timedelta(days=1)
    return count


def require_range(start: date | None, end: date | None) -> None:
    if start and end and start > end:
        raise HTTPException(400, "Start can’t be after due.")


def zone(timezone: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone)
    except Exception:
        return ZoneInfo("Asia/Seoul")


def user_today(timezone: str) -> date:
    return datetime.now(zone(timezone)).date()


def in_user_date(value: datetime, timezone: str) -> date:
    if value.tzinfo is None:
        value = value.replace(tzinfo=ZoneInfo("UTC"))
    return value.astimezone(zone(timezone)).date()


def week_monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def next_monday(d: date) -> date:
    return week_monday(d) + timedelta(days=7)


def greeting_hour(timezone: str) -> int:
    try:
        tz = ZoneInfo(timezone)
    except Exception:
        tz = ZoneInfo("Asia/Seoul")
    return datetime.now(tz).hour


def greeting_word(timezone: str) -> str:
    hour = greeting_hour(timezone)
    if 5 <= hour <= 11:
        return "morning"
    if 12 <= hour <= 17:
        return "afternoon"
    return "evening"

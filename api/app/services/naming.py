from __future__ import annotations

import re
from datetime import datetime

from app.services.dates import zone

STAMP = re.compile(r"^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}")


def slug_part(value: str | None, limit: int = 48) -> str:
    if not value:
        return ""
    cleaned = re.sub(r"\s+", "_", value.strip())
    cleaned = re.sub(r"[^\w.\-]+", "", cleaned, flags=re.UNICODE)
    return cleaned.strip("._")[:limit]


def stamp_title(timezone: str, *parts: str | None, limit: int = 160) -> str:
    now = datetime.now(zone(timezone or "Asia/Seoul"))
    chunks = [now.strftime("%Y-%m-%d_%H-%M")]
    for part in parts:
        slug = slug_part(part)
        if slug:
            chunks.append(slug)
    return "_".join(chunks)[:limit]

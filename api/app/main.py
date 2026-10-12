from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api.routes import admin, auth, backup, calendar, extra, focus, home, me, projects, review, search, tasks
from app.core.config import settings
from app.core.phone_gate import PhoneVerifiedMiddleware
from app.core.version import APP_VERSION
from app.db.session import engine


@asynccontextmanager
async def lifespan(_app: FastAPI):
    from app.services.admin import ensure_admin

    ensure_admin()
    yield


app = FastAPI(title="Work OS API", version=APP_VERSION, lifespan=lifespan)

def cors_origins() -> list[str]:
    extras = [origin.strip() for origin in settings.web_origin.split(",") if origin.strip()]
    defaults = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    return list(dict.fromkeys(extras + defaults))


app.add_middleware(PhoneVerifiedMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    me.router,
    home.router,
    search.router,
    calendar.router,
    review.router,
    projects.router,
    tasks.router,
    focus.router,
    extra.router,
    backup.router,
    admin.router,
):
    app.include_router(router, prefix="/api")


@app.exception_handler(OperationalError)
async def database_unavailable(_request: Request, _exc: OperationalError) -> JSONResponse:
    engine.dispose()
    return JSONResponse({"detail": "Database is not ready."}, status_code=503)


@app.get("/health")
def health() -> dict[str, str]:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        return {"status": "db_down"}

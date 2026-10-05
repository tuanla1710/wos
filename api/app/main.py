from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api.routes import auth, backup, calendar, extra, focus, home, me, projects, review, search, tasks
from app.db.session import engine

app = FastAPI(title="Work OS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
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

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "api"
sys.path.insert(0, str(API))

TEST_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://workos:workos@127.0.0.1:5432/workos_test",
)
os.environ["DATABASE_URL"] = TEST_URL
os.environ["SECRET_KEY"] = "test-secret"
os.environ["UPLOAD_DIR"] = str(ROOT / "api" / "uploads_test")

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url

from alembic import command
from alembic.config import Config


def _ensure_database() -> None:
    url = make_url(TEST_URL)
    dbname = url.database
    admin = url.set(database="postgres")
    engine = create_engine(admin, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": dbname}).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{dbname}"'))
    engine.dispose()


def _migrate() -> None:
    cfg = Config(str(API / "alembic.ini"))
    cfg.set_main_option("script_location", str(API / "alembic"))
    cfg.set_main_option("sqlalchemy.url", TEST_URL)
    command.upgrade(cfg, "head")


_ensure_database()
_migrate()

from fastapi.testclient import TestClient
from app.db.session import SessionLocal, engine
from app.main import app


TABLES = [
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


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    with engine.begin() as conn:
        for table in TABLES:
            conn.execute(text(f'TRUNCATE {table} RESTART IDENTITY CASCADE'))
    with TestClient(app) as test_client:
        yield test_client


class Api:
    _phones = 0

    def __init__(self, client: TestClient):
        self.client = client
        self.workspace_id = ""
        self.phone = ""

    def headers(self) -> dict[str, str]:
        return {"X-Workspace-Id": self.workspace_id} if self.workspace_id else {}

    def register(
        self,
        name: str,
        email: str,
        password: str = "password1",
        timezone: str = "Asia/Seoul",
        phone: str | None = None,
        verify_phone: bool = True,
    ):
        if phone is None:
            Api._phones += 1
            phone = f"+82101{Api._phones:07d}"
        self.phone = phone
        res = self.client.post(
            "/api/auth/register",
            json={"name": name, "email": email, "password": password, "timezone": timezone, "phone": phone},
        )
        if res.status_code == 200:
            self.workspace_id = res.json()["workspace"]["id"]
            if verify_phone:
                sent = self.post("/api/auth/phone/send", json={})
                code = sent.json().get("dev_code")
                assert sent.status_code == 200, sent.text
                assert code
                checked = self.post("/api/auth/phone/verify", json={"code": code})
                assert checked.status_code == 200, checked.text
        return res

    def login(self, email: str, password: str = "password1"):
        res = self.client.post("/api/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
            self.workspace_id = res.json()["workspace"]["id"]
        return res

    def get(self, path: str, **kwargs):
        kwargs.setdefault("headers", {}).update(self.headers())
        return self.client.get(path, **kwargs)

    def post(self, path: str, **kwargs):
        kwargs.setdefault("headers", {}).update(self.headers())
        return self.client.post(path, **kwargs)

    def patch(self, path: str, **kwargs):
        kwargs.setdefault("headers", {}).update(self.headers())
        return self.client.patch(path, **kwargs)

    def put(self, path: str, **kwargs):
        kwargs.setdefault("headers", {}).update(self.headers())
        return self.client.put(path, **kwargs)

    def delete(self, path: str, **kwargs):
        headers = {**self.headers(), **(kwargs.pop("headers", {}) or {})}
        return self.client.request("DELETE", path, headers=headers, **kwargs)


@pytest.fixture
def api(client):
    return Api(client)


@pytest.fixture
def user(api: Api):
    api.register("Ada", "ada@example.com")
    return api


def make_user(name: str, email: str) -> Api:
    other = Api(TestClient(app))
    other.register(name, email)
    return other


def invite_and_join(owner: Api, email: str, name: str, role: str = "member", project_ids: list | None = None) -> Api:
    body = {"email": email, "role": role}
    if project_ids:
        body["project_ids"] = project_ids
    token = owner.post("/api/workspace/invites", json=body).json()["token"]
    other = make_user(name, email)
    accepted = other.post(f"/api/invites/{token}/accept")
    assert accepted.status_code == 200, accepted.text
    other.workspace_id = owner.workspace_id
    return other

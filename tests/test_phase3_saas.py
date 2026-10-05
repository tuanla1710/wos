from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import Api


def test_free_user_not_paywalled_for_daily_loop(user):
    assert user.post("/api/tasks", json={"title": "Personal"}).status_code == 200
    assert user.get("/api/home").status_code == 200
    assert user.get("/api/review").status_code == 200


def test_free_blocks_second_member(user):
    res = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"})
    assert res.status_code == 402
    assert "Team plan" in res.json()["detail"]


def test_subscribe_then_invite(user):
    assert user.post("/api/billing/subscribe").status_code == 200
    billing = user.get("/api/billing").json()
    assert billing["plan"] == "team"
    inv = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"})
    assert inv.status_code == 200


def test_member_cannot_see_billing(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    assert other.get("/api/billing").status_code == 403


def test_past_due_disables_invite_not_daily_loop(user):
    user.post("/api/billing/subscribe")
    user.post("/api/billing/fail")
    assert user.post("/api/tasks", json={"title": "Still working"}).status_code == 200
    assert user.post("/api/workspace/invites", json={"email": "x@example.com", "role": "member"}).status_code == 402


def test_api_token_team_only(user):
    denied = user.post("/api/api-tokens", json={"name": "ci"})
    assert denied.status_code == 402
    user.post("/api/billing/subscribe")
    created = user.post("/api/api-tokens", json={"name": "ci"})
    assert created.status_code == 200
    token = created.json()["token"]
    res = user.client.get("/api/public/tasks", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "tasks" in res.json()


def test_analytics_owner_only(user):
    user.post("/api/tasks", json={"title": "Stat"})
    data = user.get("/api/analytics").json()
    assert data["created"] >= 1
    assert "active_members" in data


def test_second_workspace_requires_team(user):
    denied = user.post("/api/workspaces", json={"name": "Other"})
    assert denied.status_code == 402
    user.post("/api/billing/subscribe")
    ok = user.post("/api/workspaces", json={"name": "Other"})
    assert ok.status_code == 200

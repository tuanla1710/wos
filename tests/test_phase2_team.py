from tests.conftest import Api


def _second(client, email="minho@example.com", name="Minho"):
    other = Api(client)
    other.client = client.__class__(client.app) if False else None
    from fastapi.testclient import TestClient
    from app.main import app

    other.client = TestClient(app)
    other.register(name, email)
    return other


def test_tm1_invite_and_accept(user, client):
    user.post("/api/billing/subscribe")
    inv = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"})
    assert inv.status_code == 200
    token = inv.json()["token"]
    other = Api(client.__class__(__import__("app.main", fromlist=["app"]).app) if False else user.client)
    from fastapi.testclient import TestClient
    from app.main import app

    guest_client = TestClient(app)
    other = Api(guest_client)
    other.register("Minho", "minho@example.com")
    acc = other.post(f"/api/invites/{token}/accept")
    assert acc.status_code == 200
    members = user.get("/api/workspace/members").json()["members"]
    assert any(m["email"] == "minho@example.com" for m in members)


def test_tm2_member_cannot_invite_or_delete_workspace(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "jisoo@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Jisoo", "jisoo@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    assert other.post("/api/workspace/invites", json={"email": "x@example.com", "role": "member"}).status_code == 403
    assert other.delete(f"/api/workspaces/{user.workspace_id}", json={"confirm_name": "Personal"}).status_code == 403
    assert other.post("/api/tasks", json={"title": "Member task"}).status_code == 200


def test_tm3_last_owner_cannot_be_demoted(user):
    me = user.get("/api/me").json()
    res = user.patch(f"/api/workspace/members/{me['id']}", json={"role": "member"})
    assert res.status_code in {400, 403}


def test_tm4_remove_member_reassigns_to_owner(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    task = other.post("/api/tasks", json={"title": "Minho work", "due_date": "2030-01-01"}).json()
    other.patch(f"/api/tasks/{task['id']}", json={"assignee_id": other.get("/api/me").json()["id"]})
    minho_id = other.get("/api/me").json()["id"]
    user.delete(f"/api/workspace/members/{minho_id}")
    left = user.get(f"/api/tasks/{task['id']}").json()
    assert left["assignee_id"] == user.get("/api/me").json()["id"]


def test_tm5_solo_hides_team_activity(user):
    home = user.get("/api/home").json()
    assert home["member_count"] == 1
    assert home["team_activity"] == []
    team = user.get("/api/team").json()
    assert team["solo"] is True


def test_as2_my_tasks_only_mine(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    user.post("/api/tasks", json={"title": "Ada task", "due_date": "2030-01-01"})
    other.post("/api/tasks", json={"title": "Minho task", "due_date": "2030-01-01"})
    mine = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    theirs = [t["title"] for t in other.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Ada task" in mine
    assert "Minho task" not in mine
    assert "Minho task" in theirs


def test_as3_reassign_notifies_other_not_self(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    task = user.post("/api/tasks", json={"title": "Hand off", "due_date": "2030-01-01"}).json()
    minho_id = other.get("/api/me").json()["id"]
    user.patch(f"/api/tasks/{task['id']}", json={"assignee_id": minho_id})
    notes = other.get("/api/notifications").json()["notifications"]
    assert any(n["type"] == "assigned" for n in notes)
    self_notes = user.get("/api/notifications").json()["notifications"]
    assert not any(n["type"] == "assigned" for n in self_notes)


def test_cm1_cm2_comment_and_mention(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    task = user.post("/api/tasks", json={"title": "API review", "due_date": "2030-01-01"}).json()
    user.post(f"/api/tasks/{task['id']}/comments", json={"body": "Please look @Minho"})
    comments = user.get(f"/api/tasks/{task['id']}/comments").json()["comments"]
    assert comments[0]["body"] == "Please look @Minho"
    notes = other.get("/api/notifications").json()["notifications"]
    assert any(n["type"] == "mention" for n in notes)


def test_cm3_no_notify_on_focus_or_checklist(user):
    task = user.post("/api/tasks", json={"title": "Quiet"}).json()
    user.post(f"/api/tasks/{task['id']}/move-my-tasks")
    user.put("/api/focus", json={"task_ids": [task["id"]]})
    item = user.post(f"/api/tasks/{task['id']}/checklist", json={"title": "tick"}).json()
    user.patch(f"/api/checklist/{item['id']}", json={"is_done": True})
    types = [n["type"] for n in user.get("/api/notifications").json()["notifications"]]
    assert "assigned" not in types
    assert not any(t in {"focus", "checklist"} for t in types)


def test_te2_progress_formula(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    from fastapi.testclient import TestClient
    from app.main import app

    other = Api(TestClient(app))
    other.register("Minho", "minho@example.com")
    other.post(f"/api/invites/{token}/accept")
    other.workspace_id = user.workspace_id
    a = other.post("/api/tasks", json={"title": "Open", "due_date": "2030-01-01"}).json()
    b = other.post("/api/tasks", json={"title": "Done", "due_date": "2030-01-01"}).json()
    other.patch(f"/api/tasks/{b['id']}", json={"status": "done"})
    team = user.get("/api/team").json()
    minho = next(m for m in team["members"] if m["name"] == "Minho")
    assert minho["open"] == 1
    assert minho["progress"] == 50
    assert a


def test_te3_new_workspace_is_empty(user):
    user.post("/api/billing/subscribe")
    created = user.post("/api/workspaces", json={"name": "Gigalane"}).json()
    user.workspace_id = created["id"]
    home = user.get("/api/home").json()
    assert home["counts"]["inbox"] == 0
    assert user.get("/api/tasks?tab=all").json()["tasks"] == []

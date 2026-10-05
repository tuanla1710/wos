from datetime import date, timedelta

from tests.conftest import invite_and_join, make_user


def test_q2_title_and_project_skips_inbox(user):
    project = user.post("/api/projects", json={"name": "RAN"}).json()
    task = user.post("/api/tasks", json={"title": "Scoped", "project_id": project["id"]}).json()
    assert task["is_inbox"] is False
    assert task["project_id"] == project["id"]
    titles = [t["title"] for t in user.get("/api/tasks?tab=inbox").json()["tasks"]]
    assert "Scoped" not in titles


def test_search_notes_and_people(user):
    user.post("/api/billing/subscribe")
    user.post("/api/notes", json={"title": "API brief", "body": "ship notes"})
    invite_and_join(user, "minho@example.com", "Minho")
    data = user.get("/api/search?q=API").json()
    assert any(n["title"] == "API brief" for n in data["notes"])
    people = user.get("/api/search?q=Min").json()["people"]
    assert any(p["name"] == "Minho" for p in people)


def test_comment_edit_and_soft_delete(user):
    task = user.post("/api/tasks", json={"title": "Talk"}).json()
    comment = user.post(f"/api/tasks/{task['id']}/comments", json={"body": "first"}).json()
    patched = user.patch(f"/api/comments/{comment['id']}", json={"body": "edited"}).json()
    assert patched["body"] == "edited"
    user.delete(f"/api/comments/{comment['id']}")
    body = user.get(f"/api/tasks/{task['id']}/comments").json()["comments"][0]
    assert body["deleted"] is True
    assert body["body"] == "Comment deleted"


def test_tags_roundtrip(user):
    task = user.post("/api/tasks", json={"title": "Tagged", "due_date": date.today().isoformat()}).json()
    user.post("/api/tags", json={"name": "urgent"})
    user.patch(f"/api/tasks/{task['id']}", json={"tags": ["urgent"]})
    names = [t["name"] for t in user.get("/api/tags").json()["tags"]]
    assert "urgent" in names


def test_notifications_mark_read(user):
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    user.post("/api/tasks", json={"title": "Soon", "due_date": tomorrow})
    notes = user.get("/api/notifications").json()
    assert notes["unread"] >= 1
    user.post("/api/notifications/read-all")
    after = user.get("/api/notifications").json()
    assert after["unread"] == 0


def test_workspace_isolation(user):
    user.post("/api/billing/subscribe")
    user.post("/api/tasks", json={"title": "Ada only", "due_date": "2030-01-01"})
    other_ws = user.post("/api/workspaces", json={"name": "Gigalane"}).json()
    user.workspace_id = other_ws["id"]
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Ada only" not in titles
    home = user.get("/api/home").json()
    assert home["counts"]["inbox"] == 0


def test_revoke_invite_cannot_accept(user):
    user.post("/api/billing/subscribe")
    inv = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()
    user.delete(f"/api/workspace/invites/{inv['id']}")
    other = make_user("Minho", "minho@example.com")
    assert other.post(f"/api/invites/{inv['token']}/accept").status_code == 410


def test_invite_email_must_match(user):
    user.post("/api/billing/subscribe")
    token = user.post("/api/workspace/invites", json={"email": "minho@example.com", "role": "member"}).json()["token"]
    other = make_user("Other", "other@example.com")
    assert other.post(f"/api/invites/{token}/accept").status_code == 400


def test_guest_cannot_see_other_project(user):
    user.post("/api/billing/subscribe")
    shared = user.post("/api/projects", json={"name": "Shared"}).json()
    hidden = user.post("/api/projects", json={"name": "Secret"}).json()
    hidden_task = user.post("/api/tasks", json={"title": "Hidden", "project_id": hidden["id"]}).json()
    guest = invite_and_join(user, "guest@example.com", "Guest", role="guest", project_ids=[shared["id"]])
    assert guest.get(f"/api/tasks/{hidden_task['id']}").status_code == 404
    names = [p["name"] for p in guest.get("/api/projects").json()["projects"]]
    assert names == ["Shared"]


def test_api_token_revoke(user):
    user.post("/api/billing/subscribe")
    created = user.post("/api/api-tokens", json={"name": "ci"}).json()
    user.delete(f"/api/api-tokens/{created['id']}")
    res = user.client.get("/api/public/tasks", headers={"Authorization": f"Bearer {created['token']}"})
    assert res.status_code == 401


def test_event_patch_and_delete(user):
    today = date.today().isoformat()
    ev = user.post("/api/events", json={"title": "Standup", "event_date": today, "start_time": "09:00", "end_time": "09:30"}).json()
    patched = user.patch(f"/api/events/{ev['id']}", json={"title": "Retro", "event_date": today, "all_day": True}).json()
    assert patched["title"] == "Retro"
    assert patched["all_day"] is True
    user.delete(f"/api/events/{ev['id']}")
    cal = user.get(f"/api/calendar?from={today}&to={today}").json()
    assert all(e["id"] != ev["id"] for e in cal["events"])


def test_ai_toggle_off_blocks_again(user):
    user.patch("/api/me", json={"ai_enabled": True})
    assert user.get("/api/ai/focus").status_code == 200
    user.patch("/api/me", json={"ai_enabled": False})
    assert user.get("/api/ai/focus").status_code == 400


def test_note_search_and_patch(user):
    note = user.post("/api/notes", json={"title": "Draft", "body": "hello"}).json()
    patched = user.patch(f"/api/notes/{note['id']}", json={"title": "Ready", "body": "world"}).json()
    assert patched["title"] == "Ready"
    found = user.get("/api/notes?q=Ready").json()["notes"]
    assert found[0]["id"] == note["id"]
    user.delete(f"/api/notes/{note['id']}")
    assert user.get("/api/notes").json()["notes"] == []

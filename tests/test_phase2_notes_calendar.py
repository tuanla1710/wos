from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import Api


def test_nt1_note_survives_task_delete(user):
    task = user.post("/api/tasks", json={"title": "Linked"}).json()
    note = user.post("/api/notes", json={"title": "Meeting", "body": "# Agenda", "task_id": task["id"]}).json()
    assert "status" not in note
    assert "due_date" not in note
    user.delete(f"/api/tasks/{task['id']}")
    left = user.get(f"/api/notes/{note['id']}").json()
    assert left["title"] == "Meeting"
    assert left["task_id"] is None


def test_nt2_plus_task_does_not_create_note(user):
    user.post("/api/tasks", json={"title": "Not a note"})
    assert user.get("/api/notes").json()["notes"] == []


def test_ce1_timed_event_ignored_by_home(user):
    today = date.today().isoformat()
    ev = user.post(
        "/api/events",
        json={"title": "Standup", "event_date": today, "start_time": "09:00", "end_time": "09:30"},
    )
    assert ev.status_code == 200
    assert ev.json()["all_day"] is False
    cal = user.get(f"/api/calendar?from={today}&to={today}").json()
    assert any(e["title"] == "Standup" for e in cal["events"])
    home = user.get("/api/home").json()
    assert home["counts"]["due_today"] == 0


def test_ce_all_day_event(user):
    today = date.today().isoformat()
    ev = user.post("/api/events", json={"title": "Holiday", "event_date": today, "all_day": True})
    assert ev.status_code == 200
    assert ev.json()["start_time"] is None


def test_ce_invalid_times(user):
    res = user.post(
        "/api/events",
        json={"title": "Bad", "event_date": date.today().isoformat(), "start_time": "11:00", "end_time": "10:00"},
    )
    assert res.status_code == 400


def test_at1_attachment_and_project_files(user):
    project = user.post("/api/projects", json={"name": "Files"}).json()
    task = user.post("/api/tasks", json={"title": "Spec", "project_id": project["id"]}).json()
    res = user.client.post(
        f"/api/tasks/{task['id']}/attachments",
        headers={"X-Workspace-Id": user.workspace_id},
        files={"file": ("note.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 200
    files = user.get(f"/api/projects/{project['id']}/files").json()["files"]
    assert files[0]["filename"] == "note.txt"


def test_gu1_guest_cannot_see_inbox_team_settings(user):
    user.post("/api/billing/subscribe")
    project = user.post("/api/projects", json={"name": "Shared"}).json()
    token = user.post(
        "/api/workspace/invites",
        json={"email": "guest@example.com", "role": "guest", "project_ids": [project["id"]]},
    ).json()["token"]
    other = Api(TestClient(app))
    other.register("Guest", "guest@example.com")
    assert other.post(f"/api/invites/{token}/accept").status_code == 200
    other.workspace_id = user.workspace_id
    assert other.get("/api/tasks?tab=inbox").status_code == 403
    assert other.get("/api/team").status_code == 403
    assert other.patch("/api/workspace", json={"name": "Hack"}).status_code == 403
    assert other.put("/api/focus", json={"task_ids": []}).status_code == 403
    names = [p["name"] for p in other.get("/api/projects").json()["projects"]]
    assert names == ["Shared"]

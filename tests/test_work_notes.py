import re
from datetime import date

from tests.conftest import invite_and_join

STAMP = re.compile(r"^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}")


def test_note_default_title_is_datetime(user):
    note = user.post("/api/notes", json={}).json()
    assert STAMP.match(note["title"])
    assert note["title"].count("_") == 1


def test_note_title_includes_project_and_task(user):
    project = user.post("/api/projects", json={"name": "RAN Platform"}).json()
    task = user.post("/api/tasks", json={"title": "Design API", "project_id": project["id"]}).json()
    note = user.post("/api/notes", json={"project_id": project["id"], "task_id": task["id"]}).json()
    assert STAMP.match(note["title"])
    assert note["title"].endswith("_RAN_Platform_Design_API")


def test_create_defaults_to_work(user):
    note = user.post("/api/notes", json={"title": "Log", "body": "Stable after reboot"}).json()
    assert note["kind"] == "work"
    assert note["pinned"] is False
    assert note["author_name"] == "Ada"
    assert "Stable" in note["snippet"]
    assert "status" not in note


def test_quick_note_title_from_body(user):
    note = user.post("/api/notes", json={"kind": "quick", "body": "Check PTP after reboot"}).json()
    assert note["kind"] == "quick"
    assert note["title"] == "Check PTP after reboot"
    assert note["body"] == ""


def test_meeting_skeleton(user):
    note = user.post("/api/notes", json={"kind": "meeting", "title": "Standup"}).json()
    assert "## Meeting" in note["body"]
    assert date.today().isoformat() in note["body"]
    assert "- [ ]" in note["body"]


def test_filters_and_pin_star_archive(user):
    a = user.post("/api/notes", json={"title": "Alpha", "body": "one"}).json()
    user.post("/api/notes", json={"title": "Beta", "body": "two"})
    assert len(user.get("/api/notes").json()["notes"]) == 2
    user.post(f"/api/notes/{a['id']}/pin", json={"pinned": True})
    pinned = user.get("/api/notes?filter=pinned").json()["notes"]
    assert [n["title"] for n in pinned] == ["Alpha"]
    assert pinned[0]["pinned"] is True
    user.post(f"/api/notes/{a['id']}/star", json={"starred": True})
    assert user.get(f"/api/notes/{a['id']}").json()["starred"] is True
    user.post(f"/api/notes/{a['id']}/archive", json={"archived": True})
    assert user.get("/api/notes").json()["notes"][0]["title"] == "Beta"
    archived = user.get("/api/notes?filter=archived").json()["notes"]
    assert [n["title"] for n in archived] == ["Alpha"]


def test_tags_and_task_link(user):
    task = user.post("/api/tasks", json={"title": "DU Integration"}).json()
    note = user.post("/api/notes", json={"title": "PTP", "body": "offset", "task_id": task["id"], "tags": ["ptp", "du"]}).json()
    assert note["task_title"] == "DU Integration"
    assert note["tags"] == ["du", "ptp"]
    listed = user.get(f"/api/notes?task_id={task['id']}").json()["notes"]
    assert listed[0]["id"] == note["id"]


def test_duplicate_and_search(user):
    note = user.post("/api/notes", json={"title": "FHI", "body": "7.2x config"}).json()
    copy = user.post(f"/api/notes/{note['id']}/duplicate").json()
    assert copy["title"] == "FHI (copy)"
    assert copy["id"] != note["id"]
    found = user.get("/api/notes?q=7.2x").json()["notes"]
    assert {n["title"] for n in found} == {"FHI", "FHI (copy)"}


def test_attachment_and_history(user):
    note = user.post("/api/notes", json={"title": "Files"}).json()
    uploaded = user.client.post(
        f"/api/notes/{note['id']}/attachments",
        headers={"X-Workspace-Id": user.workspace_id},
        files={"file": ("log.txt", b"du log", "text/plain")},
    )
    assert uploaded.status_code == 200, uploaded.text
    detail = user.get(f"/api/notes/{note['id']}").json()
    assert detail["file_count"] == 1
    assert detail["files"][0]["filename"] == "log.txt"
    hist = user.get(f"/api/notes/{note['id']}/activity").json()["activity"]
    assert any(row["verb"] == "note.created" for row in hist)
    assert any(row["verb"] == "note.file_added" for row in hist)


def test_guest_cannot_create_or_see_hidden(user):
    user.post("/api/billing/subscribe")
    project = user.post("/api/projects", json={"name": "Shared"}).json()
    guest = invite_and_join(user, "note-guest@example.com", "NoteGuest", role="guest", project_ids=[project["id"]])
    visible = user.post("/api/notes", json={"title": "Visible", "project_id": project["id"]}).json()
    hidden = user.post("/api/notes", json={"title": "Secret"}).json()
    assert guest.post("/api/notes", json={"title": "Nope"}).status_code == 403
    titles = [n["title"] for n in guest.get("/api/notes").json()["notes"]]
    assert "Visible" in titles
    assert "Secret" not in titles
    assert guest.get(f"/api/notes/{visible['id']}").status_code == 200
    assert guest.get(f"/api/notes/{hidden['id']}").status_code == 404
    found = user.get("/api/search?q=Secret").json()["notes"]
    user.post(f"/api/notes/{hidden['id']}/archive", json={"archived": True})
    after = user.get("/api/search?q=Secret").json()["notes"]
    assert any(n["id"] == hidden["id"] for n in found)
    assert after == []


def test_nt1_still_holds(user):
    task = user.post("/api/tasks", json={"title": "Linked"}).json()
    note = user.post("/api/notes", json={"title": "Keep", "task_id": task["id"]}).json()
    user.delete(f"/api/tasks/{task['id']}")
    left = user.get(f"/api/notes/{note['id']}").json()
    assert left["task_id"] is None
    assert left["title"] == "Keep"

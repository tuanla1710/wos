from io import BytesIO

from tests.conftest import invite_and_join


def test_backup_requires_auth(api):
    res = api.get("/api/backup")
    assert res.status_code == 401


def test_member_cannot_backup(user):
    user.post("/api/billing/subscribe")
    member = invite_and_join(user, "minho@example.com", "Minho")
    res = member.get("/api/backup")
    assert res.status_code == 403
    assert member.post("/api/backup/restore", data={"confirm": "RESTORE"}, files={"file": ("x.zip", b"nope", "application/zip")}).status_code == 403


def test_restore_requires_confirm(user):
    dump = user.get("/api/backup")
    assert dump.status_code == 200
    res = user.post("/api/backup/restore", data={"confirm": "please"}, files={"file": ("workos-backup.zip", dump.content, "application/zip")})
    assert res.status_code == 400


def test_restore_rejects_garbage(user):
    res = user.post(
        "/api/backup/restore",
        data={"confirm": "RESTORE"},
        files={"file": ("workos-backup.zip", b"not-a-zip", "application/zip")},
    )
    assert res.status_code == 400


def test_backup_restore_roundtrip(user):
    user.post("/api/workspace/holidays", json={"day": "2030-01-08", "name": "Off"})
    project = user.post("/api/projects", json={"name": "Alpha"}).json()
    task = user.post("/api/tasks", json={"title": "Keep me", "project_id": project["id"]}).json()
    user.post("/api/notes", json={"title": "Memo", "body": "hello backup"})
    uploaded = user.post(
        f"/api/tasks/{task['id']}/attachments",
        files={"file": ("note.txt", b"attachment-bytes", "text/plain")},
    )
    assert uploaded.status_code == 200, uploaded.text

    dump = user.get("/api/backup")
    assert dump.status_code == 200
    assert dump.headers["content-type"].startswith("application/zip")
    assert "workos-backup-" in dump.headers.get("content-disposition", "")

    user.delete(f"/api/tasks/{task['id']}")
    gone = user.get("/api/tasks?tab=all").json()["tasks"]
    assert all(row["title"] != "Keep me" for row in gone)

    restored = user.post(
        "/api/backup/restore",
        data={"confirm": "RESTORE"},
        files={"file": ("workos-backup.zip", BytesIO(dump.content), "application/zip")},
    )
    assert restored.status_code == 200, restored.text
    assert restored.json()["ok"] is True
    assert restored.json()["rows"] > 0

    tasks = user.get("/api/tasks?tab=all").json()["tasks"]
    assert any(row["title"] == "Keep me" for row in tasks)
    notes = user.get("/api/notes").json()["notes"]
    assert any(row["title"] == "Memo" for row in notes)
    holidays = user.get("/api/workspace/holidays").json()["holidays"]
    assert any(row["day"] == "2030-01-08" for row in holidays)
    projects = user.get("/api/projects").json()["projects"]
    assert any(row["name"] == "Alpha" for row in projects)

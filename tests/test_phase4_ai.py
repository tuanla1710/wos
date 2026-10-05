from datetime import date, timedelta


def test_ai_default_off(user):
    assert user.get("/api/me").json()["ai_enabled"] is False
    assert user.get("/api/ai/review").status_code == 400


def test_ai_priority_is_suggestion_until_apply(user):
    user.patch("/api/me", json={"ai_enabled": True})
    task = user.post("/api/tasks", json={"title": "Late", "due_date": (date.today() - timedelta(days=1)).isoformat()}).json()
    sug = user.get(f"/api/ai/priority/{task['id']}").json()
    assert sug["priority"] == "high"
    assert user.get(f"/api/tasks/{task['id']}").json()["priority"] == "medium"
    user.post("/api/ai/apply", json={"kind": "priority", "payload": {"task_id": task["id"], "priority": "high"}})
    assert user.get(f"/api/tasks/{task['id']}").json()["priority"] == "high"


def test_ai_does_not_auto_archive(user):
    user.patch("/api/me", json={"ai_enabled": True})
    task = user.post("/api/tasks", json={"title": "Maybe drop", "due_date": (date.today() - timedelta(days=2)).isoformat()}).json()
    review = user.get("/api/ai/review").json()
    assert review["suggestions"]
    still = user.get(f"/api/tasks/{task['id']}").json()
    assert still["archived_at"] is None


def test_ai_focus_apply(user):
    user.patch("/api/me", json={"ai_enabled": True})
    t = user.post("/api/tasks", json={"title": "Focus me"}).json()
    user.post(f"/api/tasks/{t['id']}/move-my-tasks")
    sug = user.get("/api/ai/focus").json()["suggestions"]
    ids = [row["id"] for row in sug][:3]
    user.post("/api/ai/apply", json={"kind": "focus", "payload": {"task_ids": ids}})
    focus = user.get("/api/focus").json()["focus"]
    assert len(focus) == len(ids)


def test_ai_parse_quick_add(user):
    user.patch("/api/me", json={"ai_enabled": True})
    parsed = user.post("/api/ai/parse", json={"text": "ship API tomorrow high"}).json()
    assert parsed["priority"] == "high"
    assert parsed["due_date"] == (date.today() + timedelta(days=1)).isoformat()
    assert "API" in parsed["title"] or "ship" in parsed["title"].lower()


def test_ai_cannot_cross_workspace(user):
    user.patch("/api/me", json={"ai_enabled": True})
    user.post("/api/billing/subscribe")
    other = user.post("/api/workspaces", json={"name": "Secret"}).json()
    user.workspace_id = other["id"]
    user.post("/api/tasks", json={"title": "Hidden"}).json()
    first = user.get("/api/workspaces").json()["workspaces"][0]["id"]
    user.workspace_id = first
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Hidden" not in titles

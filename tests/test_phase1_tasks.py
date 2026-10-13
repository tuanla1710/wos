from datetime import date, timedelta


def test_q1_title_only_lands_in_inbox(user):
    res = user.post("/api/tasks", json={"title": "Buy lamp"})
    assert res.status_code == 200
    body = res.json()
    assert body["is_inbox"] is True
    assert body["project_id"] is None
    inbox = user.get("/api/tasks?tab=inbox").json()["tasks"]
    assert inbox[0]["title"] == "Buy lamp"


def test_q3_empty_title_uses_stamp(user):
    res = user.post("/api/tasks", json={"title": "   "})
    assert res.status_code == 200
    title = res.json()["title"]
    assert title.count("_") == 1
    assert title[:10].count("-") == 2


def test_task_stamp_includes_project(user):
    project = user.post("/api/projects", json={"name": "RAN Platform"}).json()
    task = user.post("/api/tasks", json={"project_id": project["id"]}).json()
    assert task["title"].endswith("_RAN_Platform")
    assert task["is_inbox"] is False


def test_i3_title_priority_stays_inbox(user):
    task = user.post("/api/tasks", json={"title": "Stay"}).json()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"title": "Stay 2", "priority": "high"}).json()
    assert patched["is_inbox"] is True


def test_i4_project_leaves_inbox(user):
    project = user.post("/api/projects", json={"name": "RAN"}).json()
    task = user.post("/api/tasks", json={"title": "Organize"}).json()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"project_id": project["id"]}).json()
    assert patched["is_inbox"] is False
    assert user.get("/api/tasks?tab=inbox").json()["tasks"] == []


def test_i5_due_leaves_inbox(user):
    task = user.post("/api/tasks", json={"title": "Dated"}).json()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"due_date": date.today().isoformat()}).json()
    assert patched["is_inbox"] is False


def test_i6_move_to_my_tasks(user):
    task = user.post("/api/tasks", json={"title": "Move"}).json()
    patched = user.post(f"/api/tasks/{task['id']}/move-my-tasks").json()
    assert patched["is_inbox"] is False


def test_i7_clear_due_does_not_return_inbox(user):
    task = user.post("/api/tasks", json={"title": "Keep", "due_date": date.today().isoformat()}).json()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"clear_due": True}).json()
    assert patched["is_inbox"] is False


def test_t5_done_sets_completed_and_clears_focus(user):
    task = user.post("/api/tasks", json={"title": "Finish"}).json()
    user.post(f"/api/tasks/{task['id']}/move-my-tasks")
    user.put("/api/focus", json={"task_ids": [task["id"]]})
    done = user.patch(f"/api/tasks/{task['id']}", json={"status": "done"}).json()
    assert done["status"] == "done"
    assert done["completed_at"]
    assert user.get("/api/focus").json()["focus"] == []


def test_t6_reopen_clears_completed(user):
    task = user.post("/api/tasks", json={"title": "Reopen", "due_date": date.today().isoformat()}).json()
    user.patch(f"/api/tasks/{task['id']}", json={"status": "done"})
    reopened = user.patch(f"/api/tasks/{task['id']}", json={"status": "todo"}).json()
    assert reopened["completed_at"] is None


def test_t7_checklist_does_not_change_status(user):
    task = user.post("/api/tasks", json={"title": "List"}).json()
    item = user.post(f"/api/tasks/{task['id']}/checklist", json={"title": "one"}).json()
    user.patch(f"/api/checklist/{item['id']}", json={"is_done": True})
    detail = user.get(f"/api/tasks/{task['id']}").json()
    assert detail["status"] == "todo"


def test_t9_move_inbox_keeps_project(user):
    project = user.post("/api/projects", json={"name": "P"}).json()
    task = user.post("/api/tasks", json={"title": "Back", "project_id": project["id"]}).json()
    moved = user.post(f"/api/tasks/{task['id']}/move-inbox").json()
    assert moved["is_inbox"] is True
    assert moved["project_id"] == project["id"]


def test_t11_archive_hides_from_lists(user):
    task = user.post("/api/tasks", json={"title": "Old", "due_date": date.today().isoformat()}).json()
    user.post(f"/api/tasks/{task['id']}/archive")
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Old" not in titles


def test_t12_delete(user):
    task = user.post("/api/tasks", json={"title": "Gone"}).json()
    assert user.delete(f"/api/tasks/{task['id']}").status_code == 200
    assert user.get(f"/api/tasks/{task['id']}").status_code == 404


def test_m1_today_includes_due_and_focus(user):
    today = date.today().isoformat()
    due = user.post("/api/tasks", json={"title": "Due today", "due_date": today}).json()
    pin = user.post("/api/tasks", json={"title": "Pin me"}).json()
    user.post(f"/api/tasks/{pin['id']}/move-my-tasks")
    user.put("/api/focus", json={"task_ids": [pin["id"]]})
    titles = [t["title"] for t in user.get("/api/tasks?tab=today").json()["tasks"]]
    assert "Due today" in titles
    assert "Pin me" in titles
    assert due["id"]


def test_m2_upcoming(user):
    future = (date.today() + timedelta(days=3)).isoformat()
    user.post("/api/tasks", json={"title": "Later", "due_date": future})
    titles = [t["title"] for t in user.get("/api/tasks?tab=upcoming").json()["tasks"]]
    assert titles == ["Later"]


def test_m3_overdue_oldest_first(user):
    old = (date.today() - timedelta(days=5)).isoformat()
    newer = (date.today() - timedelta(days=1)).isoformat()
    user.post("/api/tasks", json={"title": "Older", "due_date": old})
    user.post("/api/tasks", json={"title": "Newer", "due_date": newer})
    titles = [t["title"] for t in user.get("/api/tasks?tab=overdue").json()["tasks"]]
    assert titles[0] == "Older"


def test_m5_inbox_absent_from_all(user):
    user.post("/api/tasks", json={"title": "Only inbox"})
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Only inbox" not in titles


def test_p1_p3_project_overview(user):
    project = user.post("/api/projects", json={"name": "Alpha"}).json()
    overview = user.get(f"/api/projects/{project['id']}").json()
    assert overview["name"] == "Alpha"
    assert overview["counts"]["tasks"] == 0
    user.post("/api/tasks", json={"title": "Work", "project_id": project["id"]})
    overview = user.get(f"/api/projects/{project['id']}").json()
    assert overview["counts"]["tasks"] == 1


def test_p2_empty_project_name(user):
    res = user.post("/api/projects", json={"name": "  "})
    assert res.status_code in {400, 422}


def test_p7_delete_project_requires_password(user):
    project = user.post("/api/projects", json={"name": "Temp"}).json()
    missing = user.delete(f"/api/projects/{project['id']}", json={"task_action": "my_tasks"})
    assert missing.status_code == 422
    wrong = user.delete(f"/api/projects/{project['id']}", json={"task_action": "my_tasks", "password": "not-it"})
    assert wrong.status_code == 400
    assert wrong.json()["detail"] == "Password is wrong."
    assert user.get(f"/api/projects/{project['id']}").status_code == 200


def test_p7_delete_project_keeps_tasks(user):
    project = user.post("/api/projects", json={"name": "Temp"}).json()
    task = user.post("/api/tasks", json={"title": "Keep", "project_id": project["id"]}).json()
    user.delete(f"/api/projects/{project['id']}", json={"task_action": "my_tasks", "password": "password1"})
    left = user.get(f"/api/tasks/{task['id']}").json()
    assert left["project_id"] is None
    assert left["is_inbox"] is False


def test_focus_max_three(user):
    ids = []
    for i in range(4):
        t = user.post("/api/tasks", json={"title": f"F{i}"}).json()
        user.post(f"/api/tasks/{t['id']}/move-my-tasks")
        ids.append(t["id"])
    res = user.put("/api/focus", json={"task_ids": ids})
    assert res.status_code == 400
    ok = user.put("/api/focus", json={"task_ids": ids[:3]})
    assert ok.status_code == 200
    assert len(ok.json()["focus"]) == 3

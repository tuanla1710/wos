import io
import zipfile
from datetime import date, timedelta


def test_h1_empty_home(user):
    home = user.get("/api/home").json()
    assert home["counts"] == {"overdue": 0, "due_today": 0, "upcoming": 0, "inbox": 0}
    assert home["focus"] == []
    assert home["team_activity"] == []


def test_h3_counts(user):
    today = date.today()
    user.post("/api/tasks", json={"title": "Over", "due_date": (today - timedelta(days=1)).isoformat()})
    user.post("/api/tasks", json={"title": "Today", "due_date": today.isoformat()})
    user.post("/api/tasks", json={"title": "Soon", "due_date": (today + timedelta(days=2)).isoformat()})
    user.post("/api/tasks", json={"title": "Inbox only"})
    counts = user.get("/api/home").json()["counts"]
    assert counts["overdue"] == 1
    assert counts["due_today"] == 1
    assert counts["upcoming"] == 1
    assert counts["inbox"] == 1


def test_h5_no_auto_pin(user):
    user.post("/api/tasks", json={"title": "Idea"})
    home = user.get("/api/home").json()
    assert home["focus"] == []
    assert home["suggestions"]


def test_h6_use_suggestions(user):
    user.post("/api/tasks", json={"title": "A"})
    user.post("/api/tasks", json={"title": "B"})
    ids = [t["id"] for t in user.get("/api/home").json()["suggestions"][:3]]
    user.put("/api/focus", json={"task_ids": ids})
    assert len(user.get("/api/home").json()["focus"]) == len(ids)


def test_h10_week_bars_mon_fri(user):
    week = user.get("/api/home").json()["this_week"]
    assert len(week) == 5
    assert [d["weekday"] for d in week] == ["Mon", "Tue", "Wed", "Thu", "Fri"]


def test_h15_greeting(user):
    word = user.get("/api/home").json()["greeting"]
    assert word in {"morning", "afternoon", "evening"}


def test_c2_calendar_due_chip(user):
    today = date.today().isoformat()
    user.post("/api/tasks", json={"title": "Meet", "due_date": today})
    data = user.get(f"/api/calendar?from={today}&to={today}").json()
    assert any(t["title"] == "Meet" for t in data["tasks"])
    assert "events" in data


def test_c3_no_due_not_on_calendar(user):
    user.post("/api/tasks", json={"title": "No due"})
    today = date.today().isoformat()
    titles = [t["title"] for t in user.get(f"/api/calendar?from={today}&to={today}").json()["tasks"]]
    assert "No due" not in titles


def test_c4_drag_changes_due(user):
    task = user.post("/api/tasks", json={"title": "Drag", "due_date": date.today().isoformat()}).json()
    nxt = (date.today() + timedelta(days=1)).isoformat()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"due_date": nxt}).json()
    assert patched["due_date"] == nxt


def test_r1_review_always_returns_lists(user):
    review = user.get("/api/review").json()
    for key in ("week_start", "week_end", "completed", "completed_tasks", "overdue", "blocked", "due_next_week", "projects", "week_focus", "next_week_start"):
        assert key in review
    assert review["completed"] == 0
    assert review["completed_tasks"] == []


def test_r2_completed_this_week(user):
    task = user.post("/api/tasks", json={"title": "Shipped weekly report", "due_date": date.today().isoformat()}).json()
    user.patch(f"/api/tasks/{task['id']}", json={"status": "done"})
    review = user.get("/api/review").json()
    assert review["completed"] == 1
    assert review["completed_tasks"][0]["title"] == "Shipped weekly report"


def test_review_export_pptx(user):
    res = user.get("/api/review/export")
    assert res.status_code == 200
    assert "officedocument.presentationml.presentation" in res.headers["content-type"]
    assert res.content[:2] == b"PK"
    z = zipfile.ZipFile(io.BytesIO(res.content))
    xml = z.read("ppt/slides/slide1.xml").decode("utf-8")
    assert "실적" in xml
    assert "계획" in xml
    assert "진행 업무 및 이슈" in xml
    assert "대책" in xml
    assert z.read("ppt/presentation.xml").decode("utf-8").count("<p:sldId ") == 1


def test_r3_reschedule(user):
    task = user.post("/api/tasks", json={"title": "Late", "due_date": (date.today() - timedelta(days=2)).isoformat()}).json()
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    user.post("/api/review/reschedule", json={"task_id": task["id"], "due_date": tomorrow})
    assert user.get(f"/api/tasks/{task['id']}").json()["due_date"] == tomorrow


def test_r4_drop_archives(user):
    task = user.post("/api/tasks", json={"title": "Drop", "due_date": (date.today() - timedelta(days=1)).isoformat()}).json()
    user.post("/api/review/drop", json={"task_id": task["id"]})
    titles = [t["title"] for t in user.get("/api/tasks?tab=overdue").json()["tasks"]]
    assert "Drop" not in titles


def test_r5_unblock(user):
    task = user.post("/api/tasks", json={"title": "Stuck", "due_date": date.today().isoformat()}).json()
    user.patch(f"/api/tasks/{task['id']}", json={"status": "blocked", "blocked_reason": "wait"})
    user.post("/api/review/unblock", json={"task_id": task["id"]})
    body = user.get(f"/api/tasks/{task['id']}").json()
    assert body["status"] == "todo"
    assert body["blocked_reason"] == ""


def test_r7_week_focus_max_three(user):
    review = user.get("/api/review").json()
    ids = []
    for i in range(3):
        t = user.post("/api/tasks", json={"title": f"WF{i}"}).json()
        user.post(f"/api/tasks/{t['id']}/move-my-tasks")
        ids.append(t["id"])
    res = user.put("/api/review/week-focus", json={"week_start": review["next_week_start"], "task_ids": ids})
    assert res.status_code == 200
    extra = user.post("/api/tasks", json={"title": "WF3"}).json()
    user.post(f"/api/tasks/{extra['id']}/move-my-tasks")
    bad = user.put("/api/review/week-focus", json={"week_start": review["next_week_start"], "task_ids": ids + [extra["id"]]})
    assert bad.status_code == 400


def test_s1_search_groups(user):
    user.post("/api/projects", json={"name": "API Hub"})
    user.post("/api/tasks", json={"title": "API design"})
    data = user.get("/api/search?q=API").json()
    assert data["tasks"]
    assert data["projects"]


def test_s2_no_results(user):
    data = user.get("/api/search?q=zzzzzz").json()
    assert data["tasks"] == []
    assert data["projects"] == []


def test_s4_settings_patch(user):
    res = user.patch("/api/me", json={"name": "Ada Lovelace", "timezone": "UTC"})
    assert res.status_code == 200
    assert res.json()["name"] == "Ada Lovelace"

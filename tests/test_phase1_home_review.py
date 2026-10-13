import io
import re
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
    for key in (
        "week_start",
        "week_end",
        "last_week_start",
        "last_week_end",
        "plan_week_start",
        "plan_week_end",
        "completed",
        "completed_tasks",
        "last_week_done",
        "this_week_done",
        "this_week_doing",
        "next_week_planned",
        "overdue",
        "blocked",
        "due_next_week",
        "projects",
        "week_focus",
        "next_week_start",
    ):
        assert key in review
    assert review["completed"] == 0
    assert review["completed_tasks"] == []
    assert review["last_week_done"] == []
    assert review["this_week_doing"] == []
    assert review["next_week_planned"] == []


def test_r2_completed_this_week(user):
    task = user.post("/api/tasks", json={"title": "Shipped weekly report", "due_date": date.today().isoformat()}).json()
    user.patch(f"/api/tasks/{task['id']}", json={"status": "done"})
    review = user.get("/api/review").json()
    assert review["completed"] == 1
    assert review["completed_tasks"][0]["title"] == "Shipped weekly report"
    assert review["this_week_done"][0]["title"] == "Shipped weekly report"


def test_weekly_report_three_weeks(user):
    today = date.today()
    review = user.get("/api/review").json()
    nxt = date.fromisoformat(review["plan_week_start"])
    shipped = user.post("/api/tasks", json={"title": "Shipped last", "due_date": today.isoformat()}).json()
    user.patch(f"/api/tasks/{shipped['id']}", json={"status": "done"})
    doing = user.post("/api/tasks", json={"title": "Writing report", "due_date": today.isoformat()}).json()
    user.patch(f"/api/tasks/{doing['id']}", json={"status": "in_progress"})
    later = user.post("/api/tasks", json={"title": "Next week plan", "due_date": nxt.isoformat()}).json()
    data = user.get("/api/review").json()
    assert any(t["title"] == "Shipped last" for t in data["this_week_done"])
    assert any(t["title"] == "Writing report" for t in data["this_week_doing"])
    assert any(t["title"] == "Next week plan" for t in data["next_week_planned"])
    future = user.get(f"/api/review?week_start={nxt.isoformat()}").json()
    assert any(t["title"] == "Shipped last" for t in future["last_week_done"])


def test_review_board_keeps_tasks_when_project_due_is_later(user):
    review = user.get("/api/review").json()
    later = (date.fromisoformat(review["week_end"]) + timedelta(days=14)).isoformat()
    project = user.post("/api/projects", json={"name": "October project", "due_date": later, "start_date": review["week_start"]}).json()
    user.post(
        "/api/tasks",
        json={"title": "Due this week", "project_id": project["id"], "due_date": review["week_end"], "start_date": review["week_start"]},
    )
    board = user.get("/api/review").json()["board"]["this"]
    names = [p["name"] for p in board["projects"]]
    assert "October project" in names
    card = next(p for p in board["projects"] if p["name"] == "October project")
    assert any(t["title"] == "Due this week" for t in card["tasks"])


def test_project_status_and_week_plan(user):
    project = user.post("/api/projects", json={"name": "Editable"}).json()
    patched = user.patch(f"/api/projects/{project['id']}", json={"status": "in_progress"})
    assert patched.status_code == 200
    assert patched.json()["status"] == "in_progress"
    detail = user.get(f"/api/projects/{project['id']}").json()
    assert detail["status"] == "in_progress"
    assert detail["week_plan"]["editable"] is True
    this = detail["week_plan"]["this"]["start"]
    nxt = detail["week_plan"]["next"]["start"]
    saved = user.put(
        "/api/review/project-week-target",
        json={"project_id": project["id"], "week_start": this, "target_progress": 40},
    )
    assert saved.status_code == 200
    user.put(
        "/api/review/project-week-target",
        json={"project_id": project["id"], "week_start": nxt, "target_progress": 55},
    )
    again = user.get(f"/api/projects/{project['id']}").json()
    assert again["week_plan"]["this"]["value"] == 40
    assert again["week_plan"]["next"]["value"] == 55
    assert again["week_plan"]["next"]["min"] == 40
    low = user.put(
        "/api/review/project-week-target",
        json={"project_id": project["id"], "week_start": nxt, "target_progress": 10},
    )
    assert low.status_code == 400


def test_review_export_pptx(user):
    review = user.get("/api/review").json()
    due = review["week_end"]
    month, day = due[5:7], due[8:10]
    project = user.post("/api/projects", json={"name": "Report project", "due_date": due}).json()
    child = user.post("/api/projects", json={"name": "하위 과제", "parent_id": project["id"], "due_date": due}).json()
    task = user.post(
        "/api/tasks",
        json={"title": "Report line", "project_id": project["id"], "due_date": due, "start_date": review["week_start"]},
    ).json()
    user.post(
        "/api/tasks",
        json={"title": "Child line", "project_id": child["id"], "due_date": due, "start_date": review["week_start"]},
    )
    user.put("/api/review/week-target", json={"task_id": task["id"], "week_start": review["week_start"], "target_progress": 70})
    user.put("/api/review/week-target", json={"task_id": task["id"], "week_start": review["plan_week_start"], "target_progress": 80})
    res = user.get("/api/review/export")
    assert res.status_code == 200
    assert "officedocument.presentationml.presentation" in res.headers["content-type"]
    assert res.content[:2] == b"PK"
    z = zipfile.ZipFile(io.BytesIO(res.content))
    xml = z.read("ppt/slides/slide1.xml").decode("utf-8")
    week_no = date.fromisoformat(review["week_start"]).isocalendar().week
    assert f"ORAN 템팀 주간보고 W{week_no}" in xml
    assert "실적" in xml
    assert "계획" in xml
    assert "일시" in xml
    assert "week " not in xml
    assert "Last Week" not in xml
    assert "This Week" not in xml
    assert "Next Week" not in xml
    texts = re.findall(r"<a:t>([^<]*)</a:t>", xml)
    assert "1. report project" in texts, texts
    assert "가. 하위 과제" in xml
    assert xml.count(f"70%, {month}/{day}") == 1
    assert xml.count(f"80%, {month}/{day}") == 1
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

from datetime import date, timedelta


def test_task_start_and_workdays_skip_weekend(user):
    # Mon–Fri inclusive = 5 workdays
    start = date(2030, 1, 7)  # Monday
    due = date(2030, 1, 11)  # Friday
    task = user.post("/api/tasks", json={"title": "Sprint", "start_date": start.isoformat(), "due_date": due.isoformat()}).json()
    assert task["start_date"] == start.isoformat()
    assert task["due_date"] == due.isoformat()
    assert task["work_days"] == 5
    assert task["is_inbox"] is False


def test_task_workdays_skip_weekend_span(user):
    start = date(2030, 1, 10)  # Friday
    due = date(2030, 1, 13)  # Monday
    task = user.post("/api/tasks", json={"title": "Weekend", "start_date": start.isoformat(), "due_date": due.isoformat()}).json()
    assert task["work_days"] == 2


def test_task_start_after_due_rejected(user):
    res = user.post(
        "/api/tasks",
        json={"title": "Backwards", "start_date": "2030-01-10", "due_date": "2030-01-08"},
    )
    assert res.status_code == 400


def test_holiday_reduces_workdays(user):
    start = date(2030, 1, 7)
    due = date(2030, 1, 10)
    user.post("/api/workspace/holidays", json={"day": "2030-01-08", "name": "Off"})
    task = user.post("/api/tasks", json={"title": "Holiday", "start_date": start.isoformat(), "due_date": due.isoformat()}).json()
    assert task["work_days"] == 3


def test_project_schedule(user):
    project = user.post("/api/projects", json={"name": "Alpha", "start_date": "2030-01-07", "due_date": "2030-01-11"}).json()
    assert project["work_days"] == 5
    patched = user.patch(f"/api/projects/{project['id']}", json={"due_date": "2030-01-14"}).json()
    assert patched["work_days"] == 6


def test_clear_start(user):
    task = user.post("/api/tasks", json={"title": "Clear", "start_date": date.today().isoformat(), "due_date": (date.today() + timedelta(days=1)).isoformat()}).json()
    patched = user.patch(f"/api/tasks/{task['id']}", json={"clear_start": True}).json()
    assert patched["start_date"] is None
    assert patched["work_days"] is None

from tests.conftest import invite_and_join


def test_task_and_project_status(user):
    empty = user.post("/api/projects", json={"name": "Empty"}).json()
    ran = user.post("/api/projects", json={"name": "RAN"}).json()
    done_p = user.post("/api/projects", json={"name": "Done"}).json()

    inbox = user.post("/api/tasks", json={"title": "Capture"}).json()
    todo = user.post("/api/tasks", json={"title": "Spec", "project_id": ran["id"]}).json()
    doing = user.post("/api/tasks", json={"title": "Build", "project_id": ran["id"]}).json()
    user.patch(f"/api/tasks/{doing['id']}", json={"status": "in_progress"})
    blocked = user.post("/api/tasks", json={"title": "Wait", "project_id": ran["id"]}).json()
    user.patch(f"/api/tasks/{blocked['id']}", json={"status": "blocked"})
    late = user.post("/api/tasks", json={"title": "Late", "project_id": ran["id"], "due_date": "2020-01-01"}).json()
    finished = user.post("/api/tasks", json={"title": "Ship", "project_id": done_p["id"]}).json()
    user.patch(f"/api/tasks/{finished['id']}", json={"status": "done"})

    data = user.get("/api/statistics").json()
    tasks = data["tasks"]
    assert tasks["inbox"] == 1
    assert tasks["todo"] >= 2
    assert tasks["in_progress"] == 1
    assert tasks["blocked"] == 1
    assert tasks["done"] == 1
    assert tasks["overdue"] == 1
    assert inbox["id"]
    assert todo["id"]
    assert late["id"]
    assert empty["id"]

    rows = {row["name"]: row for row in data["projects"]["rows"]}
    assert rows["Empty"]["status"] == "empty"
    assert rows["Empty"]["progress"] == 0
    assert rows["RAN"]["status"] == "overdue"
    assert rows["RAN"]["blocked"] == 1
    assert rows["RAN"]["overdue"] == 1
    assert rows["Done"]["status"] == "done"
    assert rows["Done"]["progress"] == 100
    assert data["projects"]["counts"]["empty"] == 1
    assert data["projects"]["counts"]["done"] == 1
    assert data["projects"]["counts"]["overdue"] == 1


def test_guest_only_sees_invited_projects(user):
    user.post("/api/billing/subscribe")
    shared = user.post("/api/projects", json={"name": "Shared"}).json()
    hidden = user.post("/api/projects", json={"name": "Hidden"}).json()
    user.post("/api/tasks", json={"title": "Visible", "project_id": shared["id"]})
    user.post("/api/tasks", json={"title": "Secret", "project_id": hidden["id"]})
    guest = invite_and_join(user, "stat-guest@example.com", "StatGuest", role="guest", project_ids=[shared["id"]])

    data = guest.get("/api/statistics").json()
    names = [row["name"] for row in data["projects"]["rows"]]
    assert names == ["Shared"]
    assert data["tasks"]["total"] == 1
    assert data["tasks"]["todo"] == 1
    assert data["projects"]["total"] == 1

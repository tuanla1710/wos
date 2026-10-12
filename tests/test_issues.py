def test_project_tasks_get_issue_keys(user):
    project = user.post("/api/projects", json={"name": "RAN Platform"}).json()
    assert project["key"] == "RP"
    first = user.post("/api/tasks", json={"title": "Design API", "project_id": project["id"]}).json()
    second = user.post("/api/tasks", json={"title": "Write tests", "project_id": project["id"]}).json()
    assert first["issue_key"] == "RP-1"
    assert second["issue_key"] == "RP-2"
    listed = user.get(f"/api/tasks?tab=all&project_id={project['id']}").json()["tasks"]
    keys = {row["issue_key"] for row in listed}
    assert {"RP-1", "RP-2"} <= keys


def test_moving_off_project_clears_issue_key(user):
    project = user.post("/api/projects", json={"name": "Alpha"}).json()
    task = user.post("/api/tasks", json={"title": "Move me", "project_id": project["id"]}).json()
    assert task["issue_key"] == "ALPH-1"
    cleared = user.patch(f"/api/tasks/{task['id']}", json={"clear_project": True}).json()
    assert cleared["issue_key"] is None

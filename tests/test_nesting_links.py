def test_subtask_create_edit_delete(user):
    parent = user.post("/api/tasks", json={"title": "Parent", "due_date": "2030-01-01"}).json()
    child = user.post("/api/tasks", json={"title": "Child", "parent_id": parent["id"]}).json()
    assert child["parent_id"] == parent["id"]
    assert child["is_inbox"] is False
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Child" not in titles
    detail = user.get(f"/api/tasks/{parent['id']}").json()
    assert [s["title"] for s in detail["subtasks"]] == ["Child"]
    user.patch(f"/api/tasks/{child['id']}", json={"title": "Child 2"})
    assert user.get(f"/api/tasks/{parent['id']}").json()["subtasks"][0]["title"] == "Child 2"
    user.delete(f"/api/tasks/{child['id']}")
    assert user.get(f"/api/tasks/{parent['id']}").json()["subtasks"] == []


def test_delete_parent_removes_subtasks(user):
    parent = user.post("/api/tasks", json={"title": "Keep", "due_date": "2030-01-01"}).json()
    child = user.post("/api/tasks", json={"title": "Nested", "parent_id": parent["id"]}).json()
    user.delete(f"/api/tasks/{parent['id']}")
    assert user.get(f"/api/tasks/{child['id']}").status_code == 404


def test_move_existing_task_under_another(user):
    parent = user.post("/api/tasks", json={"title": "Parent", "due_date": "2030-01-01"}).json()
    child = user.post("/api/tasks", json={"title": "Child", "due_date": "2030-01-02"}).json()
    moved = user.patch(f"/api/tasks/{child['id']}", json={"parent_id": parent["id"]}).json()
    assert moved["parent_id"] == parent["id"]
    assert moved["is_inbox"] is False
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Child" not in titles
    assert [s["title"] for s in user.get(f"/api/tasks/{parent['id']}").json()["subtasks"]] == ["Child"]
    user.patch(f"/api/tasks/{child['id']}", json={"clear_parent": True})
    titles = [t["title"] for t in user.get("/api/tasks?tab=all").json()["tasks"]]
    assert "Child" in titles


def test_cannot_nest_task_under_itself(user):
    task = user.post("/api/tasks", json={"title": "Loop"}).json()
    res = user.patch(f"/api/tasks/{task['id']}", json={"parent_id": task["id"]})
    assert res.status_code == 400


def test_child_project_create_rename_delete(user):
    parent = user.post("/api/projects", json={"name": "Alpha"}).json()
    child = user.post("/api/projects", json={"name": "Beta", "parent_id": parent["id"]}).json()
    assert child["parent_id"] == parent["id"]
    overview = user.get(f"/api/projects/{parent['id']}").json()
    assert [c["name"] for c in overview["children"]] == ["Beta"]
    renamed = user.patch(f"/api/projects/{child['id']}", json={"name": "Gamma"}).json()
    assert renamed["name"] == "Gamma"
    user.delete(f"/api/projects/{child['id']}", json={"task_action": "my_tasks"})
    assert user.get(f"/api/projects/{parent['id']}").json()["children"] == []


def test_move_existing_project_under_another(user):
    parent = user.post("/api/projects", json={"name": "Alpha"}).json()
    child = user.post("/api/projects", json={"name": "Beta"}).json()
    moved = user.patch(f"/api/projects/{child['id']}", json={"parent_id": parent["id"]}).json()
    assert moved["parent_id"] == parent["id"]
    names = [c["name"] for c in user.get(f"/api/projects/{parent['id']}").json()["children"]]
    assert names == ["Beta"]
    user.patch(f"/api/projects/{child['id']}", json={"clear_parent": True})
    assert user.get(f"/api/projects/{parent['id']}").json()["children"] == []


def test_cannot_nest_project_under_itself(user):
    project = user.post("/api/projects", json={"name": "Solo"}).json()
    res = user.patch(f"/api/projects/{project['id']}", json={"parent_id": project["id"]})
    assert res.status_code == 400


def test_task_link_create_edit_delete(user):
    task = user.post("/api/tasks", json={"title": "Spec"}).json()
    link = user.post(f"/api/tasks/{task['id']}/links", json={"title": "Docs", "url": "example.com/a"}).json()
    assert link["url"].startswith("https://")
    assert link["title"] == "Docs"
    patched = user.patch(f"/api/links/{link['id']}", json={"title": "API", "url": "https://example.com/api"}).json()
    assert patched["title"] == "API"
    assert patched["url"] == "https://example.com/api"
    user.delete(f"/api/links/{link['id']}")
    assert user.get(f"/api/tasks/{task['id']}").json()["links"] == []


def test_project_link_create_edit_delete(user):
    project = user.post("/api/projects", json={"name": "Hub"}).json()
    link = user.post(f"/api/projects/{project['id']}/links", json={"url": "https://github.com/workos"}).json()
    assert link["title"] == "github.com"
    user.patch(f"/api/links/{link['id']}", json={"title": "Repo"})
    assert user.get(f"/api/projects/{project['id']}").json()["links"][0]["title"] == "Repo"
    user.delete(f"/api/links/{link['id']}")
    assert user.get(f"/api/projects/{project['id']}").json()["links"] == []


def test_invalid_link_rejected(user):
    task = user.post("/api/tasks", json={"title": "Bad"}).json()
    res = user.post(f"/api/tasks/{task['id']}/links", json={"url": "http://"})
    assert res.status_code == 400

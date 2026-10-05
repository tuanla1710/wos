from tests.conftest import invite_and_join


def test_lecture_skeleton_on_create(user):
    note = user.post("/api/notes", json={"kind": "lecture"}).json()
    assert note["kind"] == "lecture"
    assert note["title"] == "Untitled"
    assert "# Lesson title" in note["body"]
    assert "## Objective" in note["body"]
    assert "```python" in note["body"]
    assert "> TIP:" in note["body"]
    assert "## Homework" in note["body"]


def test_lecture_does_not_overwrite_body(user):
    note = user.post("/api/notes", json={"kind": "lecture", "title": "Lists", "body": "## Step 1\nKeep me"}).json()
    assert note["body"] == "## Step 1\nKeep me"
    switched = user.patch(f"/api/notes/{note['id']}", json={"kind": "work"}).json()
    assert switched["kind"] == "work"
    assert switched["body"] == "## Step 1\nKeep me"
    back = user.patch(f"/api/notes/{note['id']}", json={"kind": "lecture"}).json()
    assert back["kind"] == "lecture"
    assert back["body"] == "## Step 1\nKeep me"


def test_lecture_patch_empty_inserts_skeleton(user):
    note = user.post("/api/notes", json={"title": "Empty"}).json()
    assert note["kind"] == "work"
    updated = user.patch(f"/api/notes/{note['id']}", json={"kind": "lecture", "body": ""}).json()
    assert updated["kind"] == "lecture"
    assert "## Objective" in updated["body"]


def test_lecture_kind_filter(user):
    user.post("/api/notes", json={"kind": "lecture", "title": "Teach"})
    user.post("/api/notes", json={"kind": "work", "title": "Log"})
    lectures = user.get("/api/notes?kind=lecture").json()["notes"]
    assert [n["title"] for n in lectures] == ["Teach"]
    assert all(n["kind"] == "lecture" for n in lectures)


def test_lecture_invalid_kind(user):
    res = user.post("/api/notes", json={"kind": "course"})
    assert res.status_code == 400


def test_guest_can_see_invited_lecture(user):
    user.post("/api/billing/subscribe")
    project = user.post("/api/projects", json={"name": "Class"}).json()
    guest = invite_and_join(user, "lecture-guest@example.com", "LectureGuest", role="guest", project_ids=[project["id"]])
    note = user.post("/api/notes", json={"kind": "lecture", "title": "Lesson 1", "project_id": project["id"]}).json()
    hidden = user.post("/api/notes", json={"kind": "lecture", "title": "Private"}).json()
    assert guest.get(f"/api/notes/{note['id']}").status_code == 200
    assert guest.patch(f"/api/notes/{note['id']}", json={"title": "Nope"}).status_code == 403
    titles = [n["title"] for n in guest.get("/api/notes?kind=lecture").json()["notes"]]
    assert "Lesson 1" in titles
    assert "Private" not in titles
    assert guest.get(f"/api/notes/{hidden['id']}").status_code == 404


def test_home_does_not_list_lecture(user):
    user.post("/api/notes", json={"kind": "lecture", "title": "Should not appear"})
    home = user.get("/api/home").json()
    blob = str(home)
    assert "Should not appear" not in blob
    assert "notes" not in home

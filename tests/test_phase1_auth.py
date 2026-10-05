def test_a1_register_creates_personal_workspace(api):
    res = api.register("Ada", "ada@example.com")
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Ada"
    assert body["workspace"]["name"] == "Personal"
    me = api.get("/api/me")
    assert me.status_code == 200
    assert me.json()["workspace"]["role"] == "owner"
    home = api.get("/api/home")
    assert home.status_code == 200
    assert home.json()["counts"]["inbox"] == 0


def test_a2_duplicate_email(api):
    api.register("Ada", "ada@example.com")
    res = api.register("Ada 2", "ada@example.com")
    assert res.status_code == 400
    assert res.json()["detail"] == "Email is already in use."


def test_a3_short_password(api):
    res = api.register("Ada", "ada@example.com", password="short")
    assert res.status_code == 422


def test_a4_login(api):
    api.register("Ada", "ada@example.com")
    api.client.cookies.clear()
    res = api.login("ada@example.com")
    assert res.status_code == 200
    assert api.get("/api/me").status_code == 200


def test_a5_wrong_password(api):
    api.register("Ada", "ada@example.com")
    api.client.cookies.clear()
    res = api.login("ada@example.com", "wrongpass")
    assert res.status_code == 400
    assert res.json()["detail"] == "Email or password is wrong."


def test_a6_logout(user):
    assert user.post("/api/auth/logout").status_code == 200
    user.client.cookies.clear()
    assert user.get("/api/me").status_code == 401


def test_a7_no_session_is_unauthorized(client):
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/tasks?tab=inbox").status_code == 401


def test_d6_health(client):
    assert client.get("/health").json() == {"status": "ok"}

from tests.conftest import make_user

from app.core.config import settings
from app.models.user import User


def _promote(db, email: str) -> None:
    user = db.query(User).filter(User.email == email).first()
    assert user is not None
    user.is_admin = True
    db.commit()
    db.refresh(user)


def test_member_cannot_list_users(user):
    res = user.get("/api/admin/users")
    assert res.status_code == 403
    assert res.json()["detail"] == "Not allowed."


def test_admin_lists_and_edits_users(api, db):
    api.register("Admin", "admin@example.com")
    _promote(db, "admin@example.com")
    other = make_user("Bea", "bea@example.com")
    bea_id = other.get("/api/me").json()["id"]

    listed = api.get("/api/admin/users")
    assert listed.status_code == 200
    emails = {row["email"] for row in listed.json()["users"]}
    assert {"admin@example.com", "bea@example.com"} <= emails

    patched = api.patch(
        f"/api/admin/users/{bea_id}",
        json={"name": "Beatrice", "email": "beatrice@example.com", "password": "newpass12"},
    )
    assert patched.status_code == 200
    body = patched.json()
    assert body["name"] == "Beatrice"
    assert body["email"] == "beatrice@example.com"

    api.client.cookies.clear()
    login = api.login("beatrice@example.com", "newpass12")
    assert login.status_code == 200
    assert login.json()["name"] == "Beatrice"


def test_admin_can_create_and_disable_user(api, db):
    api.register("Admin", "admin@example.com")
    _promote(db, "admin@example.com")

    created = api.post(
        "/api/admin/users",
        json={"name": "Cara", "email": "cara@example.com", "password": "cara12345", "phone": "+821099900001"},
    )
    assert created.status_code == 200
    cara_id = created.json()["id"]
    assert created.json()["disabled"] is False

    disabled = api.patch(f"/api/admin/users/{cara_id}", json={"disabled": True})
    assert disabled.status_code == 200
    assert disabled.json()["disabled"] is True

    api.client.cookies.clear()
    blocked = api.login("cara@example.com", "cara12345")
    assert blocked.status_code == 400
    assert blocked.json()["detail"] == "This account is disabled."


def test_admin_cannot_disable_self_or_last_admin(api, db):
    api.register("Admin", "admin@example.com")
    _promote(db, "admin@example.com")
    me = api.get("/api/me").json()

    self_off = api.patch(f"/api/admin/users/{me['id']}", json={"disabled": True})
    assert self_off.status_code == 400
    assert self_off.json()["detail"] == "You cannot disable your own account."

    demote = api.patch(f"/api/admin/users/{me['id']}", json={"is_admin": False})
    assert demote.status_code == 400
    assert demote.json()["detail"] == "You cannot remove your own admin access."


def test_public_register_rejected_when_closed(api, db):
    previous = settings.public_register
    settings.public_register = True
    try:
        api.register("Admin", "gate-admin@example.com")
        _promote(db, "gate-admin@example.com")
        settings.public_register = False
        blocked = api.client.post(
            "/api/auth/register",
            json={
                "name": "Ada",
                "email": "closed@example.com",
                "password": "password1",
                "timezone": "Asia/Seoul",
                "phone": "+821011112222",
            },
        )
        assert blocked.status_code == 403
        assert blocked.json()["detail"] == "New accounts are created by an admin."
        created = api.post(
            "/api/admin/users",
            json={"name": "Cara", "email": "cara-closed@example.com", "password": "cara12345", "phone": "+821099900099"},
        )
        assert created.status_code == 200
        assert created.json()["email"] == "cara-closed@example.com"
    finally:
        settings.public_register = previous


def test_me_exposes_admin_flag(api, db):
    api.register("Admin", "admin@example.com")
    assert api.get("/api/me").json()["is_admin"] is False
    _promote(db, "admin@example.com")
    assert api.get("/api/me").json()["is_admin"] is True

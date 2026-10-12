def test_register_requires_phone(api):
    res = api.client.post(
        "/api/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password1", "timezone": "Asia/Seoul"},
    )
    assert res.status_code == 422


def test_unverified_cannot_use_app(api):
    res = api.register("Ada", "ada@example.com", verify_phone=False)
    assert res.status_code == 200
    assert res.json()["phone_verified"] is False
    blocked = api.get("/api/home")
    assert blocked.status_code == 403
    assert blocked.json()["detail"] == "Phone verification required."
    assert api.get("/api/me").status_code == 200


def test_phone_otp_unlocks_app(api):
    api.register("Ada", "ada@example.com", phone="010-1234-5678", verify_phone=False)
    sent = api.post("/api/auth/phone/send", json={})
    assert sent.status_code == 200
    assert sent.json()["phone"] == "+821012345678"
    wrong = api.post("/api/auth/phone/verify", json={"code": "000000"})
    assert wrong.status_code == 400
    ok = api.post("/api/auth/phone/verify", json={"code": sent.json()["dev_code"]})
    assert ok.status_code == 200
    assert ok.json()["phone_verified"] is True
    assert api.get("/api/home").status_code == 200


def test_duplicate_phone(api):
    api.register("Ada", "ada@example.com", phone="+821011111111")
    other = api.client.post(
        "/api/auth/register",
        json={
            "name": "Bea",
            "email": "bea@example.com",
            "password": "password1",
            "timezone": "Asia/Seoul",
            "phone": "010-1111-1111",
        },
    )
    assert other.status_code == 400
    assert other.json()["detail"] == "Phone number is already in use."

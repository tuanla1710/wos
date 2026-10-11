from datetime import date

YEAR = date.today().year


def _korean_new_year(user):
    rows = user.get(f"/api/holidays?from={YEAR}-01-01&to={YEAR}-12-31").json()["holidays"]
    return next(h for h in rows if h["kind"] == "primary" and h["name_en"] == "Korean New Year")


def test_country_detected_from_timezone(user):
    settings = user.get("/api/holidays/settings").json()
    assert settings["country"] is None
    assert settings["effective"] == "KR"
    assert {"code": "VN", "name": "Vietnam"} in settings["countries"]


def test_holidays_range_lists_primary_days_off(user):
    rows = user.get(f"/api/holidays?from={YEAR}-01-01&to={YEAR}-01-01").json()["holidays"]
    assert rows == [
        {"day": f"{YEAR}-01-01", "name": rows[0]["name"], "name_en": "New Year's Day", "kind": "primary", "country": "KR", "off": True}
    ]


def test_secondary_country_is_shown_but_not_off(user):
    assert user.patch("/api/holidays/settings", json={"country2": "vn"}).json()["country2"] == "VN"
    rows = user.get(f"/api/holidays?from={YEAR}-09-02&to={YEAR}-09-02").json()["holidays"]
    vn = [h for h in rows if h["kind"] == "secondary"]
    assert vn and vn[0]["country"] == "VN" and vn[0]["off"] is False


def test_skip_and_unskip_public_holiday(user):
    day = _korean_new_year(user)["day"]
    assert day in user.patch("/api/holidays/settings", json={"skip": day}).json()["skips"]
    assert _korean_new_year(user)["off"] is False
    assert day not in user.patch("/api/holidays/settings", json={"unskip": day}).json()["skips"]
    assert _korean_new_year(user)["off"] is True


def test_public_holiday_reduces_workdays(user):
    day = date.fromisoformat(_korean_new_year(user)["day"])
    task = user.post("/api/tasks", json={"title": "Seollal", "start_date": day.isoformat(), "due_date": day.isoformat()}).json()
    assert task["work_days"] == 0
    user.patch("/api/holidays/settings", json={"country": ""})
    task = user.get(f"/api/tasks/{task['id']}").json()
    assert task["work_days"] == (0 if day.weekday() >= 5 else 1)


def test_unknown_country_rejected(user):
    assert user.patch("/api/holidays/settings", json={"country": "XX"}).status_code == 400


def test_range_limit(user):
    assert user.get(f"/api/holidays?from={YEAR}-01-01&to={YEAR + 10}-01-01").status_code == 400

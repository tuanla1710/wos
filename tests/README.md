# Tests

Pytest covers Phase 1–4 from feature flows to detailed cases: auth, inbox, tasks, home, review, team, notes, calendar events, billing, public API, AI, tags, comments, notifications, guests, and workspace isolation.

```powershell
cd api
.\.venv\Scripts\pip.exe install -r requirements.txt
cd ..
$env:TEST_DATABASE_URL="postgresql+psycopg://workos:workos@127.0.0.1:5432/workos_test"
.\api\.venv\Scripts\python.exe -m pytest tests
```

Requires PostgreSQL. Tests create a separate `workos_test` database and truncate tables between cases.

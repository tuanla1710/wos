# Work OS

Personal + small-team work operating system.  
Phase 1: Personal daily loop — Inbox → Home Focus → My Tasks → Weekly Review.

Docs: [`docs/README.md`](./docs/README.md) — read `01-product` → `06-acceptance`.

```
qlcv/
├── docs/
│   ├── 01-product/
│   ├── 02-ux/
│   ├── 03-domain/
│   ├── 04-architecture/
│   ├── 05-data/
│   └── 06-acceptance/
├── docker-compose.yml
├── .env.example
│
├── web/                          # Next.js · React · Tailwind
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   └── (app)/
│       │       ├── layout.tsx          # Sidebar + top bar
│       │       ├── page.tsx            # Home
│       │       ├── inbox/page.tsx
│       │       ├── tasks/page.tsx      # My Tasks
│       │       ├── tasks/[id]/page.tsx
│       │       ├── calendar/page.tsx
│       │       ├── review/page.tsx
│       │       ├── settings/page.tsx
│       │       └── projects/[id]/page.tsx
│       ├── components/
│       │   ├── layout/                 # Sidebar, TopBar
│       │   ├── task/                   # QuickAdd, TaskRow, TaskDetail
│       │   └── ui/                     # Button, Input, Select, DatePicker…
│       ├── lib/                        # api client, types
│       └── tokens/                     # visual-system colors / spacing
│
└── api/                          # FastAPI · PostgreSQL
    ├── requirements.txt
    ├── alembic.ini
    ├── alembic/versions/
    └── app/
        ├── main.py
        ├── core/                     # config, security, deps
        ├── db/                       # session, base
        ├── models/                   # users, workspaces, projects, tasks, focus
        ├── schemas/
        ├── services/
        └── api/routes/               # auth, me, home, tasks, …
```

## Compile, build, deploy (Docker only)

Host stays clean: Docker Engine + Compose. No host Node or Python.

Stack: **web** (Next.js production build, `:3000`) → **api** (FastAPI + Alembic, `:8080`) → **db** (Postgres 16, `:5432`). Changing UI/API code requires a **rebuild**; `db` is an image, not compiled.

### 1. Configure

```bash
cp .env.example .env
```

Change before first boot:

| Variable | Why |
|---|---|
| `SECRET_KEY` | Session signing. Do not leave `change-me` on a real host. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded platform admin on first API boot. |
| `WEB_ORIGIN` | Browser origin the API allows (local: `http://localhost:3000`). |
| `WEB_PORT` / `API_PORT` | Host ports if 3000/8080 are taken. |
| `SMS_PROVIDER` | `console` logs OTP locally. `twilio` needs `TWILIO_*`. |

Compose ignores host `DATABASE_URL`. The API container always talks to service `db`.

### 2. Build and start

```bash
docker compose up --build -d
docker compose ps
```

`--build` compiles:

- **api** — `pip install` + copy FastAPI app. On start: `alembic upgrade head`, then uvicorn.
- **web** — `npm ci` + `next build` (standalone). Serves `node server.js`.
- **db** — official `postgres:16-alpine`. Data in volume `pgdata`. Uploads in `api_uploads`.

Open:

- Web: `http://localhost:3000`
- API: `http://localhost:8080/health`
- OpenAPI: `http://localhost:8080/docs`

First login: `admin@workos.dev` / `Admin1234` (or your `.env` values). Phone OTP is required; with `SMS_PROVIDER=console` the 6-digit code is in API logs and on the verify screen.

### 3. Rebuild after code changes

Images copy source at **build** time. Edit files, then rebuild the service you changed:

```bash
docker compose up --build -d web    # UI / Next.js
docker compose up --build -d api    # FastAPI / Alembic
docker compose up --build -d        # everything
```

Alembic runs on every API container start. New migrations in `api/alembic/versions/` apply on that restart.

### 4. Logs, tests, stop

```bash
docker compose logs -f --tail=100
docker compose logs -f api
docker compose run --rm --entrypoint python api -m pytest -q
docker compose down                 # keep volumes (DB + uploads)
docker compose down -v              # wipe Postgres and uploads
```

### 5. One VM / production

Same compose file. Put TLS on a reverse proxy (Caddy or nginx) in front of `:3000`. Set `WEB_ORIGIN` to the public https origin. Do **not** publish Postgres (`5432`) on a public interface — drop that `ports:` mapping or bind it to `127.0.0.1`. Keep `SECRET_KEY` and `ADMIN_PASSWORD` out of git (`.env` is gitignored).

## Run (host + Docker Postgres)

```bash
cp .env.example .env
docker compose up -d db

cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8080

cd ../web
npm install
npm run dev
```

Windows reserves port 8000 on some machines — the API uses 8080. If `docker` is missing on PATH, start Postgres from WSL: `docker compose up -d db` or `docker run` the `postgres:16-alpine` service in `docker-compose.yml`.

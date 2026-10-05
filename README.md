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

## Run (local)

```bash
cp .env.example .env
docker compose up -d db

cd api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8080

cd ../web
npm install
npm run dev
```

Web: `http://localhost:3000` · API: `http://localhost:8080` · Docs: `http://localhost:8080/docs`

Windows reserves port 8000 on some machines — the API uses 8080. If `docker` is missing on PATH, start Postgres from WSL: `docker-compose up -d db` or `docker run` the `postgres:16-alpine` service in `docker-compose.yml`.

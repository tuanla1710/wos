# Software Architecture — Work OS

**System:** Personal + Small Team Work Operating System  
**Style:** Modular monolith  
**Phase in repo:** Phase 1 Personal  
**Locks:** `../03-domain/phase-1-rules.md` · `../05-data/schema.md` · `../05-data/management.md` · `../03-domain/phase-1-edges.md` · `../02-ux/visual-system.md`  
**Later:** `../03-domain/phase-2-team.md` · `../01-product/phase-3-saas.md` · `../01-product/phase-4-ai.md`

This file is the engineering architecture. Product rules stay in the lock files. If a rule conflicts, **product lock wins**. If a folder or API path conflicts, **this file + the repo tree win**.

---

## 1. Goals

| Goal | How the architecture serves it |
|---|---|
| Daily-use loop in one app | One web client, one API, one database |
| Personal first, team later | `workspaces` from day one; Phase 1 UI uses a single workspace |
| Ship without guesswork | Routes and tables match V1 screens/schema |
| Scale later without a rewrite | Postgres + FastAPI monolith; Redis/S3 are add-ons, not a rewrite |

Non-goals: microservices, event bus, mobile app, multi-region, Kubernetes in Phase 1.

---

## 2. Quality attributes

| Attribute | Phase 1 target |
|---|---|
| Consistency | One writer (FastAPI). Last-write-wins. No offline queue |
| Isolation | Every row except `users` is workspace-scoped |
| Auth | httpOnly session cookie, 30 days, sliding |
| Latency | Home / My Tasks / Inbox = one API call each |
| Operability | `/health` on API; Postgres via Docker Compose |
| Security | No secrets in the client. Passwords hashed. CORS = web origin only |

---

## 3. System context

```
┌──────────┐     HTTPS      ┌──────────────────────────────────┐
│  Person  │ ──────────────►│  Work OS                         │
└──────────┘                │  Browser (Next.js) → FastAPI     │
                            │  → PostgreSQL                    │
                            └──────────────────────────────────┘
```

Phase 1 actors: one registered user per account. No email provider, no object storage, no Redis, no third-party calendar.

Phase 2+ optional actors: invitee, SMTP (optional), MinIO/S3, cron for due notifications.

---

## 4. Containers

### Phase 1 (what we run)

```
┌─────────────────────┐     /api/*      ┌─────────────────────┐
│  web                │ ───────────────►│  api                │
│  Next.js 15         │   cookie        │  FastAPI            │
│  React 19           │   CORS          │  SQLAlchemy         │
│  Tailwind           │                 └──────────┬──────────┘
│  :3000              │                            │
└─────────────────────┘                            │ SQL
                      same-origin /api → :8080     ▼
                                          ┌─────────────────────┐
                                          │  db                 │
                                          │  PostgreSQL 16      │
                                          │  :5432              │
                                          └─────────────────────┘
```

| Container | Role | Not responsible for |
|---|---|---|
| `web` | Routes, UI, tokens from `visual-system.md`, calls API | Business rules (inbox, focus, review) |
| `api` | Auth, domain rules, queries, JSON | Rendering HTML |
| `db` | Persistence | Cache, files |

Local: `docker compose up --build` runs **web + api + Postgres**. Optional host-dev: compose `db` only, then `npm run dev` and `uvicorn` on the host.

### Phase 2–3 add-ons (not in compose yet)

```
api ──► Redis          session cache, notification fan-out
api ──► MinIO / S3     task attachments
api ──► cron / beat    due-tomorrow + overdue notifications
```

Do not add these until Phase 2 attachments / notifications need them.

---

## 5. Repository

Monorepo. Two deployable apps. Design docs at repo root.

```
qlcv/
├── docs/   01-product … 06-acceptance   (this file = 04-architecture)
├── docker-compose.yml
├── web/
└── api/
```

| Path | Layer |
|---|---|
| `web/src/app` | Routes / pages |
| `web/src/components` | Layout, task, primitives |
| `web/src/lib` | HTTP client, TS types |
| `web/src/tokens` | Spacing / row heights |
| `api/app/api/routes` | HTTP adapters |
| `api/app/schemas` | Pydantic request/response |
| `api/app/services` | Domain use-cases |
| `api/app/models` | SQLAlchemy |
| `api/app/core` | Config, security, deps |
| `api/app/db` | Engine, session, Base |
| `api/alembic` | Migrations |

Dependency rule: `routes → services → models`. Routes do not contain inbox/focus/review logic.

---

## 6. Frontend

### 6.1 Rendering

- Next.js App Router.
- Phase 1 pages are **client-driven**: fetch FastAPI with `credentials: "include"`.
- No server-side business logic. Optional later: RSC only for shell/layout.
- `next.config.ts` rewrites `/api/:path*` → `NEXT_PUBLIC_API_URL` so the browser can call same-origin `/api` in dev.

### 6.2 Route map

| URL | Screen | API |
|---|---|---|
| `/login` | Login | `POST /api/auth/login` |
| `/register` | Register | `POST /api/auth/register` |
| `/` | Home | `GET /api/home` |
| `/inbox` | Inbox | `GET /api/tasks` + inbox flag / dedicated filter |
| `/tasks` | My Tasks | `GET /api/tasks?tab=` |
| `/tasks/[id]` | Task detail | `GET /api/tasks/:id` |
| `/calendar` | Calendar week | `GET /api/calendar?from=&to=` |
| `/review` | Weekly Review | `GET /api/review` |
| `/settings` | Settings | `GET/PATCH /api/me`, `PATCH /api/workspace` |
| `/projects/[id]` | Project | `GET /api/projects/:id` |

Auth group `(auth)` has no sidebar. App group `(app)` mounts `Sidebar` + `TopBar`.

### 6.3 UI architecture

```
(app)/layout
  Sidebar          nav + inbox badge + project list
  TopBar           search + Quick Add
  page             screen body
```

Shared: `QuickAdd` (every screen), `TaskRow`, `TaskDetail`.  
Primitives follow `visual-system.md` (36px controls, 44px task row, Lucide 16).

Copy is English. Tokens are not restyled per page.

---

## 7. Backend

### 7.1 Modular monolith

One FastAPI process. One Postgres. Routers are modules, not services.

```
HTTP
  ▼
api/routes          parse + auth dep + status codes
  ▼
services            inbox / focus / review / organize rules
  ▼
models + Session    SQL
```

| Module | Owns |
|---|---|
| `auth` | Register, login, logout, cookie |
| `me` | Profile + workspace name |
| `home` | Counts, focus, suggestions, this-week bars, review prompt |
| `tasks` | CRUD, archive, move inbox / my tasks, checklist |
| `focus` | Daily pins (max 3) |
| `projects` | CRUD + overview aggregates |
| `calendar` | Tasks with due in range |
| `review` | Week stats + reschedule / drop / unblock / week-focus |
| `search` | Title keyword, tasks + projects |

### 7.2 Request lifecycle

```
Browser
  → cookie session
  → CORS + route
  → deps.current_user
  → deps.workspace          Phase 1: the only membership
  → service
  → commit
  → JSON
```

401 → web sends user to `/login`.  
404 → toast `Not found.`  
5xx → toast `Couldn’t save. Try again.` (`phase-1-edges.md`, `visual-system.md`)

### 7.3 Domain rules that must stay in services

Do not re-implement in React.

- Inbox enter/leave (`is_inbox`)
- Focus max 3; pin from inbox organizes
- Today / upcoming / overdue / all tabs
- Review actions (archive, due, unblock)
- “Today” = date in `users.timezone`
- Project delete: tasks stay, `project_id` null

UI may hide buttons; API still enforces.

---

## 8. Data

Canonical columns: `schema.md`. Architecture view:

```
users
  └── workspace_members ── workspaces
                              ├── projects
                              └── tasks ── task_checklists
                                    ▲
users ── task_focus ───────────────┘
users ── task_week_focus ──────────┘
```

| Decision | Why |
|---|---|
| `workspace_id` on every task | Tenancy even when `project_id` is null |
| `is_inbox` flag, not an Inbox project | Inbox is a state |
| `assignee_id` unused in UI | Phase 2 assign without a migration panic |
| `task_focus` per `(user, workspace, date)` | Daily focus, copy-forward on first Home read |
| Soft archive vs hard delete | Drop/review vs user delete |
| No `calendar_events` / `notes` tables | Phase 2 objects |

Migrations: Alembic only. No `create_all` in production.

---

## 9. Auth & tenancy

### Auth (Phase 1)

| Item | Choice |
|---|---|
| Identity | Email + password |
| Password | `passlib` bcrypt |
| Session | httpOnly, Secure in prod, SameSite=Lax, 30-day sliding |
| Cookie name | `session` (set in `core/security`) |
| Verify email / reset / OAuth | Out of scope |

Register creates: `users` + `workspaces` (name `Personal`) + `workspace_members` (`owner`) in one transaction.

### Tenancy

Phase 1: one workspace per user. All queries filter `workspace_id` from the membership, not from the client.

Phase 2: header `X-Workspace-Id` (see `phase-2-team.md`). Client must not be trusted; membership is checked server-side.

---

## 10. API surface

Base path: `/api`. OpenAPI at `/docs`.

```
POST   /api/auth/register | login | logout
GET    /api/me
PATCH  /api/me
PATCH  /api/workspace
GET    /api/home
GET    /api/search?q=
GET    /api/calendar?from=&to=
GET    /api/review
POST   /api/review/reschedule | drop | unblock
PUT    /api/review/week-focus
GET|POST        /api/projects
GET|PATCH|DELETE /api/projects/{id}
GET|POST        /api/tasks
GET|PATCH|DELETE /api/tasks/{id}
POST   /api/tasks/{id}/archive | move-inbox | move-my-tasks | checklist
PATCH|DELETE    /api/checklist/{id}
GET|PUT /api/focus
GET    /health
```

JSON only. No GraphQL. No public API until Phase 3.

---

## 11. Cross-cutting

| Concern | Phase 1 |
|---|---|
| Logging | stdout from uvicorn; no APM |
| Config | `.env` via `pydantic-settings` |
| Time | Store `timestamptz`; interpret calendar dates in user TZ |
| Validation | Pydantic in; check constraints in DB |
| Files | None |
| Jobs | None. Overdue is a query, not a worker |
| Tests | Add when services land (`api/tests`, `web` later) |
| i18n | UI English only |

---

## 12. Deployment

### Local

```
docker compose up --build
# web :3000  ·  api :8080  ·  db :5432
```

Optional host-dev: `docker compose up -d db`, then `uvicorn` on `:8080` and `npm run dev` on `:3000`.

### Phase 1 production (when needed)

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  web image │────►│  api image │────►│  Postgres  │
│  :3000     │     │  :8080     │     │            │
└────────────┘     └────────────┘     └────────────┘
```

- One VM or one compose stack is enough.
- Terminate TLS at a reverse proxy (Caddy / nginx).
- `SECRET_KEY` and `DATABASE_URL` from env.
- Do not expose Postgres.

No Kubernetes, no service mesh.

---

## 13. Evolution

Keep the monolith. Grow **modules**, not repos.

| Phase | Architecture change |
|---|---|
| 2 Team | New tables (invites, comments, notifications, attachments). `X-Workspace-Id`. Optional Redis + MinIO + a due cron |
| 3 SaaS | Billing tables, Stripe, API tokens, rate limit on public API |
| 4 AI | Outbound LLM from `services/ai`. Suggestions only; apply is a normal PATCH. No separate AI service required |

Forbidden shortcuts: splitting `tasks` into its own microservice, shared DB across apps, putting domain rules in Next.js Route Handlers.

---

## 14. Decision log

| Decision | Status |
|---|---|
| Modular monolith, not microservices | Accepted |
| Next.js + FastAPI + Postgres | Accepted |
| Session cookie, not JWT-in-localStorage | Accepted |
| Workspace as tenancy boundary | Accepted |
| Redis / S3 deferred | Accepted |
| Browser TZ at signup, default `Asia/Seoul` | Accepted |
| Same-origin `/api` rewrite in dev | Accepted |

---

## 15. Related documents

| Doc | Question it answers |
|---|---|
| `../01-product/vision.md` | Why the product exists |
| `../03-domain/phase-1-rules.md` | What Phase 1 may do |
| `../02-ux/screens-and-flows.md` | Screens and flows |
| `../05-data/schema.md` | Columns and endpoints |
| `../05-data/management.md` | Migrations, tenancy, backup |
| `../03-domain/phase-1-edges.md` | Sort, empty, delete, dates |
| `../02-ux/visual-system.md` | Visual system |
| `../06-acceptance/phase-1.md` | Acceptance |
| `../../README.md` | How to run the tree |

---

*Architecture for the repo as of Phase 1 scaffold. Change the tree here first, then the code.*

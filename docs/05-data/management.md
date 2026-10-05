# Database management

**DBMS:** PostgreSQL 16  
**One database. One schema (`public`). One writer (FastAPI).**  
**Column source of truth:** `schema.md`  
**This file:** how we create, migrate, isolate, back up, and operate that database.

If a column or constraint conflicts, **`schema.md` wins**.  
If a migration practice conflicts, **this file wins**.

---

## 1. Purpose

Work OS stores personal and (later) team work in a single Postgres instance.

| We manage | We do not |
|---|---|
| Schema via Alembic | `Base.metadata.create_all()` in production |
| Workspace tenancy in the API | A database per customer in Phase 1–2 |
| App-level `workspace_id` filters | Postgres RLS in Phase 1 |
| Logical backups (`pg_dump`) | Multi-region replicas |
| Derived counts in queries | Materialized views / summary tables |

---

## 2. Principles

1. **One DB for the product.** Not a DB per workspace. Not micro-databases.
2. **Expand-only until Phase 2.** Phase 1 migration creates only the tables in §6.
3. **Constraints in the database.** CHECK, UNIQUE, FK. Domain *rules* (inbox, focus) stay in API services — some cannot be CHECKed cheaply.
4. **UUID primary keys.** `gen_random_uuid()`. Never serial IDs for public resources.
5. **Timezone honesty.** Instants = `timestamptz`. Calendar due = `date`. No `timestamp without time zone`.
6. **No silent schema drift.** Models match Alembic. Change `schema.md` first, then a revision, then the model.

---

## 3. Platform

| Item | Choice |
|---|---|
| Engine | PostgreSQL 16 |
| Image (local) | `postgres:16-alpine` in `docker-compose.yml` |
| Database name | `workos` |
| App user | `workos` (owner of objects in local) |
| Encoding | UTF8 |
| Collation | Default of the image (local). Prod: `en_US.UTF-8` |
| Extensions | `pgcrypto` (or `pgcrypto` + uuid), `citext` |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic (`api/alembic`) |
| Driver | `psycopg` v3 |

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
```

`users.email` is `citext` so `A@x.com` and `a@x.com` collide.

---

## 4. Environments

| Env | Where | Who migrates |
|---|---|---|
| Local | Docker Compose `:5432` | Developer, `alembic upgrade head` |
| (Later) Staging | Same major version 16 | CI or operator |
| (Later) Production | Managed Postgres (any host). **Version 16** | Operator after backup |

Connection string: `DATABASE_URL` in `.env`.  
Format: `postgresql+psycopg://workos:workos@localhost:5432/workos`

Phase 1: no read replica. No connection pooler (PgBouncer) until we have concurrent team traffic.

Pool in-process: SQLAlchemy `create_engine` default pool is enough for one uvicorn worker locally. Production: one or few workers + pool_size 5–10.

---

## 5. Roles and privileges

Phase 1 local: a single superuser-equivalent `workos` created by Compose. Fine for dogfood.

When production exists:

| Role | Use |
|---|---|
| `workos_migrator` | Alembic only. CREATE/ALTER/DROP |
| `workos_app` | DML + SELECT on app tables. No DROP TABLE |
| `workos_backup` | `pg_dump` |

The FastAPI process uses `workos_app` only. Never migrate as the runtime user in prod.

No end-user Postgres logins. No SQL from the browser.

---

## 6. Catalog — Phase 1

Created in the **first** Alembic revision. Details: `schema.md`.

```
users
workspaces
workspace_members
projects
tasks
task_checklists
task_focus
task_week_focus
```

### Not created in Phase 1

```
project_members
task_assignees          -- do not create; Phase 2 uses tasks.assignee_id
task_comments
task_comment_mentions
task_dependencies
task_attachments
tags
task_tags
notes
calendar_events
notifications
activity_logs
workspace_invites
```

### Columns present, UI unused

| Column | Why it exists now |
|---|---|
| `tasks.assignee_id` | Avoid a rewrite when assigning |
| `workspace_members.role` | Invite in Phase 2 |
| `projects.archived_at` | Soft-archive later; Phase 1 deletes projects |

---

## 7. Naming

| Object | Pattern | Example |
|---|---|---|
| Table | `snake_plural` | `task_checklists` |
| PK | `id` uuid | |
| FK | `{table_singular}_id` | `project_id`, `workspace_id` |
| Instant | `*_at` timestamptz | `archived_at` |
| Calendar day | `*_date` or `focus_on` / `week_start` | `due_date` |
| Boolean | `is_*` | `is_inbox`, `is_done` |
| Index | `ix_{table}_{cols}` | `ix_tasks_workspace_due` |
| Unique | `uq_{table}_{cols}` | `uq_task_focus_user_day_pos` |
| Check | `ck_{table}_{name}` | `ck_tasks_status` |
| FK | `fk_{table}_{col}` | `fk_tasks_project_id` |

No quoted identifiers. No uppercase table names.

---

## 8. Keys, deletes, integrity

### Foreign keys

| Child | Parent | On delete |
|---|---|---|
| `workspace_members.workspace_id` | `workspaces` | CASCADE |
| `workspace_members.user_id` | `users` | CASCADE |
| `projects.workspace_id` | `workspaces` | CASCADE |
| `tasks.workspace_id` | `workspaces` | CASCADE |
| `tasks.project_id` | `projects` | **SET NULL** |
| `tasks.assignee_id` | `users` | Restrict (do not delete users in Phase 1) |
| `task_checklists.task_id` | `tasks` | CASCADE |
| `task_focus.*` | workspace / user / task | CASCADE |
| `task_week_focus.*` | workspace / user / task | CASCADE |
| `workspaces.owner_id` | `users` | Restrict |

Delete workspace (Phase 2+ UI): CASCADE wipes that workspace’s projects, tasks, focus.

Delete project (Phase 1): **DELETE project row**. Tasks remain, `project_id = null`. User chose Inbox vs My Tasks in the API, not in a DB trigger.

Delete task: hard `DELETE` — checklists and focus rows go with it.

### Soft vs hard

| Action | Mechanism |
|---|---|
| Review Drop / Archive | `tasks.archived_at = now()` |
| Unarchive | `archived_at = null` |
| User Delete task | `DELETE FROM tasks` |
| Delete project | `DELETE FROM projects` |
| Delete user | Not offered in Phase 1 |

No `ON DELETE` trigger that rewrites `is_inbox`. That is API logic.

### Check constraints (must exist)

- `tasks.status IN ('todo','in_progress','blocked','done')`
- `tasks.priority IN ('high','medium','low')`
- `tasks` title length 1–200
- `workspace_members.role IN ('owner','admin','member','guest')`
- `task_focus.position BETWEEN 1 AND 3`
- `task_week_focus.position BETWEEN 1 AND 3`
- `task_week_focus.week_start` = a Monday — enforce in API; optional CHECK `EXTRACT(ISODOW FROM week_start) = 1`

---

## 9. Indexes (Phase 1)

Copy of the operational set. Names follow §7.

| Index | Purpose |
|---|---|
| `uq_users_email` | Login |
| `uq_workspace_members_ws_user` | One membership row |
| `ix_projects_workspace_active` | `(workspace_id) WHERE archived_at IS NULL` |
| `ix_tasks_ws_inbox` | Inbox badge + list |
| `ix_tasks_ws_due` | Calendar, overdue, this week |
| `ix_tasks_ws_status` | Kanban / filters |
| `ix_tasks_ws_project` | Project tasks |
| `ix_tasks_ws_assignee` | Phase 2 My Tasks; cheap now |
| `ix_task_checklists_task_pos` | Ordered checklist |
| `uq_task_focus_day_task` | One pin per task per day |
| `uq_task_focus_day_pos` | Max 3 slots |
| `uq_task_week_focus_week_task` | Week suggestions |
| `uq_task_week_focus_week_pos` | Max 3 slots |

Partial indexes use `archived_at IS NULL` so Done+archived junk does not bloat list paths.

No `pg_trgm` until Search feels slow. Phase 1 search is `ILIKE` on title/name inside a workspace.

---

## 10. Tenancy and access

```
Request
  → session user
  → membership (Phase 1: exactly one workspace)
  → every SELECT/UPDATE/DELETE adds workspace_id = that id
```

- Clients never send a raw SQL workspace they “choose” without membership check.
- Phase 2: `X-Workspace-Id` + `workspace_members` lookup.
- **Row Level Security: off in Phase 1.** Revisit in Phase 3 if we expose SQL tooling or fear a missed filter. Enabling RLS later is additive.

Cross-workspace joins are forbidden in services.

---

## 11. Transactions

| Use case | Transaction |
|---|---|
| Register | One TX: user + workspace + member |
| Quick Add | One TX: insert task |
| PUT `/focus` | One TX: delete day’s pins + insert 0–3 |
| PUT week-focus | Same pattern |
| Review drop / reschedule / unblock | One TX per action |
| Delete project | One TX: update tasks (`is_inbox` / keep) + delete project |
| Home copy-forward focus | One TX: read yesterday, insert today if empty |

Default isolation: `READ COMMITTED` (Postgres default). No `SELECT FOR UPDATE` in Phase 1 (single user).

`updated_at` maintained in the service (or a `BEFORE UPDATE` trigger). Pick **one**: Alembic trigger `set_updated_at()` on all tables that have the column. Preferred: trigger so PATCH cannot forget.

---

## 12. Derived data

Do **not** persist:

- Overdue / due-today / upcoming counts  
- Project progress %  
- This-week bars  
- Inbox badge  

Compute in SQL at read time (`schema.md` §11).  
`today` is computed from `users.timezone` in the API, then passed into queries as a `date` parameter. Do not use `CURRENT_DATE` on the server if the server TZ ≠ user TZ.

---

## 13. Migration workflow

```
1. Edit schema.md (or PHASE2 schema section)
2. alembic revision -m "add_…"
3. Write upgrade() / downgrade()
4. Update SQLAlchemy models
5. alembic upgrade head
6. Run API tests
```

Rules:

- One logical change per revision.
- `downgrade()` required for Phase 1 (small schema).
- Never edit a revision that already ran on another machine; add a new one.
- Never hand-edit prod schema.
- Data migrations (backfill) live in the same revision if tiny; otherwise a follow-up revision.

Commands (from `api/`):

```bash
alembic revision -m "phase1_initial"
alembic upgrade head
alembic downgrade -1
alembic current
```

---

## 14. Seed and empty state

Phase 1: **no seed tasks, no sample project** (`phase-1-edges.md`).

Allowed local helpers (optional script, not a migration):

- Create one user for manual QA  
- Never commit passwords in migrations  

Onboarding is empty Home, not SQL fixtures.

---

## 15. Backup and recovery

### Local

Volume `pgdata` in Compose. Losing it is acceptable. Recreate DB + `alembic upgrade head`.

In-app backup (Settings, workspace owner): a ZIP (`workos-backup` v1) with `data.json` (all app tables) plus `uploads/`. Restore truncates app tables (not `plans`) and writes the zip back. Confirm with the word `RESTORE`. This is a logical dump, not `pg_dump`. Keep the file private — it includes password hashes.

### Production (when it exists)

| Item | Policy |
|---|---|
| Method | `pg_dump` custom format (`-Fc`) nightly |
| Retention | 7 daily + 4 weekly |
| Store | Same as app backups; encrypted at rest |
| Restore drill | Restore to a scratch instance ≥ once before launch |
| Before migrate | Dump, then `alembic upgrade` |

Point-in-time recovery: only after we move to a managed Postgres that offers WAL archiving. Not a Phase 1 requirement.

Session store is the cookie + user row — no extra backup domain.

---

## 16. Observability

Phase 1:

- `log_min_duration_statement = 500` on local if debugging  
- No slow-query SaaS  
- App logs SQL errors; does not log `password_hash` or full `DATABASE_URL`

Forbidden in logs: password, session cookie, dump of all tasks for a workspace in plaintext to stdout in prod.

---

## 17. Security

| Topic | Rule |
|---|---|
| Secrets | `.env` only. Never commit `.env` |
| SQL | Parameterized SQLAlchemy only. No f-string SQL |
| PII | `users.email`, `users.name` — no extra PII tables |
| Password | `password_hash` only. Never store plaintext |
| Deletes | Hard delete task is irreversible; no recycle bin table |
| Encryption at rest | OS/volume (Compose). Managed disk in prod |

---

## 18. Capacity (Phase 1 assumptions)

Dogfood / personal:

- ~1 user, ~10³ tasks, ~10 projects  
- Indexes in §9 are enough  
- Vacuum: autovacuum default  

Phase 2 team 3–10: still one DB, same indexes + `notifications (user_id, read_at)` when that table appears.

Do not shard. Do not partition `tasks` until a single workspace exceeds ~10⁶ rows (not expected).

---

## 19. Phase 2+ catalog (do not migrate now)

Order matches `phase-2-team.md` / notes / calendar:

1. `workspace_invites`  
2. `task_comments`, `task_comment_mentions`  
3. `notifications`  
4. `activity_logs`  
5. `task_attachments`  
6. `tags`, `task_tags`  
7. `project_members` (Guest only)  
8. `notes`  
9. `calendar_events`  

Each group = its own Alembic revision after Phase 1 success. Update `schema.md` or a `phase-2-schema.md` before the revision.

---

## 20. Anti-patterns

- ORM `create_all` instead of Alembic in any shared environment  
- A second Postgres “for analytics” in Phase 1  
- Storing Focus as a boolean on `tasks` (Focus is per-day, per-user)  
- Inbox as a magic project row  
- `due_date timestamptz` (breaks “today” across TZ)  
- Enum types in Postgres that require `ALTER TYPE` for every new status — we use `TEXT + CHECK`  
- Deleting `users` while tasks still reference `assignee_id` without a plan  
- Client-supplied `workspace_id` without membership check  

---

## 21. Related documents

| Doc | Role |
|---|---|
| `schema.md` | Columns, checks, API shapes |
| `../03-domain/phase-1-edges.md` | Archive / delete / today |
| `../04-architecture/system.md` | How API talks to Postgres |
| `../03-domain/phase-2-team.md` | Next tables |
| `../../docker-compose.yml` | Local engine |

---

*Database management lock. Change this file before inventing a new table, backup scheme, or tenancy model.*

# My Work OS V1 — API contract

Lock: [`my-work-os-v1.md`](./my-work-os-v1.md). Schema: [`my-work-os-v1-database.md`](./my-work-os-v1-database.md).

Base: `/api/v1/`. JSON enums **UPPERCASE**. Session cookie. Header `X-Organization-Id`.  
Path `{id}` for tasks = UUID **or** `P5G-1024`.

The frontend never writes `task_activities` or `notifications`. **TaskService** (and sibling services) own that.

```
HTTP → Task API → TaskService
  validate, update, activity, notification, automation
  → repository → PostgreSQL
```

```python
task_service.update_status(task_id, "REVIEW", actor_id)
# 1 permission  2 transition  3 update  4 activity  5 automation  6 notify
```

---

## 0. Errors

`{ "detail": "Not found." }` — 401 / 403 / 404 / 409 (illegal transition or dependency cycle) / 422.

---

## 1. Auth

```
POST /api/v1/auth/register   { "email", "password", "name", "organization_name"? }
POST /api/v1/auth/login      { "email", "password" }
POST /api/v1/auth/logout
GET  /api/v1/me
PATCH /api/v1/me
GET  /api/v1/organizations/current
GET  /health
```

Register → organization + OWNER member.

---

## 2. Teams / members

```
GET|POST   /api/v1/teams
GET|PATCH  /api/v1/teams/{id}

GET|POST   /api/v1/members
PATCH      /api/v1/members/{id}
```

`POST /api/v1/members` `{ "email", "name", "role", "password", "team_id"? }` — OWNER/ADMIN.

---

## 3. Projects

```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id_or_key}
PATCH  /api/v1/projects/{id_or_key}
DELETE /api/v1/projects/{id_or_key}
GET    /api/v1/projects/{id_or_key}/overview
GET    /api/v1/projects/{id_or_key}/board
```

List item:

```json
{
  "items": [
    {
      "id": "uuid",
      "key": "P5G",
      "name": "RAN Test Platform",
      "status": "ACTIVE",
      "priority": "HIGH",
      "owner": { "id": "uuid", "name": "Tuan" }
    }
  ]
}
```

Create:

```json
{
  "key": "P5G",
  "name": "RAN Test Platform",
  "description": "P5G Test Platform",
  "priority": "HIGH"
}
```

`key` immutable. Overview/board payloads: same meaning as previous V1 (counts, milestones, health, columns BACKLOG/PLANNED/IN_PROGRESS/REVIEW/BLOCKED). JSON statuses UPPERCASE.

---

## 4. Milestones

```
GET|POST     /api/v1/projects/{id_or_key}/milestones
PATCH|DELETE /api/v1/milestones/{id}
```

---

## 5. Tasks

```
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{id}
PATCH  /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}
POST   /api/v1/tasks/{id}/assign
```

Create — backend allocates `task_number` → `P5G-1024`:

```json
{
  "project_id": "...",
  "title": "Implement DU OAM Lock",
  "description": "Implement OAM lock mechanism",
  "priority": "HIGH",
  "assignee_id": "...",
  "milestone_id": "..."
}
```

Patch status (Kanban):

```json
{ "status": "IN_PROGRESS" }
```

Assign:

```json
POST /api/v1/tasks/{id}/assign
{ "assignee_id": "..." }
```

Assign → update assignee → activity `ASSIGNED` → notification to new assignee. Unassign: `assignee_id: null`.

List query: `project_id`, `assignee_id=me`, `status`, `tab=assigned|today|overdue|blocked|week`, `q`.

GET detail includes `display_id`, subtasks, dependencies, `gitea` links array, `appflowy_page_id`, `document_url`.

---

## 6. Dependencies

```
POST   /api/v1/tasks/{id}/dependencies
DELETE /api/v1/tasks/{id}/dependencies/{dependency_id}
```

```json
{ "depends_on_task_id": "...", "type": "BLOCKS" }
```

Reject self-link and **cycles** (A→B→C→A) with 409.

---

## 7. Activity / comments

```
GET  /api/v1/tasks/{id}/activities
POST /api/v1/tasks/{id}/comments   { "body": "..." }
```

Comment = activity `COMMENTED`. No separate comments table.

---

## 8. Dashboard

`GET /api/v1/dashboard`

My Work (today / overdue / blocked / this week), per-project counts, team `load_pct` (`overloaded` if ≥ 90), Gitea summary null unless connected.

---

## 9. Gitea

```
POST /api/v1/integrations/gitea/connect
GET  /api/v1/integrations/gitea/repos
POST /api/v1/projects/{project_id}/repositories
PATCH /api/v1/tasks/{id}/gitea
POST /api/v1/webhooks/gitea
```

Connect — encrypt token, never return it:

```json
{ "base_url": "https://gitea.example.com", "token": "..." }
```

Link repo to project (many repos per project):

```json
POST /api/v1/projects/{project_id}/repositories
{ "repository_id": "..." }
```

Or `{ "owner_name", "repo_name" }` to upsert `gitea_repositories` then attach.

Task git fields:

```json
PATCH /api/v1/tasks/P5G-1024/gitea
{
  "repository_id": "uuid",
  "issue_id": 324,
  "pull_request_id": 87,
  "branch_name": "feature/P5G-1024-oam-lock",
  "issue_url": "...",
  "pull_request_url": "..."
}
```

### Webhook

`POST /api/v1/webhooks/gitea` — HMAC, idempotent `delivery_id`.

```
Gitea → parser (issue | pull_request | push | release)
      → Integration Service
      → find repo → find task (link table OR parse P5G-1024)
      → activity → automation → notify
```

Normalized:

```json
{ "event": "pull_request.merged", "repository": "p5g-tp", "pull_request": 87 }
```

PR merged activity:

```json
{
  "activity_type": "GITEA_PR_MERGED",
  "message": "Pull Request #87 merged"
}
```

### Resolve task from Git (no double entry)

Parse first match of `([A-Z][A-Z0-9]{1,15})-(\d+)` in:

- branch: `feature/P5G-1024-oam-lock`
- commit message: `P5G-1024 fix OAM lock`
- PR title: `[P5G-1024] Implement OAM Lock`

Then:

```sql
SELECT t.*
FROM tasks t
JOIN projects p ON p.id = t.project_id
WHERE p.organization_id = $org
  AND p.key = $1
  AND t.task_number = $2;
```

Upsert `task_gitea_links` (branch / PR / issue). Developer only uses Git.

---

## 10. AppFlowy (shallow)

```
PATCH /api/v1/tasks/{id}
{ "appflowy_page_id": "...", "document_url": "..." }
```

UI: **Open in AppFlowy**. No AppFlowy admin API in V1.

---

## 11. Notifications

```
GET  /api/v1/notifications
POST /api/v1/notifications/{id}/read
```

---

## 12. Search

`GET /api/v1/search?q=` — `P5G-1024`, title, project key. Postgres ILIKE.

---

## 13. Permissions (V1 org-wide)

| Action | Owner | Admin | Manager | Member | Viewer |
|---|---|---|---|---|---|
| Create Project | ✓ | ✓ | ✓ | — | — |
| Delete Project | ✓ | ✓ | — | — | — |
| Create Task | ✓ | ✓ | ✓ | ✓ | — |
| Assign Task | ✓ | ✓ | ✓ | — | — |
| Edit Task | ✓ | ✓ | ✓ | ✓ | — |
| View | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gitea connect | ✓ | ✓ | — | — | — |

Per-project ACL = later.

---

## 14. Backend layout (target)

```
api/app/
  main.py
  api/v1/          projects.py tasks.py teams.py members.py gitea.py
  domain/          project/ task/ team/ integration/
  models/
  services/        task_service.py assignment_service.py notification_service.py
  integrations/gitea/   client.py webhook.py mapper.py
  db/
  core/            config.py security.py
tests/
```

Routes do not bypass services for task writes.

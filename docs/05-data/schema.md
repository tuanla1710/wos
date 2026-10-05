# Schema — Phase 1

**Nguồn sự thật cho cột + API Phase 1.**  
Vận hành DB (Alembic, backup, tenancy, role): `management.md`.  
Chỉ các bảng được tạo và wire. Bảng Phase 2 (`notes`, `notifications`, …) không tạo ở migration đầu.

Luật: `../03-domain/phase-1-rules.md`. Edge: `../03-domain/phase-1-edges.md`.

Quy ước:

- PK: `uuid`, default `gen_random_uuid()`.
- Thời điểm: `timestamptz`.
- Ngày lịch: `date` theo timezone user, không lưu giờ trên due.
- Xóa mềm việc: `archived_at`. Xóa cứng: `DELETE`.
- Enum = `text` + `CHECK`.

---

## 1. ER

```
users 1──< workspace_members >──1 workspaces
workspaces 1──< projects
workspaces 1──< tasks
projects 1──< tasks          (tasks.project_id nullable)
tasks 1──< task_checklists
users 1──< task_focus
users 1──< task_week_focus
```

Mọi task thuộc `workspace_id`. Project chỉ là nhóm tùy chọn.

---

## 2. `users`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| email | citext | UNIQUE NOT NULL |
| password_hash | text | NOT NULL |
| name | text | NOT NULL |
| timezone | text | NOT NULL, IANA, default `Asia/Seoul` |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

Week luôn bắt đầu Monday. Không cột `week_starts_on` ở Phase 1.

---

## 3. `workspaces`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| name | text | NOT NULL |
| owner_id | uuid | NOT NULL → users.id |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

Signup: 1 row, name `Personal`.

---

## 4. `workspace_members`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| workspace_id | uuid | NOT NULL → workspaces.id ON DELETE CASCADE |
| user_id | uuid | NOT NULL → users.id ON DELETE CASCADE |
| role | text | NOT NULL CHECK `owner \| admin \| member \| guest` |
| created_at | timestamptz | NOT NULL default now() |

UNIQUE `(workspace_id, user_id)`.

Signup: 1 row, `role = owner`. UI Phase 1 không đọc role khác.

---

## 5. `projects`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| workspace_id | uuid | NOT NULL → workspaces.id ON DELETE CASCADE |
| name | text | NOT NULL |
| archived_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

Phase 1 không archive project — xóa cứng project, giữ task. Cột `archived_at` để sẵn, UI không dùng.

UNIQUE không bắt buộc trên name. Trùng tên được.

Index: `(workspace_id)` WHERE `archived_at IS NULL`.

---

## 6. `tasks`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| workspace_id | uuid | NOT NULL → workspaces.id ON DELETE CASCADE |
| project_id | uuid | NULL → projects.id ON DELETE SET NULL |
| assignee_id | uuid | NOT NULL → users.id |
| title | text | NOT NULL, length 1–200 |
| description | text | NOT NULL default `''` |
| status | text | NOT NULL default `todo` CHECK `todo \| in_progress \| blocked \| done` |
| priority | text | NOT NULL default `medium` CHECK `high \| medium \| low` |
| due_date | date | NULL |
| is_inbox | boolean | NOT NULL default true |
| blocked_reason | text | NOT NULL default `''` |
| archived_at | timestamptz | NULL |
| completed_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

### Luật cột — enforce ở API, không chỉ UI

- Tạo không project, không due → `is_inbox = true`.
- Tạo có `project_id` → `is_inbox = false`.
- PATCH `project_id` khác null → `is_inbox = false`.
- PATCH `due_date` khác null → `is_inbox = false`.
- Action Move to My Tasks → `is_inbox = false`.
- Action Move to Inbox → `is_inbox = true`. Không xóa project/due.
- Pin Focus một inbox task → `is_inbox = false`.
- `status = done` → set `completed_at` nếu đang null. Reopen → `completed_at = null`.
- `status = blocked` và `blocked_reason` trống: cho phép.
- `status != blocked` → API được xóa `blocked_reason` về `''`.
- Task archived: `archived_at` set. Không hiện list mặc định. Xóa focus rows của task.
- `assignee_id` Phase 1 luôn = user đang login. Client không gửi.

### Index

```
(workspace_id, is_inbox)        WHERE archived_at IS NULL
(workspace_id, due_date)        WHERE archived_at IS NULL
(workspace_id, status)          WHERE archived_at IS NULL
(workspace_id, project_id)      WHERE archived_at IS NULL
(workspace_id, assignee_id)
```

---

## 7. `task_checklists`

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| task_id | uuid | NOT NULL → tasks.id ON DELETE CASCADE |
| title | text | NOT NULL, length 1–200 |
| is_done | boolean | NOT NULL default false |
| position | int | NOT NULL default 0 |
| created_at | timestamptz | NOT NULL default now() |
| updated_at | timestamptz | NOT NULL default now() |

Index: `(task_id, position)`.

Tick checklist **không** đổi `tasks.status`.

---

## 8. `task_focus`

Focus **theo ngày**, tối đa 3 / user / workspace / ngày.

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| workspace_id | uuid | NOT NULL → workspaces.id ON DELETE CASCADE |
| user_id | uuid | NOT NULL → users.id ON DELETE CASCADE |
| task_id | uuid | NOT NULL → tasks.id ON DELETE CASCADE |
| focus_on | date | NOT NULL |
| position | smallint | NOT NULL CHECK 1–3 |
| created_at | timestamptz | NOT NULL default now() |

UNIQUE `(workspace_id, user_id, focus_on, task_id)`  
UNIQUE `(workspace_id, user_id, focus_on, position)`

Qua ngày mới: row cũ giữ nguyên. Home đọc `focus_on = today`. Task chưa Done vẫn hiện nếu còn row hôm nay; user tự đổi. Không copy tự động sang ngày mới — **giữ pin nếu cùng task được ghi lại**.

Luật giữ pin qua ngày (khớp `phase-1-rules` + `phase-1-edges`):

- Job nhẹ lúc đọc Home, không cron: nếu hôm nay chưa có row và hôm qua có pin chưa Done → **copy** sang hôm nay, cùng position. User vẫn sửa được.
- Không copy task Done / archived.

---

## 9. `task_week_focus`

Chọn ở Weekly Review cho **tuần tới**. Là gợi ý, không phải pin.

| Cột | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| workspace_id | uuid | NOT NULL → workspaces.id ON DELETE CASCADE |
| user_id | uuid | NOT NULL → users.id ON DELETE CASCADE |
| task_id | uuid | NOT NULL → tasks.id ON DELETE CASCADE |
| week_start | date | NOT NULL, phải là Monday |
| position | smallint | NOT NULL CHECK 1–3 |
| created_at | timestamptz | NOT NULL default now() |

UNIQUE `(workspace_id, user_id, week_start, task_id)`  
UNIQUE `(workspace_id, user_id, week_start, position)`

`week_start` = Monday của tuần sẽ dùng gợi ý (tuần sau lúc review).

---

## 10. Cột để sẵn, UI chưa dùng

| Cột | Lý do |
|---|---|
| tasks.assignee_id | Phase 2 assign |
| workspace_members.role | Phase 2 invite |
| projects.archived_at | Có thể dùng sau, Phase 1 xóa cứng project |

Không tạo: `project_members`, `task_assignees`, `task_comments`, `task_dependencies`, `task_attachments`, `notes`, `calendar_events`, `notifications`, `activity_logs`.

---

## 11. Derived — không lưu

| Khái niệm | Công thức |
|---|---|
| Overdue | `due_date < today` AND status ≠ done AND archived_at IS NULL AND is_inbox = false |
| Due today | `due_date = today` AND status ≠ done AND archived_at IS NULL AND is_inbox = false |
| Upcoming | `due_date > today` AND `due_date <= today+7` (Home count) AND status ≠ done AND not archived AND not inbox |
| Today tab | due today OR (status = in_progress AND not inbox) OR đang có task_focus hôm nay; chưa Done trừ khi xem All/Kanban Done |
| Project progress | count(done) / count(not archived) trong project |
| Project work status | empty → done → overdue → blocked → in_progress → not_started. Overdue nếu `projects.due_date < today` hoặc có task overdue. Không lưu cột. |
| Statistics | Task not archived (guest: project được mời). Inbox / overdue / due today / upcoming theo công thức trên. |
| This Week bar (một ngày Mon–Fri) | count task not archived, not inbox, not done, `due_date = ngày đó` |
| Inbox badge | count `is_inbox = true` AND archived_at IS NULL |

`today` = ngày hiện tại theo `users.timezone`.

---

## 12. API Phase 1

Base: `/api`. Auth: session cookie hoặc bearer. Mọi resource (trừ auth) filter theo workspace duy nhất của user.

### Auth · me

| Method | Path | Việc |
|---|---|---|
| POST | `/auth/register` | Tạo user + workspace + member |
| POST | `/auth/login` | |
| POST | `/auth/logout` | |
| GET | `/me` | User + workspace |
| PATCH | `/me` | name, timezone |
| PATCH | `/workspace` | name |

### Home · search · calendar · review

| Method | Path | Việc |
|---|---|---|
| GET | `/home` | counts, focus, suggestions, this_week[Mon–Fri], review_prompt |
| GET | `/search?q=` | tasks + projects, min 1 ký tự |
| GET | `/calendar?from=&to=` | tasks có due trong khoảng |
| GET | `/review?week_start=` | stats + overdue + blocked + next week list |
| POST | `/review/reschedule` | `{ task_id, due_date }` |
| POST | `/review/drop` | `{ task_id }` → archive |
| POST | `/review/unblock` | `{ task_id }` → todo, clear reason |
| PUT | `/review/week-focus` | `{ week_start, task_ids }` max 3 |

### Projects

| Method | Path | Việc |
|---|---|---|
| GET | `/projects` | |
| POST | `/projects` | `{ name }` |
| GET | `/projects/:id` | overview counts + upcoming 5 |
| PATCH | `/projects/:id` | `{ name }` |
| DELETE | `/projects/:id` | `{ task_action: my_tasks \| inbox }` |

### Tasks

| Method | Path | Việc |
|---|---|---|
| GET | `/tasks` | query: `tab`, `view` không cần, `project_id`, `priority`, `status` |
| POST | `/tasks` | Quick Add / project add |
| GET | `/tasks/:id` | + checklists |
| PATCH | `/tasks/:id` | field cho phép |
| DELETE | `/tasks/:id` | hard delete |
| POST | `/tasks/:id/archive` | set archived_at |
| POST | `/tasks/:id/unarchive` | clear archived_at — API có, UI Phase 1 chưa bắt buộc |
| POST | `/tasks/:id/move-inbox` | |
| POST | `/tasks/:id/move-my-tasks` | |

`GET /tasks?tab=today\|upcoming\|overdue\|all`

### Checklist

| Method | Path | Việc |
|---|---|---|
| POST | `/tasks/:id/checklist` | `{ title }` |
| PATCH | `/checklist/:id` | title, is_done, position |
| DELETE | `/checklist/:id` | |

### Focus

| Method | Path | Việc |
|---|---|---|
| GET | `/focus?date=` | default today |
| PUT | `/focus` | `{ date, task_ids }` đúng thứ tự, 0–3 id |

PUT replace cả bộ pin ngày đó.

---

## 13. POST `/tasks` body

```json
{
  "title": "Prepare API documentation",
  "project_id": null,
  "due_date": null,
  "priority": "medium"
}
```

Server set `assignee_id`, `workspace_id`, `is_inbox`, `status = todo`.

---

*Không thêm bảng trước khi hết Phase 1. Sửa cột thì sửa file này trước.*

# My Work OS V1 — Workflows

Lock: [`my-work-os-v1.md`](./my-work-os-v1.md). Edges implemented in **TaskService**, not the client.

---

## 1. Task state machine

```
             ┌──────────────┐
             │    BACKLOG   │
             └──────┬───────┘
                    ▼
             ┌──────────────┐
             │   PLANNED    │
             └──────┬───────┘
                    ▼
             ┌──────────────┐
             │ IN_PROGRESS  │
             └───┬──────┬───┘
          blocked│      │ submit
                 ▼      ▼
            ┌────────┐ REVIEW
            │BLOCKED │    │
            └───┬────┘    │ unblock
                │         │
                └────► IN_PROGRESS
                          │
                          ▼
                       DONE
```

**Legal edges**

| From | To |
|---|---|
| BACKLOG | PLANNED, CANCELLED |
| PLANNED | BACKLOG, IN_PROGRESS, CANCELLED |
| IN_PROGRESS | PLANNED, REVIEW, BLOCKED, CANCELLED |
| BLOCKED | IN_PROGRESS, CANCELLED |
| REVIEW | IN_PROGRESS, DONE, CANCELLED |
| DONE | REVIEW only (reopen) |
| CANCELLED | BACKLOG |

**Forbidden:** `DONE → BACKLOG` (and any other edge not listed) → HTTP 409.

Entering `DONE` sets `completed_at`. Leaving `DONE` clears it.

---

## 2. Hardcoded automation (no UI builder)

| When | If | Then |
|---|---|---|
| `pull_request.merged` | linked or parsed task status = `REVIEW` | `DONE` + activity `AUTOMATION` |
| `pull_request.merged` | status ≠ `REVIEW` | activity `GITEA_PR_MERGED` only |
| `issues.closed` | task open | activity + notify |
| `push` / `pull_request.opened` | parse `P5G-1024` | upsert `task_gitea_links` + activity |

---

## 3. Git-native UX

```
git checkout -b feature/P5G-1024-oam-lock
git commit -m "P5G-1024 implement OAM lock"
# PR title: [P5G-1024] Implement OAM Lock
```

Work OS attaches branch / commit / PR. No second form in the app.

---

## 4. Happy path

Create project `P5G` → task `P5G-1024` → assign → link repos → issue/PR via Git → human `IN_PROGRESS` → `REVIEW` → merge → **if REVIEW** then `DONE` → dashboard %.

---

## 5. Sprints (code order)

| Sprint | Build |
|---|---|
| 1 | Postgres, FastAPI, Alembic, Organization, Team, Member |
| 2 | Project, Milestone, Task |
| 3 | State machine, assign, dependency, activity |
| 4 | Dashboard, Project UI, Task UI, Kanban |
| 5 | Gitea connect, repositories, webhook, key parser |
| 6 | AppFlowy `appflowy_page_id` / `document_url` |
| 7 | Notification, search |

Then Intelligence / AI.

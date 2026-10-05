# My Work OS — V1 lock

**Work OS Postgres** is the business database. AppFlowy and Gitea keep their own data.

AppFlowy is **not** the Work OS backend. Four engines:

```
                  MY WORK OS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Work Engine      Knowledge Engine   Dev Engine
    Custom           AppFlowy          Gitea
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                Intelligence (AI) — V2
```

Start tiny: **Project + Task + Team**. Grow to people + agents later.

**V1 not in scope:** AI agents, workflow builder, knowledge graph, vector DB, billing, chat, HR, K8s, microservices, fork AppFlowy core.

UI: English, existing Next.js `web/`. API: FastAPI `/api/v1`. Auth: email/password on `members`.

| File | Contents |
|---|---|
| [my-work-os-v1-database.md](./my-work-os-v1-database.md) | 12 tables, ERD, SQL |
| [my-work-os-v1-api.md](./my-work-os-v1-api.md) | REST + TaskService + permissions |
| [my-work-os-v1-workflows.md](./my-work-os-v1-workflows.md) | State machine, Git key parse, sprints |

JSON and DB enums: **UPPERCASE** (`IN_PROGRESS`, `HIGH`, `MEMBER`).

Display task id: `{project.key}-{task_number}` → `P5G-1024`. UUID stays internal.

---

## 12 tables (no more)

organizations, teams, members, projects, milestones, tasks, task_dependencies, task_activities, gitea_repositories, project_repositories, task_gitea_links, notifications.

AppFlowy V1: columns `appflowy_page_id` / `document_url` on **tasks** (“Open in AppFlowy”). No document module. Deep AppFlowy = V2.

Gitea: pointers + webhook. One **project** → many **repos**. Git messages/branches/PRs containing `P5G-1024` auto-link. Developers do not double-enter.

---

## Six screens

Dashboard · Projects · Project detail (Overview / Tasks / Board / Team / Git) · My Tasks · Task detail · Team.

---

## Code sprints

1. Postgres, FastAPI, migration, Organization, Team, Member  
2. Project, Milestone, Task  
3. State machine, assign, dependency, activity  
4. Dashboard, Project UI, Task UI, Kanban  
5. Gitea connect, repos, issue/PR, webhook  
6. AppFlowy page/url links  
7. Notification, search  

Then AI.

Existing Gitea server is preferred (no Gitea in compose required).

---

*This lock replaces the `users` + `organization_members` split and 1:1 `gitea_links` from the previous draft.*

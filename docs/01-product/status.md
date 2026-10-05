# Design status

Audit toàn bộ design. File này nói cái gì **đã lock**, cái gì **vừa bổ sung**, cái gì **cố ý không thiết kế**.

Khi implement Phase 1: `02-ux` + `03-domain` + `05-data` + `06-acceptance/phase-1.md`.  
Khi implement Phase 2: `03-domain/PHASE2_*`.  
Không code theo mock vision trong `vision.md`.

---

## Đã hoàn chỉnh — không cần viết thêm

| Phần | File | Mức |
|---|---|---|
| Tầm nhìn, roadmap | `vision.md` | Vision |
| Phạm vi + luật Phase 1 | `../03-domain/phase-1-rules.md` | Domain |
| Empty / sort / Done / Focus | `../03-domain/phase-1-edges.md` | Domain |
| Mock + flow | `../02-ux/screens-and-flows.md` | UX |
| Visual + copy | `../02-ux/visual-system.md` | UX |
| Architecture | `../04-architecture/system.md` | Engineering |
| Schema + API | `../05-data/schema.md` | Data |
| DB operations | `../05-data/management.md` | Data |
| Phase 1 expected results | `../06-acceptance/phase-1.md` | Acceptance |

Phase 1 object đã đủ: Auth tối thiểu, Home, Inbox, Quick Add, Task, Checklist, My Tasks, Project, Calendar due-date, Weekly Review, Search, Settings.

---

## Trước audit — chưa hoàn chỉnh

| Phần | Phase | Tình trạng cũ | File mới |
|---|---|---|---|
| UI system (space, icon, state, control, copy) | 1 | Đã lock | `visual-system.md` |
| Auth session | 1 | Đã lock; không reset password | `visual-system.md` §11 |
| Invite + role + Guest | 2 | Bảng 4 role | `phase-2-team.md` |
| Assignee | 2 | Một câu | `phase-2-team.md` |
| Comments + mentions | 2 | Mock vision | `phase-2-team.md` |
| Notifications | 2 | Bảng event | `phase-2-team.md` |
| Team dashboard + Home activity | 2 | ASCII vision | `phase-2-team.md` |
| Nhiều workspace + switcher | 2 | Sơ đồ | `phase-2-team.md` |
| Project Members / Files / Activity | 2 | Tên tab | `phase-2-team.md` |
| Tags | 2 | Filter mention | `phase-2-team.md` |
| Attachments | 2 | Tên bảng | `phase-2-team.md` |
| Activity log | 2 | Optional | `phase-2-team.md` |
| Notes | 2 | “không Notion clone” | `phase-2-notes.md` |
| Calendar meeting / giờ | 2 | Cấm Phase 1 | `phase-2-calendar.md` |
| Billing, plan, public API | 3 | 6 từ | `phase-3-saas.md` |
| AI | 4 | Danh sách ý | `phase-4-ai.md` |

---

## Cố ý không thiết kế (vẫn out of scope)

Không viết spec. Không lẻn vào Phase 2.

- Subtasks, dependencies, followers
- Custom status / workflow
- Gantt, project timeline
- Chat, CRM, time tracking, hardware
- Email digest, mobile push, native app
- OAuth bắt buộc, SSO, SCIM
- Recurring task / recurring event
- Semantic search, natural-language Quick Add
- Multi-assignee (`task_assignees`)
- i18n framework

---

## Thứ tự đọc

```
docs/01-product        → 02-ux → 03-domain → 04-architecture → 05-data → 06-acceptance
```

---

## Target platform (not current Phase 1 code)

AppFlowy as document engine + Work OS as business layer + Gitea: [`../04-architecture/my-work-os-v1.md`](../04-architecture/my-work-os-v1.md) · [database](../04-architecture/my-work-os-v1-database.md) · [API](../04-architecture/my-work-os-v1-api.md).

That spec is a **new track**. It does not unlock Gantt/chat/SSO in the current `web/` + `api/` Phase 1. Inbox / Home / My Tasks locks still win until domain files are rewritten.

---

*Audit 2026-10-04. Design Phase 1 + Phase 2 + khung Phase 3/4 đã đủ cho stack hiện tại. Track AppFlowy platform: `my-work-os-v1.md`.*

# Personal + Small Team Work Management Platform

**Product name (working):** Work OS  
**Positioning:** Personal & Team Work Operating System  
**Audience:** 1 người dùng cá nhân → team 3–10 người  
**Version:** Full product vision  
**Build lock:** [`../03-domain/phase-1-rules.md`](../03-domain/phase-1-rules.md) — Phase 1 Personal. Khi lệch luật, file lock thắng.  
**Bản đồ:** [`status.md`](./status.md) · [`../README.md`](../README.md)

| Nhóm | File |
|---|---|
| Product | [`status.md`](./status.md) · [`phase-3-saas.md`](./phase-3-saas.md) · [`phase-4-ai.md`](./phase-4-ai.md) |
| UX | [`../02-ux/screens-and-flows.md`](../02-ux/screens-and-flows.md) · [`../02-ux/visual-system.md`](../02-ux/visual-system.md) |
| Domain | [`../03-domain/phase-1-rules.md`](../03-domain/phase-1-rules.md) · [`../03-domain/phase-1-edges.md`](../03-domain/phase-1-edges.md) · [`../03-domain/phase-2-team.md`](../03-domain/phase-2-team.md) |
| Architecture | [`../04-architecture/system.md`](../04-architecture/system.md) |
| Data | [`../05-data/schema.md`](../05-data/schema.md) · [`../05-data/management.md`](../05-data/management.md) |
| Acceptance | [`../06-acceptance/phase-1.md`](../06-acceptance/phase-1.md) |

Đây không phải "một app quản lý task".

Đây là **một nơi duy nhất** để một người hoặc một team nhỏ:

**Capture → Organize → Plan → Focus → Execute → Complete → Review**

Mục tiêu đầu tiên: tạo ra phần mềm mà chính bạn muốn mở mỗi ngày. Nếu dùng hàng ngày và thấy tốt hơn Excel / Notion / Trello hiện tại, lúc đó mới có cơ sở để bán.

---

## 1. Triết lý sản phẩm

Người dùng **không cần suy nghĩ**:

> “Tôi phải vào module nào?”

Mà chỉ cần mở app và thấy:

> **Hôm nay cần làm gì → đang làm gì → việc gì trễ → tiếp theo làm gì.**

### Core flow

```
Capture
   ↓
Organize
   ↓
Plan
   ↓
Focus
   ↓
Execute
   ↓
Complete
   ↓
Review
```

| Bước | Ý nghĩa | Màn hình chính |
|---|---|---|
| Capture | Bất cứ khi nào nghĩ ra việc → bỏ vào Inbox trước | Inbox, Quick Add |
| Organize | Gán project, priority, due, assignee | Inbox, Task Detail |
| Plan | Xếp việc theo ngày / tuần | Calendar, My Tasks |
| Focus | Tối đa 3 việc quan trọng nhất hôm nay, user pin | Home — My Focus |
| Execute | Làm việc, checklist. Comment từ Phase 2 | My Tasks, Task Detail |
| Complete | Đóng việc, cập nhật tiến độ | Task, Project |
| Review | Nhìn lại tuần, chốt tuần sau | Weekly Review |

Giá trị cốt lõi: người dùng mở app mỗi sáng và **toàn bộ công việc trong ngày nằm trước mặt họ**.

---

## 2. UI chính — Sidebar

Sidebar cố ý mỏng. Không có module thừa. Không bắt người dùng "đi tìm chức năng".

Mục tiêu dài hạn:

```
┌──────────────────────────────┐
│  WORKFLOW                    │
│                              │
│  🏠 Home                     │
│  📥 Inbox                    │
│  ✓  My Tasks                 │
│  📅 Calendar                 │
│  🔁 Review                   │
│                              │
│  PROJECTS                    │
│  📁 Project A                │
│  📁 Project B                │
│                              │
│  TEAM                        │
│  👥 Team                     │
│                              │
│  📝 Notes                    │
│                              │
│  ──────────────────────────  │
│  ⚙ Settings                  │
└──────────────────────────────┘
```

Phase 1 **không** có Team và Notes. Sidebar build: Home, Inbox, My Tasks, Calendar, Review, Projects, Settings. Chi tiết trong `phase-1-rules.md`.

### Inbox là cửa vào Capture

Inbox rất quan trọng.

Bất cứ khi nào nghĩ ra việc gì → **đưa vào Inbox trước**.

Không bắt buộc chọn project, due date, priority ngay lúc capture. Organize xảy ra sau.

Inbox **không** phải project đặc biệt, cũng không phải nhãn Personal. Inbox = task `is_inbox = true` trong workspace hiện tại. Ra Inbox khi user gán project, gán due date, hoặc bấm Move to My Tasks.

---

## 3. Home — màn hình quan trọng nhất

Home phải **cực kỳ sạch**. Đây là màn hình mặc định mỗi lần mở app.

```
┌──────────────────────────────────────────────────┐
│ Good morning, Tuan                         + Task │
│ Sunday, October 4                                │
├──────────────────────────────────────────────────┤
│                                                  │
│  TODAY                                           │
│                                                  │
│  🔴 2 overdue    🟠 3 due today    🔵 8 upcoming │
│                                                  │
├──────────────────────────────────────────────────┤
│ MY FOCUS                                         │
│                                                  │
│  ☐ Finish API design                 HIGH        │
│  ☐ Prepare weekly report             HIGH        │
│  ☐ Review team document              MEDIUM      │
│                                                  │
├──────────────────────────────────────────────────┤
│ THIS WEEK                                        │
│                                                  │
│  Mon  ████████                                  │
│  Tue  ██████████                                │
│  Wed  ██████                                    │
│  Thu  █████████                                 │
│  Fri  █████                                     │
│                                                  │
├──────────────────────────────────────────────────┤
│ TEAM ACTIVITY                                    │
│                                                  │
│ Minho completed "API test"                      │
│ Jisoo created "UI review"                       │
│ David is blocked on "Deployment"                │
└──────────────────────────────────────────────────┘
```

### Nguyên tắc Home

- Không dashboard KPI phức tạp.
- Không widget tùy biến kiểu Notion.
- Phase 1 trả lời 3 câu: hôm nay / đang focus / tuần này. Team Activity từ Phase 2.
- Nút `+ Task` luôn có trên Home (và mọi màn hình khác).

### Luật My Focus

- Tối đa 3 task / ngày.
- User pin thủ công. Pin không đổi due / status / project.
- Home trống thì hệ thống **đề xuất**, không tự pin.
- Thứ tự đề xuất: Overdue → Due today + High → Due today → In Progress → Inbox.

---

## 4. Quick Add

Ở **bất kỳ màn hình nào**, nút `+ Task` mở một popup nhỏ:

```
┌─────────────────────────────────┐
│ What needs to be done?          │
│                                 │
│ Prepare API documentation       │
│                                 │
│ Project   RAN Platform          │
│ Due       Tomorrow              │
│ Priority  High                  │
│ Assignee  Me                    │
│                                 │
│ [Add Task]                      │
└─────────────────────────────────┘
```

### Phase 1

- Title bắt buộc.
- Project / Due / Priority optional. Priority mặc định Medium.
- Không có Assignee picker — luôn là bạn.
- Không chọn project → Inbox.
- Có chọn project → vào project, không Inbox.

### Sau này (không V1)

Nhập tự nhiên:

> Prepare API documentation tomorrow high priority

Hệ thống tự hiểu title, due date, priority.

---

## 5. Task Detail

Task phải đủ chuyên nghiệp nhưng **không gây rối**.

```
┌─────────────────────────────────────────────┐
│ ← Back                                     │
│                                             │
│ Prepare API documentation          HIGH     │
│                                             │
│ Status       IN PROGRESS                    │
│ Assignee     Tuan                           │
│ Project      RAN Platform                   │
│ Due          Oct 5                          │
│                                             │
├─────────────────────────────────────────────┤
│ DESCRIPTION                                 │
│                                             │
│ Complete REST API documentation...          │
│                                             │
├─────────────────────────────────────────────┤
│ CHECKLIST                                   │
│                                             │
│ ☑ Define endpoints                          │
│ ☑ Define request schema                     │
│ ☐ Define response schema                    │
│ ☐ Update documentation                      │
│                                             │
├─────────────────────────────────────────────┤
│ COMMENTS                                    │
│                                             │
│ Minho: Please review endpoint /tasks        │
│                                             │
├─────────────────────────────────────────────┤
│ ACTIVITY                                    │
│                                             │
│ 10:42 Tuan changed status                   │
│ 09:31 Tuan added checklist                  │
└─────────────────────────────────────────────┘
```

Comments + Activity trên mock là product đầy đủ. Phase 1 dừng ở description + checklist.

### UI rule

Chỉ hiển thị những thứ cần thiết theo mặc định.

Phase 1 first screen: title, priority, status, project, due, description, checklist.

Tags, attachments, subtasks, dependencies, comments, followers **không có ở Phase 1**. Product đầy đủ mới mở khi cần, không phơi hết first screen.

---

## 6. Task model

Task không chỉ có "Done".

### Basic

| Field | Ghi chú |
|---|---|
| Title | Bắt buộc |
| Description | Rich text nhẹ, không editor nặng |
| Status | Todo / In Progress / Blocked / Done |
| Priority | High / Medium / Low |
| Due date | Optional |
| Assignee | Phase 1 = chính user. Phase 2 mới chọn người |
| Project | Optional. Không project ≠ Inbox. Inbox là `is_inbox` |

### Productivity

| Có Phase 1 | Có từ Phase 2 |
|---|---|
| Checklist | Tags, comments, attachments, subtasks, dependencies |

### Team — Phase 2+

- Activity history
- Mentions
- Followers
- Notifications

### Status V1

| Status | Ý nghĩa |
|---|---|
| Todo | Chưa bắt đầu |
| In Progress | Đang làm |
| Blocked | Bị kẹt, hiện trên Team + Weekly Review |
| Done | Hoàn thành |

Không làm workflow tùy biến / custom status.

Kanban luôn 4 cột, kể cả Phase 1. Blocked dùng được khi dùng một mình. Nên có `blocked_reason` ngắn.

---

## 7. My Tasks

Đây là nơi người dùng **làm việc hằng ngày**.

### Tabs

```
My Tasks

[Today] [Upcoming] [Overdue] [All]
```

- **Today:** due hôm nay, hoặc In Progress, hoặc đang Focus
- **Upcoming:** due từ ngày mai, chưa Done
- **Overdue:** due trước hôm nay, chưa Done
- **All:** đã organize, chưa archived — không gồm Inbox chưa organize

### Filter

- Project
- Priority
- Status
- Tag (Phase 2)

### View Phase 1 — 2 loại

| View | Dùng khi |
|---|---|
| List | Làm việc nhanh, tick từng việc. Mặc định |
| Kanban | Kéo status: Todo → In Progress → Blocked → Done |

Xếp việc theo ngày dùng trang Calendar, không làm view Calendar thứ hai trong My Tasks.

`All` không gồm Inbox chưa organize. **Không cần 10 loại view.** Không Gantt.

---

## 8. Project

### Project dashboard

```
RAN Platform
────────────────────────────────

Progress
████████████████░░░░ 78%

Tasks          42
Completed      31
In Progress     7
Overdue         4

Timeline
──────────────────────────────

Team
Tuan
Minho
Jisoo

Upcoming
• API release
• Integration test
• Documentation
```

`Timeline` trên mock là ý tưởng dài hạn. **Không làm Gantt / timeline ở Phase 1.** Upcoming = 5 task gần due nhất.

### Project tabs

| Tab | Phase 1 | Nội dung |
|---|---|---|
| Overview | Có | Progress, counts, upcoming. Team counts từ Phase 2 |
| Tasks | Có | List / Kanban của project |
| Members | Phase 2 | Thành viên project |
| Calendar | Phase 2 | Deadline + event của project |
| Files | Phase 2 | Attachments thuộc project |
| Activity | Phase 2 | Nhật ký thay đổi |

Progress Phase 1: `completed / total` task. Không weight.

---

## 9. Team

Dành cho team nhỏ. Manager nhìn 10 giây là biết ai quá tải, ai bị kẹt.

```
TEAM

                    Tasks   Progress
Tuan                 12       82%
Minho                 8       71%
Jisoo                  6       90%
David                  5       60%
```

### Who is overloaded?

```
Tuan       ████████████
Minho      ███████
Jisoo      █████
David      ███
```

### Who is blocked?

```
🔴 David
Deployment blocked

🔴 Minho
Waiting for API
```

Đây là chức năng rất hữu ích cho team 3–10 người. Không cần resource planner kiểu Jira.

**Phase 2.** Phase 1 không có màn Team. Home cũng không hiện Team Activity.

Overload Phase 2 đếm task mở chưa Done — metric thô, chấp nhận. Không story point.

---

## 10. Calendar

Calendar **không phải** một module độc lập kiểu Google Calendar.

Nó là:

> **Task + deadline + meeting**

```
Monday
09:00 Meeting
11:00 API Design
14:00 Code Review
16:00 Report
```

### Hành vi Phase 1

- Week view.
- Task có due date hiện vào ngày đó.
- Task không due không hiện trên Calendar.
- Kéo task sang ngày khác → đổi due date.
- Click task → Task Detail.

### Chưa làm

- Meeting / `calendar_events`
- Kéo vào khung giờ
- Recurring, conflict, time tracking

---

## 11. Weekly Review

Mỗi cuối tuần, hệ thống mở một màn hình review.

```
WEEKLY REVIEW
────────────────────────────

Completed
✓ 24 tasks

Overdue
⚠ 3 tasks

Blocked
🔴 2 tasks

Next Week
→ 12 planned tasks

Project Progress
██████████████░░ 76%
```

Sau này AI có thể hỗ trợ: tóm tắt tuần, đề xuất ưu tiên tuần sau, cảnh báo project chậm.

Phase 1: số liệu + **hành động**, không AI.

Hành động bắt buộc:

1. Reschedule overdue
2. Drop việc không làm
3. Unblock hoặc giữ Blocked
4. Chọn tối đa 3 Focus cho tuần tới

Vào được mọi lúc từ sidebar Review. Friday trở đi, Home nhắc review.

---

## 12. Notifications

Không spam.

Chỉ notify những thứ quan trọng:

| Event | Notify |
|---|---|
| Task assigned to you | Có |
| Task due tomorrow | Có |
| Task overdue | Có |
| Someone mentioned you | Có |
| Task blocked | Có |
| Comment on your task | Có |

Có **notification center** riêng trong app.

Phase 1 không notify. Phase 2: in-app, các event trên. Không email digest, không mobile push cho đến khi team thật sự dùng.

---

## 13. Search

Search phải là **global search**.

Ví dụ nhập `API`:

```
Tasks
  API design
  API testing

Projects
  RAN API

Notes
  API meeting notes

People
  Minho
```

Phase 1: keyword trên title task và name project.  
Phase 2: thêm notes, people.  
Sau này: semantic search.

---

## 14. Personal và Team không tách thành 2 app

Một tài khoản. Một sản phẩm. **Không** gắn nhãn Personal/Work lên từng task.

Ranh giới là workspace:

```
Personal workspace          ← Phase 1
├── Inbox
│   └── Buy bike light      ← chưa organize
├── (no project)
│   └── Doctor appointment  ← đã organize, không cần project
└── Personal project
    └── ...

Gigalane Team workspace     ← Phase 2
├── API design
├── Weekly report
└── Team meeting
```

User có thể tạo nhiều workspace. Phase 1 chỉ tạo 1 Personal workspace khi signup. Schema để sẵn. UI switcher = Phase 2.

Đây là kiến trúc đúng cho SaaS: personal-first, team-ready, không fork product.

---

## 15. Workspace

```
Workspace
│
├── Members
├── Projects
├── Tasks
├── Notes
├── Calendar
├── Files
└── Settings
```

User có thể dùng song song:

```
Personal Workspace
        +
Team Workspace
        +
Other Workspace
```

Mỗi workspace có data riêng. Switch workspace ở header, không đổi app.

Phase 1: signup tạo 1 Personal workspace. Header chưa có switcher.

---

## 16. Permission

Cho team nhỏ, V1 chỉ cần 4 role:

| Role | Quyền chính |
|---|---|
| Owner | Toàn quyền workspace, xóa workspace, billing sau này |
| Admin | Quản lý members, projects, settings |
| Member | Tạo/sửa task, comment, notes trong workspace |
| Guest | Xem project được mời, comment hạn chế |

Không RBAC phức tạp. Không custom role. Không permission per-field.

Phase 1: một user, role Owner. Có bảng `workspace_members`. Không UI invite, không Guest.

---

## 17. Database (V1)

Đủ cho sản phẩm đầy đủ. Không over-model.

**Phase 1 chỉ dùng:** `users`, `workspaces`, `workspace_members`, `projects`, `tasks`, `task_checklists`, `task_focus`, `task_week_focus`. Cột: `schema.md`.

Các bảng còn lại là schema đích, wire khi vào phase tương ứng. Xem `phase-1-rules.md`.

```
users
workspaces
workspace_members

projects
project_members

tasks
task_assignees
task_checklists
task_comments
task_dependencies
task_attachments

notes

calendar_events

notifications

activity_logs
```

### Quan hệ chính

```
users ──< workspace_members >── workspaces
workspaces ──< projects
workspaces ──< notes
workspaces ──< calendar_events
projects ──< tasks
tasks ──< task_checklists
tasks ──< task_comments
tasks ──< task_attachments
tasks ──< task_dependencies
tasks ──< task_assignees
```

---

## 18. Technology

Giữ stack đơn giản. Một backend. Một database. Một frontend. Không microservices.

### Frontend

- TypeScript
- Next.js
- React
- Tailwind

### Backend

- Python
- FastAPI

### Data & infra

| Layer | Choice |
|---|---|
| Database | PostgreSQL |
| Cache | Redis |
| Storage | S3 / MinIO |
| Deployment | Docker |

---

## 19. Product Architecture

```
                 WEB APP
                    │
                    ▼
              Next.js / React
                    │
                    ▼
                 FastAPI
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
 PostgreSQL       Redis       Storage
```

Đơn giản nhưng đủ chuyên nghiệp để scale sau này.

Nguyên tắc:

- Monolith FastAPI.
- Next.js gọi API, không nhúng business logic nặng.
- Redis cho session / cache / notification nhẹ — **chưa cần Phase 1**.
- Object storage cho attachments — **chưa cần Phase 1**.

---

## 20. Chức năng — Phase 1 vs sau

Bảng cũ gom 10 mục vào “V1” là quá béo. Chốt lại:

| # | Chức năng | Phase | Ghi chú |
|---|---|---|---|
| 1 | Workspace (1 Personal) | 1 | Schema multi-workspace sẵn, chưa có switcher |
| 2 | Task + checklist | 1 | Core object |
| 3 | Project Overview + Tasks | 1 | Group work |
| 4 | Inbox + Quick Add + Home | 1 | Capture / Focus |
| 5 | My Tasks | 1 | Daily execution |
| 6 | Calendar (due date) | 1 | Kéo đổi ngày |
| 7 | Weekly Review | 1 | Có hành động, không AI |
| 8 | Search (task + project) | 1 | Keyword |
| 9 | Team dashboard | 2 | Load + blocked |
| 10 | Comments + notifications | 2 | Cộng tác nhẹ |
| 11 | Nhiều workspace | 2 | Switcher |
| 12 | Notes | 2 | Gắn task/project, không Notion clone |
| 13 | Calendar meeting | 2 | `calendar_events` |

Home, Inbox, Quick Add, Search, Task Detail là **bề mặt**, không phải module cộng thêm.

---

## 21. Những thứ KHÔNG làm — cả tầm nhìn gần

Cố tình loại bỏ khỏi sản phẩm (không chỉ Phase 1):

- Hardware
- Test automation
- Complex AI (trước Phase 4)
- Chat system
- CRM
- Accounting
- Time tracking quá chi tiết
- Gantt phức tạp
- Enterprise permission
- 20 loại integration
- Mobile app ngay lập tức

Cắt thêm ở Phase 1 — xem `phase-1-rules.md` §1: Team, comments, notify, notes, meeting, subtasks, dependencies, tags, attachments, Guest.

Lý do:

> Mục tiêu đầu tiên là tạo ra một phần mềm mà bạn muốn mở mỗi ngày.

---

## 22. Roadmap

### Phase 1 — Personal

Home, Inbox, Task + checklist, Project, My Tasks, Calendar due-date, Weekly Review.

→ Dùng cho chính mình. Luật build: `phase-1-rules.md`.

### Phase 2 — Small Team

Members, Assignment, Comments, Notifications, Team Dashboard, nhiều workspace, Notes, calendar events.

→ Đưa cho team 3–10 người.

### Phase 3 — SaaS

Multiple Workspaces (đã thiết kế từ đầu), Subscription, Billing, Admin, Analytics, API.

→ Bắt đầu bán.

### Phase 4 — AI

AI Task Planning, AI Weekly Review, AI Priority, AI Schedule, AI Summary, AI Search.

→ Tạo khác biệt.

---

## 23. Success criteria

Sản phẩm thành công ở V1 khi:

Phase 1 xong khi tự dùng ≥ 2 tuần và đạt:

1. Bạn mở app mỗi sáng mà không cần nghĩ "vào đâu".
2. Capture một việc mất dưới 5 giây (Quick Add / Inbox).
3. Home trả lời được hôm nay / trễ / focus / tuần này.
4. Cuối tuần Review xong: overdue được reschedule hoặc drop, tuần sau có Focus.

Phase 2 xong khi:

5. Team 3–10 người thấy ai overloaded và ai blocked trong 10 giây.

Chưa đạt 1–4: không sang Phase 2.  
Chưa đạt 5: không sang Phase 3.

---

*Vision document. Luật implement Phase 1: `phase-1-rules.md`. Không thêm module cho đến khi daily-use loop chạy được.*

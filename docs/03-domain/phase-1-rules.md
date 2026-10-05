# Phase 1 rules

**Nguồn sự thật khi implement.**  
Tầm nhìn dài hạn: `../01-product/vision.md`. Khi lệch luật Phase 1, **file này thắng**.

| File | Thắng về |
|---|---|
| `phase-1-rules.md` | Phạm vi + luật nghiệp vụ |
| `phase-1-edges.md` | Empty, xóa, timezone, sort, Done, Focus |
| `../02-ux/screens-and-flows.md` | Mock + flow |
| `../02-ux/visual-system.md` | Visual + copy |
| `../05-data/schema.md` | Cột DB + API |
| `../06-acceptance/phase-1.md` | Acceptance |

Phase 2 trong folder này: `phase-2-team.md`, `phase-2-notes.md`, `phase-2-calendar.md`.  
SaaS / AI: `../01-product/`. Bản đồ: `../01-product/status.md`.

V1 = Phase 1 Personal.  
Chưa phải Small Team. Chưa phải SaaS. Chưa phải AI.

Mục tiêu duy nhất: bạn muốn mở app mỗi ngày.

Vòng phải chạy được:

```
Inbox → Home Focus → My Tasks → Weekly Review
```

---

## 1. Phạm vi Phase 1

### Làm

| Bề mặt | Việc được làm |
|---|---|
| Auth tối thiểu | Đăng ký / đăng nhập. Signup tạo 1 Personal workspace |
| Home | Today counts + My Focus + This Week |
| Inbox | Capture + organize |
| Quick Add | Title + project + due + priority |
| Task | Basic fields + checklist |
| Task Detail | Đủ để làm việc, không phơi field chết |
| My Tasks | Today / Upcoming / Overdue / All · List + Kanban |
| Project | Overview + Tasks |
| Calendar | Task theo ngày, kéo đổi due |
| Weekly Review | Số liệu + hành động chốt tuần sau |
| Search | Keyword trên title task / project |
| Settings | Tên, email, tên workspace |

### Không làm ở Phase 1

- Team dashboard
- Comments, mentions, followers
- Notifications (in-app / email / push)
- Notes
- Calendar meeting / event / khung giờ
- Subtasks, dependencies, tags, attachments
- Multiple workspace UI (schema vẫn thiết kế sẵn)
- Invite member, Guest, Admin
- Files tab, Project timeline/Gantt, Activity feed
- Natural-language Quick Add
- Redis / S3 bắt buộc — Postgres + local upload sau này cũng được

---

## 2. Ba tầng dữ liệu — không trộn

Đây là luật dứt khoát. Không thêm tầng Personal / Work bên trong task.

| Tầng | Là gì | Không phải |
|---|---|---|
| Workspace | Ranh giới data | Nhãn trên task |
| Inbox | Việc đã capture, chưa organize | Một project đặc biệt |
| Project | Việc đã được nhóm | Nơi chứa việc personal bắt buộc |

```
Personal Workspace          ← Phase 1 chỉ có cái này
├── Inbox                   ← chưa organize
├── My Tasks                ← mọi task của tôi, kể cả không project
├── Project A
└── Project B
```

Việc “mua đèn xe” sống ở Personal workspace.  
Không cần project. Không cần nhãn Personal/Work.

Phase 2 mới có Team workspace + switcher. Schema `workspaces` vẫn tạo từ đầu.

---

## 3. Inbox

### Định nghĩa

Inbox = task có `is_inbox = true`.

Mặc định:

- Quick Add không chọn project → `is_inbox = true`
- Quick Add có chọn project → `is_inbox = false`, gán project
- Tạo task từ trang Project → `is_inbox = false`

### Organize — ra khỏi Inbox khi

User làm **một** trong các việc sau:

1. Gán project
2. Gán due date
3. Bấm **Move to My Tasks**

Chỉ đổi title / description / priority **không** đưa task ra Inbox. Capture phải rẻ. Organize là chủ ý.

### Luật khác

- Xóa khỏi Inbox ≠ xóa task. Chỉ `is_inbox = false`.
- Task không project vẫn hợp lệ sau khi organize.
- Inbox không có Kanban. Chỉ list, newest first.
- Badge sidebar = số task đang `is_inbox = true`.

---

## 4. My Focus

Home sống hay chết ở luật này.

### Luật

1. Tối đa **3** task Focus trong một ngày.
2. User pin thủ công. Pin là nguồn sự thật.
3. Pin không đổi due date, status, hay project.
4. Done / bỏ pin → mất khỏi Focus, slot trống.
5. Focus theo ngày. Qua ngày mới: copy pin chưa Done sang hôm nay. Chi tiết `phase-1-edges.md` §6.

### Khi Home trống (chưa pin)

Hệ thống **đề xuất**, không tự pin. User bấm để nhận.

Thứ tự đề xuất:

1. Overdue
2. Due today + High
3. Due today
4. In Progress
5. Inbox (nếu vẫn trống)

Empty state:

> Pick up to 3 tasks to focus on today.

Không auto-fill thầm. Home trống mà tự nhét việc là phá Focus.

### Home Phase 1 không có

- Team Activity
- Widget tùy biến
- KPI ngoài 3 chỉ số Today: overdue / due today / upcoming (7 ngày)

`+ Task` luôn có trên Home.

This Week = Mon–Fri. Mỗi bar = số task đã organize, chưa Done, due đúng ngày đó. Timezone user, tuần bắt đầu Monday. `phase-1-edges.md` §1–2.

---

## 5. Task

### Field Phase 1

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| Title | Có | |
| Description | Không | Text thường. Không rich text nặng |
| Status | Có | Default `Todo` |
| Priority | Không | High / Medium / Low. Default Medium |
| Due date | Không | Chỉ ngày, không giờ |
| Project | Không | Null = việc lẻ trong workspace |
| Checklist | Không | Item text + done. Không lồng nhau |
| Assignee | Hệ thống | Phase 1 = chính user. Cột để sẵn |

### Không có ở Phase 1

Tags, comments, attachments, subtasks, dependencies, mentions, followers.

### Status

| Status | Ý nghĩa | Kanban |
|---|---|---|
| Todo | Chưa bắt đầu | Cột 1 |
| In Progress | Đang làm | Cột 2 |
| Blocked | Bị kẹt. Dùng được cả khi dùng một mình | Cột 3 |
| Done | Xong | Cột 4 |

Không custom status. Không workflow.

Kéo Kanban = đổi status.  
Done không xóa task.  
Blocked cần 1 dòng lý do ngắn (`blocked_reason`). Trống vẫn cho phép, Weekly Review sẽ kém hữu ích.

---

## 6. My Tasks

Nơi làm việc hằng ngày. Chỉ việc của user hiện tại.

### Tabs

`Today` · `Upcoming` · `Overdue` · `All`

| Tab | Luật |
|---|---|
| Today | Due hôm nay, hoặc đang In Progress, hoặc đang Focus |
| Upcoming | Due từ ngày mai trở đi, chưa Done |
| Overdue | Due trước hôm nay, chưa Done |
| All | Mọi task chưa archived, trừ Inbox chưa organize |

Inbox chưa organize **không** tràn vào All. All là việc đã vào hệ thống làm việc.

### Filter Phase 1

Project, Priority, Status.

Không filter Tag.

### View Phase 1

| View | Có |
|---|---|
| List | Có. Mặc định |
| Kanban | Có. 4 cột status |
| Calendar | Không. Dùng trang Calendar |

Hai view thôi. Trang Calendar lo việc xếp ngày.

---

## 7. Project

### Phase 1 có 2 tab

| Tab | Nội dung |
|---|---|
| Overview | Tên, progress, counts, upcoming |
| Tasks | List + Kanban của project |

Không có: Members, Calendar riêng, Files, Activity, Timeline, Gantt.

### Progress

```
completed_tasks / total_tasks  (chưa Done = chưa xong)
```

Không weight, không story point. Metric đơn giản, nói thẳng giới hạn này.

### Counts trên Overview

Tasks · Completed · In Progress · Blocked · Overdue

### Upcoming

5 task gần due nhất, chưa Done. Không phải milestone object riêng.

### Xóa project

Không xóa cứng task. Task về `project_id = null`. User chọn: về Inbox hoặc giữ trong My Tasks.

---

## 8. Calendar

Phase 1: **bản đồ due date**. Không phải Google Calendar.

### Có

- Week view
- Task hiện vào ngày due
- Task không due: không hiện trên Calendar
- Kéo sang ngày khác = đổi `due_date`
- Click task = mở Task Detail

### Không

- Meeting / `calendar_events`
- Khung giờ 09:00 / 14:00
- Recurring
- Timezone phức tạp — dùng timezone user, default local
- Kéo giữa các khung giờ
- Conflict detection

Muốn time-box hay họp → Phase 2.

---

## 9. Weekly Review

Không phải báo cáo để ngắm. Phải **chốt tuần sau** được.

### Khi nào hiện

- Vào được mọi lúc từ sidebar: **Review**
- Từ Friday, Home hiện prompt: `Review this week`

### Số liệu

- Completed tuần này
- Overdue hiện tại
- Blocked hiện tại
- Task đã có due tuần tới
- Progress từng project (completed / total)

### Hành động bắt buộc có

1. **Reschedule** việc overdue — chọn ngày mới, hoặc Next week
2. **Drop** — không làm nữa, archived
3. **Unblock hoặc giữ Blocked** — sửa lý do
4. **Chọn Focus tuần tới** — tối đa 3 task, thành gợi ý thứ Hai

Không có 4 hành động này thì không gọi là Weekly Review. Chỉ là dashboard.

Phase 1 không AI.

---

## 10. Quick Add

Có trên mọi màn hình.

### Field

- Title — bắt buộc
- Project — optional
- Due — optional, chỉ ngày
- Priority — optional, default Medium

Không Assignee picker ở Phase 1. Assignee = me.

### Sau Add

- Có project → vào project, không Inbox
- Không project → Inbox
- Không đóng app, không bắt mở Task Detail
- Capture < 5 giây

Natural language parse: không Phase 1.

---

## 11. Sidebar Phase 1

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
│  ──────────────────────────  │
│  ⚙ Settings                  │
└──────────────────────────────┘
```

Không Team. Không Notes. Review nằm trong Workflow vì nó đóng vòng, không phải settings.

---

## 12. Search · Auth · Permission

### Search

Một ô global. Kết quả Phase 1:

- Tasks (title)
- Projects (name)

Không Notes, không People.

### Auth

Email + password đủ. Signup → 1 Personal workspace, role Owner. Không OAuth bắt buộc.

### Permission Phase 1

Một user, một workspace. Owner.  
Bảng `workspace_members` vẫn tạo. Không UI invite. Không Guest.

---

## 13. Database Phase 1

Schema dài hạn vẫn theo `vision.md`. Chỉ **dùng** các bảng này ở Phase 1:

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

Cột đầy đủ: `schema.md`.

Có cột, chưa dùng UI:

- `tasks.assignee_id`
- `workspaces` sẵn cho nhiều workspace
- `projects.archived_at`

Chưa tạo / chưa wire:

```
project_members
task_assignees
task_comments
task_dependencies
task_attachments
notes
calendar_events
notifications
```

`activity_logs` optional. Có thì ghi: tạo task, đổi status, đổi due, complete. Chưa có Activity UI.

---

## 14. Stack Phase 1

Giữ stack đã chọn. Bớt infra.

| Layer | Phase 1 |
|---|---|
| Frontend | TypeScript, Next.js, React, Tailwind |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Cache | Chưa cần Redis |
| Storage | Chưa cần S3/MinIO |
| Deploy | Docker khi cần. Local chạy được là đủ để tự dùng |

Một backend. Một database. Một frontend.

---

## 15. Success — mới được sang Phase 2

Tự dùng ít nhất 2 tuần. Đạt hết:

1. Mở app buổi sáng, không nghĩ “vào đâu”.
2. Capture một việc < 5 giây.
3. Home trả lời: hôm nay / trễ / Focus / tuần này.
4. Cuối tuần Review xong: overdue được reschedule hoặc drop, tuần sau có Focus.

Chưa đạt thì không làm Team, Comments, Notifications, Notes, Calendar meeting.

---

## 16. Phase 2 mở lại theo thứ tự này

Chi tiết: `phase-2-team.md`. Notes: `phase-2-notes.md`. Event: `phase-2-calendar.md`.

1. Invite member + role Owner / Admin / Member
2. Assignee
3. Comments + mentions
4. In-app notifications
5. Team dashboard: load + blocked
6. Nhiều workspace + switcher
7. Calendar events
8. Notes gắn task/project
9. Attachments
10. Guest

Không nhảy cóc lên AI hay billing trước khi team 3 người dùng được tuần.

---

*Lock ngày 2026-10-04. Không thêm module vào Phase 1. Sửa luật thì sửa file này trước, rồi mới sửa `vision.md`.*

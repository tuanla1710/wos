# Screens and flows — Phase 1

**Nguồn sự thật cho UI Phase 1.**  
Tầm nhìn dài hạn (Team, Comments, Meeting, Timeline) nằm ở `vision.md` — **không implement theo mock đó**.

File này chỉ vẽ cái được build. Luật: `../03-domain/phase-1-rules.md`. Edge: `../03-domain/phase-1-edges.md`.  
Schema: `../05-data/schema.md`. Copy: `visual-system.md`. Acceptance: `../06-acceptance/phase-1.md`.  
Emoji trong ASCII = placeholder Lucide, không render emoji.

---

## 1. Sidebar

```
┌──────────────────────────────┐
│  WORKFLOW                    │
│                              │
│  🏠 Home                     │
│  📥 Inbox                 3  │
│  ✓  My Tasks                 │
│  📅 Calendar                 │
│  🔁 Review                   │
│  ▂  Statistics               │
│                              │
│  PROJECTS                    │
│  + New project               │
│  📁 RAN Platform             │
│  📁 Side work                │
│                              │
│  ──────────────────────────  │
│  ⚙ Settings                  │
└──────────────────────────────┘
```

- Badge Inbox = số `is_inbox = true`, chưa archived.
- Review không badge, trừ Friday–Sunday: chấm nhỏ “cần review”.
- Header app (không vẽ trong sidebar): tên workspace · ô Search · `+ Task`.
- Không Team. Không Notes. Không workspace switcher.

---

## 2. Home

```
┌──────────────────────────────────────────────────┐
│ Good morning, Tuan                         + Task │
│ Sunday, October 4                                │
├──────────────────────────────────────────────────┤
│  TODAY                                           │
│  🔴 2 overdue    🟠 3 due today    🔵 8 upcoming │
├──────────────────────────────────────────────────┤
│  MY FOCUS                              Pin / Edit │
│                                                  │
│  ☐ Finish API design                 HIGH        │
│  ☐ Prepare weekly report             HIGH        │
│  ☐ Review team document              MEDIUM      │
├──────────────────────────────────────────────────┤
│  THIS WEEK                                       │
│  Mon  ████████                                  │
│  Tue  ██████████                                │
│  Wed  ██████                                    │
│  Thu  █████████                                 │
│  Fri  █████                                     │
└──────────────────────────────────────────────────┘
```

Không Team Activity. Không widget.

- Click 🔴/🟠/🔵 → My Tasks tab tương ứng (Overdue / Today / Upcoming).
- Tick ☐ trên Focus = Done. Task biến mất khỏi Focus, slot trống.
- Click title → Task Detail.
- Pin / Edit → picker tối đa 3 task (xem flow §10.4).
- This Week: Mon–Fri. Click một ngày → Calendar tuần đó, focus ngày đó.
- Friday–Sunday: banner một dòng trên Today: `Review this week →`.

### Home trống (chưa có task)

```
┌──────────────────────────────────────────────────┐
│ Good morning, Tuan                         + Task │
│ Sunday, October 4                                │
├──────────────────────────────────────────────────┤
│  Nothing here yet.                               │
│  Add your first task. New tasks land in Inbox.   │
│                                         [+ Task] │
└──────────────────────────────────────────────────┘
```

### Home có việc, chưa pin Focus

```
MY FOCUS

Pick up to 3 tasks to focus on today.

Suggested
☐ 2 overdue · Finish API design
☐ Due today · Prepare weekly report
☐ In progress · Review team document

[Use these suggestions]     or pick individually
```

`Use these suggestions` mới pin. Không tự pin.

---

## 3. Inbox

```
┌──────────────────────────────────────────────────┐
│ Inbox · 3                                  + Task │
│ Unorganized tasks                                 │
├──────────────────────────────────────────────────┤
│ ○  Buy bike light                                 │
│    Just now                                       │
│ ○  Call dentist                                   │
│    2h ago                                         │
│ ○  Draft intro mail                               │
│    Yesterday                                      │
└──────────────────────────────────────────────────┘
```

List, newest first. Không Kanban. Không filter.

Click row → Task Detail (vẫn đang Inbox cho đến khi organize).

Trên Detail, CTA chính: Project · Due · **Move to My Tasks**.

### Inbox trống

```
Inbox is empty.
New tasks without a project or due date land here.
```

---

## 4. Quick Add

Mở từ mọi màn. Overlay nhỏ, focus vào title.

```
┌─────────────────────────────────┐
│ What needs to be done?          │
│                                 │
│ Prepare API documentation       │
│                                 │
│ Project   — None —              │
│ Due       — No date —           │
│ Priority  Medium                │
│                                 │
│              [Cancel] [Add Task]│
└─────────────────────────────────┘
```

Không field Assignee. Enter = Add nếu title không trống. Esc = đóng, không lưu.

---

## 5. Task Detail

```
┌─────────────────────────────────────────────┐
│ ← Back                                      │
│                                             │
│ Prepare API documentation          HIGH     │
│                                             │
│ Status       IN PROGRESS                    │
│ Project      RAN Platform                   │
│ Due          Oct 5                          │
│                                             │
│ [Move to Inbox]                             │
├─────────────────────────────────────────────┤
│ DESCRIPTION                                 │
│ Complete REST API documentation...          │
├─────────────────────────────────────────────┤
│ CHECKLIST                                +  │
│ ☑ Define endpoints                          │
│ ☑ Define request schema                     │
│ ☐ Define response schema                    │
│ ☐ Update documentation                      │
├─────────────────────────────────────────────┤
│ [Archive]  [Delete]                         │
└─────────────────────────────────────────────┘
```

Không Comments. Không Activity. Không Assignee picker.

- Back = màn trước (không phải luôn Home).
- Status: select 4 giá trị. Blocked mở ô `Why?` một dòng.
- Project: select hoặc None.
- Due: date picker, clear được. Clear due **không** đẩy về Inbox.
- Move to Inbox: hiện khi `is_inbox = false`.
- Checklist `+` thêm dòng. Enter thêm dòng tiếp. Tick item ≠ Done task.

Nếu task đang Inbox, thay cụm field bằng:

```
INBOX · Not organized

[Choose project]  [Choose due date]  [Move to My Tasks]
```

---

## 6. My Tasks

```
┌──────────────────────────────────────────────────┐
│ My Tasks                                   + Task │
│ [Today] [Upcoming] [Overdue] [All]                │
│ List | Kanban          Project ▾ Priority ▾ Status│
├──────────────────────────────────────────────────┤
│ TODAY                                             │
│ ★ Finish API design              HIGH   Oct 4     │
│ ☐ Prepare weekly report          HIGH   Oct 4     │
│ ☐ Review team document           MED    In prog.  │
└──────────────────────────────────────────────────┘
```

- ★ = đang Focus.
- List mặc định. Kanban 4 cột: Todo · In Progress · Blocked · Done.
- Filter: Project, Priority, Status. Không Tag.
- Không view Calendar ở đây.

### My Tasks trống theo tab

- Today: `Nothing today. Pin Focus or set a due date.`
- Upcoming: `Nothing upcoming.`
- Overdue: `Nothing overdue.`
- All: `No organized tasks yet. Open Inbox.`

---

## 7. Project

Tạo project: `+ New project` → chỉ hỏi **Name** → vào Overview trống.

### Overview

```
RAN Platform
────────────────────────────────

Progress
████████████████░░░░ 78%
31 / 42 tasks done

Tasks          42
Completed      31
In Progress     7
Blocked         1
Overdue         4

Upcoming
• API release          Oct 5
• Integration test     Oct 8
• Documentation        Oct 10
```

Không Timeline. Không Team. Không Members / Files / Activity.

Tab: **Overview | Tasks**

### Project Tasks

Giống My Tasks nhưng scope = project này. List + Kanban. Không tab Today/Upcoming — filter due trên chỗ filter nếu cần. Mặc định All chưa Done, sort theo `phase-1-edges.md`.

### Xóa project

```
Delete project “RAN Platform”?
Tasks are not deleted.

○ Keep in My Tasks
○ Move to Inbox

[Cancel]  [Delete project]
```

---

## 8. Calendar

Week view. **Không** cột giờ. **Không** meeting.

```
Mon 6     Tue 7     Wed 8     Thu 9     Fri 10    Sat 11    Sun 12
────────────────────────────────────────────────────────────────
☐ API     ☐ Report            ☐ Review
  design    HIGH                doc
  HIGH

☐ Call
  dentist
```

- Chỉ task có `due_date`, chưa archived.
- Done: hiện mờ, gạch nhẹ, vẫn trên ngày due.
- Kéo sang ngày khác = đổi due. Thả ra là lưu.
- Click = Task Detail.
- Task không due: không hiện. Không cột “unscheduled”.

Header: `< This week >` · hôm nay highlight.

---

## 9. Weekly Review

```
WEEKLY REVIEW · Sep 29 – Oct 5
────────────────────────────────

Completed          24
Overdue             3
Blocked             2
Due next week      12

Project progress
RAN Platform     ██████████████░░  76%
Side work        ████░░░░░░░░░░░░  25%

── Overdue ──
☐ Finish API design     Oct 2    [Reschedule ▾] [Drop]
☐ Call dentist          Oct 1    [Reschedule ▾] [Drop]

── Blocked ──
☐ Deployment            Waiting for staging    [Unblock] [Keep]

── Focus next week (max 3) ──
☐ API release
☐ Integration test
+ Add

[Done reviewing]
```

Reschedule: hôm nay / tomorrow / next Monday / pick date.  
Drop = archive.  
Unblock = status Todo, xóa `blocked_reason`.  
Focus next week = gợi ý thứ Hai, không tự pin.

---

## 10. Flows

### 10.1 Signup → lần mở đầu

1. Register: name, email, password.
2. Timezone = timezone trình duyệt. Fallback `Asia/Seoul`.
3. Tạo Personal workspace, member Owner, `assignee` mặc định = user.
4. Vào Home trống. Banner 3 dòng, dismiss được:

   > Capture to Inbox. Pin up to 3 Focus tasks. Review at the end of the week.

5. Không wizard nhiều bước. Không sample project.

### 10.2 Capture

1. `+ Task` mọi màn → Quick Add.
2. Title bắt buộc. Add.
3. Không project → Inbox, `is_inbox = true`.
4. Có project → project đó, không Inbox.
5. Đóng popup. Không mở Detail. Không đổi route trừ khi đang Inbox thì list cập nhật tại chỗ.

### 10.3 Organize Inbox

Một trong ba:

- Gán project → ra Inbox.
- Gán due → ra Inbox.
- Move to My Tasks → ra Inbox, không project, không due.

Chỉ sửa title / description / priority → vẫn Inbox.

### 10.4 Pin Focus

1. Home → Edit, hoặc `Use these suggestions`.
2. Picker: task chưa archived, chưa Done, đã organize **hoặc** Inbox (pin Inbox = organize: `is_inbox = false`).
3. Tối đa 3. Cố pin 4 → không nhận, giữ 3 cái đang có.
4. Pin không đổi due / status / project.
5. Thứ tự picker = thứ tự Focus trên Home.

### 10.5 Làm việc trong ngày

1. Mở app → Home.
2. Tick Focus hoặc vào My Tasks Today.
3. Cần đổi ngày → Calendar kéo, hoặc Due trên Detail.
4. Kẹt → Status = Blocked + lý do.
5. Xong → Done. `completed_at` = now. Ra khỏi Focus.

### 10.6 Tạo / xóa project

1. `+ New project` → name → Overview trống + CTA `+ Task`.
2. Task tạo từ project: không Inbox, `project_id` set.
3. Xóa project: chọn giữ My Tasks hoặc về Inbox; `project_id = null`; xóa row project.

### 10.7 Calendar kéo

1. Drag task ngày A → ngày B.
2. `due_date = B`. `is_inbox` không đổi (task trên calendar đã organize).
3. Nếu task đang Focus hôm nay và B ≠ hôm nay: **giữ pin hôm nay**. Due và Focus là hai thứ khác nhau.

### 10.8 Weekly Review

1. Sidebar Review, hoặc banner Home từ Friday.
2. Reschedule / Drop / Unblock / chọn ≤ 3 Focus tuần tới.
3. Done reviewing: dismiss banner đến Friday tuần sau.
4. Thứ Hai: Home trống Focus thì gợi ý **week-focus trước**, rồi mới overdue / due today.

### 10.9 Search

1. Ô header → gõ → kết quả nhóm Tasks, Projects.
2. Enter / click → Detail hoặc Project Overview.
3. Không kết quả: `No results for “API”.`

### 10.10 Settings

```
Name
Email
Password
Workspace name
Timezone
```

Không member list. Không billing. Không notification prefs.

---

## 11. Search overlay

```
Search
[ API                         ]

Tasks
  API design
  API testing

Projects
  RAN Platform
```

Keyword trên `tasks.title`, `projects.name`. Không People, không Notes.

---

*Phase 1 screens lock. Muốn vẽ Team / Comments / Meeting thì vẽ ở vision, không thay file này.*

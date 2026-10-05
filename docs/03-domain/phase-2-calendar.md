# Phase 2 — Calendar events

Phase 1 Calendar = **bản đồ due date**.  
Phase 2 thêm **event** (họp / block giờ). Không biến thành Google Calendar.

Recurring, timezone per-event, conflict engine, sync Google: **không**.

---

## 1. Hai loại trên lịch

| Loại | Object | Thời gian |
|---|---|---|
| Task | `tasks.due_date` | Cả ngày. Kéo = đổi due |
| Event | `calendar_events` | Cả ngày **hoặc** có giờ bắt đầu–kết thúc |

Task không có giờ. Muốn “làm API 11:00–13:00” → tạo event, optional gắn `task_id`. Không nhồi `due_time` vào task.

---

## 2. Event model

```
calendar_events
  id
  workspace_id
  created_by
  title                 NOT NULL 1–160
  event_date            date NOT NULL
  start_time            time NULL     -- null = all-day
  end_time              time NULL
  project_id            NULL
  task_id               NULL          -- optional link
  created_at, updated_at
```

Luật:

- `start_time` null → all-day. `end_time` phải null.
- Có `start_time` → `end_time` bắt buộc, > start, cùng ngày. Không overnight Phase 2.
- Time = timezone user, naive `time` + `users.timezone`.
- Xóa task: `task_id = null`, event còn.
- Không attendees riêng. Ai trong workspace thấy mọi event. Guest: event của project được mời (nếu `project_id` set; event không project → Guest không thấy).

---

## 3. UI Calendar Phase 2

Week view, **có hàng giờ** 08:00–18:00 + hàng All-day phía trên.

```
        Mon 6      Tue 7      Wed 8
All-day [API due]  [Report]
08:00
09:00   Meeting
10:00
11:00              API Design (event)
…
```

- Task due: chip trên All-day. Style khác event (outline vs fill).
- Event timed: block theo giờ. Label title.
- Event all-day: hàng All-day, fill `accent` nhẹ.
- Kéo task all-day → ngày khác = đổi due (như Phase 1).
- Kéo event → đổi `event_date` và/hoặc giờ (snap 30 phút).
- Click task → Task Detail. Click event → Event popover.

### Event popover

```
Title      Standup
Date       Oct 6
Time       09:00 – 09:30     ☐ All day
Project    RAN Platform
Task       — None —
           [Save]  [Delete]
```

Tạo: click ô giờ trống → popover title focused. Click hàng all-day → all-day event.

Không `+ Event` global cạnh `+ Task`. Tạo event **trên Calendar**. Tránh hai nút capture.

---

## 4. Home / My Tasks / Review

- Event **không** vào My Tasks, Focus, Inbox, overdue counts.
- Home This Week bar: **vẫn chỉ đếm task due**, không đếm event.
- Review: không list event.

Calendar là nơi thấy họp. Home vẫn là chỗ làm việc.

---

## 5. Project Calendar

Tab Calendar của project = cùng week view, filter `project_id` (task due của project + event của project).

---

## 6. API

| Method | Path |
|---|---|
| GET | `/calendar?from=&to=` → `{ tasks, events }` |
| POST | `/events` |
| PATCH/DELETE | `/events/:id` |

GET `/calendar` Phase 1 chỉ tasks — Phase 2 thêm `events` không breaking nếu client cũ bỏ qua.

---

## 7. Edges

- Snap 30 phút. Kéo chồng event: **cho phép**. Không cấm conflict.
- Đổi timezone user: `event_date` + `time` không convert (như due).
- Title trống: không save.
- Xóa event: confirm. Không archive event.
- Done task: chip all-day mờ, như Phase 1.

---

## 8. Không làm

- Recurring (RRULE)
- Invites / RSVP / Google sync
- Reminder 10 phút (không push)
- Timezone per event
- Multi-day event
- Calendar sharing public

---

*Calendar Phase 2 lock. Task vẫn không có giờ.*

# Phase 1 edges

**Nguồn sự thật cho empty, xóa, ngày giờ, sort, Done, Focus tuần tới.**  
Khi mơ hồ lúc code, file này thắng đoán của dev.

---

## 1. Ngày, giờ, tuần

| Luật | Giá trị |
|---|---|
| Timezone | `users.timezone` (IANA). Signup lấy từ browser. Fallback `Asia/Seoul` |
| Today | `CURRENT_DATE` theo timezone user, không theo UTC server |
| Due | Chỉ `date`. Không giờ. Không recurring |
| Week | ISO. Thứ Hai = đầu tuần |
| Home This Week | Chỉ Mon–Fri |
| Calendar | Cả 7 ngày |
| Review “tuần này” | Monday 00:00 → Sunday 23:59:59 cùng timezone |
| Friday prompt | Local weekday ≥ Friday (Fri, Sat, Sun) và user chưa Done reviewing tuần này |

Đổi timezone ở Settings: due_date **không** đổi (vẫn là ngày lịch). “Today” có thể nhảy. Chấp nhận.

Không DST special case. Dùng IANA.

---

## 2. This Week bars

Mỗi cột Mon–Fri:

```
count(tasks)
  WHERE due_date = ngày đó
    AND archived_at IS NULL
    AND is_inbox = false
    AND status != 'done'
```

- Chiều dài bar = count / max(count trong 5 ngày, 1).
- Count = 0 → bar trống, vẫn hiện thứ.
- Weekend không có cột trên Home.
- Click cột → Calendar, highlight ngày đó.

Không đếm In Progress nếu không due ngày đó. Không đếm Inbox.

---

## 3. Sort

| List | Sort |
|---|---|
| Inbox | `created_at DESC` |
| My Tasks · Today | Focus `position` ASC trước. Rồi overdue không — overdue không thuộc Today trừ khi đang Focus. Còn lại: due today theo priority `high > medium > low`, rồi `created_at ASC`. In Progress không due: sau due today, `updated_at DESC` |
| My Tasks · Upcoming | `due_date ASC`, rồi priority, rồi `title ASC` |
| My Tasks · Overdue | `due_date ASC` (cũ nhất trên), rồi priority |
| My Tasks · All | `due_date ASC NULLS LAST`, rồi priority, rồi `updated_at DESC` |
| Project Tasks | giống All trong project |
| Calendar một ngày | priority, rồi `title ASC` |
| Search tasks | title match exact trước, rồi `updated_at DESC` |
| Search projects | `name ASC` |
| Focus trên Home | `task_focus.position` 1–3 |
| Gợi ý Focus | tuần tới (nếu có) → Overdue → Due today + High → Due today → In Progress → Inbox |
| Upcoming trên Project | `due_date ASC`, 5 task, chưa Done, chưa archive |
| Sidebar projects | `name ASC` |

Kanban trong một cột: cùng sort với List của tab đang mở.

---

## 4. Today / Upcoming / Overdue / All

Áp dụng: `archived_at IS NULL`. Inbox chưa organize **không** vào Upcoming / Overdue / All.

| Tab | Task vào khi |
|---|---|
| Today | (`due_date = today` AND status ≠ done) OR (`status = in_progress` AND `is_inbox = false` AND status ≠ done) OR (có `task_focus` hôm nay AND status ≠ done) |
| Upcoming | `is_inbox = false` AND `due_date > today` AND status ≠ done |
| Overdue | `is_inbox = false` AND `due_date < today` AND status ≠ done |
| All | `is_inbox = false` |

All gồm cả Done, để Kanban có cột Done. List All mặc định vẫn hiện Done ở cuối (due nulls last + done sau cùng: sau khi sort due/priority, `status = done` xuống dưới).

Một task Focus không due, status Todo: vào Today vì đang pin. Không vào Upcoming.

---

## 5. Done

| Hành động | Hệ quả |
|---|---|
| Tick ☐ trên Home Focus | `status = done`, `completed_at = now`, xóa row `task_focus` hôm nay |
| Tick ☐ trên My Tasks List | giống trên nếu có checkbox. List Phase 1 có checkbox |
| Đổi status → Done trên Detail / Kanban | giống, xóa focus hôm nay |
| Tick một checklist item | Chỉ item đó. Task không Done |
| Mọi checklist done | Task **không** tự Done |
| Reopen (Done → Todo / In Progress / Blocked) | `completed_at = null`. Không tự pin lại |
| Done task trên Calendar | Vẫn hiện ngày due, style mờ |

Không undo toast bắt buộc ở Phase 1. Reopen từ Detail đủ.

---

## 6. Focus hàng ngày

- Tối đa 3. PUT replace.
- Pin không đổi due, status, project.
- Pin task Inbox → `is_inbox = false` (organize bằng hành động Focus).
- Pin task Done: không cho. Picker loại Done.
- Pin task archived: không cho.
- Cùng một task không pin 2 lần một ngày.
- Kéo Calendar đổi due ≠ bỏ pin hôm nay.
- Task Done / Delete / Archive → gỡ pin ngày đó, dồn position 1..n.

### Qua ngày

Lần đọc Home đầu tiên trong ngày mới:

- Nếu chưa có `task_focus` cho today:
- Copy từ ngày gần nhất có pin (thường hôm qua) những task còn sống: chưa Done, chưa archive.
- Giữ position. Slot task chết thì để trống, không kéo gợi ý vào.

User xóa pin hôm qua không ảnh hưởng hôm nay sau khi đã copy.

### Gợi ý (chưa pin)

Không ghi DB. Tính lúc GET `/home`.

Thứ tự, bỏ task đã liệt kê, lấy đến 3:

1. `task_week_focus` của tuần có `week_start = Monday(today)`, task còn sống, chưa Done
2. Overdue
3. Due today + High
4. Due today
5. In Progress, không inbox
6. Inbox newest

Nút `Dùng 3 gợi ý này` = PUT `/focus` với đúng 3 (hoặc ít hơn nếu không đủ).

---

## 7. Focus tuần tới

- Lưu `task_week_focus.week_start` = **Monday tuần sau** lúc review (nếu đang Fri 3/10/2026 → `2026-10-06`).
- Review vào Mon–Thu: `week_start` vẫn = Monday **tuần sau**, không phải tuần hiện tại. Focus tuần này dùng pin hàng ngày.
- Tối đa 3. Task Done / archived loại khỏi picker.
- Thứ Hai tuần đó: **không auto-pin**. Chỉ nhảy lên đầu danh sách gợi ý.
- User pin tay hoặc bấm dùng gợi ý.
- Hết Chủ nhật tuần đó: week-focus cũ không hiện ở gợi ý nữa.

---

## 8. Archive · Drop · Delete

Ba việc khác nhau.

| Hành động | Dữ liệu | UI |
|---|---|---|
| Archive / Drop | `archived_at = now()`, gỡ focus | Biến khỏi mọi list mặc định. Review Drop = archive |
| Unarchive | `archived_at = null` | API có. Settings/restore **không** làm Phase 1 |
| Delete task | `DELETE` task, cascade checklist + focus | Confirm. Không undo |
| Move to Inbox | `is_inbox = true` | Vẫn còn task, vào Inbox |
| Delete project | Xóa project; task `project_id = null`; user chọn My Tasks hoặc Inbox | Confirm 2 lựa chọn |

### Confirm copy

Delete task:

> Delete “{title}”? This can’t be undone.

Delete project: xem `screens-and-flows.md` §7.

Archive từ Detail: không confirm thứ hai. Review Drop không confirm thứ hai — user đang trong review có chủ ý.

Không trash bin Phase 1.

---

## 9. Inbox edges

- Gán rồi xóa project → không về Inbox.
- Gán rồi clear due → không về Inbox.
- Move to Inbox giữ project + due. Badge Inbox tăng. Task biến khỏi All cho đến khi organize lại.
- Organize lại: đổi project, đổi due, Move to My Tasks, hoặc pin Focus.
- Quick Add vừa project vừa due → không Inbox.
- Tạo từ trang Project → không Inbox dù không due.

---

## 10. Blocked

- Status Blocked được trên personal.
- `blocked_reason` optional, một dòng, max 200.
- Đổi sang status khác → clear reason ở API.
- Review Unblock → `todo` + clear reason.
- Review Keep → không đổi.
- Overdue + Blocked: vào cả Overdue list và Blocked list trên Review. Counts đếm riêng, một task có thể vào cả 2 số.

---

## 11. Empty · error · validate

### Empty

| Màn | Copy |
|---|---|
| Home, 0 task | Nothing here yet. / Add your first task. New tasks land in Inbox. |
| Home, có task, 0 pin | Pick up to 3 tasks to focus on today. |
| Inbox | Inbox is empty. / New tasks without a project or due date land here. |
| My Tasks Today | Nothing today. Pin Focus or set a due date. |
| My Tasks Upcoming | Nothing upcoming. |
| My Tasks Overdue | Nothing overdue. |
| My Tasks All | No organized tasks yet. Open Inbox. |
| Project Overview mới | No tasks yet. / Add a task to this project. |
| Calendar tuần trống | No due dates this week. |
| Search | No results for “{q}”. |
| Review, 0 completed | No tasks completed this week. |

### Validate

| Field | Rule | Lỗi |
|---|---|---|
| Title | 1–200, trim | Title can’t be empty. |
| Project name | 1–80, trim | Project name can’t be empty. |
| Checklist title | 1–200 | Don’t add an empty item. |
| Search q | trim, ≥ 1 | Don’t call API if empty |
| Focus ids | 0–3, unique, tồn tại, cùng workspace | 400 |
| Email | unique | Email is already in use. |
| Password | ≥ 8 | Password must be at least 8 characters. |

### Error

- 401 → login.
- 404 task/project → toast `Not found.`, về Home.
- 500 / network → toast `Couldn’t save. Try again.`, không xóa state local đang sửa.
- Kéo Calendar fail → task **snap về ngày cũ**.

Không form đa lỗi phức tạp. Một field một message.

---

## 12. Concurrent · refresh

Phase 1 một user: last-write-wins. Không optimistic lock.

Sau PATCH / kéo / tick: UI dùng response server. Không queue offline.

Mở 2 tab: tab sau ghi đè. Chấp nhận.

---

## 13. Onboarding edges

- Không seed task mẫu.
- Banner 3 ý: dismiss → `localStorage` hoặc flag `users` không cần cột mới; `localStorage` đủ Phase 1.
- Review done: `localStorage` key `review_done:{week_start}` hoặc bảng sau. Phase 1: `localStorage` chấp nhận (đổi máy thì thấy lại prompt — OK).
- User không pin Focus cả tuần: Home vẫn dùng được qua Today counts + My Tasks. Không block.

---

## 14. Không làm thành “edge” Phase 1

Không spec, không lẻn vào:

- Recurring task
- Timezone per-task
- Undo stack
- Multi-select
- Keyboard shortcuts ngoài Enter/Esc Quick Add
- Drag reorder Focus (đổi thứ tự trong picker đủ)
- Mobile layout riêng — web usable ở 768px+, không optimize phone
- i18n: UI English như mock, không bắt buộc i18n framework

---

*Edge lock. Gặp case mới: thêm vào file này, đừng im lặng xử lý khác mỗi màn.*

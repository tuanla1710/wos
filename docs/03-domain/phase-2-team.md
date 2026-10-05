# Phase 2 — Team

Chỉ mở khi Phase 1 đạt success trong `phase-1-rules.md` §15.

Notes: `phase-2-notes.md`.  
Calendar event: `phase-2-calendar.md`.  
File này: người, quyền, giao việc, comment, notify, Team, workspace, file, tag, activity.

Khi lệch vision, **file này thắng** cho Phase 2.

---

## 1. Thứ tự build

1. Invite + Owner / Admin / Member
2. Assignee
3. Comments + mentions
4. In-app notifications
5. Team dashboard + Home activity
6. Nhiều workspace + switcher
7. Calendar events → `phase-2-calendar.md`
8. Notes → `phase-2-notes.md`
9. Attachments + Project Files
10. Guest
11. Tags (làm cùng bước 3 nếu rẻ; không chặn Team)

Không làm trong Phase 2: subtasks, dependencies, followers, Gantt, email/push, chat.

---

## 2. Sidebar + Home đổi gì

```
WORKFLOW: Home, Inbox, My Tasks, Calendar, Review, Statistics
PROJECTS: …
TEAM: Team
NOTES: Notes                    ← bước 8
────────
Settings
```

Header: **workspace switcher** (bước 6) · Search · `+ Task`.

Home thêm block **TEAM ACTIVITY** dưới This Week — chỉ khi workspace có ≥ 2 member. Personal một mình: không hiện block trống.

```
TEAM ACTIVITY
Minho completed “API test”
Jisoo created “UI review”
David is blocked on “Deployment”
```

Click dòng → Task Detail. Tối đa 10 dòng, mới nhất trước.

---

## 3. Role + permission

Bốn role. Không custom.

| Hành động | Owner | Admin | Member | Guest |
|---|---|---|---|---|
| Xem task/project trong workspace | ✓ | ✓ | ✓ | Chỉ project được mời |
| Tạo task | ✓ | ✓ | ✓ | |
| Sửa mọi task | ✓ | ✓ | ✓ | |
| Xóa task | ✓ | ✓ | Task mình tạo | |
| Archive / Drop | ✓ | ✓ | Task mình tạo hoặc đang assignee | |
| Comment | ✓ | ✓ | ✓ | ✓ trên project được mời |
| Mention | ✓ | ✓ | ✓ | |
| Đổi assignee | ✓ | ✓ | ✓ | |
| Tạo / sửa project | ✓ | ✓ | ✓ | |
| Xóa project | ✓ | ✓ | | |
| Invite Member / Admin | ✓ | ✓ | | |
| Invite Guest | ✓ | ✓ | | |
| Đổi role | ✓ | ✓ trừ Owner | | |
| Xóa / leave member | ✓ | ✓ trừ Owner | Chính mình | Chính mình |
| Workspace settings | ✓ | ✓ | | |
| Xóa workspace | ✓ | | | |
| Billing (Phase 3) | ✓ | | | |

Member **sửa mọi task** trong workspace — team 3–10, không lock per-task. Guest không tạo task.

Phase 1 user = Owner. Không downgrade Owner cuối cùng.

---

## 4. Invite · Members

Settings → **Members**.

```
MEMBERS
Tuan     Owner
Minho    Admin          [Remove]
Jisoo    Member         [Remove]

Invite
Email · Role [Member ▾]   [Copy invite link]
Pending
minho@…  Member  expires 7d   [Revoke]
```

### Luật

- Tạo `workspace_invites`: email, role, token, expires 7 ngày, created_by.
- Phase 2 **không bắt SMTP**. Màn hình hiện link. Owner gửi tay.
- SMTP optional sau. Cùng bảng.
- Accept: login/register → vào `workspace_members`, invite consumed.
- Email invite đã là member → 400, không tạo invite mới.
- Xóa member: task họ đang assignee → về Owner (không unassigned). Focus/week-focus của họ xóa.
- Leave: Member/Guest được. Owner phải transfer Owner trước, hoặc xóa workspace.

Không invite vào từng project trừ Guest (bước 10).

---

## 5. Assignee

Một người / task. Dùng `tasks.assignee_id`. Không bảng `task_assignees`.

| Luật | Giá trị |
|---|---|
| Bắt buộc | Có. Không null |
| Default tạo | User tạo |
| Quick Add | Thêm field Assignee, default Me |
| My Tasks | Chỉ task `assignee_id = me` |
| Project Tasks / All (filter) | Thêm filter Assignee |
| Inbox | Vẫn mọi inbox user tạo; assign người khác + organize thì ra Inbox của creator, vào My Tasks của assignee |
| Đổi assignee | Notify người mới. Không notify nếu gán cho chính mình |
| Unassign | Không. Đổi người, hoặc archive |

Home Focus / Review vẫn theo **tôi** (assignee = me), trừ Team Activity / Team page.

---

## 6. Comments + mentions

Trên Task Detail, dưới Checklist.

```
COMMENTS
Minho  10:42
Please review endpoint /tasks

[Write a comment…  @ to mention]
```

### Luật

- Text thường. Không rich text. Max 2000.
- Sửa comment của mình. Xóa của mình. Owner/Admin xóa mọi comment.
- Không thread / reply lồng.
- `@Name` → `task_comment_mentions` + notify.
- Mention chỉ member (và Guest nếu đang xem task đó). Gõ @ hiện list.
- Comment không đổi status. Comment không organize Inbox.

Schema:

```
task_comments
  id, task_id, author_id, body, created_at, updated_at, deleted_at

task_comment_mentions
  comment_id, user_id   UNIQUE
```

Soft-delete comment: `deleted_at`, UI “Comment deleted”.

---

## 7. Notifications

In-app only. Bell ở header. Badge = unread.

```
NOTIFICATIONS
● Tuan assigned you “API design”
● “Weekly report” is due tomorrow
○ Jisoo mentioned you on “UI review”
```

| Event | Ai nhận | Không nhận |
|---|---|---|
| Assigned to you | Assignee mới | Người tự gán mình |
| Due tomorrow | Assignee | Task inbox / archived / done |
| Overdue | Assignee, 1 lần/ngày lúc 00:15 timezone user | |
| Mentioned | Người được @ | Tự @ mình |
| Task blocked | Assignee | Người tự block |
| Comment on your task | Assignee + người đã comment thread đó | Author comment |

Job due/overdue: cron nhẹ hoặc check lúc GET `/notifications` + nightly. Phase 2 chấp nhận “khi ai đó mở app / cron 15 phút”.

Luật khác:

- Click → Task Detail, mark read.
- Mark all read.
- Không email, không push, không digest.
- Không notify Focus / pin / checklist tick.
- Giữ 90 ngày rồi xóa.

```
notifications
  id, workspace_id, user_id, type, task_id NULL,
  body, read_at NULL, created_at
```

---

## 8. Team dashboard

`/team`. Workspace ≥ 2 member. Một mình: empty “Invite your team”.

```
TEAM

              Open   Progress
Tuan           12      82%
Minho           8      71%
Jisoo           6      90%
David           5      60%

WHO IS OVERLOADED
Tuan     ████████████  12
Minho    ███████       8
Jisoo    █████         6
David    ███           5

WHO IS BLOCKED
🔴 David   Deployment blocked
🔴 Minho   Waiting for API
```

### Metric — lock

**Open** = task `assignee_id = user` AND not archived AND not inbox AND status ≠ done.

**Progress** = done / (done + open) của user trong workspace. Không done + không open → `—`.

**Overload bar** = Open / max(Open trên team, 1). Không story point. Không “overloaded” threshold tự tô đỏ — manager tự đọc số.

**Blocked** = open + status blocked. Hiện title + `blocked_reason`. Click → Detail.

Guest không hiện trên Team. Sort Open DESC.

Review Phase 2: thêm block “Team blocked” (optional, cùng query). Không đổi 4 hành động personal.

---

## 9. Nhiều workspace

Header:

```
[ Personal ▾ ]
  Personal
  Gigalane Team
  + New workspace
```

### Luật

- Signup vẫn 1 workspace `Personal`, Owner.
- New workspace: chỉ **name** → user = Owner. Home trống.
- Data không đụng nhau. Search / Focus / Inbox theo workspace đang chọn.
- Last workspace: `localStorage`.
- User thuộc nhiều workspace qua invite.
- Xóa workspace: Owner, confirm gõ tên. Cascade data. Không xóa user account.
- Không “workspace type” Personal/Work. Chỉ tên.

---

## 10. Project tabs Phase 2

| Tab | Có khi |
|---|---|
| Overview | + member avatars (assignee distinct) |
| Tasks | + filter Assignee |
| Members | Bước 1: mọi member workspace thấy project. Bước 10: Guest chỉ project mời |
| Calendar | Filter Calendar theo project — không module mới |
| Files | Mọi attachment của task trong project |
| Activity | `activity_logs` của project + task con |

Không Timeline / Gantt.

`project_members` **chỉ dùng cho Guest** (và sau này share hẹp). Member/Admin/Owner = implicit all projects. Không bắt Member join từng project.

```
project_members
  project_id, user_id, role_in_project  -- Phase 2: chỉ guest
```

Đơn giản: `project_id, user_id` UNIQUE. Có row = Guest được xem project đó.

---

## 11. Attachments

Trên Task Detail, dưới Comments.

- Upload 1 file / lần. Max 10 MB.  
- Type: pdf, png, jpg, webp, gif, txt, md, zip, docx.  
- Lưu MinIO/S3. Local disk chấp nhận nếu chưa có S3.  
- Tên file + size + người + lúc. Xóa: author hoặc Admin/Owner.  
- Không preview Office. Ảnh: thumbnail. PDF: link.  
- Không attachment trên comment.

```
task_attachments
  id, task_id, uploaded_by, filename, content_type, size_bytes, storage_key, created_at
```

Project Files = list join tasks của project.

---

## 12. Tags

Optional, Phase 2 muộn.

- Task: nhiều tag, text `a-z0-9-`, 1–24 ký tự, lowercase.
- Autocomplete tag đã có trong workspace.
- Filter My Tasks + Project Tasks.
- Không color bắt buộc. Không nested.

```
tags
  id, workspace_id, name   UNIQUE (workspace_id, name)

task_tags
  task_id, tag_id
```

Không hiện tag trên Home.

---

## 13. Activity

```
activity_logs
  id, workspace_id, actor_id, project_id NULL, task_id NULL,
  verb, summary, created_at
```

Verb Phase 2: `created`, `status`, `due`, `assignee`, `blocked`, `commented`, `completed`.

- Task Detail: 20 dòng mới nhất.
- Project Activity: 50.
- Home Team Activity: 10, workspace, không gồm việc chỉ mình comment nếu… không: gồm hết verb trên.
- Không activity cho checklist tick, pin focus.

Ghi đồng bộ trong request API. Không queue Phase 2.

---

## 14. Guest (bước 10)

- Invite role Guest + chọn **một hoặc nhiều project**.
- Guest login: sidebar chỉ Home (counts trên project được mời), project đó, Search hẹp.
- Không Inbox, không My Tasks All workspace, không Team, không Settings, không Review, không tạo task.
- Comment + xem file được.
- Home Guest: Today/Overdue/Focus trên task họ được xem. Focus vẫn pin được trên task visible — hữu ích nếu Guest là collaborator ngoài.

Nếu Guest quá méo Home: Guest default vào project đầu, không pin Focus. **Lock: Guest không có Focus, không Inbox, vào project list.**

---

## 15. Search Phase 2

Thêm nhóm:

- People (`users.name` trong workspace)
- Notes (sau khi có Notes)
- Tasks vẫn title

Guest: chỉ task/project visible.

---

## 16. Schema + API thêm

Bảng mới: `workspace_invites`, `task_comments`, `task_comment_mentions`, `notifications`, `activity_logs`, `task_attachments`, `tags`, `task_tags`, `project_members`.

Không tạo `task_assignees`.

API thêm (prefix `/api`):

| Method | Path |
|---|---|
| GET/POST | `/workspace/members` |
| POST | `/workspace/invites` |
| POST | `/invites/:token/accept` |
| DELETE | `/workspace/members/:userId` |
| PATCH | `/tasks/:id` thêm `assignee_id` |
| GET/POST | `/tasks/:id/comments` |
| PATCH/DELETE | `/comments/:id` |
| GET | `/notifications` |
| POST | `/notifications/read-all` |
| GET | `/team` |
| POST | `/workspaces` |
| POST | `/workspaces/:id/switch` (hoặc client chỉ đổi header `X-Workspace-Id`) |
| POST | `/tasks/:id/attachments` |
| GET | `/projects/:id/files` |
| GET | `/projects/:id/activity` |
| GET/POST | `/tags` |

Mọi request workspace-scoped: header `X-Workspace-Id`.

---

## 17. Edges Phase 2

- Personal workspace một mình: ẩn Team, ẩn Team Activity, ẩn Assignee picker (luôn me). Hiện lại khi member thứ 2 join.
- Đổi workspace: Focus/Inbox/counts reset theo workspace. Không lẫn.
- Assignee bị remove: task → Owner, notify Owner.
- Comment trên task archived: không thêm. Xem được lịch sử.
- Notify due: không tạo nếu đã unread cùng type + task cùng ngày.
- Upload fail: toast, không tạo row DB.
- Invite hết hạn: accept 410, Owner tạo lại.

---

## 18. Success Phase 2

Team 3–10 người, dùng ≥ 1 tuần:

1. Invite xong trong 2 phút (kể cả gửi link tay).
2. My Tasks của mỗi người chỉ việc họ được gán.
3. Team page: ai open nhiều, ai blocked — 10 giây.
4. Comment + mention tới notification, không spam tick/pin.
5. Không ai hỏi “phải vào Slack để nói về task”.

Chưa đạt: không Phase 3.

---

*Phase 2 lock. Notes + Calendar event là object riêng — xem 2 file PHASE2_* tương ứng.*

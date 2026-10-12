# Phase 2 — Notes

Notes là chỗ **viết**. Task là chỗ **làm**. Không trộn.

Không Notion: không folder, database, backlink, slash-command, wiki graph, permission per-page.

Làm sau bước Team/workspace trong `phase-2-team.md` §1.

---

## 1. Object

```
Note
  title          bắt buộc, 1–160, default Untitled
  body           markdown hẹp (heading, bold, list, checkbox, link, code inline). Max 200 KB
  kind           quick | work | meeting | lecture
  workspace_id
  project_id     optional — SET NULL nếu xóa project
  task_id        optional — SET NULL nếu xóa task
  pinned_at      workspace pin (team)
  archived_at    soft hide
  created_by
  updated_at
  tags, stars (per user), attachments, activity
```

- Không status, due, assignee, Done, Focus, Inbox.
- Gắn tối đa 1 project và 1 task. Không bắt buộc gắn.
- Xóa task/project: `task_id` / `project_id` = null. Note **còn** (NT1).
- `+ Task` không bao giờ tạo note (NT2).
- Pin = workspace. Favorite = `note_stars` per user.
- Home / Focus / Review không đọc notes.

---

## 2. Surfaces

| Route | Job |
|---|---|
| `/notes` | Library: search, chips All / My Notes / Pinned / Archived, cards, Import. Tạo note từ top bar `+ Note` |
| `/notes/new` | POST rồi replace `/notes/:id` |
| `/notes/:id` | Full editor + meta + files + history |
| `/tasks/:id` tab Notes | Note của task. Drawer Add (kind=quick) |
| `/projects/:id` tab Notes | `project_id` hoặc task thuộc project |
| Global search | Nhóm Notes, title + body, không archived |

List: pinned first, rồi `updated_at DESC`.

Task tabs: Overview | Notes | Files | Activity | Comments. Files tab = attachment của **task**, không phải file của note.

---

## 3. Kinds + editor

| Kind | Hành vi |
|---|---|
| quick | Drawer mặc định trên task. Enter save. Write more → work |
| work | Default top bar `+ Note` |
| meeting | Body trống → insert skeleton một lần. Đổi kind không xóa body |
| lecture | Body trống → skeleton buổi dạy. Author / Teach. [`phase-2-notes-lecture.md`](./phase-2-notes-lecture.md) |

Autosave 800ms. Header: Saved / Saving… / Unsaved. Rời trang đợi PATCH. Preview toggle. Toolbar chèn markdown, không ContentEditable.  
Find / Replace trên **body** (literal, không regex). `Ctrl/Cmd+F` find, `Ctrl/Cmd+H` replace, Enter / Shift+Enter next/prev, Escape đóng. Match case optional. Guest chỉ find.

Meeting skeleton:

```
## Meeting
Date: YYYY-MM-DD

## Participants
- 

## Discussion
- 

## Decision
- 

## Action items
- [ ]
```

---

## 4. Tạo note

| Từ | Kết quả |
|---|---|
| Top bar `+ Note` | full editor. Title mặc định `YYYY-MM-DD_HH-MM`, thêm `_project` / `_task` nếu đang ở project hoặc task |
| Notes Import `.txt` | một note / file, kind=work |

Empty `/notes`:

> Notes are for writing. Tasks are for doing.

Guest: “Only notes from invited projects.” Không Add / Import.

---

## 5. Menu + flags

| Action | Ai |
|---|---|
| Edit / tag / attach / duplicate / move | Member+ |
| Pin / archive / delete | Author, Admin, Owner |
| Favorite / Export `.txt` | Ai xem được |

Archive ẩn khỏi All. History = `activity_logs.note_id`, không body diff. `note.updated` tối đa 1 lần / 60s / user.

Attachments: `api/uploads/notes/{note_id}/…`, 10 MB, cùng allow-list task files.

---

## 6. Permission

- Member+: tạo / sửa note trong workspace.
- Xóa / pin / archive: author, Admin, Owner.
- Guest: xem note thuộc project được mời (hoặc task của project đó). Không tạo. Có favorite.

---

## 7. Schema + API

```
notes
  id, workspace_id, project_id, task_id, created_by
  title, body, kind, pinned_at, archived_at, created_at, updated_at

note_tags, note_stars, note_attachments
activity_logs.note_id
```

| Method | Path |
|---|---|
| GET | `/notes` `q, task_id, project_id, filter, kind` |
| POST | `/notes` |
| GET/PATCH/DELETE | `/notes/:id` |
| POST | `/notes/:id/duplicate` `/pin` `/star` `/archive` |
| POST/GET/DELETE | `/notes/:id/attachments` … |
| GET | `/notes/:id/activity` |

---

## 8. Không làm

- Folder / nested notes / wiki graph
- Block editor / slash-command
- Body revision diffs
- Note → convert to task
- Pin note lên Home / Focus
- Comment trên note
- Realtime cursor / public share
- Ảnh trong body (dùng attachment)

---

*Notes lock. Home / Focus / Review không đọc notes.*

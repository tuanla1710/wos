# Phase 2 — Notes · Lecture mode

**Bài giảng coding.** Cùng object Note. Không app mới. Không Notion. Không Jupyter.

Luật gốc: [`phase-2-notes.md`](./phase-2-notes.md). Khi lệch, **file này thắng** cho kind `lecture`.

Mục tiêu: soạn một buổi dạy (Python / C / API / Git…) trong Notes, rồi **dạy** từ cùng note — không copy sang PowerPoint.

---

## 1. Quyết định

| Làm | Không làm |
|---|---|
| Kind mới `lecture` | Folder khóa học, curriculum graph |
| Skeleton + markdown hẹp + fence code | Block editor, slash-command |
| Author / Teach trên cùng note | App học viên riêng, quiz điểm |
| Preview code + Copy | Chạy code / REPL / kernel |
| Gắn 1 project + 1 task (bài tập) | Convert lecture → task tự động |
| Export `.md` / `.txt` | Video, PDF slide deck, i18n |

Home / Focus / Review **không** đọc lecture. Task vẫn là chỗ **làm**. Lecture là chỗ **dạy**.

---

## 2. Object

`notes.kind` thêm giá trị:

```
quick | work | meeting | lecture
```

Không cột DB mới. Metadata nằm trong body (giống Meeting).

| Field sẵn có | Dùng cho lecture |
|---|---|
| title | Tên buổi: `Lesson 3 — Python lists` |
| body | Skeleton + nội dung. Max 200 KB |
| project_id | Khóa / môn (optional) |
| task_id | Homework task (optional, 1 cái) |
| tags | `python`, `beginner`, `ptp` |
| attachments | Hình / PDF / file mẫu. Không nhúng ảnh trong body |

Đổi kind: không xóa body. Body trống + chọn Lecture → insert skeleton **một lần**.

---

## 3. Markdown hẹp — lecture

Giữ Notes hiện tại: heading, bold, italic, list, checkbox, link, inline code.

**Mở thêm chỉ khi kind = lecture:**

| Cú pháp | Ý |
|---|---|
| ` ```lang ` … ` ``` ` | Khối code. `lang` = `python` `c` `ts` `bash` `sql` `json` `text` |
| `> TIP:` / `> WARNING:` / `> PITFALL:` | Callout 1 dòng hoặc nhiều dòng blockquote |
| `##` | Một **beat** khi Teach (mỗi H2 = một bước dạy) |
| `#` | Tiêu đề bài, 1 lần ở đầu |

Không: bảng phức tạp, mermaid, math, HTML, embed.

Fence không có `lang` → `text`. Preview: monospace, nền `bg-hover`, nút `Copy`. Không highlight màu cầu vồng — token accent cho keyword không bắt buộc V1.

---

## 4. Skeleton

Body trống + kind Lecture → chèn một lần:

```
# Lesson title

Level: beginner
Duration: 45 min
Language: python

## Objective
- 

## Why this matters
- 

## Outline
1. 
2. 
3. 

## Step 1
Explain.

```python
# type here
```

> TIP: 

## Exercise
Do this.

Expected:

```text

```

## Pitfalls
> PITFALL: 

## Recap
- 

## Homework
- [ ] 
```

Đổi kind đi chỗ khác: skeleton đã gõ thì **giữ**. Không insert lần hai nếu body đã có `# Lesson` hoặc `## Objective`.

---

## 5. Hai mode trên cùng màn

Chip cạnh Quick / Work / Meeting / **Lecture**.

Khi kind = lecture, thêm toggle **Author | Teach**. Default Author. Không phải route mới.

### 5.1 Author (soạn)

Giống editor hiện tại + toolbar thêm:

| Nút | Chèn |
|---|---|
| `Code` | fence `python` quanh selection (hoặc lang đang chọn) |
| `Tip` | `> TIP: ` |
| `Warn` | `> WARNING: ` |
| `Pitfall` | `> PITFALL: ` |
| `Exercise` | block `## Exercise` + Expected fence nếu caret không nằm trong một H2 Exercise |

Dropdown lang cạnh `Code`: Python · C · TypeScript · Bash · SQL · JSON · Text.

Autosave 800ms. Preview Author = markdown + code fence (không Teach).

Copy English UI: `Lecture` `Author` `Teach` `Code` `Tip` `Warn` `Pitfall` `Exercise`.

### 5.2 Teach (dạy)

Không textarea. Cắt body theo `##` (bỏ `#` title).

```
┌──────────────────────────────────────────────┐
│ Lesson 3 — Python lists          2 / 7  [→]  │
│ beginner · 45 min · python                   │
├──────────┬───────────────────────────────────┤
│ Outline  │  Beat hiện tại                    │
│ · Obj    │  heading + prose + code           │
│ · Why    │  [Copy] trên mỗi fence            │
│ ● Step 1 │                                   │
│ · Exer   │                                   │
│ · Pit    │                                   │
│ · Recap  │                                   │
│ · Home   │                                   │
└──────────┴───────────────────────────────────┘
```

- Click outline → nhảy beat.
- `→` / `←` hoặc `j` / `k` beat kế / trước. `Home` beat 1. `End` beat cuối.
- Beat không có H2 (chỉ `#` + meta): không hiện trong outline.
- Guest: Teach được nếu xem được note. Không Author.
- Homework checkbox trong Teach **không** ghi body (tránh đụng lúc dạy). Checkbox chỉ sống ở Author. Teach hiện list tĩnh.

Empty Teach (không có `##`):

> Add ## headings in Author to split the lesson into beats.

---

## 6. Tạo lecture

| Từ | Kết quả |
|---|---|
| Top bar `+ Note` → full editor → chọn Lecture | kind=lecture, skeleton nếu body trống |
| Notes library chip `Lecture` | filter `kind=lecture` (API `kind=` đã có) |

Empty filter Lecture:

> Lectures are for teaching. Tasks are for doing.

---

## 7. Flows

### 7.1 Soạn buổi mới

1. Top bar `+ Note` → full editor.
2. Chip **Lecture**. Skeleton hiện.
3. Đổi title. Gõ Objective / Step / Exercise. Fence code.
4. Optional: gắn project (môn), task (homework), tags.
5. Preview Author. Save autosave.

### 7.2 Dạy

1. Mở note → **Teach**.
2. Đi beat bằng outline hoặc phím.
3. Copy code block lên máy chiếu / editor học viên.
4. Không sửa body lúc Teach. Muốn sửa → Author.

### 7.3 Homework

1. Author: mục Homework checkbox.
2. Optional: Related task = một task thật cho học viên / chính mình.
3. Click task → My Tasks / Task detail. Không auto-tạo task từ checkbox.

---

UI mock (layout + states): [`../02-ux/lecture-screens.md`](../02-ux/lecture-screens.md).

## 8. Visual + copy

English UI. Không tiếng Việt trên màn.

| Chỗ | Copy |
|---|---|
| Kind chip | `Lecture` |
| Modes | `Author` `Teach` |
| Toolbar | `Code` `Tip` `Warn` `Pitfall` `Exercise` |
| Teach chrome | `{n} / {total}` |
| Code | `Copy` → toast `Copied.` |
| Empty Teach | `Add ## headings in Author to split the lesson into beats.` |
| Library chip | `Lecture` (cùng hàng All / My Notes / Pinned) |

Width editor Author: giữ `max-w-[880px]`. Teach: `max-w-[1100px]`, outline 220px.

Code block: `font-mono text-[13px]`, padding 12px, `Copy` góc phải.

Callout:

- TIP → `accent-soft`
- WARNING / PITFALL → nền nhạt overdue, không emoji

---

## 9. Schema + API

Không bảng mới. `notes.kind` CHECK thêm `lecture`.

| Method | Path | Đổi |
|---|---|---|
| GET `/notes?kind=lecture` | Đã có query `kind` | Filter chip |
| POST `/notes` `{ kind: "lecture" }` | Server chấp nhận | Body rỗng OK |
| PATCH kind | Như meeting | Client insert skeleton |

Export: `.txt` hiện tại đủ. Thêm `.md` = cùng bytes body (optional, cùng nút Export nếu filename `.md`).

Body 200 KB giữ. Lecture dài: cắt buổi, không nâng limit.

---

## 10. Acceptance (L1–L12)

| ID | Setup | Action | Expected |
|---|---|---|---|
| L1 | Notes | Top bar `+ Note` → full editor, chip Lecture, body trống | Skeleton §4. Kind `lecture` |
| L2 | Lecture có chữ | Đổi sang Work rồi Lecture lại | Body không bị ghi đè skeleton |
| L3 | Author | Nút Code, chọn `print(1)` | Fence `python` (hoặc lang đang chọn) |
| L4 | Author Preview | Fence + `> TIP:` | Code block + callout. Không raw fence |
| L5 | Author | Copy trên fence | Clipboard = source. Toast `Copied.` |
| L6 | Body có 3 `##` | Teach | Outline 3 beat. Chrome `1 / 3` |
| L7 | Teach | `→` rồi `←` | Beat 2 rồi về 1 |
| L8 | Teach | Click Outline Recap | Nhảy beat Recap |
| L9 | Teach, guest | Mở note được mời | Teach OK. Không toolbar Author |
| L10 | Library chip Lecture | Click | Chỉ `kind=lecture` |
| L11 | Related task set | Open task | Task detail. Note còn |
| L12 | Home | Inspect | Không list lecture |

---

## 11. Cố ý không làm

- Execute / REPL / test runner
- Multi-file repo trong note
- Student progress, điểm quiz, classroom roster
- Slide PPTX từ lecture (Weekly Report PPTX là Review, không phải Notes)
- Realtime co-teach
- Ảnh trong body
- Nested lessons / ordered course (dùng tags + project)

Làm những thứ trên = sản phẩm khác. Lecture mode chỉ là **format buổi dạy** trên Note.

---

## 12. Thứ tự implement

1. `kind=lecture` API + chip + skeleton  
2. Fence + callout trong `renderMarkdown` (chỉ cần đúng khi preview; Author vẫn raw)  
3. Toolbar Code / Tip / Warn / Pitfall / Exercise  
4. Teach: split H2, outline, phím, Copy  
5. Library filter chip Lecture  
6. Acceptance L1–L12  

Không mở Lecture trước khi Notes work/meeting ổn (autosave, find, permission).

---

*Lecture lock. Note vẫn không phải task. Dạy ≠ làm.*

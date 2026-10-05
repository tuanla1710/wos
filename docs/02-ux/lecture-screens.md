# Screens — Notes · Lecture

**Nguồn sự thật UI cho kind `lecture`.** Luật: [`../03-domain/phase-2-notes-lecture.md`](../03-domain/phase-2-notes-lecture.md).  
Chrome Notes: [`../03-domain/phase-2-notes.md`](../03-domain/phase-2-notes.md). Token + copy: [`visual-system.md`](./visual-system.md).

Không app mới. Không route `/lecture`. Không slide deck. English UI.

Emoji trong ASCII = placeholder Lucide, không render emoji.

---

## 1. Library — `/notes`

Cùng trang Notes hiện tại. Thêm chip `Lecture` trên hàng filter. Không tab thứ hai.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Notes                                    [Import .txt]  [Add Note]     │
│                                                                         │
│  [ Search notes…                              ]                         │
│  ( All )  ( My Notes )  ( Pinned )  ( Lecture )  ( Archived )           │
│                                                                         │
│  Lesson 3 — Python lists                                                │
│  Lecture · 2 min ago · Tuan · python · beginner                         │
│  Objective: index, slice, and mutate a list without copying.            │
│  [python] [beginner] [ptp]                                              │
│                                                                         │
│  ───                                                                    │
│                                                                         │
│  API auth walkthrough                                                   │
│  Lecture · Yesterday · Tuan · PTP                                       │
│  Why this matters: every later lesson assumes a Bearer token.           │
│  [api] [auth]                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

- Chip active: `bg-accent-soft` + `text-accent` + semibold. Inactive: border `border` + `text-muted`.
- Chip `Lecture` gọi `GET /notes?kind=lecture` (cộng filter hiện tại nếu API cho phép; V1: `kind=lecture` thay `filter` khi chip này bật).
- Row meta: `Lecture · {relative time} · {author}` + optional project + tags. Không hiện `Author` / `Teach` trên list.
- Click row → `/notes/{id}` mặc định **Author**.
- Empty chip Lecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Notes                                    [Import .txt]  [Add Note]     │
│  ( All )  ( My Notes )  ( Pinned )  ( Lecture )  ( Archived )           │
│                                                                         │
│           Lectures are for teaching. Tasks are for doing.               │
└─────────────────────────────────────────────────────────────────────────┘
```

Guest: không `Add Note`. List chỉ lecture của project được mời.

---

## 2. Author — `/notes/{id}` · kind Lecture

Cùng Note editor. Width `max-w-[880px]`. Default khi mở.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Notes                                                                │
│                                                                         │
│  Lesson 3 — Python lists                               Saved · ⋯        │
│                                                                         │
│  ( Quick )  ( Work )  ( Meeting )  ( Lecture )                          │
│                                     [ Author | Teach ]                  │
│                                                                         │
│  [B] [I] [H1] [List] [Checkbox] [Link]                                  │
│  [Code ▾ Python] [Tip] [Warn] [Pitfall] [Exercise]                      │
│                                                                         │
│  ┌─ body ─────────────────────────────────────────────────────────────┐ │
│  │ # Lesson 3 — Python lists                                          │ │
│  │                                                                    │ │
│  │ Level: beginner                                                    │ │
│  │ Duration: 45 min                                                   │ │
│  │ Language: python                                                   │ │
│  │                                                                    │ │
│  │ ## Objective                                                       │ │
│  │ - Index, slice, and mutate a list in place.                        │ │
│  │                                                                    │ │
│  │ ## Step 1                                                          │ │
│  │ A list is ordered and mutable.                                     │ │
│  │                                                                    │ │
│  │ ```python                                                          │ │
│  │ nums = [1, 2, 3]                                                   │ │
│  │ nums.append(4)                                                     │ │
│  │ ```                                                                │ │
│  │                                                                    │ │
│  │ > TIP: append mutates. Use + if you need a copy.                   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Tags          python, beginner, ptp                                    │
│  Related task  Homework — lists 01                          ▾           │
│  Project       PTP                                          ▾           │
│  Files         sample_lists.py · 2 KB                       [Attach]    │
│                                                                         │
│  HISTORY                                                                │
│  Tuan edited · 2 min ago                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Header

| Control | Spec |
|---|---|
| Back | `← Notes` — Lucide `arrow-left` 16 + label |
| Title | Input 20/28/600, placeholder `Untitled` |
| Status | `Saved` / `Saving…` / `Unsaved` — 12/16 muted, phải |
| Menu | `⋯` — Pin, Star, Export, Archive, Delete (giữ NoteMenu) |

Kind chips một hàng. **Author | Teach** chỉ hiện khi `kind = lecture`. Segmented control 32px height, radius 8, active `bg-accent-soft` `text-accent`.

Guest: không kind chips, không toolbar, không textarea. Guest lecture mở thẳng **Teach** (xem §4). Nếu guest vào Author vì note work/meeting — không đổi.

### 2.2 Toolbar — hai hàng

Hàng 1 (mọi kind): `B` `I` `H1` `List` `Checkbox` `Link`

Hàng 2 (chỉ Lecture):

| Nút | Width | Insert |
|---|---|---|
| `Code` | 36h + chevron | fence lang quanh selection |
| lang ▾ | sát Code, không tách nhóm | Python · C · TypeScript · Bash · SQL · JSON · Text |
| `Tip` | 36h | `> TIP: ` |
| `Warn` | 36h | `> WARNING: ` |
| `Pitfall` | 36h | `> PITFALL: ` |
| `Exercise` | 36h | block Exercise + Expected fence |

Nhóm Code + lang: một cụm border chung (`border` `#E4E2DB`), không hai nút rời. Default lang = `python` lần đầu; nhớ last-used trong session (không persist DB).

Preview toggle: text button `Preview` / `Edit` góc phải hàng toolbar (giữ Notes hiện tại). Không nút thứ ba.

### 2.3 Body

- Textarea `font-mono` 14/22, padding 0, no border, min-height ~ 420px.
- Placeholder khi body trống trước skeleton insert: không hiện — skeleton đã chèn.
- Không line numbers. Không minimap.

### 2.4 Footer fields

Giữ Notes: Tags, Related task, Project, Files, History.

Hint 12px muted dưới Related task khi kind=lecture:

> Related task is homework. It is not created from the checkboxes.

---

## 3. Author · Preview

Cùng width 880. Không outline Teach.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Lesson 3 — Python lists                               Saved · ⋯        │
│  ( Quick ) ( Work ) ( Meeting ) ( Lecture )   [ Author | Teach ]        │
│  [B] …                                              [ Edit ]            │
│                                                                         │
│  Lesson 3 — Python lists                                     ← H1       │
│  Level: beginner · Duration: 45 min · Language: python                  │
│                                                                         │
│  Objective                                                   ← H2       │
│  • Index, slice, and mutate a list in place.                            │
│                                                                         │
│  Step 1                                                                 │
│  A list is ordered and mutable.                                         │
│                                                                         │
│  ┌─ python ────────────────────────────────────────────── [Copy] ─────┐ │
│  │ nums = [1, 2, 3]                                                   │ │
│  │ nums.append(4)                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─ TIP ──────────────────────────────────────────────────────────────┐ │
│  │ append mutates. Use + if you need a copy.                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Code block

- Header 28px: lang 11/16/600 uppercase muted trái · `Copy` text button phải
- Body: `font-mono` 13/20, padding 12, bg `bg-hover` `#EFEDE6`, radius 8, overflow-x auto
- Không rainbow syntax V1. Text `text` `#1C1917`
- Click Copy → clipboard = source (không lang line) · toast `Copied.` 2s

### Callouts

| Loại | Bg | Label | Border-left |
|---|---|---|---|
| TIP | `accent-soft` `#D9E8E6` | `TIP` 11/16/600 uppercase accent | 3px `accent` |
| WARNING | `#FEE4E2` 40% / `#FDF2F0` | `WARNING` overdue | 3px `overdue` |
| PITFALL | cùng WARNING | `PITFALL` overdue | 3px `overdue` |

Radius 8, padding 12. Không emoji. Label trên một dòng, body 14/22 bên dưới.

---

## 4. Teach

Không textarea. Width `max-w-[1100px]`. Outline 220px. Beat `1fr`.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Notes                                                                │
│                                                                         │
│  Lesson 3 — Python lists          beginner · 45 min · python            │
│                                   2 / 7                    [ ← ] [ → ]  │
│  ( Quick ) ( Work ) ( Meeting ) ( Lecture )   [ Author | Teach ]        │
│                                                                         │
│  ┌─ Outline 220 ─┬─ Beat ─────────────────────────────────────────────┐ │
│  │ OUTLINE       │                                                    │ │
│  │               │  Step 1                                            │ │
│  │   Objective   │                                                    │ │
│  │   Why this…   │  A list is ordered and mutable. Start from a       │ │
│  │ ● Step 1      │  literal, then change it in place.                 │ │
│  │   Exercise    │                                                    │ │
│  │   Pitfalls    │  ┌─ python ────────────────────────── [Copy] ────┐ │ │
│  │   Recap       │  │ nums = [1, 2, 3]                              │ │ │
│  │   Homework    │  │ nums.append(4)                                │ │ │
│  │               │  │ print(nums)                                   │ │ │
│  │               │  └───────────────────────────────────────────────┘ │ │
│  │               │                                                    │ │
│  │               │  ┌─ TIP ─────────────────────────────────────────┐ │ │
│  │               │  │ append mutates. Use + if you need a copy.     │ │ │
│  │               │  └───────────────────────────────────────────────┘ │ │
│  └───────────────┴────────────────────────────────────────────────────┘ │
│                                                                         │
│  Tags / task / project / files — collapsed footer, same as Author       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Chrome

| Chỗ | Spec |
|---|---|
| Title | 20/28/600, read-only (không input). Sửa → Author |
| Meta | `beginner · 45 min · python` — parse 3 dòng `Level:` `Duration:` `Language:` dưới H1. Thiếu field → ẩn field đó, không hiện `—` |
| Counter | `{n} / {total}` tabular nums, 14/20/600 |
| Prev / Next | Icon buttons 36×36, `arrow-left` / `arrow-right`. Disabled mờ ở đầu / cuối |
| Kind chips | Vẫn hiện (đổi kind = rời Teach). Guest: ẩn chips |
| Author \| Teach | Teach active |
| Toolbar format | **Ẩn** hết hàng B/I/Code |

Footer Tags / task / files: vẫn dưới, collapsed — Teach không kéo History lên trên beat.

### 4.2 Outline

- Label `OUTLINE` 12/16/600 uppercase tracking 0.04em `text-muted`
- Item 36px height, padding 8 12, truncate 14/20
- Current: `bg-accent-soft`, 3px left `accent`, label semibold
- Hover: `bg-hover`
- Click → set beat. Scroll beat pane to top
- Không drag reorder. Không checkbox trên outline

Label outline = text H2, rút gọn 28 ký tự + `…`

### 4.3 Beat pane

- H2 → 20/28/600, không lặp H1 của note
- Prose 14/22, max-width 640 trong pane (dễ đọc khi dạy)
- Code + callout = cùng spec Preview
- Homework checkboxes: list tĩnh, **không** tick được. Hint 12 muted: `Edit checkboxes in Author.`
- Empty beat (H2 rồi hết): `This beat is empty.`

### 4.4 Keys (khi Teach focus, không gõ trong input)

| Key | Action |
|---|---|
| `→` `j` `Space` | Next beat |
| `←` `k` | Prev beat |
| `Home` | Beat 1 |
| `End` | Last beat |
| `1`…`9` | Beat n nếu tồn tại |

Không capture khi caret trong Search / tag input.

### 4.5 Empty Teach (không `##`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Untitled lecture                        —                 0 / 0        │
│  [ Author | Teach ]                                                     │
│                                                                         │
│           Add ## headings in Author to split the lesson into beats.     │
│                              [ Author ]                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

Nút `Author` = primary accent, chuyển mode.

### 4.6 Guest Teach

- Back, title, meta, outline, beats, Copy — có
- Kind chips, Author toggle, toolbar, Tags edit, Attach, Menu destructive — không
- Menu guest: Export nếu Notes cho phép; không Delete / Archive
- Copy code vẫn được

---

## 5. States

| State | UI |
|---|---|
| Saving | `Saving…` cạnh title (Author). Teach không hiện (read-only) |
| Saved | `Saved` |
| Error persist | Toast `Couldn’t save. Try again.` |
| Copy ok | Toast `Copied.` |
| Copy fail | Toast `Couldn’t copy.` |
| Switch kind Lecture, body trống | Skeleton insert, caret sau `# Lesson title` |
| Switch kind away | Body giữ. Toggle Author/Teach **biến mất** |
| Filter Lecture + search miss | `No notes match. Clear search or change filter.` |
| Attach on lecture | Giống Notes: list dưới editor, không nhúng trong beat |

Không skeleton screen. Không illustration.

---

## 6. Motion + density

- Mode Author ↔ Teach: instant swap, ≤ 120ms nếu fade. Không slide deck transition
- Beat change: instant. Không Ken Burns
- Outline current: không pulse
- Min height 720. Teach không horizontal scroll ở 1280 (outline + beat)

`< 768px`: outline **dropdown** trên beat (select `Step 1 ▾`), không hai cột. Usable, không optimize phone.

---

## 6b. Teach visual (v2)

- Beat → phase theo tiêu đề `##`: **Start** (Objective, Goal, Parent prep, Today) · **Hook** (Story, Ask) · **Explore** (Unplugged, Explain, Think, Draw, Problem, Lesson) · **Build** (Build, Sample, Scratch, Python, Algorithm) · **Practice** (Practice, Challenge, Test) · **Wrap up** (Mistakes, Check, Homework, Pass, Next). Tiêu đề lạ = phase của beat trước.
- Màu phase: Start `#57534E`, Hook `#B54708`, Explore `#175CD3`, Build `#1D4E4A`, Practice `#6941C6`, Wrap `#067647`.
- Thanh tiến trình: 1 vạch / beat, màu phase, đã qua = đậm. Outline nhóm theo phase, số tròn.
- Beat = card, dải màu phase trên đầu, chữ 17px, tiêu đề 30px.
- Kiểu riêng: Objective = khối “Today” chữ lớn · Story = trích dẫn lớn · Ask/Check/Eight questions = thẻ câu hỏi đánh số · Mistakes = thẻ đỏ (phần “Bố:/Hỏi:” dòng dưới) · Pass = khối xanh “Pass when” · Homework = khối checklist · Code = nền tối 16px.
- Nút dưới beat hiện tên beat trước / sau. **Present** (phím F) = fullscreen.

---

## 7. Không vẽ

- REPL / Run / Output pane
- Dual editor (teacher + student)
- Timer / attendance
- PPTX export từ lecture
- Syntax rainbow
- Slash menu / `/code`
- Mini-map / TOC thứ hai ngoài Outline
- Course folder tree

---

## 8. Implement từ file này

Thứ tự build UI = domain §12. File này thắng ASCII cũ trong chat. Token `visual-system.md` thắng màu / type khi lệch mock.

*Lecture UI lock. Dạy từ note — không mở app thứ hai.*

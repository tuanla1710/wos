# Visual system — Phase 1

Nguồn sự thật cho **nhìn + copy + control** Phase 1.  
IA / flow: `screens-and-flows.md`. Luật: `../03-domain/phase-1-rules.md`.

Không brand book. Không illustration. Không marketing site.

---

## 1. Nguyên tắc

- Desktop-first. Sạch, dày vừa, không glass.
- Một cột + sidebar. Không card grid Notion.
- Màu = trạng thái, không trang trí.
- **UI copy: English.** Docs nội bộ tiếng Việt.
- Working name: `Work OS`. Chưa lock brand. Lockup: ô accent `#1D4E4A` + check, chữ `Work OS` 14/600 sidebar · 20/600 auth.
- Emoji trong mock cũ là placeholder. **App dùng custom glyphs `currentColor`, không emoji, không icon nhiều màu.**
- Theme: giấy sáng kiểu Notion. Không HUD / glass / glow.

---

## 2. Layout

| Vùng | Spec |
|---|---|
| Sidebar | 256px, fixed, full height, `#F7F6F3` |
| Main | `1fr`, nền trắng. Home / Review / Inbox / Detail: padding 32px, max-width 880px, center trong main |
| Wide | My Tasks / Calendar / Project Tasks: padding 24px, full width còn lại |
| Top bar (main) | height 56px, title trái, Search + `+ Task` phải |
| Quick Add | Modal 440px, center viewport |
| Search | Popover 480px, align phải dưới Search button |
| Breakpoint | `< 768px`: sidebar drawer. Usable, không optimize phone |

Min height 720px. Không horizontal scroll ở 1280.

---

## 3. Spacing — 8px scale

Mọi khoảng cách ∈ `4, 8, 12, 16, 24, 32, 48`.

| Token | px | Dùng |
|---|---|---|
| `space-1` | 4 | Badge padding, icon gap |
| `space-2` | 8 | Trong control, gap icon–label |
| `space-3` | 12 | Gap trong hàng task (checkbox–title) |
| `space-4` | 16 | Giữa field, list item padding x |
| `space-5` | 24 | Giữa section, wide page padding |
| `space-6` | 32 | Page padding hẹp, giữa block Home |
| `space-7` | 48 | Auth form top |

### Chiều cao cố định

| Surface | Height |
|---|---|
| Sidebar item | 36px |
| Sidebar section label | 28px, padding-top 16px |
| Top bar | 56px |
| Task row (list) | 44px |
| Checklist row | 36px |
| Button / input / select | 36px |
| Tab item | 36px |
| Calendar day chip (task) | 28px |
| Focus row trên Home | 44px |
| Modal header | 56px |

Task row 44px là nhịp chính. Không 40/42/46 lẫn.

---

## 4. Type

Font: `Inter, ui-sans-serif, system-ui, sans-serif`.  
Tabular nums cho count, due, %.

| Role | Size / line / weight |
|---|---|
| Greeting | 24 / 32 / 600 |
| Screen title | 20 / 28 / 600 |
| Section label | 12 / 16 / 600, uppercase, tracking 0.04em, `text-muted` |
| Task title | 14 / 20 / 500 |
| Body | 14 / 22 / 400 |
| Meta | 12 / 16 / 400, `text-muted` |
| Badge / priority | 11 / 16 / 600, uppercase |
| Button | 14 / 20 / 600 |

Weight chỉ 400 / 500 / 600. Greeting không 700.

---

## 5. Color

Một theme sáng. Không dark mode.

| Token | Hex | Dùng |
|---|---|---|
| `bg` | `#FFFFFF` | Main content |
| `sidebar` | `#F7F6F3` | Sidebar canvas |
| `bg-elev` | `#FFFFFF` | Modal, popover, top bar |
| `bg-hover` | `#EFEDE6` | Row / item hover |
| `bg-active` | `#E7E5E0` | Sidebar current |
| `border` | `#E4E2DB` | Line, input |
| `text` | `#1C1917` | Chính |
| `text-muted` | `#78716C` | Meta, section |
| `text-faint` | `#A8A29E` | Placeholder |
| `accent` | `#1D4E4A` | Primary button, link, focus ring, pin |
| `accent-soft` | `#D9E8E6` | Today highlight trên Calendar |
| `overdue` | `#B42318` | Due trễ, Inbox badge, destructive |
| `due-today` | `#C4320A` | Due hôm nay |
| `upcoming` | `#175CD3` | Upcoming count |
| `priority-high` | `#9A3412` | HIGH — **không** cùng màu overdue |
| `priority-medium` | `#B54708` | MEDIUM |
| `priority-low` | `#78716C` | LOW |
| `blocked` | `#B42318` | Blocked pill + icon |
| `done` | dùng `text-muted` + line-through |

Status pill:

| Status | Bg / text |
|---|---|
| Todo | `#F5F5F4` / `text` |
| In Progress | `#E0F2FE` / `#075985` |
| Blocked | `#FEE4E2` / `#B42318` |
| Done | `#ECFDF3` / `#067647` |

Count trên Home: số + label, không chỉ chấm màu.  
This Week fill: `accent` @ 70%. Track: `border`.

Contrast chữ ≥ WCAG AA.

---

## 6. Icon — Lucide

Package: `lucide-react`. Size **16px**. Stroke **1.5**. Color `currentColor`.

Không emoji trong UI. Mock ASCII được giữ icon chữ cho dễ đọc.

| Chỗ | Lucide |
|---|---|
| Home | `house` |
| Inbox | `inbox` |
| My Tasks | `check-square` |
| Calendar | `calendar` |
| Review | `rotate-cw` |
| Project | `folder` |
| New project | `plus` |
| Settings | `settings` |
| Search | `search` |
| + Task | `plus` (trong button, không icon-only) |
| Back | `arrow-left` |
| Pin / Focus | `star` outline; đang pin = `star` filled `accent` |
| Close / dismiss | `x` |
| More (nếu cần) | `ellipsis` |
| Overdue count | `circle-alert` |
| Due today | `sun` |
| Upcoming | `clock` |
| Blocked | `octagon-alert` |
| Drag calendar | không handle; cursor `grab` / `grabbing` |
| External / empty | không icon trang trí |

Sidebar: icon 16 + gap 8 + label. Không icon nhiều màu.

---

## 7. Elevation

Không blur nặng. Shadow ngắn.

| Surface | Treatment |
|---|---|
| Sidebar / top bar | Không shadow. Border-right / border-bottom `border` |
| Modal (Quick Add, confirm, Focus picker) | Overlay `#1C1917` @ 32%. Modal shadow `0 16px 40px rgba(28,25,23,0.12)`, radius 8 |
| Popover (Search, Select, Date) | Shadow `0 8px 24px rgba(28,25,23,0.10)`, border `border`, radius 8 |
| Toast | Cùng popover shadow |
| Kanban card | `bg-elev` + border. Không shadow |
| Drag ghost | `bg-elev`, shadow popover, opacity 0.92, rotate 0 |

---

## 8. State

Áp dụng mọi control và hàng.

| State | Hành vi |
|---|---|
| Default | Như token |
| Hover | Row / sidebar item: `bg-hover`. Button primary: accent 92% brightness. Ghost: `bg-hover` |
| Pressed | `bg-active` |
| Focus visible | Ring 2px `accent`, offset 2px. Chỉ bàn phím / focus-visible, không click chuột trên row |
| Selected | Sidebar `bg-active`. Tab: `text` + underline 2px `accent`. Filter chip on: `accent-soft` + `accent` text |
| Disabled | Opacity 0.4, `cursor: not-allowed`, không hover |
| Error | Input border `overdue`, message 12px `overdue` dưới field |
| Loading (button) | Disable + label giữ nguyên + spinner 14px. Không skeleton trang |
| Drag ghost | Xem §7. Nguồn: opacity 0.4 |
| Drop target (Calendar day) | Nền `accent-soft`, outline 1px `accent` |
| Done row | Title line-through, `text-muted`, checkbox checked |

Transition chỉ `background-color`, `box-shadow`, `opacity`. **≤ 120ms**, ease. Không bounce, không layout animation.

Modal: fade overlay 120ms. Không slide từ dưới.

---

## 9. Controls

### 9.1 Button

| Variant | Spec |
|---|---|
| Primary | h 36, px 14, bg `accent`, text white, radius 8, weight 600 |
| Ghost | h 36, px 12, text `text`, hover `bg-hover` |
| Destructive | Primary nhưng bg `overdue` |
| Icon | 36×36, ghost |

`+ Task` = Primary, label `Add task` trên modal submit; trên header label `+ Task`.

### 9.2 Input

h 36, px 12, radius 8, border `border`, bg `bg-elev`.  
Focus: ring. Placeholder `text-faint`.

### 9.3 Checkbox

16×16, radius 4, border 1.5 `text-muted`.  
Checked: bg `accent`, check trắng.  
Hit area 36×36 căn giữa — cả hàng 44px click title ≠ tick; chỉ box và padding box = Done.

### 9.4 Select

Trigger giống input: h 36, caret Lucide `chevron-down` 16.  
Mở: popover §7, item h 36, hover `bg-hover`.  
Item chọn: `check` 16 bên phải.  
Esc đóng. Click outside đóng.  
Dùng cho: Project, Priority, Status, Timezone, Review Reschedule.

### 9.5 Date picker

Trigger: input h 36, text `Oct 5` hoặc placeholder `No date`. Icon `calendar` phải.

Popover: tháng một lưới 7×n, ô 32×32, radius 4.

- Today: điểm 3px `accent` dưới số, không nhầm selected.
- Selected: bg `accent`, chữ trắng.
- Outside month: `text-faint`.
- Footer: `Clear` trái (ghost) · `Today` phải.
- Không time. Không range. Không week numbers.

Clear due không đẩy Inbox (`phase-1-rules`).

### 9.6 Tabs

Hàng h 36. Item px 12.  
Inactive: `text-muted`. Hover: `text`.  
Active: `text` + underline 2px `accent` sát đáy, không pill đầy.

My Tasks: `Today` `Upcoming` `Overdue` `All`.  
Project: `Overview` `Tasks`.  
View toggle `List | Kanban`: cùng style tabs, nhóm phải filter hàng.

### 9.7 Kanban

4 cột đều nhau, gap 16, min width 200, horizontal scroll nếu hẹp.

```
TODO          IN PROGRESS     BLOCKED         DONE
(12)          (4)             (1)             (31)
[card 44+]    …
```

- Cột: `bg` inset, radius 8, padding 8. Header section label + count.
- Card: `bg-elev`, border, padding 12, title 14/500, dòng meta 12. Min height 44.
- Kéo card: ghost §8. Cột drop: outline `accent`.
- Card không hiện description. Priority chữ + due.
- Cột Done: card muted, title line-through.

### 9.8 Search

Header: button ghost 36, icon `search`. Click / `/` focus (optional `/` — có thì làm, không bắt).

Popover 480px:

- Input trên, h 36, auto-focus.
- Nhóm: label section `TASKS` / `PROJECTS`.
- Row 36px, title 14. Hover `bg-hover`.
- Enter = item highlight đầu.
- Empty: `No results for “{q}”.`
- Debounce 200ms. `q` trống: đóng list, không gọi API.

### 9.9 Focus picker

Modal 480px.

```
Choose up to 3 focus tasks
☐ Finish API design          HIGH · Overdue
☐ Prepare weekly report      HIGH · Today
☐ Review team document       MEDIUM · In progress

[Cancel]  [Save]
```

Checkbox. Đủ 3: item còn lại disabled. Save = PUT `/focus`.

### 9.10 Toast / confirm / empty

- Toast: bottom-right 24px, `bg-elev`, min 280px. Success 3s. Error sticky + `x`.
- Confirm: modal 400px. Title + 1–2 câu + Ghost / Destructive.
- Empty: 1–2 câu `text-muted` + một Primary nếu có hành động. Không ảnh.

---

## 10. Copy — English, lock

Mọi string user thấy. Không Việt trên UI.

### Nav · chrome

| Chỗ | Copy |
|---|---|
| Sidebar groups | `WORKFLOW` · `PROJECTS` |
| Nav | `Home` `Inbox` `My Tasks` `Calendar` `Review` `Statistics` `Settings` |
| New project | `New project` |
| Header button | `+ Task` |
| Search placeholder | `Search` |
| Document title | `Work OS` |

### Home

| Chỗ | Copy |
|---|---|
| Greeting | `Good morning, {name}` · afternoon / evening theo hour timezone user (5–11 / 12–17 / 18–4) |
| Date | `Sunday, October 4` |
| Sections | `TODAY` `MY FOCUS` `THIS WEEK` |
| Counts | `{n} overdue` `{n} due today` `{n} upcoming` |
| Pin | `Edit` |
| Banner Fri–Sun | `Review this week →` |
| Empty app | `Nothing here yet.` / `Add your first task. New tasks land in Inbox.` |
| Empty focus | `Pick up to 3 tasks to focus on today.` |
| Suggestions | `Suggested` |
| Apply suggestions | `Use these suggestions` |
| Alt | `or pick individually` |
| Onboarding (dismiss) | `Capture to Inbox. Pin up to 3 Focus tasks. Review at the end of the week.` |

### Inbox · Quick Add · Detail

| Chỗ | Copy |
|---|---|
| Inbox subtitle | `Unorganized tasks` |
| Inbox empty | `Inbox is empty.` / `New tasks without a project or due date land here.` |
| Relative | `Just now` · `{n}h ago` · `Yesterday` · `Oct 3` |
| Quick Add title | `What needs to be done?` |
| Placeholders | Project `None` · Due `No date` · Priority `Medium` |
| Actions | `Cancel` `Add task` |
| Inbox detail | `INBOX · Not organized` |
| CTAs | `Choose project` `Choose due date` `Move to My Tasks` `Move to Inbox` |
| Sections | `DESCRIPTION` `CHECKLIST` |
| Blocked reason | `Why?` |
| Footer | `Archive` `Delete` |

### My Tasks · Project · Calendar · Review

| Chỗ | Copy |
|---|---|
| Tabs | `Today` `Upcoming` `Overdue` `All` |
| Views | `List` `Kanban` |
| Filters | `Project` `Priority` `Status` |
| Today empty | `Nothing today. Pin Focus or set a due date.` |
| Upcoming empty | `Nothing upcoming.` |
| Overdue empty | `Nothing overdue.` |
| All empty | `No organized tasks yet. Open Inbox.` |
| Project empty | `No tasks yet.` / `Add a task to this project.` |
| Delete project | `Delete project “{name}”?` / `Tasks are not deleted.` |
| Keep | `Keep in My Tasks` |
| To inbox | `Move to Inbox` |
| Confirm | `Cancel` `Delete project` |
| Calendar nav | `This week` · `<` `>` |
| Days | `Mon` … `Sun` |
| Review title | `WEEKLY REVIEW · Sep 29 – Oct 5` |
| Stats | `Completed` `Overdue` `Blocked` `Due next week` |
| Section | `Project progress` `Focus next week (max 3)` |
| Reschedule | `Today` `Tomorrow` `Next Monday` `Pick date` |
| Review actions | `Drop` `Unblock` `Keep` `Add` `Done reviewing` |
| Calendar empty | `No due dates this week.` |

### Auth · errors · validate

| Chỗ | Copy |
|---|---|
| Login | `Log in` `Create account` |
| Register | `Create account` `Name` `Email` `Password` `Confirm password` `Already have an account?` |
| Forgot | Không link. Không câu “Phase 1…” trên UI — form chỉ login/register |
| Auth error | `Email or password is wrong.` |
| Title empty | `Title can’t be empty.` |
| Project name empty | `Project name can’t be empty.` |
| Password short | `Password must be at least 8 characters.` |
| Email taken | `Email is already in use.` |
| Search empty | `No results for “{q}”.` |
| 404 toast | `Not found.` |
| 500 toast | `Couldn’t save. Try again.` |
| Delete task | `Delete “{title}”? This can’t be undone.` |
| Delete task btn | `Delete` |

### Notes · Lecture

Mocks: `lecture-screens.md`. Luật: `../03-domain/phase-2-notes-lecture.md`.

| Chỗ | Copy |
|---|---|
| Kind chip | `Lecture` |
| Modes | `Author` `Teach` |
| Toolbar 2 | `Code` `Tip` `Warn` `Pitfall` `Exercise` |
| Lang menu | `Python` `C` `TypeScript` `Bash` `SQL` `JSON` `Text` |
| Preview | `Preview` `Edit` |
| Teach counter | `{n} / {total}` |
| Teach outline | `OUTLINE` |
| Code | `Copy` → toast `Copied.` |
| Copy fail | `Couldn’t copy.` |
| Empty Teach | `Add ## headings in Author to split the lesson into beats.` |
| Empty Teach CTA | `Author` |
| Empty beat | `This beat is empty.` |
| Homework in Teach | `Edit checkboxes in Author.` |
| Related task hint | `Related task is homework. It is not created from the checkboxes.` |
| Library chip | `Lecture` (hàng All / My Notes / Pinned / Archived) |
| Empty library | `Lectures are for teaching. Tasks are for doing.` |

Author width `max-w-[880px]`. Teach `max-w-[1100px]`, outline 220px.  
Code block: mono 13, padding 12, `bg-hover`, `Copy` góc phải.  
Callout TIP = `accent-soft` + border-left `accent`. WARNING / PITFALL = nền nhạt overdue.

Lucide thêm: Teach prev/next `arrow-left` `arrow-right`. Outline không icon.

Priority labels: `HIGH` `MEDIUM` `LOW`.  
Status labels: `Todo` `In Progress` `Blocked` `Done`.  
Kanban headers: `TODO` `IN PROGRESS` `BLOCKED` `DONE`.

---

## 11. Auth

| Mục | Phase 1 |
|---|---|
| Register | name, email, password ≥ 8, confirm |
| Login | email, password |
| Logout | Settings, text button `Log out` |
| Session | httpOnly cookie, 30 ngày, sliding |
| Verify / reset / OAuth / 2FA | Không |

Trang `/login` `/register`. Form 360px, center, `bg`. Lockup mark accent + `Work OS` 20/600. Sau login → Home.

---

## 12. Không làm Phase 1 UI

- Dark mode, theme picker
- Custom Home, command palette, right-click
- Skeleton screens, illustration, mascot
- Animation > 120ms, page transition
- Marketing landing trong app
- Emoji icon, multi-color sidebar icons
- `/` shortcut bắt buộc (optional)

---

*UI system lock. Token + copy + control thắng mock ASCII khi lệch.*

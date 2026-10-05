# Phase 1 — expected results

Acceptance for Personal daily loop. Copy: `../02-ux/visual-system.md`.  
Flows: `../02-ux/screens-and-flows.md`. Edges: `../03-domain/phase-1-edges.md`.

Each row: **setup → action → expected**. All user-visible strings are English.

Phase 1 is done only when §12 (dogfood) also passes.

---

## 1. Auth

| ID | Setup | Action | Expected |
|---|---|---|---|
| A1 | Empty DB | Register name, email, password ≥ 8 | User + workspace `Personal` + member `owner`. Redirect Home |
| A2 | Same email exists | Register again | `Email is already in use.` No second user |
| A3 | Password < 8 | Register | `Password must be at least 8 characters.` |
| A4 | Valid account | Log in | Session cookie, Home |
| A5 | Wrong password | Log in | `Email or password is wrong.` No hint if email exists |
| A6 | Logged in | Log out (Settings) | Cookie cleared. Next `/` → login |
| A7 | No session | Open `/inbox` | Redirect `/login` |
| A8 | Register | Inspect DB | `users.timezone` = browser TZ or `Asia/Seoul`. No seed tasks |

No forgot-password link. No OAuth.

---

## 2. Home

| ID | Setup | Action | Expected |
|---|---|---|---|
| H1 | New user | Open `/` | Empty: `Nothing here yet.` + `Add your first task. New tasks land in Inbox.` + `+ Task` |
| H2 | First visit | See banner | `Capture to Inbox. Pin up to 3 Focus tasks. Review at the end of the week.` Dismiss hides it |
| H3 | 2 overdue, 3 due today, 8 upcoming (not inbox) | Open Home | Counts: `2 overdue` `3 due today` `8 upcoming` |
| H4 | Click `2 overdue` | Click | `/tasks` tab Overdue |
| H5 | No pins | Home | `Pick up to 3 tasks to focus on today.` + Suggested list. **No auto-pin** |
| H6 | Suggestions shown | `Use these suggestions` | Up to 3 pins written. Appear under MY FOCUS |
| H7 | 3 pins | Tick checkbox of one | Status `done`, `completed_at` set, row leaves Focus, slot empty |
| H8 | Click Focus title | Click | `/tasks/{id}` |
| H9 | Pins exist | `Edit` | Picker max 3. 4th checkbox disabled |
| H10 | This week | View bars | Mon–Fri only. Height ∝ incomplete organized tasks due that day |
| H11 | Click Wednesday bar | Click | Calendar, that week, Wednesday highlighted |
| H12 | Friday–Sunday, review not done | Home | Banner `Review this week →` |
| H13 | After `Done reviewing` | Home same weekend | Banner gone until next Friday |
| H14 | No Team Activity | Home | Block absent |
| H15 | Morning / afternoon / evening | Open Home | `Good morning/afternoon/evening, {name}` by user TZ |

---

## 3. Quick Add (every screen)

| ID | Setup | Action | Expected |
|---|---|---|---|
| Q1 | Any app page | `+ Task`, title only, Add | Task `is_inbox=true`, popup closes, no Task Detail |
| Q2 | Any page | Title + project | `is_inbox=false`, `project_id` set |
| Q3 | Empty title | Add | `Title can’t be empty.` No row |
| Q4 | Esc | Open then Esc | Closed, nothing saved |
| Q5 | Enter with title | Enter | Same as Add |
| Q6 | Fields | Inspect | No Assignee. Priority default Medium. Due optional date only |

---

## 4. Inbox

| ID | Setup | Action | Expected |
|---|---|---|---|
| I1 | 0 inbox | `/inbox` | `Inbox is empty.` / `New tasks without a project or due date land here.` |
| I2 | 3 inbox | `/inbox` | Newest first. Subtitle `Unorganized tasks`. Badge on sidebar = 3 |
| I3 | Inbox task | Change only title/priority | Stays inbox |
| I4 | Inbox task | Set project | Leaves inbox. Badge −1 |
| I5 | Inbox task | Set due | Leaves inbox |
| I6 | Inbox task | `Move to My Tasks` | `is_inbox=false`, no project/due required |
| I7 | Organized task | Clear due or project | **Does not** return to inbox |
| I8 | Inbox | Kanban / filters | Not present |

---

## 5. Task detail

| ID | Setup | Action | Expected |
|---|---|---|---|
| T1 | Organized task | Open detail | Title, priority, status, project, due, description, checklist. No comments/activity/assignee |
| T2 | Inbox task | Open detail | `INBOX · Not organized` + Choose project / due / Move to My Tasks |
| T3 | Status → Blocked | Select | `Why?` field. Empty reason allowed |
| T4 | Leave Blocked | Other status | `blocked_reason` cleared |
| T5 | Status → Done | Select | `completed_at` set; removed from today’s focus |
| T6 | Reopen Done | Status Todo | `completed_at` null. Not auto-pinned |
| T7 | Checklist | Tick all items | Task status **unchanged** |
| T8 | Checklist | Enter on new line | Adds next item |
| T9 | `Move to Inbox` | Click | `is_inbox=true`; project/due kept |
| T10 | Clear due | Clear in date picker | Stays organized |
| T11 | Archive | Click | Hidden from default lists. No second confirm |
| T12 | Delete | Confirm | `Delete “{title}”? This can’t be undone.` Hard delete + checklists |
| T13 | Cancel delete | Cancel | Task remains |

---

## 6. My Tasks

| ID | Setup | Action | Expected |
|---|---|---|---|
| M1 | Today tab | View | Due today ∪ In Progress (not inbox) ∪ today’s Focus; not Done |
| M2 | Upcoming | View | `due > today`, not done, not inbox |
| M3 | Overdue | View | `due < today`, not done, not inbox. Oldest due first |
| M4 | All | View | All `is_inbox=false`. Done at bottom of List |
| M5 | Inbox only tasks | All | Those tasks **absent** |
| M6 | Empty Today | — | `Nothing today. Pin Focus or set a due date.` |
| M7 | Views | Toggle | List default. Kanban 4 columns TODO / IN PROGRESS / BLOCKED / DONE |
| M8 | Kanban drag | Drop on Blocked | `status=blocked` |
| M9 | Filters | Project / Priority / Status | No Tag filter |
| M10 | No Calendar view | Inspect | No third view; use `/calendar` |

---

## 7. Project

| ID | Setup | Action | Expected |
|---|---|---|---|
| P1 | Sidebar | `New project`, name | Overview empty: `No tasks yet.` |
| P2 | Empty name | Save | `Project name can’t be empty.` |
| P3 | Overview | Counts | Tasks, Completed, In Progress, Blocked, Overdue. Progress = done/total |
| P4 | Upcoming | — | 5 soonest due, not done |
| P5 | Tabs | — | Overview \| Tasks only. No Members/Files/Timeline |
| P6 | Add task from project | `+ Task` | Not inbox |
| P7 | Delete project | Keep in My Tasks | Project gone; tasks `project_id` null, still organized |
| P8 | Delete project | Move to Inbox | Tasks `is_inbox=true` |
| P9 | Confirm copy | Open delete | `Delete project “{name}”?` / `Tasks are not deleted.` |

---

## 8. Calendar

| ID | Setup | Action | Expected |
|---|---|---|---|
| C1 | Week view | Open | 7 days. No hour rows. No meetings |
| C2 | Task due Wed | View | Chip on Wednesday |
| C3 | No due | View | Not on calendar |
| C4 | Drag Mon → Thu | Drop | `due_date` = Thursday |
| C5 | Drag fail (API error) | Fail | Chip snaps back |
| C6 | Done task | View | Muted, strike, still on due day |
| C7 | Click chip | Click | Task detail |
| C8 | Today | View | Day uses `accent-soft` |
| C9 | Empty week | — | `No due dates this week.` |
| C10 | Focus + drag due away | Drag | Pin **today** remains |

---

## 9. Weekly Review

| ID | Setup | Action | Expected |
|---|---|---|---|
| R1 | Sidebar Review | Open any day | Stats + lists + actions |
| R2 | Completed this week | Count | Done with `completed_at` in Mon–Sun user TZ |
| R3 | Overdue row | Reschedule → Tomorrow | `due_date` = tomorrow, leaves overdue if now future |
| R4 | Drop | Click | Archived. Gone from default lists |
| R5 | Unblock | Click | `todo`, reason `''` |
| R6 | Keep blocked | Click | Unchanged |
| R7 | Focus next week | Pick 3 | `task_week_focus.week_start` = next Monday |
| R8 | 4th focus | Try | Rejected |
| R9 | `Done reviewing` | Fri | Home banner hidden until next Friday |
| R10 | Next Monday, no daily pins | Home | Suggestions **lead with** week-focus, not auto-pin |
| R11 | No AI | Inspect | Numbers + actions only |

---

## 10. Search · Settings · chrome

| ID | Setup | Action | Expected |
|---|---|---|---|
| S1 | Query `API` | Search | Groups TASKS / PROJECTS by title/name |
| S2 | No match | Search | `No results for “API”.` |
| S3 | Empty q | Search | No API call |
| S4 | Settings | Save name, TZ | `PATCH /me`. Due dates unchanged; “today” may shift |
| S5 | Settings | Workspace name | `PATCH /workspace` |
| S6 | Settings | Inspect | No members, billing, notifications |
| S7 | Sidebar | Inbox count | = inbox not archived |
| S8 | Icons | Inspect | Lucide 16, no emoji |
| S9 | Language | Any screen | No Vietnamese UI strings |
| S10 | 404 task | Open bad id | Toast `Not found.` → Home |
| S11 | 500 on save | Fail PATCH | Toast `Couldn’t save. Try again.` Local edit kept |

---

## 11. Data / API (implementation check)

| ID | Expected |
|---|---|
| D1 | Only Phase 1 tables exist (`schema.md`) |
| D2 | Register is one transaction: user + workspace + member |
| D3 | All task queries filter `workspace_id` from session, not from a trusted client field |
| D4 | PUT `/focus` replaces the day (0–3 rows) |
| D5 | No Redis, no S3, no `notes` / `notifications` tables |
| D6 | `GET /health` → `{ "status": "ok" }` |

---

## 12. Dogfood gate (Phase 1 success)

Use the app yourself ≥ 2 weeks. Then:

| ID | Expected |
|---|---|
| G1 | Morning open is Home; no “which module?” |
| G2 | Capture < 5 seconds (Quick Add) |
| G3 | Home answers today / overdue / Focus / this week |
| G4 | Friday Review: overdue rescheduled or dropped; next week has ≤ 3 Focus picks |

If G1–G4 fail, do not start Phase 2.

---

*Phase 1 expected results. A screen that looks right but fails a row is not done.*

# Phase 2 — expected results

Only after `phase-1.md` §12 passes.  
Product: `../03-domain/phase-2-team.md`, `phase-2-notes.md`, `phase-2-calendar.md`.

---

## 1. Members and roles

| ID | Expected |
|---|---|
| TM1 | Owner copies an invite link; second user accepts → member in workspace |
| TM2 | Member can create/edit tasks; cannot delete workspace or invite |
| TM3 | Last Owner cannot be demoted |
| TM4 | Remove member → their assigned tasks go to Owner; their focus rows deleted |
| TM5 | Personal workspace with 1 user: no Assignee picker, no Team page, no Team Activity |

---

## 2. Assignee · My Tasks

| ID | Expected |
|---|---|
| AS1 | Task always has `assignee_id` |
| AS2 | My Tasks shows only tasks assigned to me |
| AS3 | Reassign notifies the new assignee, not self-assign |

---

## 3. Comments · notifications

| ID | Expected |
|---|---|
| CM1 | Comment appears on Task Detail; no threads |
| CM2 | `@Name` creates mention + unread notification |
| CM3 | No notify for pin, checklist tick, or Focus |
| CM4 | Due-tomorrow / overdue notify assignee only |

---

## 4. Team · workspace switcher

| ID | Expected |
|---|---|
| TE1 | `/team` shows Open count and Blocked list in < 10 seconds of reading |
| TE2 | Progress = done / (done + open) per member |
| TE3 | New workspace is empty; data never leaks across switcher |
| TE4 | Home Team Activity only if members ≥ 2 |

---

## 5. Notes · calendar events · files · Guest

| ID | Expected |
|---|---|
| NT1 | Note has no status/due. Deleting a task does not delete the note |
| NT2 | `+ Task` does not create notes |
| CE1 | Timed event on calendar; task still all-day; Home bars ignore events |
| AT1 | Attachment ≤ 10 MB on task; Project Files lists them |
| GU1 | Guest sees only invited projects; no Inbox, Team, Settings, Focus |

---

## 6. Phase 2 success

| ID | Expected |
|---|---|
| G2.1 | Invite finishes in ~2 minutes (link is enough) |
| G2.2 | Each person’s My Tasks is only their assignments |
| G2.3 | Team page shows load + blocked |
| G2.4 | Mentions land in the bell; pin/tick do not |
| G2.5 | Team does not need Slack to talk about a task |

Fail G2.* → no Phase 3 billing.

---

*Phase 2 expected results. Do not treat vision mocks in `vision.md` as acceptance.*

"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeftGlyph } from "@/components/icons/AppIcons";
import { NoteList } from "@/components/notes/NoteList";
import { api, priorityLabel } from "@/lib/api";
import type { Attachment, Checklist, Comment, Task, WorkNote } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import { allowDrop, currentDrag, endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { canMoveUnder } from "@/lib/nesting";
import { PlanSlider, formatSpan } from "@/components/review/WeekBoard";
import { weekNumberLabel } from "@/lib/review";
import { LinksEditor } from "@/components/ui/LinksEditor";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

type Tab = "overview" | "notes" | "files" | "activity" | "comments";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const { me, projects, refresh } = useApp();
  const guest = me?.workspace?.role === "guest";
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [activity, setActivity] = useState<{ id: string; summary: string; created_at: string | null }[]>([]);
  const [comment, setComment] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [taskChoices, setTaskChoices] = useState<Task[]>([]);

  const load = useCallback(async () => {
    try {
      const next = await api<Task>(`/api/tasks/${id}`);
      setTask(next);
      const [c, m, n, a] = await Promise.all([
        api<{ comments: Comment[] }>(`/api/tasks/${id}/comments`),
        api<{ members: { id: string; name: string }[] }>("/api/workspace/members").catch(() => ({ members: [] })),
        api<{ notes: WorkNote[] }>(`/api/notes?task_id=${id}`).catch(() => ({ notes: [] })),
        api<{ activity: { id: string; summary: string; created_at: string | null }[] }>(`/api/tasks/${id}/activity`).catch(() => ({ activity: [] })),
      ]);
      setComments(c.comments);
      setMembers(m.members);
      setNotes(n.notes);
      setActivity(a.activity);
      const listed = await api<{ files: Attachment[] }>(`/api/tasks/${id}/attachments`).catch(() => ({ files: [] }));
      setFiles(listed.files);
      const [organized, inbox] = await Promise.all([
        api<{ tasks: Task[] }>("/api/tasks?tab=all").catch(() => ({ tasks: [] })),
        api<{ tasks: Task[] }>("/api/tasks?tab=inbox").catch(() => ({ tasks: [] })),
      ]);
      const seen = new Set<string>();
      const choices: Task[] = [];
      for (const row of [...organized.tasks, ...inbox.tasks]) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        choices.push(row);
      }
      if (next.parent_id && !seen.has(next.parent_id)) {
        const parent = await api<Task>(`/api/tasks/${next.parent_id}`).catch(() => null);
        if (parent) choices.unshift(parent);
      }
      setTaskChoices(choices);
    } catch {
      setError("Not found.");
      router.replace("/");
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  async function patch(body: Record<string, unknown>) {
    try {
      await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      await refresh();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t save. Try again.");
    }
  }

  if (!task) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: `Notes (${notes.length})` },
    { id: "files", label: `Files (${files.length})` },
    { id: "activity", label: "Activity" },
    { id: "comments", label: `Comments (${comments.length})` },
  ];

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <button type="button" onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeftGlyph size={16} /> Back
      </button>
      <div className="flex items-start justify-between gap-4">
        <input
          defaultValue={task.title}
          onBlur={(e) => e.target.value !== task.title && void patch({ title: e.target.value })}
          className="flex-1 bg-transparent text-xl font-semibold outline-none"
        />
        <span className="text-[11px] font-semibold uppercase text-priority-high">{priorityLabel(task.priority)}</span>
      </div>

      {task.is_inbox && (
        <div className="mt-4 rounded border border-line p-4">
          <p className="text-[12px] font-semibold uppercase text-muted">Inbox · Not organized</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <select className="h-9 rounded border border-line px-2 text-sm" onChange={(e) => e.target.value && void patch({ project_id: e.target.value })}>
              <option value="">Choose project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="date" title="Start" className="h-9 rounded border border-line px-2 text-sm" onChange={(e) => e.target.value && void patch({ start_date: e.target.value })} />
            <input type="date" title="Due" className="h-9 rounded border border-line px-2 text-sm" onChange={(e) => e.target.value && void patch({ due_date: e.target.value })} />
            <button type="button" className="btn-primary" onClick={() => void api(`/api/tasks/${id}/move-my-tasks`, { method: "POST" }).then(() => { void refresh(); void load(); })}>
              Move to My Tasks
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 border-b border-line">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`h-9 text-sm ${tab === t.id ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="mt-6 grid gap-3 text-sm">
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Progress</span>
              {(task.subtasks ?? []).length > 0 ? (
                <span className="text-sm tabular-nums">{task.progress ?? 0}% · average of subtasks</span>
              ) : (
                <span className="flex items-center gap-2">
                  <input
                    key={`${task.id}-${task.progress}`}
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={task.progress ?? 0}
                    disabled={guest}
                    onBlur={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isInteger(next) || next < 0 || next > 100 || next === task.progress) return;
                      void patch({ progress: next });
                    }}
                    className="h-9 w-20 rounded border border-line px-2 tabular-nums"
                  />
                  <span className="text-muted">%</span>
                </span>
              )}
            </label>
            {task.week_plan && (
              <div className="rounded-lg border border-line p-3">
                <p className="text-[12px] font-semibold uppercase text-muted">Week plan</p>
                <div className="mt-2 grid gap-2">
                  {(
                    [
                      ["this", "plan"],
                      ["next", "plan"],
                    ] as const
                  ).map(([key, kind]) => {
                    const slot = task.week_plan?.[key];
                    if (!slot) return null;
                    const label = `${weekNumberLabel(slot.start)} ${kind}`;
                    return (
                      <label key={key} className="flex items-center gap-3">
                        <span className="w-36 text-muted">
                          {label}
                          <span className="mt-0.5 block text-[11px] text-faint">{formatSpan(slot.start, slot.end)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <PlanSlider
                            key={`${key}-${slot.value ?? "x"}-${slot.min}-${slot.max}`}
                            value={slot.value}
                            min={slot.min}
                            max={slot.max}
                            disabled={guest || task.week_plan?.editable === false}
                            title={key === "next" && slot.min > 0 ? `At least ${slot.min}%, this week’s plan` : label}
                            onSave={(next) => {
                              void api("/api/review/week-target", {
                                method: "PUT",
                                body: JSON.stringify({ task_id: id, week_start: slot.start, target_progress: next }),
                              })
                                .then(() => load())
                                .catch((err) => setError(err instanceof Error ? err.message : "Couldn’t save the plan."));
                            }}
                          />
                        </span>
                      </label>
                    );
                  })}
                </div>
                {task.week_plan.editable === false && <p className="mt-2 text-[12px] text-faint">Comes from the average of subtasks.</p>}
              </div>
            )}
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Status</span>
              <select value={task.status} disabled={guest || (task.subtasks ?? []).length > 0} onChange={(e) => void patch({ status: e.target.value })} className="h-9 rounded border border-line px-2">
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            {task.status === "blocked" && (
              <input placeholder="Why?" defaultValue={task.blocked_reason} onBlur={(e) => void patch({ blocked_reason: e.target.value })} className="h-9 rounded border border-line px-3" />
            )}
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Project</span>
              <select value={task.project_id ?? ""} onChange={(e) => void patch(e.target.value ? { project_id: e.target.value } : { clear_project: true })} className="h-9 rounded border border-line px-2">
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Start</span>
              <input type="date" value={task.start_date ?? ""} onChange={(e) => void patch(e.target.value ? { start_date: e.target.value } : { clear_start: true })} className="h-9 rounded border border-line px-2" />
            </label>
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Due</span>
              <input type="date" value={task.due_date ?? ""} onChange={(e) => void patch(e.target.value ? { due_date: e.target.value } : { clear_due: true })} className="h-9 rounded border border-line px-2" />
            </label>
            <p className="text-[12px] text-muted">
              {task.work_days == null ? "Set start and due to see workdays (weekends and holidays off)." : `${task.work_days} workday${task.work_days === 1 ? "" : "s"} · weekends and holidays off`}
            </p>
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Priority</span>
              <select value={task.priority} onChange={(e) => void patch({ priority: e.target.value })} className="h-9 rounded border border-line px-2">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            {members.length > 0 && (
              <label className="flex items-center gap-3">
                <span className="w-24 text-muted">Assignee</span>
                <select value={task.assignee_id ?? ""} onChange={(e) => void patch({ assignee_id: e.target.value })} className="h-9 rounded border border-line px-2">
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {!task.is_inbox && (
            <button type="button" className="mt-4 text-sm text-muted underline" onClick={() => void api(`/api/tasks/${id}/move-inbox`, { method: "POST" }).then(() => { void refresh(); void load(); })}>
              Move to Inbox
            </button>
          )}
          <p className="mt-8 text-[12px] font-semibold uppercase text-muted">Description</p>
          <textarea defaultValue={task.description} onBlur={(e) => e.target.value !== task.description && void patch({ description: e.target.value })} className="mt-2 min-h-24 w-full rounded border border-line p-3 text-sm" />
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase text-muted">Checklist</p>
            <button
              type="button"
              className="text-sm text-accent"
              onClick={async () => {
                const title = prompt("Checklist item");
                if (!title?.trim()) return;
                await api(`/api/tasks/${id}/checklist`, { method: "POST", body: JSON.stringify({ title: title.trim() }) });
                await load();
              }}
            >
              +
            </button>
          </div>
          <div className="mt-2">
            {(task.checklists ?? []).map((c: Checklist) => (
              <label key={c.id} className="flex h-9 items-center gap-2 text-sm">
                <input type="checkbox" checked={c.is_done} onChange={async () => { await api(`/api/checklist/${c.id}`, { method: "PATCH", body: JSON.stringify({ is_done: !c.is_done }) }); await load(); }} />
                {c.title}
              </label>
            ))}
          </div>
          <p className="mt-8 text-[12px] font-semibold uppercase text-muted">Subtasks</p>
          {!guest && (
            <label className="mt-2 flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted">Parent</span>
              <select
                value={task.parent_id ?? ""}
                onChange={(e) => void patch(e.target.value ? { parent_id: e.target.value } : { clear_parent: true })}
                className="h-9 min-w-0 flex-1 rounded border border-line px-2"
              >
                <option value="">None</option>
                {taskChoices
                  .filter((row) => row.id !== id)
                  .map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.title}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div
            className="mt-2 min-h-9 space-y-1 rounded-lg"
            onDragOver={(e) => {
              if (guest) return;
              const d = currentDrag();
              const nodes = [...taskChoices, task, ...(task.subtasks ?? [])];
              if (d?.kind === "task" && canMoveUnder(nodes, d.id, id)) allowDrop(e);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const d = parseDragData(e);
              endDrag();
              const nodes = [...taskChoices, task, ...(task.subtasks ?? [])];
              if (!guest && d?.kind === "task" && canMoveUnder(nodes, d.id, id)) {
                void api(`/api/tasks/${d.id}`, { method: "PATCH", body: JSON.stringify({ parent_id: id }) }).then(() => {
                  void refresh();
                  void load();
                });
              }
            }}
          >
            {(task.subtasks ?? []).map((child) => (
              <div
                key={child.id}
                draggable={!guest}
                onDragStart={(e) => {
                  if (guest) return;
                  setDragData(e, "task", child.id);
                }}
                onDragEnd={() => endDrag()}
                className={`flex h-9 items-center gap-2 text-sm ${guest ? "" : "cursor-grab active:cursor-grabbing"}`}
              >
                <button type="button" className="flex-1 truncate text-left" onClick={() => router.push(`/tasks/${child.id}`)}>
                  {child.title}
                </button>
                <span className="tabular-nums text-muted">{child.progress ?? 0}%</span>
                <span className="text-muted">{child.status.replace("_", " ")}</span>
                {!guest && (
                  <button type="button" className="text-muted" onClick={() => void api(`/api/tasks/${child.id}`, { method: "PATCH", body: JSON.stringify({ clear_parent: true }) }).then(() => load())}>
                    Unlink
                  </button>
                )}
                <button type="button" className="text-overdue" onClick={async () => { if (!confirm(`Delete “${child.title}”?`)) return; await api(`/api/tasks/${child.id}`, { method: "DELETE" }); await load(); }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          {!guest && (
            <>
              {taskChoices.filter((row) => row.id !== id && !(task.subtasks ?? []).some((child) => child.id === row.id)).length > 0 && (
                <select
                  className="mt-2 h-9 w-full rounded border border-line px-2 text-sm"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) void api(`/api/tasks/${e.target.value}`, { method: "PATCH", body: JSON.stringify({ parent_id: id }) }).then(() => { void refresh(); void load(); });
                  }}
                >
                  <option value="">Move existing task here</option>
                  {taskChoices
                    .filter((row) => row.id !== id && !(task.subtasks ?? []).some((child) => child.id === row.id))
                    .map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.title}
                      </option>
                    ))}
                </select>
              )}
              <form className="mt-2 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!subTitle.trim()) return; await api("/api/tasks", { method: "POST", body: JSON.stringify({ title: subTitle.trim(), parent_id: id }) }); setSubTitle(""); await refresh(); await load(); }}>
                <input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="Add a subtask" className="h-9 flex-1 rounded border border-line px-3 text-sm" />
                <button type="submit" className="btn-ghost">Add</button>
              </form>
            </>
          )}
          <div className="mt-8">
            <LinksEditor links={task.links ?? []} createPath={`/api/tasks/${id}/links`} onChange={() => void load()} />
          </div>
          <div className="mt-10 flex gap-3">
            <button type="button" className="btn-ghost text-muted" onClick={() => void api(`/api/tasks/${id}/archive`, { method: "POST" }).then(() => router.push("/tasks"))}>Archive</button>
            <button type="button" className="btn-danger" onClick={() => { if (confirm(`Delete “${task.title}”? This can’t be undone.`)) void api(`/api/tasks/${id}`, { method: "DELETE" }).then(() => { void refresh(); router.push("/tasks"); }); }}>Delete</button>
          </div>
        </>
      )}

      {tab === "notes" && (
        <div className="mt-6">
          <NoteList notes={notes} empty="Write what you learned on this task." onOpen={(n) => router.push(`/notes/${n.id}`)} onChange={() => void load()} />
        </div>
      )}

      {tab === "files" && (
        <div className="mt-6 text-sm">
          {!guest && (
            <input
              type="file"
              className="mb-3 text-sm"
              onChange={async (e) => {
                const picked = e.target.files?.[0];
                e.target.value = "";
                if (!picked) return;
                const body = new FormData();
                body.append("file", picked);
                await api(`/api/tasks/${id}/attachments`, { method: "POST", body });
                await load();
              }}
            />
          )}
          {files.length === 0 ? <p className="text-muted">No files yet.</p> : files.map((f) => <p key={f.id} className="h-9 border-b border-line">{f.filename}</p>)}
        </div>
      )}

      {tab === "activity" && (
        <div className="mt-6 text-sm">
          {activity.length === 0 ? <p className="text-muted">No activity yet.</p> : activity.map((a) => <p key={a.id} className="border-b border-line py-2">{a.summary}</p>)}
        </div>
      )}

      {tab === "comments" && (
        <div className="mt-6">
          <div className="space-y-2 text-sm">
            {comments.map((c) => (
              <p key={c.id} className={c.deleted ? "text-muted" : ""}>
                <span className="font-medium">{c.author_name}</span> {c.body}
              </p>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!comment.trim()) return; await api(`/api/tasks/${id}/comments`, { method: "POST", body: JSON.stringify({ body: comment.trim() }) }); setComment(""); await load(); }}>
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment. Use @Name to mention." className="h-9 flex-1 rounded border border-line px-3 text-sm" />
            <button type="submit" className="btn-primary">Comment</button>
          </form>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-overdue">{error}</p>}
    </div>
  );
}

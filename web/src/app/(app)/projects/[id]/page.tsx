"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NoteList } from "@/components/notes/NoteList";
import { api } from "@/lib/api";
import type { EntityLink, Project, Task, WeekPlan, WorkNote } from "@/lib/types";
import { IssueList } from "@/components/task/IssueList";
import { TaskRow } from "@/components/task/TaskRow";
import { useApp } from "@/lib/AppContext";
import { allowDrop, currentDrag, endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { ancestorIds, canMoveUnder, descendantIds, projectDepth } from "@/lib/nesting";
import { ProjectLevelTile } from "@/components/icons/AppIcons";
import { ConfirmPassword } from "@/components/ui/ConfirmPassword";
import { LinksEditor } from "@/components/ui/LinksEditor";
import { useReloadOnChange } from "@/lib/useReloadOnChange";
import { PlanSlider, formatSpan } from "@/components/review/WeekBoard";
import { weekNumberLabel } from "@/lib/review";
import type { TaskStatus } from "@/lib/types";

type Overview = {
  id: string;
  name: string;
  key?: string | null;
  status?: TaskStatus;
  parent_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  work_days?: number | null;
  progress: number;
  counts: { tasks: number; completed: number; in_progress: number; blocked: number; overdue: number };
  upcoming: Task[];
  children?: Project[];
  links?: EntityLink[];
  week_plan?: WeekPlan;
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { me, projects, refresh } = useApp();
  const guest = me?.workspace?.role === "guest";
  const [tab, setTab] = useState<"overview" | "tasks" | "notes" | "files" | "activity">("overview");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ id: string; filename: string }[]>([]);
  const [activity, setActivity] = useState<{ id: string; summary: string; created_at: string | null }[]>([]);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [data, setData] = useState<Overview | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [childName, setChildName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; leave: boolean } | null>(null);
  const [taskAction, setTaskAction] = useState<"my_tasks" | "inbox">("my_tasks");

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>(`/api/projects/${id}`));
      const [list, fileRes, actRes, noteRes] = await Promise.all([
        api<{ tasks: Task[] }>(`/api/tasks?tab=all&project_id=${id}`),
        api<{ files: { id: string; filename: string }[] }>(`/api/projects/${id}/files`),
        api<{ activity: { id: string; summary: string; created_at: string | null }[] }>(`/api/projects/${id}/activity`),
        api<{ notes: WorkNote[] }>(`/api/notes?project_id=${id}`),
      ]);
      setTasks(list.tasks);
      setFiles(fileRes.files);
      setActivity(actRes.activity);
      setNotes(noteRes.notes);
    } catch {
      /* AppProvider handles session / API down */
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  async function patch(body: Record<string, unknown>) {
    setError("");
    try {
      await api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      await refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save.");
    }
  }

  async function nestProject(projectId: string, parentId: string | null) {
    setError("");
    try {
      await api(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify(parentId ? { parent_id: parentId } : { clear_parent: true }),
      });
      await refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t move project.");
    }
  }

  if (!data) return null;

  const nested = descendantIds(projects, id);
  const ancestors = ancestorIds(projects, id);
  const childIds = new Set((data.children ?? []).map((child) => child.id));
  const parentChoices = projects.filter((project) => project.id !== id && !nested.has(project.id));
  const moveChoices = parentChoices.filter((project) => !childIds.has(project.id) && !ancestors.has(project.id));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ProjectLevelTile depth={projectDepth(projects, id)} size={26} />
          {data.key && <span className="rounded bg-accent-soft px-2 py-0.5 text-[12px] font-semibold tabular-nums text-accent">{data.key}</span>}
          <input
            defaultValue={data.name}
            key={data.id + data.name}
            onBlur={async (e) => {
              const name = e.target.value.trim();
              if (!name || name === data.name) return;
              await api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
              await refresh();
              await load();
            }}
            className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none"
          />
        </div>
        {!guest && (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              setTaskAction("my_tasks");
              setDeleteTarget({ id, name: data.name, leave: true });
            }}
          >
            Delete project
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <div className="mt-4 flex gap-4 border-b border-line">
        <button type="button" onClick={() => setTab("overview")} className={`h-9 text-sm ${tab === "overview" ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
          Overview
        </button>
        <button type="button" onClick={() => setTab("tasks")} className={`h-9 text-sm ${tab === "tasks" ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
          Tasks
        </button>
        <button type="button" onClick={() => setTab("notes")} className={`h-9 text-sm ${tab === "notes" ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
          Notes ({notes.length})
        </button>
        <button type="button" onClick={() => setTab("files")} className={`h-9 text-sm ${tab === "files" ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
          Files
        </button>
        <button type="button" onClick={() => setTab("activity")} className={`h-9 text-sm ${tab === "activity" ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}>
          Activity
        </button>
      </div>

      {tab === "overview" ? (
        <div className="mt-6 max-w-[880px]">
          <div className="grid gap-3 text-sm">
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Progress</span>
              <span className="tabular-nums">{data.progress}% · average of tasks and child projects</span>
            </label>
            {data.week_plan && (
              <div className="rounded-lg border border-line p-3">
                <p className="text-[12px] font-semibold uppercase text-muted">Week plan</p>
                <div className="mt-2 grid gap-2">
                  {(
                    [
                      ["this", "plan"],
                      ["next", "plan"],
                    ] as const
                  ).map(([key, kind]) => {
                    const slot = data.week_plan?.[key];
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
                            min={slot.min ?? 0}
                            max={slot.max ?? 100}
                            disabled={guest || data.week_plan?.editable === false}
                            title={key === "next" && (slot.min ?? 0) > 0 ? `At least ${slot.min}%, this week’s plan` : label}
                            onSave={(next) => {
                              void api("/api/review/project-week-target", {
                                method: "PUT",
                                body: JSON.stringify({ project_id: id, week_start: slot.start, target_progress: next }),
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
              </div>
            )}
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Status</span>
              <select
                value={data.status ?? "todo"}
                disabled={guest}
                onChange={(e) => void patch({ status: e.target.value })}
                className="h-9 rounded border border-line px-2"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Start</span>
              <input
                type="date"
                value={data.start_date ?? ""}
                disabled={guest}
                onChange={(e) => void patch(e.target.value ? { start_date: e.target.value } : { clear_start: true })}
                className="h-9 rounded border border-line px-2"
              />
            </label>
            <label className="flex items-center gap-3">
              <span className="w-24 text-muted">Due</span>
              <input
                type="date"
                value={data.due_date ?? ""}
                disabled={guest}
                onChange={(e) => void patch(e.target.value ? { due_date: e.target.value } : { clear_due: true })}
                className="h-9 rounded border border-line px-2"
              />
            </label>
            <p className="text-[12px] text-muted">
              {data.work_days == null
                ? "Set start and due to see workdays (weekends and holidays off)."
                : `${data.work_days} workday${data.work_days === 1 ? "" : "s"} · weekends and holidays off`}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-3 text-sm">
            {(["tasks", "completed", "in_progress", "blocked", "overdue"] as const).map((k) => (
              <div key={k} className="rounded-xl glass px-4 py-3">
                <p className="capitalize text-[12px] text-muted">{k.replace("_", " ")}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{data.counts[k]}</p>
              </div>
            ))}
          </div>
          {!guest && (
            <label className="mt-8 flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Parent</span>
              <select
                value={data.parent_id ?? ""}
                onChange={(e) => void nestProject(id, e.target.value || null)}
                className="h-9 min-w-0 flex-1 rounded border border-line px-2"
              >
                <option value="">None</option>
                {parentChoices.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="section-label mt-8">Child projects</p>
          <div
            className="mt-2 min-h-9 space-y-1 rounded-lg text-sm"
            onDragOver={(e) => {
              if (guest) return;
              const d = currentDrag();
              if (d?.kind === "project" && canMoveUnder(projects, d.id, id)) allowDrop(e);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const d = parseDragData(e);
              endDrag();
              if (!guest && d?.kind === "project" && canMoveUnder(projects, d.id, id)) void nestProject(d.id, id);
            }}
          >
            {(data.children ?? []).map((child) => (
              <div
                key={child.id}
                draggable={!guest}
                onDragStart={(e) => {
                  if (guest) return;
                  setDragData(e, "project", child.id);
                }}
                onDragEnd={() => endDrag()}
                onDragOver={(e) => {
                  const d = currentDrag();
                  if (guest || d?.kind !== "project" || !canMoveUnder(projects, d.id, child.id)) return;
                  e.stopPropagation();
                  allowDrop(e);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const d = parseDragData(e);
                  endDrag();
                  if (!guest && d?.kind === "project" && canMoveUnder(projects, d.id, child.id)) void nestProject(d.id, child.id);
                }}
                className={`flex h-9 items-center gap-2 ${guest ? "" : "cursor-grab active:cursor-grabbing"}`}
              >
                <ProjectLevelTile depth={projectDepth(projects, child.id)} />
                <button type="button" className="flex-1 truncate text-left" onClick={() => router.push(`/projects/${child.id}`)}>
                  {child.name}
                </button>
                <span className="tabular-nums text-muted">{child.progress ?? 0}%</span>
                {!guest && (
                  <button type="button" className="text-muted" onClick={() => void nestProject(child.id, null)}>
                    Unlink
                  </button>
                )}
                {!guest && (
                  <button
                    type="button"
                    className="text-overdue"
                    onClick={() => {
                      setTaskAction("my_tasks");
                      setDeleteTarget({ id: child.id, name: child.name, leave: false });
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          {!guest && moveChoices.length > 0 && (
            <select
              className="mt-2 h-9 w-full rounded border border-line px-2 text-sm"
              value=""
              onChange={(e) => {
                if (e.target.value) void nestProject(e.target.value, id);
              }}
            >
              <option value="">Move existing project here</option>
              {moveChoices.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          {!guest && (
            <form
              className="mt-2 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!childName.trim()) return;
                const created = await api<{ id: string }>("/api/projects", { method: "POST", body: JSON.stringify({ name: childName.trim(), parent_id: id }) });
                setChildName("");
                await refresh();
                router.push(`/projects/${created.id}`);
              }}
            >
              <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Add a child project" className="h-9 flex-1 rounded border border-line px-3 text-sm" />
              <button type="submit" className="btn-ghost">
                Add
              </button>
            </form>
          )}

          <div className="mt-8">
            <LinksEditor links={data.links ?? []} createPath={`/api/projects/${id}/links`} onChange={() => void load()} />
          </div>

          <p className="section-label mt-8">Upcoming</p>
          {data.upcoming.length === 0 && <p className="mt-2 text-sm text-muted">No tasks yet.</p>}
          <div className="mt-2 overflow-hidden rounded-xl glass">
            {data.upcoming.map((t) => (
              <TaskRow key={t.id} task={t} peers={data.upcoming} onChange={() => void load()} />
            ))}
          </div>
        </div>
      ) : tab === "notes" ? (
        <div className="mt-4">
          <NoteList notes={notes} empty="Meeting and work notes for this project." onOpen={(n) => router.push(`/notes/${n.id}`)} onChange={() => void load()} />
        </div>
      ) : tab === "files" ? (
        <div className="mt-4 text-sm">
          {files.length === 0 ? <p className="text-muted">No files yet.</p> : files.map((f) => <p key={f.id} className="h-9 border-b border-line">{f.filename}</p>)}
        </div>
      ) : tab === "activity" ? (
        <div className="mt-4 text-sm">
          {activity.length === 0 ? <p className="text-muted">No activity yet.</p> : activity.map((a) => <p key={a.id} className="border-b border-line py-2">{a.summary}</p>)}
        </div>
      ) : (
        <div className="mt-4">
          <IssueList tasks={tasks} onChange={() => void load()} />
        </div>
      )}
      {deleteTarget && (
        <ConfirmPassword
          title={`Delete project “${deleteTarget.name}”?`}
          body="Tasks are not deleted. Enter your password to confirm."
          extra={
            deleteTarget.leave ? (
              <label className="mt-3 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
                Tasks
                <select
                  value={taskAction}
                  onChange={(e) => setTaskAction(e.target.value as "my_tasks" | "inbox")}
                  className="mt-1 h-9 w-full rounded border border-line px-2 text-sm font-normal normal-case tracking-normal text-ink"
                >
                  <option value="my_tasks">Keep in My Tasks</option>
                  <option value="inbox">Move to Inbox</option>
                </select>
              </label>
            ) : undefined
          }
          onConfirm={async (password) => {
            await api(`/api/projects/${deleteTarget.id}`, {
              method: "DELETE",
              body: JSON.stringify({ task_action: deleteTarget.leave ? taskAction : "my_tasks", password }),
            });
            await refresh();
            if (deleteTarget.leave) router.push("/");
            else await load();
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

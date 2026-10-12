"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NoteList } from "@/components/notes/NoteList";
import { api } from "@/lib/api";
import type { EntityLink, Project, Task, WorkNote } from "@/lib/types";
import { IssueList } from "@/components/task/IssueList";
import { TaskRow } from "@/components/task/TaskRow";
import { useApp } from "@/lib/AppContext";
import { allowDrop, currentDrag, endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { ancestorIds, canMoveUnder, descendantIds } from "@/lib/nesting";
import { LinksEditor } from "@/components/ui/LinksEditor";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

type Overview = {
  id: string;
  name: string;
  key?: string | null;
  parent_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  work_days?: number | null;
  progress: number;
  counts: { tasks: number; completed: number; in_progress: number; blocked: number; overdue: number };
  upcoming: Task[];
  children?: Project[];
  links?: EntityLink[];
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
        <button
          type="button"
          className="btn-danger"
          onClick={async () => {
            if (!confirm(`Delete project “${data.name}”? Tasks are not deleted.`)) return;
            const action = confirm("OK = Keep in My Tasks. Cancel = Move to Inbox") ? "my_tasks" : "inbox";
            await api(`/api/projects/${id}`, { method: "DELETE", body: JSON.stringify({ task_action: action }) });
            await refresh();
            router.push("/");
          }}
        >
          Delete project
        </button>
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
          <p className="text-sm text-muted">
            {data.progress}% · {data.counts.completed} / {data.counts.tasks} tasks done
          </p>
          <div className="mt-2 h-2 rounded bg-line">
            <div className="h-2 rounded bg-accent/70" style={{ width: `${data.progress}%` }} />
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
                <button type="button" className="flex-1 truncate text-left" onClick={() => router.push(`/projects/${child.id}`)}>
                  {child.name}
                </button>
                {!guest && (
                  <button type="button" className="text-muted" onClick={() => void nestProject(child.id, null)}>
                    Unlink
                  </button>
                )}
                <button
                  type="button"
                  className="text-overdue"
                  onClick={async () => {
                    if (!confirm(`Delete project “${child.name}”? Tasks are not deleted.`)) return;
                    await api(`/api/projects/${child.id}`, { method: "DELETE", body: JSON.stringify({ task_action: "my_tasks" }) });
                    await refresh();
                    await load();
                  }}
                >
                  Delete
                </button>
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
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NoteDrawer } from "@/components/notes/NoteDrawer";
import { NoteList } from "@/components/notes/NoteList";
import { api } from "@/lib/api";
import type { EntityLink, Project, Task, WorkNote } from "@/lib/types";
import { TaskRow } from "@/components/task/TaskRow";
import { useApp } from "@/lib/AppContext";
import { QuickAdd } from "@/components/task/QuickAdd";
import { LinksEditor } from "@/components/ui/LinksEditor";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

type Overview = {
  id: string;
  name: string;
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
  const { me, refresh } = useApp();
  const guest = me?.workspace?.role === "guest";
  const [tab, setTab] = useState<"overview" | "tasks" | "notes" | "files" | "activity">("overview");
  const [files, setFiles] = useState<{ id: string; filename: string }[]>([]);
  const [activity, setActivity] = useState<{ id: string; summary: string; created_at: string | null }[]>([]);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [noteDrawer, setNoteDrawer] = useState(false);
  const [data, setData] = useState<Overview | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [add, setAdd] = useState(false);
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

  if (!data) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
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
          className="flex-1 bg-transparent text-xl font-semibold outline-none"
        />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2 text-muted">
            Start
            <input
              type="date"
              value={data.start_date ?? ""}
              onChange={async (e) => {
                await api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(e.target.value ? { start_date: e.target.value } : { clear_start: true }) });
                await load();
              }}
              className="h-9 rounded border border-line px-2 text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-muted">
            Due
            <input
              type="date"
              value={data.due_date ?? ""}
              onChange={async (e) => {
                await api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(e.target.value ? { due_date: e.target.value } : { clear_due: true }) });
                await load();
              }}
              className="h-9 rounded border border-line px-2 text-ink"
            />
          </label>
          <span className="text-[12px] text-muted">
            {data.work_days == null ? "Set start and due" : `${data.work_days} workday${data.work_days === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover" onClick={() => setAdd(true)}>
            + Task
          </button>
          <button
            type="button"
            className="h-9 rounded px-3 text-sm font-medium text-overdue hover:bg-hover"
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
      </div>
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
          <p className="section-label mt-8">Child projects</p>
          <div className="mt-2 space-y-1 text-sm">
            {(data.children ?? []).map((child) => (
              <div key={child.id} className="flex h-9 items-center gap-2">
                <button type="button" className="flex-1 truncate text-left" onClick={() => router.push(`/projects/${child.id}`)}>
                  {child.name}
                </button>
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
            <button type="submit" className="h-9 rounded border border-line px-3 text-sm">
              Add
            </button>
          </form>

          <div className="mt-8">
            <LinksEditor links={data.links ?? []} createPath={`/api/projects/${id}/links`} onChange={() => void load()} />
          </div>

          <p className="section-label mt-8">Upcoming</p>
          {data.upcoming.length === 0 && <p className="mt-2 text-sm text-muted">No tasks yet.</p>}
          <div className="mt-2 overflow-hidden rounded-xl glass">
            {data.upcoming.map((t) => (
              <TaskRow key={t.id} task={t} onChange={() => void load()} />
            ))}
          </div>
        </div>
      ) : tab === "notes" ? (
        <div className="mt-4">
          <div className="mb-4 flex justify-end">
            {!guest && (
              <button type="button" className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white" onClick={() => setNoteDrawer(true)}>
                Add Note
              </button>
            )}
          </div>
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
        <div className="mt-4 overflow-hidden rounded-xl glass">
          {tasks.length === 0 ? <p className="p-4 text-sm text-muted">No tasks yet. Add a task to this project.</p> : tasks.map((t) => <TaskRow key={t.id} task={t} onChange={() => void load()} />)}
        </div>
      )}
      {noteDrawer && <NoteDrawer projectId={id} onClose={() => { setNoteDrawer(false); void load(); }} />}
      {add && (
        <QuickAdd
          defaultProjectId={id}
          onClose={() => {
            setAdd(false);
            void load();
            void refresh();
          }}
        />
      )}
    </div>
  );
}

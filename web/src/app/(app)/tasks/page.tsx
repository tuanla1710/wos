"use client";

import { useCallback, useEffect, useState } from "react";
import { api, statusLabel } from "@/lib/api";
import type { Task } from "@/lib/types";
import { TaskRow } from "@/components/task/TaskRow";
import { useApp } from "@/lib/AppContext";
import { endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

const tabs = ["today", "upcoming", "overdue", "all"] as const;

export default function MyTasksPage() {
  const { projects } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("today");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("tab");
    if (t && (tabs as readonly string[]).includes(t)) setTab(t as (typeof tabs)[number]);
    const s = q.get("status");
    if (s && ["todo", "in_progress", "blocked", "done"].includes(s)) setStatus(s);
  }, []);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    const q = new URLSearchParams({ tab });
    if (projectId) q.set("project_id", projectId);
    if (priority) q.set("priority", priority);
    if (status) q.set("status", status);
    try {
      const data = await api<{ tasks: Task[] }>(`/api/tasks?${q}`);
      setTasks(data.tasks);
    } catch {
      /* AppProvider handles session / API down */
    }
  }, [tab, projectId, priority, status]);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  const empty = {
    today: "Nothing today. Pin Focus or set a due date.",
    upcoming: "Nothing upcoming.",
    overdue: "Nothing overdue.",
    all: "No organized tasks yet. Open Inbox.",
  }[tab];

  const columns = ["todo", "in_progress", "blocked", "done"] as const;

  async function dropStatus(id: string, status: string) {
    await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">My Tasks</h1>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-9 text-sm capitalize ${tab === t ? "border-b-2 border-accent font-medium text-ink" : "text-muted hover:text-ink"}`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex rounded border border-line p-0.5 text-sm">
          <button type="button" onClick={() => setView("list")} className={`h-8 rounded px-3 ${view === "list" ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover"}`}>
            List
          </button>
          <button type="button" onClick={() => setView("kanban")} className={`h-8 rounded px-3 ${view === "kanban" ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover"}`}>
            Kanban
          </button>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-9 rounded border border-line bg-hover px-2 text-sm">
          <option value="">Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-9 rounded border border-line px-2 text-sm">
          <option value="">Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded border border-line px-2 text-sm">
          <option value="">Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="done">Done</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-10 text-sm text-muted">{empty}</p>
      ) : view === "list" ? (
        <div className="mt-4">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} peers={tasks} onChange={() => void load()} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {columns.map((col) => (
            <div
              key={col}
              className="min-h-[200px] rounded-xl hud-drop p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const d = parseDragData(e);
                if (d?.kind === "task") void dropStatus(d.id, col);
              }}
            >
              <p className="mb-2 px-1 text-[12px] font-semibold uppercase text-muted">
                {statusLabel(col)} ({tasks.filter((t) => t.status === col).length})
              </p>
              {tasks
                .filter((t) => t.status === col)
                .map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => setDragData(e, "task", t.id)}
                    onDragEnd={() => endDrag()}
                    className="grab-chip mb-2 rounded-lg p-3 text-sm hover:bg-hover"
                  >
                    {t.title}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

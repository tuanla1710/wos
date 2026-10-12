"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GripGlyph } from "@/components/icons/AppIcons";
import { api, priorityLabel, statusLabel } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import { allowDrop, currentDrag, endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { canMoveUnder } from "@/lib/nesting";

const statusTone: Record<string, string> = {
  todo: "bg-hover text-ink",
  in_progress: "bg-[#E0F2FE] text-[#075985]",
  blocked: "bg-[#FEE4E2] text-[#B42318]",
  done: "bg-[#ECFDF3] text-[#067647]",
};

const scopes = [
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

export function IssueList({ tasks, onChange }: { tasks: Task[]; onChange?: () => void }) {
  const { refresh, me } = useApp();
  const guest = me?.workspace?.role === "guest";
  const [scope, setScope] = useState<(typeof scopes)[number]["id"]>("open");
  const [priority, setPriority] = useState("");
  const [overId, setOverId] = useState<string | null>(null);
  const dragged = useRef(false);

  const rows = useMemo(() => {
    return tasks
      .filter((task) => {
        if (scope === "open") return task.status !== "done";
        if (scope === "done") return task.status === "done";
        return true;
      })
      .filter((task) => !priority || task.priority === priority)
      .sort((a, b) => (a.task_number ?? 0) - (b.task_number ?? 0));
  }, [tasks, scope, priority]);

  async function toggleDone(task: Task) {
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: task.status === "done" ? "todo" : "done" }),
    });
    await refresh();
    onChange?.();
  }

  async function nest(childId: string, parentId: string) {
    try {
      await api(`/api/tasks/${childId}`, { method: "PATCH", body: JSON.stringify({ parent_id: parentId }) });
    } catch {
      /* cycle or depth limit */
    }
    await refresh();
    onChange?.();
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex rounded border border-line p-0.5 text-sm">
          {scopes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id)}
              className={`h-8 rounded px-3 ${scope === item.id ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-hover"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-8 rounded border border-line px-2 text-sm">
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="text-[12px] text-muted tabular-nums">{rows.length} issue{rows.length === 1 ? "" : "s"}</span>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-muted">No issues in this view. Add a task to this project to start tracking.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-[88px_1fr_110px_72px_96px] gap-2 border-b border-line bg-hover px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
            <span>ID</span>
            <span>Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span className="text-right">Due</span>
          </div>
          {rows.map((task) => (
            <div
              key={task.id}
              draggable={!guest}
              onDragStart={(e) => {
                if (guest) return;
                dragged.current = true;
                setDragData(e, "task", task.id);
              }}
              onDragEnd={() => {
                endDrag();
                setOverId(null);
                window.setTimeout(() => {
                  dragged.current = false;
                }, 0);
              }}
              onDragOver={(e) => {
                const d = currentDrag();
                if (guest || d?.kind !== "task" || !canMoveUnder(tasks, d.id, task.id)) return;
                allowDrop(e);
                setOverId(task.id);
              }}
              onDragLeave={() => {
                if (overId === task.id) setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOverId(null);
                const d = parseDragData(e);
                endDrag();
                if (!guest && d?.kind === "task" && canMoveUnder(tasks, d.id, task.id)) void nest(d.id, task.id);
              }}
              className={`grid h-11 grid-cols-[88px_1fr_110px_72px_96px] items-center gap-2 border-b border-line px-4 last:border-0 hover:bg-hover ${guest ? "" : "cursor-grab active:cursor-grabbing"} ${overId === task.id ? "bg-accent-soft ring-1 ring-inset ring-accent" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-1 truncate text-[12px] font-semibold tabular-nums text-muted">
                <GripGlyph size={12} className="shrink-0 text-faint" />
                {task.issue_key ?? "—"}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => void toggleDone(task)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-4 w-4 shrink-0 accent-accent"
                />
                <Link
                  href={`/tasks/${task.id}`}
                  className={`truncate text-sm font-medium ${task.status === "done" ? "text-muted line-through" : "text-ink"}`}
                  onClick={(e) => {
                    if (dragged.current) e.preventDefault();
                  }}
                >
                  {task.title}
                </Link>
              </div>
              <span className={`w-fit rounded px-2 py-0.5 text-[11px] font-semibold ${statusTone[task.status] ?? statusTone.todo}`}>
                {statusLabel(task.status)}
              </span>
              <span className={`text-[11px] font-semibold uppercase ${task.priority === "high" ? "text-priority-high" : task.priority === "low" ? "text-muted" : "text-priority-medium"}`}>
                {priorityLabel(task.priority)}
              </span>
              <span className="text-right text-xs tabular-nums text-muted">{task.due_date ?? "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { GripGlyph, StarGlyph } from "@/components/icons/AppIcons";
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

export function TaskRow({ task, onChange, peers = [] }: { task: Task; onChange?: () => void; peers?: Task[] }) {
  const { refresh, me } = useApp();
  const guest = me?.workspace?.role === "guest";
  const [over, setOver] = useState(false);
  const dragged = useRef(false);
  const nodes = peers.length ? peers : [task];
  const color =
    task.priority === "high" ? "text-priority-high" : task.priority === "low" ? "text-muted" : "text-priority-medium";

  async function toggleDone() {
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: task.status === "done" ? "todo" : "done" }),
    });
    await refresh();
    onChange?.();
  }

  async function nest(childId: string) {
    try {
      await api(`/api/tasks/${childId}`, { method: "PATCH", body: JSON.stringify({ parent_id: task.id }) });
    } catch {
      /* cycle or depth limit */
    }
    await refresh();
    onChange?.();
  }

  function canDropHere() {
    const d = currentDrag();
    return Boolean(d && d.kind === "task" && canMoveUnder(nodes, d.id, task.id));
  }

  return (
    <div
      draggable={!guest}
      onDragStart={(e) => {
        if (guest) return;
        dragged.current = true;
        setDragData(e, "task", task.id);
      }}
      onDragEnd={() => {
        endDrag();
        setOver(false);
        window.setTimeout(() => {
          dragged.current = false;
        }, 0);
      }}
      onDragOver={(e) => {
        if (guest || !canDropHere()) return;
        allowDrop(e);
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        const d = parseDragData(e);
        endDrag();
        if (!guest && d?.kind === "task" && canMoveUnder(nodes, d.id, task.id)) void nest(d.id);
      }}
      className={`flex h-11 items-center gap-3 border-b border-line px-4 last:border-0 hover:bg-hover ${guest ? "" : "cursor-grab active:cursor-grabbing"} ${over ? "bg-accent-soft ring-1 ring-inset ring-accent" : ""}`}
    >
      <GripGlyph size={14} className="text-faint" />
      <input
        type="checkbox"
        checked={task.status === "done"}
        onChange={() => void toggleDone()}
        onMouseDown={(e) => e.stopPropagation()}
        className="h-4 w-4 accent-accent"
      />
      {task.focused && <StarGlyph size={15} filled className="text-accent" />}
      {task.issue_key && <span className="w-16 shrink-0 text-[12px] font-semibold tabular-nums text-muted">{task.issue_key}</span>}
      <Link
        href={`/tasks/${task.id}`}
        className={`flex-1 truncate text-sm font-medium ${task.status === "done" ? "text-muted line-through" : "text-ink"}`}
        onClick={(e) => {
          if (dragged.current) e.preventDefault();
        }}
      >
        {task.title}
      </Link>
      <span className={`hidden rounded px-2 py-0.5 text-[11px] font-semibold sm:inline ${statusTone[task.status] ?? statusTone.todo}`}>
        {statusLabel(task.status)}
      </span>
      <span className={`text-[11px] font-semibold uppercase ${color}`}>{priorityLabel(task.priority)}</span>
      {task.work_days != null && <span className="hidden text-[11px] tabular-nums text-muted sm:inline">{task.work_days}d</span>}
      {task.start_date && <span className="hidden w-[88px] text-right text-xs tabular-nums text-muted md:inline">{task.start_date}</span>}
      {task.due_date && <span className="w-[88px] text-right text-xs tabular-nums text-muted">{task.due_date}</span>}
    </div>
  );
}

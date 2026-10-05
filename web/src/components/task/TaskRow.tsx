"use client";

import Link from "next/link";
import { GripGlyph, StarGlyph } from "@/components/icons/AppIcons";
import { api, priorityLabel, statusLabel } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useApp } from "@/lib/AppContext";

const statusTone: Record<string, string> = {
  todo: "bg-hover text-ink",
  in_progress: "bg-[#E0F2FE] text-[#075985]",
  blocked: "bg-[#FEE4E2] text-[#B42318]",
  done: "bg-[#ECFDF3] text-[#067647]",
};

export function TaskRow({ task, onChange }: { task: Task; onChange?: () => void }) {
  const { refresh } = useApp();
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

  return (
    <div className="flex h-11 cursor-grab items-center gap-3 border-b border-line px-4 last:border-0 hover:bg-hover active:cursor-grabbing">
      <GripGlyph size={14} className="text-faint" />
      <input type="checkbox" checked={task.status === "done"} onChange={() => void toggleDone()} className="h-4 w-4 accent-accent" />
      {task.focused && <StarGlyph size={15} filled className="text-accent" />}
      <Link href={`/tasks/${task.id}`} className={`flex-1 truncate text-sm font-medium ${task.status === "done" ? "text-muted line-through" : "text-ink"}`}>
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

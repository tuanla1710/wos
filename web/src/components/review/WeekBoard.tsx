"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronRightGlyph, FolderGlyph } from "@/components/icons/AppIcons";
import type { ReviewBoardProject, ReviewBoardTask, ReviewBoardWeek } from "@/lib/types";
import { formatDue, weekNumberLabel } from "@/lib/review";

export type WeekKey = "last" | "this" | "next";

export function formatSpan(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const left = a.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const right = b.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${left} – ${right}`;
}

function Bar({ value, className = "h-1.5", tone = "bg-accent" }: { value: number; className?: string; tone?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <span className={`block w-full overflow-hidden rounded-full bg-line ${className}`}>
      <span className={`block h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
    </span>
  );
}

function StatusDot({ task }: { task: ReviewBoardTask }) {
  if (task.status === "done") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#067647] text-white" title="Completed">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.2 4L19 7.5" />
        </svg>
      </span>
    );
  }
  if (task.status === "in_progress") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#175CD3] text-white" title="In progress">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.2l2.8 1.8" />
        </svg>
      </span>
    );
  }
  if (task.status === "blocked") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B42318] text-white" title="Blocked">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
          <path d="M12 6.5v7M12 17.4v.1" />
        </svg>
      </span>
    );
  }
  return <span className="block h-4 w-4 shrink-0 rounded-full border-[1.5px] border-faint bg-white" title="Not started" />;
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export type WeekMode = "actual" | "plan";

export function weekMode(week: WeekKey): WeekMode {
  return week === "last" ? "actual" : "plan";
}

export function weekMetric(week: WeekKey) {
  return week === "last" ? "Done" : "Plan";
}

function pct(value: number | null) {
  return value == null ? "—" : `${value}%`;
}

function shownProgress(task: ReviewBoardTask, mode: WeekMode): number | null {
  if (task.subtasks.length) {
    return average(task.subtasks.map((child) => shownProgress(child, mode)).filter((value): value is number => value != null));
  }
  if (mode === "actual") return task.actual ?? (task.status === "done" ? 100 : null);
  return task.plan;
}

function toneFor(task: ReviewBoardTask) {
  if (task.status === "done") return "bg-[#067647]";
  if (task.status === "blocked") return "bg-[#B42318]";
  if (task.status === "in_progress") return "bg-[#175CD3]";
  return "bg-faint";
}

export function PlanSlider({
  value,
  min = 0,
  max = 100,
  disabled,
  tone = "bg-accent",
  title,
  onSave,
}: {
  value: number | null;
  min?: number;
  max?: number;
  disabled?: boolean;
  tone?: string;
  title?: string;
  onSave: (next: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<number | null>(value);
  const shown = draft ?? 0;
  const floor = Math.max(0, Math.min(100, min));
  const cap = Math.max(floor, Math.min(100, max));

  function at(clientX: number) {
    const rect = track.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return floor;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(cap, Math.max(floor, Math.round(ratio * 100)));
  }

  return (
    <div className="flex items-center gap-2" title={title}>
      <div
        ref={track}
        role="slider"
        aria-valuemin={floor}
        aria-valuemax={cap}
        aria-valuenow={draft ?? 0}
        aria-disabled={disabled || undefined}
        aria-label={title || "Progress"}
        className={`relative h-2.5 flex-1 rounded-full bg-line ${disabled ? "" : "cursor-ew-resize touch-none"}`}
        onPointerDown={(e) => {
          if (disabled) return;
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          setDraft(at(e.clientX));
        }}
        onPointerMove={(e) => {
          if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
          setDraft(at(e.clientX));
        }}
        onPointerUp={(e) => {
          if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const next = at(e.clientX);
          setDraft(next);
          if (next !== value) onSave(next);
        }}
      >
        <span className={`absolute inset-y-0 left-0 rounded-full ${tone}`} style={{ width: `${shown}%` }} />
        {floor > 0 && <span className="absolute inset-y-0 w-px bg-ink/30" style={{ left: `${floor}%` }} />}
        {!disabled && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-[0_1px_3px_rgba(28,25,23,0.28)]"
            style={{ left: `${shown}%` }}
          />
        )}
      </div>
      <span className="w-9 text-right text-[12px] font-semibold tabular-nums text-ink">{draft == null ? "—" : `${shown}%`}</span>
    </div>
  );
}

function countTasks(tasks: ReviewBoardTask[]): number {
  return tasks.reduce((sum, task) => sum + 1 + countTasks(task.subtasks), 0);
}

function inProgressTasks(tasks: ReviewBoardTask[]): ReviewBoardTask[] {
  const out: ReviewBoardTask[] = [];
  for (const task of tasks) {
    const subtasks = inProgressTasks(task.subtasks);
    if (task.status === "in_progress") out.push({ ...task, subtasks });
    else out.push(...subtasks);
  }
  return out;
}

function inProgressProjects(projects: ReviewBoardProject[]): ReviewBoardProject[] {
  const out: ReviewBoardProject[] = [];
  for (const project of projects) {
    const tasks = inProgressTasks(project.tasks);
    const children = inProgressProjects(project.children);
    const listed = project.status === "in_progress" || tasks.length > 0;
    if (!listed && children.length === 0) continue;
    if (!listed) {
      out.push(...children);
      continue;
    }
    const nested = children.reduce((sum, child) => sum + child.total, 0);
    out.push({ ...project, tasks, children, total: countTasks(tasks) + nested });
  }
  return out;
}

function TaskLine({
  task,
  mode,
  canEdit,
  depth,
  onSave,
}: {
  task: ReviewBoardTask;
  mode: WeekMode;
  canEdit: boolean;
  depth: number;
  onSave: (taskId: string, value: number) => void;
}) {
  const dates =
    task.start_date && task.due_date && task.start_date !== task.due_date
      ? `${formatDue(task.start_date)} – ${formatDue(task.due_date)}`
      : formatDue(task.due_date ?? task.start_date);
  const locked = !task.editable;
  const shown = shownProgress(task, mode);
  return (
    <>
      <div className="px-3 py-2 text-[12px] hover:bg-hover" style={{ paddingLeft: 12 + depth * 14 }}>
        <div className="flex items-center gap-2">
          <StatusDot task={task} />
          <Link href={`/tasks/${task.id}`} className={`min-w-0 flex-1 truncate ${task.status === "done" ? "text-muted" : "text-ink"}`} title={task.title}>
            {task.title}
          </Link>
          <span className={`shrink-0 text-[11px] tabular-nums ${task.overdue ? "text-overdue" : "text-faint"}`}>
            now {task.progress}%{dates ? ` · ${dates}` : ""}
          </span>
        </div>
        <div className="mt-1.5 pl-6">
          <PlanSlider
            key={`${task.id}-${mode}-${shown ?? "x"}-${task.min_value}-${task.max_value}`}
            value={shown}
            min={mode === "plan" ? task.min_value : 0}
            max={mode === "plan" ? task.max_value : 100}
            disabled={!canEdit || locked}
            tone={toneFor(task)}
            title={
              locked
                ? "Average of subtasks"
                : mode === "plan" && task.min_value > 0
                  ? `Plan, at least ${task.min_value}% from the week before`
                  : mode === "plan" && task.max_value < 100
                    ? `Plan, at most ${task.max_value}% until the next week is raised`
                    : mode === "plan"
                      ? "Drag to set the plan"
                      : "Drag to set what got done"
            }
            onSave={(next) => onSave(task.id, next)}
          />
        </div>
      </div>
      {task.subtasks.map((child) => (
        <TaskLine key={child.id} task={child} mode={mode} canEdit={canEdit} depth={depth + 1} onSave={onSave} />
      ))}
    </>
  );
}

function ProjectCard({
  project,
  week,
  canEdit,
  onSave,
}: {
  project: ReviewBoardProject;
  week: WeekKey;
  canEdit: boolean;
  onSave: (taskId: string, value: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const header = (
    <div className="flex items-start gap-2.5 px-3 pt-3">
      <span
        className="icon-tile inline-flex h-8 w-8 shrink-0 items-center justify-center"
        style={{ backgroundColor: "#D5DEEA", color: "#1B365D", boxShadow: "inset 0 0 0 1px #1B365D22" }}
      >
        <FolderGlyph size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-5 text-ink">{project.name}</span>
        <span className="block truncate text-[11px] leading-4 text-muted">
          {project.key ? `${project.key} · ` : ""}
          {weekMetric(week)} {pct(project.progress)} · now {project.project_progress}%
        </span>
      </span>
      <span className="w-[112px] shrink-0 pt-0.5">
        <span className="block text-right text-[12px] font-semibold tabular-nums text-ink">{pct(project.progress)}</span>
        <Bar value={project.progress ?? 0} className="mt-1 h-1.5" />
      </span>
    </div>
  );
  return (
    <section className="rounded-lg border border-line bg-white">
      {project.id ? <Link href={`/projects/${project.id}`}>{header}</Link> : header}
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 pb-2 pt-1.5 text-[11px] text-muted hover:text-ink"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>
          {project.total} tasks · {weekMetric(week).toLowerCase()} {pct(project.progress)}
        </span>
        <ChevronRightGlyph size={12} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line py-1">
          {project.tasks.map((t) => (
            <TaskLine key={t.id} task={t} mode={weekMode(week)} canEdit={canEdit} depth={0} onSave={onSave} />
          ))}
          {project.children.map((child) => (
            <div key={child.id ?? "none"} className="px-2 pb-2">
              <ProjectCard project={child} week={week} canEdit={canEdit} onSave={onSave} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function WeekColumn({
  week,
  data,
  active,
  canEdit,
  onActivate,
  onSave,
}: {
  week: WeekKey;
  data: ReviewBoardWeek;
  active: boolean;
  canEdit: boolean;
  onActivate: () => void;
  onSave: (taskId: string, value: number) => void;
}) {
  const projects = inProgressProjects(data.projects);
  return (
    <section
      className={`flex min-w-0 flex-col rounded-xl border bg-[#FBFAF8] ${active ? "border-accent/40 shadow-[0_0_0_1px_rgba(27,54,93,0.18)]" : "border-line"}`}
      onClick={onActivate}
    >
      <div className="flex flex-col gap-3 px-3 py-3">
        {projects.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-[12px] text-muted">
            No in-progress tasks in this week.
          </p>
        )}
        {projects.map((p) => (
          <ProjectCard key={p.id ?? "none"} project={p} week={week} canEdit={canEdit} onSave={onSave} />
        ))}
      </div>
    </section>
  );
}

export function WeekTabs({ board, active, onChange }: { board: Record<WeekKey, ReviewBoardWeek>; active: WeekKey; onChange: (k: WeekKey) => void }) {
  const keys: WeekKey[] = ["this", "next"];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-hover p-1">
      {keys.map((k) => {
        const on = k === active;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={`rounded-lg px-3 py-2 text-center transition-colors ${on ? "bg-accent text-white shadow-[0_6px_14px_rgba(27,54,93,0.22)]" : "text-muted hover:bg-white hover:text-ink"}`}
          >
            <span className="block text-[13px] font-semibold leading-5">{weekNumberLabel(board[k].start)}</span>
            <span className={`block text-[11px] leading-4 ${on ? "text-white/80" : "text-faint"}`}>{formatSpan(board[k].start, board[k].end)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function BoardLegend() {
  const items = [
    { label: "Project Progress", node: <span className="block h-1.5 w-5 rounded-full bg-accent" /> },
    { label: "Task Completed", node: <span className="block h-3 w-3 rounded-full bg-[#067647]" /> },
    { label: "In Progress", node: <span className="block h-3 w-3 rounded-full bg-[#175CD3]" /> },
    { label: "Blocked", node: <span className="block h-3 w-3 rounded-full bg-[#B42318]" /> },
    { label: "Not Started", node: <span className="block h-3 w-3 rounded-full border-[1.5px] border-faint bg-white" /> },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.node}
          {i.label}
        </span>
      ))}
    </div>
  );
}

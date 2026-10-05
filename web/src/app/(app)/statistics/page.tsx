"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProjectWorkStatus, StatisticsData } from "@/lib/types";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

const projectLabel: Record<ProjectWorkStatus, string> = {
  empty: "Empty",
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  overdue: "Overdue",
  done: "Done",
};

const projectTone: Record<ProjectWorkStatus, string> = {
  empty: "bg-hover text-muted",
  not_started: "bg-hover text-ink",
  in_progress: "bg-[#E0F2FE] text-[#075985]",
  blocked: "bg-[#FEE4E2] text-[#B42318]",
  overdue: "bg-[#FEE4E2] text-overdue",
  done: "bg-[#ECFDF3] text-[#067647]",
};

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<StatisticsData>("/api/statistics"));
    } catch {
      /* AppProvider */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  if (!data) return null;

  const t = data.tasks;
  const open = t.todo + t.in_progress + t.blocked;
  const bar = [
    { key: "todo", n: t.todo, cls: "bg-hover" },
    { key: "in_progress", n: t.in_progress, cls: "bg-[#7DD3FC]" },
    { key: "blocked", n: t.blocked, cls: "bg-overdue" },
    { key: "done", n: t.done, cls: "bg-accent" },
  ];

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <h1 className="text-xl font-semibold">Statistics</h1>
      <p className="mt-1 text-sm text-muted">Task and project status for this workspace.</p>

      <p className="section-label mt-8">Tasks</p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <Count href="/tasks?tab=all" value={t.total} label="Total" />
        <Count href="/inbox" value={t.inbox} label="Inbox" />
        <Count href="/tasks?tab=overdue" value={t.overdue} label="Overdue" tone="text-overdue" />
        <Count href="/tasks?tab=today" value={t.due_today} label="Due today" tone="text-due-today" />
        <Count href="/tasks?tab=all&status=todo" value={t.todo} label="Todo" />
        <Count href="/tasks?tab=all&status=in_progress" value={t.in_progress} label="In progress" tone="text-upcoming" />
        <Count href="/tasks?tab=all&status=blocked" value={t.blocked} label="Blocked" tone="text-overdue" />
        <Count href="/tasks?tab=all&status=done" value={t.done} label="Done" />
      </div>

      {t.total > 0 && (
        <div className="mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-hover">
            {bar.map((seg) =>
              seg.n ? (
                <span key={seg.key} className={seg.cls} style={{ width: `${(seg.n / t.total) * 100}%` }} />
              ) : null,
            )}
          </div>
          <p className="mt-2 text-[12px] text-muted">
            {open} open · {t.done} done · {t.upcoming} upcoming
          </p>
        </div>
      )}

      {t.total === 0 && <p className="mt-4 text-sm text-muted">No tasks yet.</p>}

      <p className="section-label mt-10">Projects</p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Count value={data.projects.total} label="Projects" />
        <Count value={data.projects.counts.in_progress} label="In progress" />
        <Count value={data.projects.counts.overdue} label="Overdue" tone="text-overdue" />
        <Count value={data.projects.counts.blocked} label="Blocked" />
        <Count value={data.projects.counts.not_started} label="Not started" />
        <Count value={data.projects.counts.done} label="Done" />
      </div>

      {data.projects.rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No projects yet.</p>
      ) : (
        <div className="mt-6">
          {data.projects.rows.map((row) => (
            <Link key={row.id} href={`/projects/${row.id}`} className="flex h-11 items-center gap-3 border-b border-line text-sm last:border-0 hover:bg-hover">
              <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
              <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${projectTone[row.status]}`}>{projectLabel[row.status]}</span>
              <span className="hidden h-1.5 w-24 rounded-full bg-hover sm:block">
                <span className="block h-1.5 rounded-full bg-accent/70" style={{ width: `${row.progress}%` }} />
              </span>
              <span className="w-16 text-right tabular-nums text-muted">
                {row.completed}/{row.tasks}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Count({
  href,
  value,
  label,
  tone = "text-ink",
}: {
  href?: string;
  value: number;
  label: string;
  tone?: string;
}) {
  const body = (
    <>
      <p className={`text-xl font-semibold tabular-nums leading-7 ${tone}`}>{value}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </>
  );
  if (!href) return <div>{body}</div>;
  return (
    <Link href={href} className="rounded-lg px-1 py-1 hover:bg-hover">
      {body}
    </Link>
  );
}

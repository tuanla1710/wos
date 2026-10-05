"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconTile, type IconName } from "@/components/icons/AppIcons";
import { api } from "@/lib/api";
import type { HomeData, Task } from "@/lib/types";
import { TaskRow } from "@/components/task/TaskRow";
import { useApp } from "@/lib/AppContext";
import { isoWeekMonday, isReviewDone } from "@/lib/review";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

export default function HomePage() {
  const { refresh } = useApp();
  const [data, setData] = useState<HomeData | null>(null);
  const [picker, setPicker] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [pool, setPool] = useState<Task[]>([]);

  const load = useCallback(async () => {
    try {
      setData(await api<HomeData>("/api/home"));
    } catch {
      /* AppProvider handles session / API down */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  if (!data) return null;

  const maxBar = Math.max(1, ...data.this_week.map((d) => d.count));
  const date = new Date(data.today + "T12:00:00");
  const dateLabel = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  async function applySuggestions() {
    await api("/api/focus", {
      method: "PUT",
      body: JSON.stringify({ task_ids: data!.suggestions.slice(0, 3).map((t) => t.id) }),
    });
    await refresh();
    await load();
  }

  async function saveFocus() {
    await api("/api/focus", { method: "PUT", body: JSON.stringify({ task_ids: picked.slice(0, 3) }) });
    setPicker(false);
    await refresh();
    await load();
  }

  async function openPicker() {
    const all = await api<{ tasks: Task[] }>("/api/tasks?tab=all");
    const inbox = await api<{ tasks: Task[] }>("/api/tasks?tab=inbox");
    const list = [...data!.focus, ...all.tasks, ...inbox.tasks].filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i && t.status !== "done");
    setPool(list);
    setPicked(data!.focus.map((t) => t.id));
    setPicker(true);
  }

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <p className="section-label">Today</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Good {data.greeting}, {data.name}
      </h1>
      <p className="mt-1 text-sm text-muted">{dateLabel}</p>

      {data.review_prompt && !isReviewDone(data.review_week_start || isoWeekMonday(data.today)) && (
        <Link href="/review" className="mt-4 block rounded-lg border border-line bg-elev px-4 py-3 text-sm font-medium text-accent hover:bg-hover">
          Review this week →
        </Link>
      )}

      {data.counts.overdue + data.counts.due_today + data.counts.upcoming + data.counts.inbox === 0 && data.focus.length === 0 ? (
        <div className="mt-10 text-muted">
          <p>Nothing here yet.</p>
          <p className="mt-1">Add your first task. New tasks land in Inbox.</p>
        </div>
      ) : (
        <>
          <section className="mt-8">
            <p className="section-label">Today</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CountCard href="/tasks?tab=overdue" icon="alert" value={data.counts.overdue} label="Overdue" tone="text-overdue" />
              <CountCard href="/tasks?tab=today" icon="sun" value={data.counts.due_today} label="Due today" tone="text-due-today" />
              <CountCard href="/tasks?tab=upcoming" icon="clock" value={data.counts.upcoming} label="Upcoming" tone="text-upcoming" />
              <CountCard href="/inbox" icon="inbox" value={data.counts.inbox} label="Inbox" tone="text-accent" />
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <p className="section-label">My Focus</p>
              <button type="button" onClick={() => void openPicker()} className="text-sm font-medium text-accent">
                Edit
              </button>
            </div>
            {data.focus.length === 0 ? (
              <div className="mt-3">
                <p className="text-sm text-muted">Pick up to 3 tasks to focus on today.</p>
                {data.suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="px-4 pt-3 text-[12px] font-semibold uppercase text-muted">Suggested</p>
                    {data.suggestions.map((t) => (
                      <TaskRow key={t.id} task={t} onChange={() => void load()} />
                    ))}
                    <button type="button" onClick={() => void applySuggestions()} className="m-3 h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover">
                      Use these suggestions
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3">
                {data.focus.map((t) => (
                  <TaskRow key={t.id} task={t} onChange={() => void load()} />
                ))}
              </div>
            )}
          </section>

          {(data.member_count ?? 1) >= 2 && (data.team_activity?.length ?? 0) > 0 && (
            <section className="mt-8">
              <p className="section-label">Team Activity</p>
              <div className="mt-3">
                {data.team_activity!.map((row) => (
                  <Link key={row.id} href={row.task_id ? `/tasks/${row.task_id}` : "/"} className="block border-b border-line px-4 py-2.5 text-sm last:border-0 hover:bg-hover">
                    <span className="text-muted">{row.actor}</span> {row.summary}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <p className="section-label">This Week</p>
            <div className="mt-3 space-y-3">
              {data.this_week.map((d) => (
                <Link key={d.date} href="/calendar" className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-muted">{d.weekday}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-hover">
                    <span className="block h-1.5 rounded-full bg-accent/70" style={{ width: `${(d.count / maxBar) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right tabular-nums text-muted">{d.count}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30" onClick={() => setPicker(false)}>
          <div className="max-h-[70vh] w-[480px] overflow-y-auto rounded-lg border border-line bg-elev p-6 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 font-semibold">Choose up to 3 focus tasks</p>
            {pool.map((t) => {
              const on = picked.includes(t.id);
              const locked = !on && picked.length >= 3;
              return (
                <label key={t.id} className={`flex h-11 items-center gap-3 text-sm ${locked ? "opacity-40" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={locked}
                    checked={on}
                    onChange={() => setPicked((prev) => (on ? prev.filter((id) => id !== t.id) : [...prev, t.id]))}
                  />
                  {t.title}
                </label>
              );
            })}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setPicker(false)} className="h-9 px-3 text-sm">
                Cancel
              </button>
              <button type="button" onClick={() => void saveFocus()} className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CountCard({
  href,
  icon,
  value,
  label,
  tone,
}: {
  href: string;
  icon: IconName;
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <Link href={href} className="rounded-lg px-3 py-3 transition hover:bg-hover">
      <IconTile name={icon} size={20} className="text-muted" />
      <p className={`mt-2 text-xl font-semibold tabular-nums leading-7 ${tone}`}>{value}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </Link>
  );
}

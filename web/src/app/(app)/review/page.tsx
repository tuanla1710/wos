"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, downloadReviewReport } from "@/lib/api";
import type { ReviewData, Task } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import { useReloadOnChange } from "@/lib/useReloadOnChange";
import { addDays, formatDue, formatReviewRange, isoWeekMonday, markReviewDone, todayIso } from "@/lib/review";

export default function ReviewPage() {
  const { me, refresh } = useApp();
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState("");
  const [focusIds, setFocusIds] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [pool, setPool] = useState<Task[]>([]);
  const [extraFocus, setExtraFocus] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [ai, setAi] = useState<{ summary: string; suggestions: { kind: string; task_id: string; title: string; reason: string }[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<ReviewData>("/api/review");
      setData(r);
      setFocusIds(r.week_focus.map((t) => t.id));
      setError("");
      if (me?.ai_enabled) {
        const suggestions = await api<{ summary: string; suggestions: { kind: string; task_id: string; title: string; reason: string }[] }>("/api/ai/review").catch(() => null);
        setAi(suggestions);
      } else {
        setAi(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t load review.");
    }
  }, [me?.ai_enabled]);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  const today = todayIso();
  const tomorrow = addDays(today, 1);
  const nextMonday = data?.next_week_start ?? isoWeekMonday(addDays(today, 7));

  const focusPool = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const out: Task[] = [];
    for (const t of [...data.week_focus, ...data.due_next_week, ...data.overdue, ...extraFocus]) {
      if (seen.has(t.id) || t.status === "done") continue;
      seen.add(t.id);
      out.push(t);
    }
    return out;
  }, [data, extraFocus]);

  async function reschedule(id: string, due: string) {
    await api("/api/review/reschedule", { method: "POST", body: JSON.stringify({ task_id: id, due_date: due }) });
    await refresh();
    await load();
  }

  async function drop(id: string) {
    await api("/api/review/drop", { method: "POST", body: JSON.stringify({ task_id: id }) });
    await refresh();
    await load();
  }

  async function unblock(id: string) {
    await api("/api/review/unblock", { method: "POST", body: JSON.stringify({ task_id: id }) });
    await refresh();
    await load();
  }

  async function openAdd() {
    const all = await api<{ tasks: Task[] }>("/api/tasks?tab=all");
    const list = [...focusPool, ...all.tasks].filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i && t.status !== "done");
    setPool(list);
    setPicker(true);
  }

  function toggleFocus(task: Task) {
    setFocusIds((ids) => {
      if (ids.includes(task.id)) return ids.filter((x) => x !== task.id);
      if (ids.length >= 3) return ids;
      return [...ids, task.id];
    });
    setExtraFocus((prev) => (prev.some((t) => t.id === task.id) ? prev : [...prev, task]));
  }

  async function finish() {
    if (!data) return;
    setSaving(true);
    try {
      await api("/api/review/week-focus", {
        method: "PUT",
        body: JSON.stringify({ week_start: data.next_week_start, task_ids: focusIds }),
      });
      markReviewDone(data.week_start);
      setDone(true);
      await refresh();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function exportDoc() {
    if (!data) return;
    setExporting(true);
    try {
      await downloadReviewReport(data.week_start);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t export.");
    } finally {
      setExporting(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[880px] p-8">
        <h1 className="text-xl font-semibold">Weekly Review</h1>
        <p className="mt-3 text-sm text-muted">{error || "Loading weekly review…"}</p>
        {error && (
          <button type="button" className="btn-primary mt-4" onClick={() => void load()}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Review</p>
          <h1 className="mt-1 text-xl font-semibold">Weekly Review · {formatReviewRange(data.week_start, data.week_end)}</h1>
          <p className="mt-1 text-sm text-muted">Close the week. Reschedule or drop overdue work, then pick next week’s Focus.</p>
        </div>
        <button type="button" className="btn-ghost" disabled={exporting} onClick={() => void exportDoc()}>
          {exporting ? "Exporting…" : "Export report"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-overdue">{error}</p>}
      {done && <p className="mt-3 text-sm text-accent">Review saved. Home will hide the Friday banner until next week.</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Completed" value={data.completed} />
        <Stat label="Overdue" value={data.overdue.length} />
        <Stat label="Blocked" value={data.blocked.length} />
        <Stat label="Due next week" value={data.due_next_week.length} />
      </div>

      <p className="section-label mt-8">Completed this week</p>
      <div className="mt-2 overflow-hidden rounded-xl glass">
        {data.completed_tasks.length === 0 && <p className="px-4 py-3 text-sm text-muted">No completed tasks this week.</p>}
        {data.completed_tasks.map((t) => (
          <Link key={t.id} href={`/tasks/${t.id}`} className="flex h-11 items-center gap-3 border-b border-line px-4 text-sm last:border-0 hover:bg-hover">
            <span className="flex-1 truncate text-muted line-through">{t.title}</span>
            <span className="text-xs text-muted">{formatDue(t.due_date)}</span>
          </Link>
        ))}
      </div>

      {data.projects.length > 0 && (
        <>
          <p className="section-label mt-8">Project progress</p>
          <div className="mt-2 space-y-2">
            {data.projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 text-sm">
                <span className="w-40 truncate">{p.name}</span>
                <span className="h-3 flex-1 rounded bg-line">
                  <span className="block h-3 rounded bg-accent/70" style={{ width: `${p.progress}%` }} />
                </span>
                <span className="w-10 text-right text-muted">{p.progress}%</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {ai && (
        <div className="mt-8 rounded-xl glass p-4 text-sm">
          <p className="section-label">AI suggestions</p>
          <p className="mt-1 text-muted">{ai.summary}</p>
          {ai.suggestions.map((s) => (
            <div key={`${s.kind}-${s.task_id}`} className="mt-2 flex items-center justify-between gap-3">
              <span>
                {s.title} — {s.reason}
              </span>
              <button
                type="button"
                className="text-accent"
                onClick={() => void api("/api/ai/apply", { method: "POST", body: JSON.stringify({ kind: s.kind, payload: { task_id: s.task_id } }) }).then(load)}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="section-label mt-8">Overdue</p>
      <div className="mt-2 overflow-hidden rounded-xl glass">
        {data.overdue.length === 0 && <p className="px-4 py-3 text-sm text-muted">Nothing overdue.</p>}
        {data.overdue.map((t) => (
          <OverdueRow
            key={t.id}
            task={t}
            today={today}
            tomorrow={tomorrow}
            nextMonday={nextMonday}
            onReschedule={(due) => void reschedule(t.id, due)}
            onDrop={() => void drop(t.id)}
          />
        ))}
      </div>

      <p className="section-label mt-8">Blocked</p>
      <div className="mt-2 overflow-hidden rounded-xl glass">
        {data.blocked.length === 0 && <p className="px-4 py-3 text-sm text-muted">Nothing blocked.</p>}
        {data.blocked.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 text-sm last:border-0">
            <Link href={`/tasks/${t.id}`} className="min-w-[160px] flex-1 truncate font-medium">
              {t.title}
              {t.blocked_reason ? <span className="ml-2 font-normal text-muted">{t.blocked_reason}</span> : null}
            </Link>
            <button type="button" className="text-sm font-medium text-accent" onClick={() => void unblock(t.id)}>
              Unblock
            </button>
            <span className="text-sm text-muted">Keep</span>
          </div>
        ))}
      </div>

      <p className="section-label mt-8">Focus next week (max 3)</p>
      <div className="mt-2 overflow-hidden rounded-xl glass">
        {focusPool.length === 0 && <p className="px-4 py-3 text-sm text-muted">No candidates yet. Add an organized task.</p>}
        {focusPool.map((t) => {
          const on = focusIds.includes(t.id);
          const locked = !on && focusIds.length >= 3;
          return (
            <label key={t.id} className={`flex h-11 items-center gap-3 border-b border-line px-4 text-sm last:border-0 ${locked ? "opacity-40" : ""}`}>
              <input type="checkbox" checked={on} disabled={locked} onChange={() => toggleFocus(t)} />
              <span className="flex-1 truncate">{t.title}</span>
              <span className="text-xs text-muted">{formatDue(t.due_date)}</span>
            </label>
          );
        })}
      </div>
      <button type="button" className="btn-ghost mt-2" onClick={() => void openAdd()}>
        Add
      </button>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" disabled={saving} onClick={() => void finish()}>
          {saving ? "Saving…" : "Done reviewing"}
        </button>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30" onClick={() => setPicker(false)}>
          <div className="max-h-[70vh] w-[480px] overflow-y-auto rounded-lg border border-line bg-elev p-6 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 font-semibold">Add Focus candidates</p>
            {pool.map((t) => {
              const on = focusIds.includes(t.id);
              const locked = !on && focusIds.length >= 3;
              return (
                <label key={t.id} className={`flex h-11 items-center gap-3 text-sm ${locked ? "opacity-40" : ""}`}>
                  <input type="checkbox" disabled={locked} checked={on} onChange={() => toggleFocus(t)} />
                  {t.title}
                </label>
              );
            })}
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn-primary" onClick={() => setPicker(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function OverdueRow({
  task,
  today,
  tomorrow,
  nextMonday,
  onReschedule,
  onDrop,
}: {
  task: Task;
  today: string;
  tomorrow: string;
  nextMonday: string;
  onReschedule: (due: string) => void;
  onDrop: () => void;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 text-sm last:border-0">
      <Link href={`/tasks/${task.id}`} className="min-w-[160px] flex-1 truncate font-medium">
        {task.title}
      </Link>
      <span className="text-xs text-muted">{formatDue(task.due_date)}</span>
      <select
        defaultValue=""
        className="field w-[140px]"
        onChange={(e) => {
          const v = e.target.value;
          e.target.value = "";
          if (v === "__pick") {
            setPicking(true);
            return;
          }
          if (v) onReschedule(v);
        }}
      >
        <option value="" disabled>
          Reschedule
        </option>
        <option value={today}>Today</option>
        <option value={tomorrow}>Tomorrow</option>
        <option value={nextMonday}>Next Monday</option>
        <option value="__pick">Pick date</option>
      </select>
      {picking && (
        <input
          type="date"
          autoFocus
          className="field w-[150px]"
          onChange={(e) => {
            if (e.target.value) {
              onReschedule(e.target.value);
              setPicking(false);
            }
          }}
        />
      )}
      <button type="button" className="text-sm font-medium text-overdue" onClick={onDrop}>
        Drop
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl glass px-4 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

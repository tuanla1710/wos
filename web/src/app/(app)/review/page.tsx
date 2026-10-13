"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, downloadReviewReport } from "@/lib/api";
import type { ReviewData, Task } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import { useReloadOnChange } from "@/lib/useReloadOnChange";
import { addDays, formatDue, formatWeekOfYear, isoWeekMonday, markReviewDone, todayIso } from "@/lib/review";
import { BoardLegend, WeekColumn, WeekTabs, formatSpan, type WeekKey } from "@/components/review/WeekBoard";
import { ChevronLeftGlyph, ChevronRightGlyph } from "@/components/icons/AppIcons";

export default function ReviewPage() {
  const { me, refresh } = useApp();
  const [data, setData] = useState<ReviewData | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<WeekKey>("this");
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
      const r = await api<ReviewData>(weekStart ? `/api/review?week_start=${weekStart}` : "/api/review");
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
  }, [me?.ai_enabled, weekStart]);

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
      <div className="mx-auto max-w-[1440px] p-8">
        <h1 className="text-xl font-semibold">Weekly Review</h1>
        <p className="mt-3 text-sm text-muted">{error || "Loading weekly report…"}</p>
        {error && (
          <button type="button" className="btn-primary mt-4" onClick={() => void load()}>
            Try again
          </button>
        )}
      </div>
    );
  }

  const weekKeys: WeekKey[] = ["this", "next"];
  const isCurrentWeek = data.week_start === isoWeekMonday(today);

  return (
    <div className="mx-auto max-w-[1440px] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-7">Weekly Review</h1>
          <p className="mt-0.5 text-sm text-muted">Project &amp; Task Progress · {formatWeekOfYear(data.week_start)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-9 items-center rounded-lg border border-line bg-white">
            <button type="button" className="flex h-full w-8 items-center justify-center text-muted hover:text-ink" title="Previous week" onClick={() => setWeekStart(addDays(data.week_start, -7))}>
              <ChevronLeftGlyph size={14} />
            </button>
            <span className="px-1 text-[13px] font-medium tabular-nums">{formatSpan(data.week_start, data.week_end)}</span>
            <button type="button" className="flex h-full w-8 items-center justify-center text-muted hover:text-ink" title="Next week" onClick={() => setWeekStart(addDays(data.week_start, 7))}>
              <ChevronRightGlyph size={14} />
            </button>
          </div>
          {isCurrentWeek ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#ECFDF3] px-3 text-[12px] font-medium text-[#067647]">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#067647]" />
              Live
            </span>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => setWeekStart(null)}>
              Today
            </button>
          )}
          <button type="button" className="btn-ghost" disabled={exporting} onClick={() => void exportDoc()}>
            {exporting ? "Exporting…" : "Export report"}
          </button>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => void finish()}>
            {saving ? "Saving…" : "Done reviewing"}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-overdue">{error}</p>}
      {done && <p className="mt-3 text-sm text-accent">Report saved. Home will hide the Friday banner until next week.</p>}

      <div className="mt-5">
        <WeekTabs board={data.board} active={activeWeek} onChange={setActiveWeek} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {weekKeys.map((k) => (
          <div key={k} className={k === activeWeek ? "" : "hidden xl:block"}>
            <WeekColumn
              week={k}
              data={data.board[k]}
              active={k === activeWeek}
              canEdit={me?.workspace?.role !== "guest"}
              onActivate={() => setActiveWeek(k)}
              onSave={(taskId, value) => {
                setError("");
                void api("/api/review/week-target", {
                  method: "PUT",
                  body: JSON.stringify({
                    task_id: taskId,
                    week_start: data.board[k].start,
                    ...(k === "last" ? { actual_progress: value } : { target_progress: value }),
                  }),
                })
                  .then(() => load())
                  .catch((e) => setError(e instanceof Error ? e.message : "Couldn’t save the plan."));
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <BoardLegend />
        <p className="text-[11px] text-faint">Drag a bar to set the %. A later week’s plan can’t be lower than the week before it, and anything already at 100% stays out of the following week. Only projects and tasks set to In Progress are listed. Each week keeps tasks whose own deadline falls in that week. Use the arrows to open another week.</p>
      </div>

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

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section>
          <p className="section-label">Overdue</p>
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
        </section>

        <section>
          <p className="section-label">Blocked</p>
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
        </section>

        <section>
          <div className="flex items-center justify-between">
            <p className="section-label">Focus next week (max 3)</p>
            <button type="button" className="text-[12px] font-medium text-accent" onClick={() => void openAdd()}>
              Add
            </button>
          </div>
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
        </section>
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

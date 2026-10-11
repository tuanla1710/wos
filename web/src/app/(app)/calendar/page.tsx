"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftGlyph, ChevronRightGlyph } from "@/components/icons/AppIcons";
import { api, priorityLabel } from "@/lib/api";
import type { CalendarEvent, PublicHoliday, Task } from "@/lib/types";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

function mondayOf(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(12, 0, 0, 0);
  return x;
}

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const [start, setStart] = useState(() => mondayOf(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(iso(new Date()));
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  }), [start]);

  const load = useCallback(async () => {
    const from = iso(days[0]);
    const to = iso(days[6]);
    try {
      const data = await api<{ tasks: Task[]; events: CalendarEvent[] }>(`/api/calendar?from=${from}&to=${to}`);
      setTasks(data.tasks);
      setEvents(data.events ?? []);
      const hol = await api<{ holidays: PublicHoliday[] }>(`/api/holidays?from=${from}&to=${to}`).catch(() => ({ holidays: [] }));
      setHolidays(hol.holidays);
    } catch {
      /* AppProvider handles session / API down */
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  const today = iso(new Date());

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" className="icon-btn" onClick={() => setStart((s) => { const n = new Date(s); n.setDate(s.getDate() - 7); return n; })}>
          <ChevronLeftGlyph size={16} />
        </button>
        <h1 className="text-xl font-semibold">This week</h1>
        <button type="button" className="icon-btn" onClick={() => setStart((s) => { const n = new Date(s); n.setDate(s.getDate() + 7); return n; })}>
          <ChevronRightGlyph size={16} />
        </button>
        <span className="ml-2 text-sm text-muted">
          {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <form
        className="mb-4 flex flex-wrap items-end gap-2 rounded-xl glass p-3 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          await api("/api/events", {
            method: "POST",
            body: JSON.stringify({
              title: title.trim(),
              event_date: eventDate,
              all_day: allDay,
              start_time: allDay ? null : startTime,
              end_time: allDay ? null : endTime,
            }),
          });
          setTitle("");
          await load();
        }}
      >
        <label>
          Event
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="ml-2 h-9 rounded border border-line px-2" />
        </label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="h-9 rounded border border-line px-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          All day
        </label>
        {!allDay && (
          <>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9 rounded border border-line px-2" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9 rounded border border-line px-2" />
          </>
        )}
        <button type="submit" className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover">
          Add event
        </button>
      </form>
      {tasks.length === 0 && events.length === 0 && <p className="mb-4 text-sm text-muted">No due dates this week.</p>}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const key = iso(d);
          const dayTasks = tasks.filter((t) => t.due_date === key);
          const dayEvents = events.filter((ev) => ev.event_date === key);
          const dayHolidays = holidays.filter((h) => h.day === key);
          const off = dayHolidays.some((h) => h.off);
          const tone = off || d.getDay() === 0 ? "text-overdue" : d.getDay() === 6 ? "text-upcoming" : "text-muted";
          return (
            <div
              key={key}
              className={`min-h-[280px] rounded-lg border p-2 ${key === today ? "border-accent bg-accent-soft" : off ? "border-[#FECDCA] bg-[#FEF3F2]" : "border-line bg-sidebar"}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (!id) return;
                await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ due_date: key }) });
                await load();
              }}
            >
              <p className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.04em] ${tone}`}>
                {d.toLocaleDateString("en-US", { weekday: "short" })} {d.getDate()}
              </p>
              {dayHolidays.map((h) => (
                <p
                  key={`${h.kind}-${h.country}-${h.name}`}
                  title={h.kind === "secondary" ? h.name_en : h.name}
                  className={`mb-1 truncate text-[11px] leading-4 ${h.off ? "font-semibold text-overdue" : h.kind === "primary" ? "text-muted line-through" : "text-muted"}`}
                >
                  {h.kind === "secondary" ? `${h.country} · ${h.name}` : h.kind === "primary" ? h.name_en : h.name}
                </p>
              ))}
              {dayEvents.map((ev) => (
                <div key={ev.id} className="grab-chip mb-1 w-full rounded-lg border-accent/30 bg-accent/10 px-2 py-1 text-left text-xs text-accent">
                  {ev.title}
                  {!ev.all_day && ev.start_time ? ` · ${ev.start_time.slice(0, 5)}` : ""}
                </div>
              ))}
              {dayTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  onClick={() => router.push(`/tasks/${t.id}`)}
                  className={`grab-chip mb-1 w-full rounded-lg px-2 py-1 text-left text-xs ${t.status === "done" ? "text-muted line-through" : ""}`}
                >
                  {t.title}
                  <span className="ml-1 uppercase text-priority-high">{priorityLabel(t.priority)}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

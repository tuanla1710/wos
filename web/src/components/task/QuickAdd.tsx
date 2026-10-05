"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { workDays, workDaysLabel } from "@/lib/schedule";

export function QuickAdd({ onClose, defaultProjectId }: { onClose: () => void; defaultProjectId?: string }) {
  const { projects, holidays, refresh } = useApp();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [start, setStart] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  async function submit() {
    if (!title.trim()) {
      setError("Title can't be empty.");
      return;
    }
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        project_id: projectId || null,
        start_date: start || null,
        due_date: due || null,
        priority,
      }),
    });
    await refresh();
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30" onClick={onClose}>
      <div
        className="w-[440px] rounded-lg border border-line bg-elev p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Enter") void submit();
        }}
      >
        <p className="mb-3 text-sm font-semibold">What needs to be done?</p>
        <input
          ref={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 h-9 w-full rounded border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Project</label>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mb-3 h-9 w-full rounded border border-line px-2 text-sm">
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Start</label>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mb-3 h-9 w-full rounded border border-line px-2 text-sm" />
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Due</label>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mb-3 h-9 w-full rounded border border-line px-2 text-sm" />
        <p className="mb-3 text-[12px] text-muted">{workDaysLabel(workDays(start, due, holidays))}</p>
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mb-4 h-9 w-full rounded border border-line px-2 text-sm">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {error && <p className="mb-3 text-sm text-overdue">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded px-3 text-sm hover:bg-hover">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} className="h-9 rounded bg-accent px-3.5 text-sm font-semibold text-white hover:bg-accent-hover">
            Add task
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

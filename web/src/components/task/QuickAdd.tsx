"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { stampTitle } from "@/lib/entityTitle";
import { workDays, workDaysLabel } from "@/lib/schedule";

export function QuickAdd({ onClose, defaultProjectId }: { onClose: () => void; defaultProjectId?: string }) {
  const { me, projects, holidays, refresh } = useApp();
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const auto = useRef("");
  const [title, setTitle] = useState(() => {
    const project = projects.find((p) => p.id === (defaultProjectId ?? ""));
    const next = stampTitle(me?.timezone, project?.name);
    auto.current = next;
    return next;
  });
  const [start, setStart] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  function applyProject(nextId: string) {
    const project = projects.find((p) => p.id === nextId);
    const generated = stampTitle(me?.timezone, project?.name);
    setProjectId(nextId);
    if (!title.trim() || title === auto.current) {
      auto.current = generated;
      setTitle(generated);
    }
  }

  async function submit() {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim() || undefined,
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
        <select value={projectId} onChange={(e) => applyProject(e.target.value)} className="mb-3 h-9 w-full rounded border border-line px-2 text-sm">
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
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} className="btn-primary">
            Add task
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

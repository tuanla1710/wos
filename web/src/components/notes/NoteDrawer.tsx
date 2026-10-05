"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MEETING_SKELETON, LECTURE_SKELETON, kindLabel } from "@/lib/noteMd";
import type { NoteKind, WorkNote } from "@/lib/types";

export function NoteDrawer({
  taskId,
  projectId,
  onClose,
}: {
  taskId?: string;
  projectId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<NoteKind>(taskId ? "quick" : "work");
  const [title, setTitle] = useState("");
  const [more, setMore] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = Boolean(title.trim() || more.trim());

  function close() {
    if (!dirty || confirm("Discard this note?")) onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty]);

  async function save() {
    if (!title.trim() && !more.trim()) return;
    setBusy(true);
    try {
      const created = await api<WorkNote>("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          kind,
          title: title.trim() || undefined,
          body: more,
          task_id: taskId || undefined,
          project_id: projectId || undefined,
        }),
      });
      onClose();
      return created;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#1C1917]/30" onClick={close}>
      <aside className="flex h-full w-full max-w-[420px] flex-col border-l border-line bg-elev p-5 shadow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">New note</p>
          <button type="button" className="text-sm text-muted" onClick={close}>
            Close
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["quick", "work", "meeting", "lecture"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`h-8 rounded-full px-3 text-[12px] ${kind === k ? "bg-accent-soft font-semibold text-accent" : "border border-line text-muted"}`}
              onClick={() => {
                setKind(k);
                if (k === "meeting" && !more.trim()) setMore(MEETING_SKELETON);
                if (k === "lecture" && !more.trim()) setMore(LECTURE_SKELETON);
              }}
            >
              {kindLabel(k)}
            </button>
          ))}
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && kind === "quick") {
              e.preventDefault();
              void save();
            }
          }}
          placeholder={kind === "quick" ? "Check PTP after reboot" : "Title"}
          className="mt-4 h-10 w-full rounded border border-line px-3 text-sm"
        />
        {kind !== "quick" && (
          <textarea value={more} onChange={(e) => setMore(e.target.value)} placeholder="Write the note…" className={`mt-3 min-h-[220px] w-full rounded border border-line p-3 text-sm ${kind === "lecture" ? "font-mono" : ""}`} />
        )}
        {kind === "quick" && (
          <button type="button" className="mt-3 text-left text-[12px] text-muted underline" onClick={() => setKind("work")}>
            Write more
          </button>
        )}
        <div className="mt-auto flex justify-end gap-2 pt-6">
          <button
            type="button"
            className="h-9 rounded px-3 text-sm text-muted"
            onClick={async () => {
              const created = await save();
              if (created) router.push(`/notes/${created.id}`);
            }}
          >
            Open full editor
          </button>
          <button type="button" disabled={busy} className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white" onClick={() => void save()}>
            Save note
          </button>
        </div>
      </aside>
    </div>
  );
}

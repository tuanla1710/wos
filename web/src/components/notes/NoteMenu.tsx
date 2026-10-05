"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { downloadTxt } from "@/lib/noteFile";
import type { Task, WorkNote } from "@/lib/types";

export function NoteMenu({
  note,
  onChange,
  onOpen,
}: {
  note: WorkNote;
  onChange: () => void;
  onOpen?: () => void;
}) {
  const { me } = useApp();
  const role = me?.workspace?.role;
  const guest = role === "guest";
  const canWrite = !guest;
  const canModerate = role === "owner" || role === "admin" || note.author_id === me?.id;
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"actions" | "task">("actions");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pos, setPos] = useState({ top: 0, right: 8 });
  const box = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function hide(e: MouseEvent) {
      const t = e.target as Node;
      if (box.current?.contains(t) || menu.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", hide);
    return () => document.removeEventListener("mousedown", hide);
  }, []);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const r = box.current?.getBoundingClientRect();
    if (r) {
      const height = 320;
      const below = r.bottom + 4;
      setPos({
        top: below + height > window.innerHeight ? Math.max(8, r.top - height) : below,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setPanel("actions");
    setOpen(true);
  }

  async function run(fn: () => Promise<void>) {
    setOpen(false);
    await fn();
    onChange();
  }

  return (
    <div ref={box} className="relative">
      <button type="button" className="h-8 w-8 rounded text-muted hover:bg-hover hover:text-ink" onClick={toggle} aria-label="Note actions">
        ···
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            className="fixed z-50 min-w-[200px] overflow-hidden rounded-xl glass py-1 text-sm"
            style={{ top: pos.top, right: pos.right }}
          >
            {panel === "task" ? (
              <>
                <Item onClick={() => setPanel("actions")}>Back</Item>
                <Item
                  onClick={() =>
                    run(async () => {
                      await api(`/api/notes/${note.id}`, { method: "PATCH", body: JSON.stringify({ clear_task: true }) });
                    })
                  }
                >
                  Detach from task
                </Item>
                {tasks.map((t) => (
                  <Item
                    key={t.id}
                    onClick={() =>
                      run(async () => {
                        await api(`/api/notes/${note.id}`, { method: "PATCH", body: JSON.stringify({ task_id: t.id }) });
                      })
                    }
                  >
                    {t.title}
                  </Item>
                ))}
              </>
            ) : (
              <>
                {canWrite && <Item onClick={() => { setOpen(false); onOpen?.(); }}>Edit</Item>}
                {canModerate && (
                  <Item onClick={() => run(() => api(`/api/notes/${note.id}/pin`, { method: "POST", body: JSON.stringify({ pinned: !note.pinned }) }))}>
                    {note.pinned ? "Unpin" : "Pin"}
                  </Item>
                )}
                <Item onClick={() => run(() => api(`/api/notes/${note.id}/star`, { method: "POST", body: JSON.stringify({ starred: !note.starred }) }))}>
                  {note.starred ? "Unfavorite" : "Favorite"}
                </Item>
                {canWrite && (
                  <Item
                    onClick={() =>
                      run(async () => {
                        const copy = await api<WorkNote>(`/api/notes/${note.id}/duplicate`, { method: "POST" });
                        window.location.href = `/notes/${copy.id}`;
                      })
                    }
                  >
                    Duplicate
                  </Item>
                )}
                {canWrite && (
                  <Item
                    onClick={() => {
                      void api<{ tasks: Task[] }>("/api/tasks?tab=all").then((d) => {
                        setTasks(d.tasks);
                        setPanel("task");
                      });
                    }}
                  >
                    {note.task_id ? "Move / detach task" : "Move to task"}
                  </Item>
                )}
                {canWrite && (
                  <Item
                    onClick={() =>
                      run(async () => {
                        const tag = window.prompt("Tag (a-z, 0-9, hyphen)");
                        if (!tag?.trim()) return;
                        await api(`/api/notes/${note.id}`, { method: "PATCH", body: JSON.stringify({ tags: [...note.tags, tag.trim()] }) });
                      })
                    }
                  >
                    Add tag
                  </Item>
                )}
                <Item
                  onClick={() =>
                    run(async () => {
                      const full = await api<WorkNote>(`/api/notes/${note.id}`);
                      downloadTxt(full.title, full.body ?? "");
                    })
                  }
                >
                  Export .txt
                </Item>
                {canModerate && (
                  <Item onClick={() => run(() => api(`/api/notes/${note.id}/archive`, { method: "POST", body: JSON.stringify({ archived: !note.archived }) }))}>
                    {note.archived ? "Unarchive" : "Archive"}
                  </Item>
                )}
                {canModerate && (
                  <Item
                    danger
                    onClick={() =>
                      run(async () => {
                        if (!confirm("Delete this note and its files? This cannot be undone.")) return;
                        await api(`/api/notes/${note.id}`, { method: "DELETE" });
                      })
                    }
                  >
                    Delete
                  </Item>
                )}
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function Item({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" className={`block w-full px-3 py-2 text-left hover:bg-hover ${danger ? "text-overdue" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

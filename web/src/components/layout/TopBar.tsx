"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BellGlyph, PlusGlyph, SearchGlyph } from "@/components/icons/AppIcons";
import { api } from "@/lib/api";
import { TopBarAccount } from "@/components/layout/AccountSession";
import { QuickAdd } from "@/components/task/QuickAdd";
import { useApp } from "@/lib/AppContext";

export function TopBar() {
  const { me, workspaces, unread, switchWorkspace, refresh } = useApp();
  const [openAdd, setOpenAdd] = useState(false);
  const [bell, setBell] = useState(false);
  const [notes, setNotes] = useState<{ id: string; body: string; task_id: string | null; read: boolean }[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{
    tasks: { id: string; title: string }[];
    projects: { id: string; name: string }[];
    notes?: { id: string; title: string }[];
    people?: { id: string; name: string }[];
  } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const guest = me?.workspace?.role === "guest";
  const projectId = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const taskId = pathname.match(/^\/tasks\/([^/]+)/)?.[1];

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      void api<typeof results>(`/api/search?q=${encodeURIComponent(q.trim())}`).then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) {
        setResults(null);
        setBell(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="relative flex h-14 shrink-0 items-center gap-3 border-b border-line px-6">
      {workspaces.length > 0 && (
        <select
          value={me?.workspace.id ?? ""}
          onChange={(e) => void switchWorkspace(e.target.value)}
          className="h-9 max-w-[200px] rounded-md border-0 bg-hover px-2 text-sm"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      )}
      <div className="relative ml-auto" ref={box}>
        <div className="flex h-9 w-[280px] items-center gap-2 rounded-md bg-hover px-3">
          <SearchGlyph size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-full w-full bg-transparent text-sm outline-none placeholder:text-faint" />
        </div>
        {q.trim() && results && (
          <div className="absolute right-0 z-20 mt-1 w-[480px] rounded-lg border border-line bg-elev p-2 shadow-popover">
            {!results.tasks.length && !results.projects.length && !(results.notes?.length || results.people?.length) && (
              <p className="px-2 py-2 text-sm text-muted">No results for “{q}”.</p>
            )}
            {results.tasks.map((t) => (
              <button key={t.id} type="button" className="flex h-9 w-full items-center rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { router.push(`/tasks/${t.id}`); setQ(""); }}>
                {t.title}
              </button>
            ))}
            {results.projects.map((p) => (
              <button key={p.id} type="button" className="flex h-9 w-full items-center rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { router.push(`/projects/${p.id}`); setQ(""); }}>
                {p.name}
              </button>
            ))}
            {(results.notes ?? []).map((n) => (
              <button key={n.id} type="button" className="flex h-9 w-full items-center rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { router.push(`/notes/${n.id}`); setQ(""); }}>
                {n.title}
              </button>
            ))}
          </div>
        )}
        {bell && (
          <div className="absolute right-0 top-11 z-30 w-[360px] rounded-lg border border-line bg-elev p-3 shadow-popover">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Notifications</span>
              <button type="button" className="text-[12px] font-medium text-accent" onClick={() => void api("/api/notifications/read-all", { method: "POST" }).then(refresh)}>
                Mark all read
              </button>
            </div>
            {notes.length === 0 && <p className="py-3 text-sm text-muted">You’re all caught up.</p>}
            {notes.map((n) => (
              <button
                key={n.id}
                type="button"
                className="flex w-full items-start gap-2 rounded px-2 py-2 text-left text-sm hover:bg-hover"
                onClick={() => {
                  if (n.task_id) router.push(`/tasks/${n.task_id}`);
                  setBell(false);
                }}
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-overdue"}`} />
                <span className={n.read ? "text-muted" : "text-ink"}>{n.body}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!guest && (
        <button
          type="button"
          className="icon-btn relative"
          onClick={async () => {
            const data = await api<{ notifications: typeof notes }>("/api/notifications");
            setNotes(data.notifications);
            setBell((v) => !v);
          }}
        >
          <BellGlyph size={17} />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-overdue" />}
        </button>
      )}
      {!guest && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            const qs = new URLSearchParams();
            if (taskId) {
              qs.set("task", taskId);
              qs.set("kind", "quick");
            }
            if (projectId) qs.set("project", projectId);
            const query = qs.toString();
            router.push(query ? `/notes/new?${query}` : "/notes/new");
          }}
        >
          <PlusGlyph size={15} boxed={false} /> Note
        </button>
      )}
      {!guest && (
        <button type="button" onClick={() => setOpenAdd(true)} className="btn-primary">
          <PlusGlyph size={15} boxed={false} /> Task
        </button>
      )}
      <TopBarAccount />
      {openAdd && (
        <QuickAdd
          defaultProjectId={projectId}
          onClose={() => {
            setOpenAdd(false);
            window.dispatchEvent(new Event("workos:changed"));
          }}
        />
      )}
    </header>
  );
}

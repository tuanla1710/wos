"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NoteList } from "@/components/notes/NoteList";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { attachBundleImages, NOTE_IMPORT_ACCEPT, readNoteFile, uploadNoteImage } from "@/lib/noteFile";
import type { WorkNote } from "@/lib/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mine", label: "My Notes" },
  { id: "pinned", label: "Pinned" },
  { id: "lecture", label: "Lecture" },
  { id: "archived", label: "Archived" },
] as const;

export default function NotesPage() {
  const router = useRouter();
  const { me } = useApp();
  const guest = me?.workspace?.role === "guest";
  const file = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load(nextFilter = filter, nextQ = q) {
    try {
      const kind = nextFilter === "lecture" ? "&kind=lecture" : "";
      const apiFilter = nextFilter === "lecture" ? "all" : nextFilter;
      const data = await api<{ notes: WorkNote[] }>(`/api/notes?filter=${apiFilter}&q=${encodeURIComponent(nextQ)}${kind}`);
      setNotes(data.notes);
    } catch {
      /* AppProvider */
    }
  }

  useEffect(() => {
    void load();
  }, [filter]);

  async function create() {
    const n = await api<WorkNote>("/api/notes", { method: "POST", body: JSON.stringify({ kind: "work" }) });
    router.push(`/notes/${n.id}`);
  }

  const empty =
    filter === "archived"
      ? "Nothing archived."
      : q
        ? "No notes match. Clear search or change filter."
        : guest
          ? "Only notes from invited projects."
          : filter === "lecture"
            ? "Lectures are for teaching. Tasks are for doing."
            : "Notes are for writing. Tasks are for doing.";

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Notes</h1>
        {!guest && (
          <div className="flex gap-2">
            <input ref={file} type="file" accept={NOTE_IMPORT_ACCEPT} multiple className="hidden" onChange={async (e) => {
              const list = e.target.files;
              e.target.value = "";
              if (!list?.length) return;
              setError("");
              try {
                let last = "";
                for (const f of [...list]) {
                  const bundle = await readNoteFile(f);
                  const n = await api<WorkNote>("/api/notes", { method: "POST", body: JSON.stringify({ title: bundle.title, body: bundle.body, kind: "work" }) });
                  if (Object.keys(bundle.images).length) {
                    const body = await attachBundleImages(bundle, (img) => uploadNoteImage(n.id, img));
                    await api(`/api/notes/${n.id}`, { method: "PATCH", body: JSON.stringify({ body }) });
                  }
                  last = n.id;
                }
                await load();
                if (list.length === 1 && last) router.push(`/notes/${last}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Couldn’t import.");
              }
            }} />
            <button type="button" className="h-9 rounded px-3 text-sm hover:bg-hover" onClick={() => file.current?.click()}>
              Import
            </button>
            <button type="button" className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover" onClick={() => void create()}>
              Add Note
            </button>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load(filter, q)}
          placeholder="Search notes…"
          className="h-9 min-w-[200px] flex-1 rounded-md border-0 bg-hover px-3 text-sm placeholder:text-faint"
        />
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`h-8 rounded-full px-3 text-[12px] ${filter === f.id ? "bg-accent-soft font-semibold text-accent" : "border border-line text-muted"}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-overdue">{error}</p>}
      <div className="mt-6">
        <NoteList notes={notes} empty={empty} onOpen={(n) => router.push(`/notes/${n.id}`)} onChange={() => void load()} />
      </div>
    </div>
  );
}

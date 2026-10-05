"use client";

import { NoteCard } from "@/components/notes/NoteCard";
import type { WorkNote } from "@/lib/types";

export function NoteList({
  notes,
  empty,
  onOpen,
  onChange,
}: {
  notes: WorkNote[];
  empty: string;
  onOpen: (note: WorkNote) => void;
  onChange: () => void;
}) {
  if (notes.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="divide-y divide-line">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onOpen={() => onOpen(note)} onChange={onChange} />
      ))}
    </div>
  );
}

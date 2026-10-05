"use client";

import { PinGlyph, StarGlyph } from "@/components/icons/AppIcons";
import { NoteMenu } from "@/components/notes/NoteMenu";
import { formatNoteTime, kindLabel } from "@/lib/noteMd";
import type { WorkNote } from "@/lib/types";

export function NoteCard({ note, onOpen, onChange }: { note: WorkNote; onOpen: () => void; onChange: () => void }) {
  return (
    <article className="rounded-md px-2 py-3 hover:bg-hover">
      <div className="flex items-start gap-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="flex items-center gap-2">
            {note.pinned && <PinGlyph size={14} className="text-accent" />}
            {note.starred && <StarGlyph size={14} filled className="text-accent" />}
            <p className="truncate text-sm font-semibold">{note.title || "Untitled"}</p>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {note.pinned ? "Pinned · " : ""}
            {kindLabel(note.kind)} · {formatNoteTime(note.updated_at)} · {note.author_name}
            {note.task_title ? ` · ${note.task_title}` : ""}
            {note.file_count ? ` · ${note.file_count} file${note.file_count === 1 ? "" : "s"}` : ""}
          </p>
          {note.snippet && <p className="mt-2 text-sm leading-6 text-ink/90">{note.snippet}</p>}
          {note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>
        <NoteMenu note={note} onChange={onChange} onOpen={onOpen} />
      </div>
    </article>
  );
}

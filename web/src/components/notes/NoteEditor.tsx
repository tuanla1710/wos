"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftGlyph } from "@/components/icons/AppIcons";
import { LectureTeach } from "@/components/notes/LectureTeach";
import { NoteFindReplace } from "@/components/notes/NoteFindReplace";
import { NoteMarkdown } from "@/components/notes/NoteMarkdown";
import { NoteMenu } from "@/components/notes/NoteMenu";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { downloadTxt, readTxtFile } from "@/lib/noteFile";
import {
  CODE_LANGS,
  formatFileSize,
  formatNoteTime,
  getLastCodeLang,
  insertCodeFence,
  insertExercise,
  insertLinePrefix,
  insertWrap,
  kindLabel,
  LECTURE_SKELETON,
  MEETING_SKELETON,
  setLastCodeLang,
} from "@/lib/noteMd";
import type { NoteActivity, NoteKind, Task, WorkNote } from "@/lib/types";

const KINDS: NoteKind[] = ["quick", "work", "meeting", "lecture"];

export function NoteEditor({ initial, onSaved }: { initial: WorkNote; onSaved?: (note: WorkNote) => void }) {
  const router = useRouter();
  const { me, projects } = useApp();
  const guest = me?.workspace?.role === "guest";
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const skip = useRef(true);
  const inflight = useRef<Promise<WorkNote | void> | null>(null);
  const [note, setNote] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body ?? "");
  const [kind, setKind] = useState<NoteKind>(initial.kind);
  const [mode, setMode] = useState<"author" | "teach">(guest && initial.kind === "lecture" ? "teach" : "author");
  const [lang, setLang] = useState(getLastCodeLang());
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [taskId, setTaskId] = useState(initial.task_id ?? "");
  const [projectId, setProjectId] = useState(initial.project_id ?? "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [history, setHistory] = useState<NoteActivity[]>([]);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [findSeed, setFindSeed] = useState("");
  const lecture = kind === "lecture";
  const teach = lecture && (guest || mode === "teach");
  const canEdit = !guest;

  async function loadHistory() {
    const d = await api<{ activity: NoteActivity[] }>(`/api/notes/${initial.id}/activity`);
    setHistory(d.activity);
  }

  useEffect(() => {
    void api<{ tasks: Task[] }>("/api/tasks?tab=all").then((d) => setTasks(d.tasks)).catch(() => {});
    void loadHistory().catch(() => {});
  }, [initial.id]);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    if (!canEdit) return;
    setStatus("unsaved");
    const t = setTimeout(() => {
      inflight.current = persist().finally(() => {
        inflight.current = null;
      });
    }, 800);
    return () => clearTimeout(t);
  }, [title, body, kind, tags, taskId, projectId, canEdit]);

  function openFind(replace = false) {
    setPreview(false);
    const el = area.current;
    const picked = el && el.selectionStart !== el.selectionEnd ? body.slice(el.selectionStart, el.selectionEnd) : "";
    setFindSeed(picked);
    setReplaceMode(replace);
    setFindOpen(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (teach) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openFind(false);
      }
      if (meta && e.key.toLowerCase() === "h") {
        e.preventDefault();
        openFind(true);
      }
      if (e.key === "Escape" && findOpen) {
        e.preventDefault();
        setFindOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [body, findOpen, teach]);

  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (status !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  async function persist(extra?: Record<string, unknown>) {
    if (!canEdit) return note;
    setStatus("saving");
    const payload: Record<string, unknown> = {
      title,
      body,
      kind,
      tags: tags
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      ...extra,
    };
    if (taskId) payload.task_id = taskId;
    else payload.clear_task = true;
    if (projectId) payload.project_id = projectId;
    else payload.clear_project = true;
    const next = await api<WorkNote>(`/api/notes/${note.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    setNote(next);
    if (kind === "lecture" && !body.trim() && next.body) {
      skip.current = true;
      setBody(next.body);
    }
    onSaved?.(next);
    setStatus("saved");
    void loadHistory().catch(() => {});
    return next;
  }

  async function leave() {
    if (inflight.current) await inflight.current;
    else if (status === "unsaved" && canEdit) await persist();
    router.push("/notes");
  }

  function apply(next: string, cursor: number) {
    setBody(next);
    requestAnimationFrame(() => {
      const el = area.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function wrap(before: string, after = before) {
    const el = area.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const result = insertWrap(body, start, end, before, after);
    apply(result.next, result.cursor);
  }

  function prefix(value: string) {
    const el = area.current;
    const start = el?.selectionStart ?? 0;
    const result = insertLinePrefix(body, start, value);
    apply(result.next, result.cursor);
  }

  function pickKind(k: NoteKind) {
    setKind(k);
    if (k !== "lecture") setMode("author");
    if (k === "meeting" && !body.trim()) setBody(MEETING_SKELETON);
    if (k === "lecture" && !body.trim()) setBody(LECTURE_SKELETON);
  }

  function insertCode() {
    const el = area.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const result = insertCodeFence(body, start, end, lang);
    apply(result.next, result.cursor);
  }

  function insertExerciseBlock() {
    const el = area.current;
    const start = el?.selectionStart ?? body.length;
    const result = insertExercise(body, start);
    apply(result.next, result.cursor);
  }

  return (
    <div className={`mx-auto flex w-full flex-col gap-4 p-6 ${teach ? "max-w-[1100px]" : "max-w-[880px]"}`}>
      <div className="flex items-center gap-2">
        <button type="button" className="icon-btn h-8 w-8" onClick={() => void leave()}>
          <ArrowLeftGlyph size={15} />
        </button>
        <p className="text-[12px] text-muted">{status === "saved" ? "Saved" : status === "saving" ? "Saving…" : "Unsaved"}</p>
        {canEdit && !teach && (
          <button type="button" className={`ml-auto h-8 rounded px-3 text-[12px] ${preview ? "bg-hover" : "text-muted"}`} onClick={() => setPreview((v) => !v)}>
            {preview ? "Edit" : "Preview"}
          </button>
        )}
        {canEdit && (
          <button type="button" className={`${teach || preview ? "ml-auto" : ""} h-8 rounded-lg bg-accent px-3 text-[12px] font-semibold text-white`} onClick={() => void persist()}>
            Save
          </button>
        )}
        <NoteMenu
          note={{ ...note, title, tags: tags.split(",").map((v) => v.trim()).filter(Boolean) }}
          onOpen={() => {}}
          onChange={() => {
            void api<WorkNote>(`/api/notes/${note.id}`)
              .then((next) => {
                setNote(next);
                setTaskId(next.task_id ?? "");
                setProjectId(next.project_id ?? "");
                setTags((next.tags ?? []).join(", "));
                skip.current = true;
                void loadHistory().catch(() => {});
              })
              .catch(() => router.push("/notes"));
          }}
        />
      </div>

      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={`h-8 rounded-full px-3 text-[12px] ${kind === k ? "bg-accent-soft font-semibold text-accent" : "border border-line text-muted"}`}
                onClick={() => pickKind(k)}
              >
                {kindLabel(k)}
              </button>
            ))}
          </div>
          {lecture && (
            <div className="inline-flex h-8 overflow-hidden rounded-lg border border-line">
              {(["author", "teach"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`h-8 px-3 text-[12px] ${mode === m ? "bg-accent-soft font-semibold text-accent" : "text-muted"}`}
                  onClick={() => {
                    setMode(m);
                    if (m === "teach") setPreview(false);
                  }}
                >
                  {m === "author" ? "Author" : "Teach"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!teach && (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          readOnly={!canEdit}
          className="w-full border-0 bg-transparent text-[32px] font-semibold leading-10 tracking-tight outline-none placeholder:text-faint"
        />
      )}

      {teach && <LectureTeach title={title} body={body} onAuthor={canEdit ? () => setMode("author") : undefined} />}

      {!teach && !preview && canEdit && (
        <>
          <div className="flex flex-wrap gap-1 text-[12px]">
            <Tool onClick={() => wrap("**")}>B</Tool>
            <Tool onClick={() => wrap("*")}>I</Tool>
            <Tool onClick={() => prefix("# ")}>H1</Tool>
            <Tool onClick={() => prefix("- ")}>List</Tool>
            <Tool onClick={() => prefix("- [ ] ")}>Checkbox</Tool>
            <Tool onClick={() => wrap("[", "](https://)")}>Link</Tool>
            <Tool onClick={() => file.current?.click()}>Attach</Tool>
            <button type="button" className="h-8 rounded px-2 text-muted hover:bg-hover" onClick={() => downloadTxt(title, body)}>
              Export
            </button>
            <button type="button" className={`h-8 rounded px-2 ${findOpen ? "bg-hover text-ink" : "text-muted hover:bg-hover"}`} onClick={() => openFind(false)}>
              Find
            </button>
          </div>
          {lecture && (
            <div className="flex flex-wrap items-center gap-1 text-[12px]">
              <div className="inline-flex h-8 overflow-hidden rounded border border-line">
                <button type="button" className="h-8 px-2 font-semibold text-muted hover:bg-hover hover:text-ink" onClick={insertCode}>
                  Code
                </button>
                <select
                  value={lang}
                  className="h-8 border-l border-line bg-transparent px-2 text-[12px] outline-none"
                  onChange={(e) => setLang(setLastCodeLang(e.target.value))}
                >
                  {CODE_LANGS.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </div>
              <Tool onClick={() => prefix("> TIP: ")}>Tip</Tool>
              <Tool onClick={() => prefix("> WARNING: ")}>Warn</Tool>
              <Tool onClick={() => prefix("> PITFALL: ")}>Pitfall</Tool>
              <Tool onClick={insertExerciseBlock}>Exercise</Tool>
            </div>
          )}
          <NoteFindReplace
            open={findOpen}
            replaceMode={replaceMode}
            body={body}
            canReplace={canEdit}
            textarea={area}
            initialQuery={findSeed}
            onBody={setBody}
            onClose={() => setFindOpen(false)}
            onReplaceMode={setReplaceMode}
          />
          <textarea
            ref={area}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the note…"
            className={`min-h-[360px] w-full resize-none border-0 bg-transparent p-0 outline-none placeholder:text-faint ${lecture ? "font-mono text-sm leading-[22px]" : "text-base leading-7"}`}
          />
        </>
      )}
      {!teach && preview && <NoteMarkdown src={body} />}
      {!teach && !preview && !canEdit && <NoteMarkdown src={body} />}

      <input
        ref={file}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) return;
          const data = new FormData();
          data.append("file", picked);
          await api(`/api/notes/${note.id}/attachments`, { method: "POST", body: data });
          setNote(await api<WorkNote>(`/api/notes/${note.id}`));
          void loadHistory().catch(() => {});
        }}
      />

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <label>
          <span className="text-[12px] text-muted">Tags</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ptp, du" readOnly={!canEdit} className="mt-1 h-9 w-full rounded border border-line px-3" />
        </label>
        <label>
          <span className="text-[12px] text-muted">Related task</span>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={!canEdit} className="mt-1 h-9 w-full rounded border border-line px-2">
            <option value="">None</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {lecture && <p className="mt-1 text-[12px] text-muted">Related task is homework. It is not created from the checkboxes.</p>}
          {taskId && (
            <button type="button" className="mt-1 text-[12px] text-accent" onClick={() => router.push(`/tasks/${taskId}`)}>
              Open task
            </button>
          )}
        </label>
        <label>
          <span className="text-[12px] text-muted">Related project</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!canEdit} className="mt-1 h-9 w-full rounded border border-line px-2">
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(note.files?.length ?? 0) > 0 && (
        <div>
          <p className="section-label">Files</p>
          <div className="mt-2 space-y-1 text-sm">
            {note.files?.map((f) => (
              <div key={f.id} className="flex h-9 items-center gap-2">
                <a className="flex-1 truncate text-accent" href={`/api/notes/${note.id}/attachments/${f.id}`}>
                  {f.filename}
                </a>
                <span className="text-[12px] text-muted">{formatFileSize(f.size_bytes)}</span>
                {canEdit && (
                  <button
                    type="button"
                    className="text-overdue"
                    onClick={async () => {
                      await api(`/api/notes/${note.id}/attachments/${f.id}`, { method: "DELETE" });
                      setNote(await api<WorkNote>(`/api/notes/${note.id}`));
                      void loadHistory().catch(() => {});
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="section-label">History</p>
        <div className="mt-2 space-y-1 text-[12px] text-muted">
          {history.length === 0 && <p>No history yet.</p>}
          {history.map((row) => (
            <p key={row.id}>
              {row.actor} · {row.summary} · {formatNoteTime(row.created_at)}
            </p>
          ))}
        </div>
      </div>

      {canEdit && (
        <label className="text-[12px] text-muted">
          Import .txt
          <input
            type="file"
            accept=".txt,text/plain"
            className="mt-1 block"
            onChange={async (e) => {
              const picked = e.target.files?.[0];
              e.target.value = "";
              if (!picked) return;
              const parsed = await readTxtFile(picked);
              if (!title || title === "Untitled") setTitle(parsed.title);
              setBody(parsed.body);
            }}
          />
        </label>
      )}
    </div>
  );
}

function Tool({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="h-8 rounded px-2 font-semibold text-muted hover:bg-hover hover:text-ink" onClick={onClick}>
      {children}
    </button>
  );
}

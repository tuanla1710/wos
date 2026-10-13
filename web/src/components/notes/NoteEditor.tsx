"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftGlyph } from "@/components/icons/AppIcons";
import { LectureTeach } from "@/components/notes/LectureTeach";
import { NoteFindReplace } from "@/components/notes/NoteFindReplace";
import { NoteMarkdown } from "@/components/notes/NoteMarkdown";
import { NoteMenu } from "@/components/notes/NoteMenu";
import { RichNoteEditor } from "@/components/notes/RichNoteEditor";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { attachBundleImages, downloadMd, downloadTxt, downloadZip, NOTE_IMPORT_ACCEPT, readNoteFile } from "@/lib/noteFile";
import { markdownFromPaste } from "@/lib/pasteHtml";
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
const isVoiceClip = (f: { filename: string }) => /\.mp3$/i.test(f.filename);

export function NoteEditor({ initial, onSaved }: { initial: WorkNote; onSaved?: (note: WorkNote) => void }) {
  const router = useRouter();
  const { me, projects } = useApp();
  const guest = me?.workspace?.role === "guest";
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const importFile = useRef<HTMLInputElement>(null);
  const [fileMsg, setFileMsg] = useState("");
  const skip = useRef(true);
  const plainPaste = useRef(false);
  const inflight = useRef<Promise<WorkNote | void> | null>(null);
  const [note, setNote] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body ?? "");
  const [kind, setKind] = useState<NoteKind>(initial.kind);
  const openLecture = initial.kind === "lecture" && (guest || !!initial.body?.trim());
  const [mode, setMode] = useState<"author" | "teach">(openLecture ? "teach" : "author");
  const [lang, setLang] = useState(getLastCodeLang());
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [taskId, setTaskId] = useState(initial.task_id ?? "");
  const [projectId, setProjectId] = useState(initial.project_id ?? "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [preview, setPreview] = useState(openLecture);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [history, setHistory] = useState<NoteActivity[]>([]);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [findSeed, setFindSeed] = useState("");
  const lecture = kind === "lecture";
  const teach = lecture && (guest || mode === "teach");
  const canEdit = !guest;
  const rich = canEdit && !lecture;

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
      if (teach || rich) return;
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
  }, [body, findOpen, teach, rich]);

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

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const md = markdownFromPaste(e.clipboardData, plainPaste.current);
    plainPaste.current = false;
    if (!md) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = body.slice(0, start);
    const lead = before && !before.endsWith("\n") && md.includes("\n") ? "\n" : "";
    const text = lead + md;
    apply(before + text + body.slice(end), start + text.length);
  }

  async function uploadFile(picked: File) {
    const data = new FormData();
    data.append("file", picked);
    const row = await api<{ id: string }>(`/api/notes/${note.id}/attachments`, { method: "POST", body: data });
    setNote(await api<WorkNote>(`/api/notes/${note.id}`));
    void loadHistory().catch(() => {});
    return row;
  }

  async function uploadImage(picked: File) {
    const row = await uploadFile(picked);
    return `/api/notes/${note.id}/attachments/${row.id}`;
  }

  async function exportAs(format: "zip" | "md" | "txt") {
    setFileMsg("");
    try {
      if (format === "zip") await downloadZip(title, body);
      else if (format === "md") downloadMd(title, body);
      else downloadTxt(title, body);
    } catch {
      setFileMsg("Couldn’t export.");
    }
  }

  async function importInto(picked: File) {
    setFileMsg("");
    try {
      const bundle = await readNoteFile(picked);
      if (body.trim() && !window.confirm(`Replace this note with “${picked.name}”?`)) return;
      if (Object.keys(bundle.images).length) setFileMsg("Uploading images…");
      const next = await attachBundleImages(bundle, uploadImage);
      if (!title.trim() || title === "Untitled") setTitle(bundle.title);
      setBody(next);
      setFileMsg("");
    } catch (err) {
      setFileMsg(err instanceof Error ? err.message : "Couldn’t import.");
    }
  }

  const fileTools = (
    <>
      <details className="relative">
        <summary className="flex h-8 cursor-pointer list-none items-center rounded px-2 font-semibold text-muted hover:bg-hover hover:text-ink">Export</summary>
        <div className="absolute left-0 top-9 z-20 w-56 rounded-lg border border-line bg-elev p-1 shadow-popover">
          {(
            [
              ["zip", ".zip — Markdown + images"],
              ["md", ".md — Markdown only"],
              ["txt", ".txt — plain text"],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              className="block h-8 w-full rounded px-2 text-left text-[12px] hover:bg-hover"
              onClick={(e) => {
                (e.currentTarget.closest("details") as HTMLDetailsElement).open = false;
                void exportAs(f);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </details>
      <button type="button" className="h-8 rounded px-2 font-semibold text-muted hover:bg-hover hover:text-ink" onClick={() => importFile.current?.click()}>
        Import
      </button>
      {fileMsg && <span className="ml-1 text-[12px] text-muted">{fileMsg}</span>}
    </>
  );

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
        {canEdit && !teach && !rich && (
          <button type="button" className={`ml-auto h-8 rounded px-3 text-[12px] ${preview ? "bg-hover" : "text-muted"}`} onClick={() => setPreview((v) => !v)}>
            {preview ? "Edit" : "Preview"}
          </button>
        )}
        {canEdit && (
          <button type="button" className={`${teach || preview || rich ? "ml-auto" : ""} btn-primary h-8 px-3 text-[12px]`} onClick={() => void persist()}>
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

      {rich && (
        <RichNoteEditor
          value={body}
          onChange={setBody}
          upload={uploadImage}
          onAttach={() => file.current?.click()}
          onMarkdownFile={(name) => {
            if (!title.trim() || title === "Untitled") setTitle(name);
          }}
          tools={fileTools}
        />
      )}

      {!teach && !preview && canEdit && !rich && (
        <>
          <div className="flex flex-wrap gap-1 text-[12px]">
            <Tool onClick={() => wrap("**")}>B</Tool>
            <Tool onClick={() => wrap("*")}>I</Tool>
            <Tool onClick={() => prefix("# ")}>H1</Tool>
            <Tool onClick={() => prefix("- ")}>List</Tool>
            <Tool onClick={() => prefix("- [ ] ")}>Checkbox</Tool>
            <Tool onClick={() => wrap("[", "](https://)")}>Link</Tool>
            <Tool onClick={() => file.current?.click()}>Attach</Tool>
            {fileTools}
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
              <Tool
                onClick={() => {
                  const sample = "```mermaid\nflowchart LR\n  A[Start] --> B[Done]\n```\n";
                  const el = area.current;
                  const start = el?.selectionStart ?? body.length;
                  const end = el?.selectionEnd ?? body.length;
                  const lead = start > 0 && body[start - 1] !== "\n" ? "\n\n" : "";
                  apply(body.slice(0, start) + lead + sample + body.slice(end), start + lead.length + sample.length);
                }}
              >
                Mermaid
              </Tool>
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
            onKeyDown={(e) => {
              plainPaste.current = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "v";
            }}
            onPaste={onPaste}
            onDrop={(e) => {
              const docs = Array.from(e.dataTransfer.files).filter((f) => /\.(md|markdown|txt)$/i.test(f.name));
              if (!docs.length) return;
              e.preventDefault();
              void (async () => {
                const chunks = await Promise.all(docs.map((f) => f.text()));
                const text = chunks.map((t) => t.replace(/\r\n/g, "\n")).join("\n\n");
                if (!title.trim() || title === "Untitled") setTitle(docs[0].name.replace(/\.(md|markdown|txt)$/i, ""));
                setBody(body.trim() ? `${body}\n\n${text}` : text);
              })();
            }}
            placeholder="Write Markdown…"
            className={`min-h-[360px] w-full resize-none border-0 bg-transparent p-0 outline-none placeholder:text-faint ${lecture ? "font-mono text-sm leading-[22px]" : "text-base leading-7"}`}
          />
        </>
      )}
      {!teach && preview && !rich && <NoteMarkdown src={body} />}
      {!teach && !preview && !canEdit && <NoteMarkdown src={body} />}

      <input
        ref={file}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) return;
          await uploadFile(picked);
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
            {note.files?.some(isVoiceClip) && (
              <p className="flex h-9 items-center text-muted">{note.files.filter(isVoiceClip).length} coach voice clips</p>
            )}
            {note.files?.filter((f) => !isVoiceClip(f)).map((f) => (
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
        <input
          ref={importFile}
          type="file"
          accept={NOTE_IMPORT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (picked) void importInto(picked);
          }}
        />
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

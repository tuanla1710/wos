export const MEETING_SKELETON = `## Meeting
Date: ${new Date().toISOString().slice(0, 10)}

## Participants
- 

## Discussion
- 

## Decision
- 

## Action items
- [ ] `;

export const LECTURE_SKELETON = `# Lesson title

Level: beginner
Duration: 45 min
Language: python

## Objective
- 

## Why this matters
- 

## Outline
1. 
2. 
3. 

## Step 1
Explain.

\`\`\`python
# type here
\`\`\`

> TIP: 

## Exercise
Do this.

Expected:

\`\`\`text

\`\`\`

## Pitfalls
> PITFALL: 

## Recap
- 

## Homework
- [ ] `;

export const EXERCISE_BLOCK = `## Exercise
Do this.

Expected:

\`\`\`text

\`\`\`
`;

export const CODE_LANGS = [
  { id: "python", label: "Python" },
  { id: "c", label: "C" },
  { id: "ts", label: "TypeScript" },
  { id: "bash", label: "Bash" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
  { id: "text", label: "Text" },
] as const;

export type CodeLang = (typeof CODE_LANGS)[number]["id"];
export type CalloutKind = "tip" | "warning" | "pitfall";
export type LectureMeta = { level: string; duration: string; language: string; when: string; project: string };
export type LectureBeat = { title: string; body: string };
export type BeatPhase = "start" | "hook" | "explore" | "build" | "practice" | "wrap";
export type BeatVariant = "objective" | "story" | "questions" | "mistakes" | "pass" | "homework" | "next" | "default";
export type MdBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "li"; text: string }
  | { type: "ol"; n: number; text: string }
  | { type: "quote"; text: string }
  | { type: "check"; text: string; done: boolean }
  | { type: "code"; lang: string; code: string }
  | { type: "callout"; kind: CalloutKind; text: string }
  | { type: "spacer" };

let lastCodeLang: CodeLang = "python";

export function getLastCodeLang(): CodeLang {
  return lastCodeLang;
}

export function setLastCodeLang(lang: string): CodeLang {
  const hit = CODE_LANGS.find((row) => row.id === lang);
  lastCodeLang = hit ? hit.id : "python";
  return lastCodeLang;
}

export function formatNoteTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function kindLabel(kind: string) {
  if (kind === "quick") return "Quick";
  if (kind === "meeting") return "Meeting";
  if (kind === "lecture") return "Lecture";
  return "Work";
}

export function hasLectureSkeleton(body: string) {
  return /^# Lesson\b/m.test(body) || /^## Objective\b/m.test(body);
}

export function insertWrap(body: string, start: number, end: number, before: string, after = "") {
  const selected = body.slice(start, end) || "text";
  const next = body.slice(0, start) + before + selected + after + body.slice(end);
  return { next, cursor: start + before.length + selected.length + after.length };
}

export function insertLinePrefix(body: string, start: number, prefix: string) {
  const lineStart = body.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const next = body.slice(0, lineStart) + prefix + body.slice(lineStart);
  return { next, cursor: start + prefix.length };
}

export function insertCodeFence(body: string, start: number, end: number, lang: string) {
  const inner = body.slice(start, end);
  const before = "```" + (lang || "text") + "\n";
  const after = "\n```";
  const next = body.slice(0, start) + before + inner + after + body.slice(end);
  return { next, cursor: start + before.length + inner.length };
}

function headingAt(body: string, start: number) {
  const before = body.slice(0, start);
  const idx = before.lastIndexOf("\n## ");
  const from = idx >= 0 ? idx + 1 : before.startsWith("## ") ? 0 : -1;
  if (from < 0) return "";
  return body.slice(from).split("\n")[0] ?? "";
}

export function insertExercise(body: string, start: number) {
  if (/^## Exercise\b/i.test(headingAt(body, start))) return { next: body, cursor: start };
  const prefix = start === 0 ? "" : body[start - 1] === "\n" ? "\n" : "\n\n";
  const block = prefix + EXERCISE_BLOCK;
  return { next: body.slice(0, start) + block + body.slice(start), cursor: start + block.length };
}

export function lectureMeta(body: string): LectureMeta {
  const meta: LectureMeta = { level: "", duration: "", language: "", when: "", project: "" };
  for (const line of body.split("\n")) {
    if (line.startsWith("## ")) break;
    const m = /^(Level|Duration|Language|When|Project):\s*(.*)$/i.exec(line.trim());
    if (!m) continue;
    const value = m[2].trim();
    if (!value) continue;
    const key = m[1].toLowerCase() as keyof LectureMeta;
    meta[key] = value;
  }
  return meta;
}

const PHASE_OF: Record<string, BeatPhase> = {
  plan: "start",
  spec: "start",
  choose: "hook",
  design: "explore",
  debug: "practice",
  improve: "practice",
  polish: "practice",
  readme: "practice",
  demo: "wrap",
  review: "wrap",
  objective: "start",
  goal: "start",
  today: "start",
  note: "start",
  "parent prep": "start",
  rules: "start",
  "choose one": "start",
  story: "hook",
  ask: "hook",
  game: "hook",
  unplugged: "explore",
  explain: "explore",
  think: "explore",
  draw: "explore",
  problem: "explore",
  lesson: "explore",
  build: "build",
  sample: "build",
  scratch: "build",
  python: "build",
  algorithm: "build",
  code: "build",
  practice: "practice",
  challenge: "practice",
  test: "practice",
  exercise: "practice",
  transfer: "practice",
  mistakes: "wrap",
  check: "wrap",
  homework: "wrap",
  pass: "wrap",
  next: "wrap",
  "eight questions": "wrap",
  badge: "wrap",
};

function beatKey(title: string) {
  return title.trim().toLowerCase().split(/\s+[—–-]\s+/)[0];
}

export function beatPhase(title: string, fallback: BeatPhase = "explore"): BeatPhase {
  const key = beatKey(title);
  if (key.startsWith("saturday") || key.startsWith("sunday")) return "build";
  return PHASE_OF[key] ?? fallback;
}

export function beatVariant(title: string): BeatVariant {
  const key = beatKey(title);
  if (key === "objective" || key === "goal") return "objective";
  if (key === "story") return "story";
  if (key === "ask" || key === "check" || key === "eight questions") return "questions";
  if (key === "mistakes") return "mistakes";
  if (key === "pass") return "pass";
  if (key === "homework") return "homework";
  if (key === "next") return "next";
  return "default";
}

export function beatPhases(beats: LectureBeat[]): BeatPhase[] {
  let last: BeatPhase = "start";
  return beats.map((b) => {
    last = beatPhase(b.title, last);
    return last;
  });
}

export function lectureMetaLabel(meta: LectureMeta) {
  return [meta.level, meta.duration, meta.language].filter(Boolean).join(" · ");
}

export function lectureBeats(src: string): LectureBeat[] {
  const beats: LectureBeat[] = [];
  let current: LectureBeat | null = null;
  for (const line of src.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) beats.push(current);
      current = { title: line.slice(3).trim() || "Untitled", body: "" };
      continue;
    }
    if (!current) continue;
    current.body += current.body ? `\n${line}` : line;
  }
  if (current) beats.push(current);
  return beats;
}

export function outlineLabel(title: string) {
  const t = title.trim();
  return t.length > 28 ? `${t.slice(0, 28)}…` : t;
}

export function parseMarkdownBlocks(src: string): MdBlock[] {
  const lines = src.split("\n");
  const out: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const raw = line.slice(3).trim().toLowerCase();
      const lang = raw.replace(/[^a-z0-9_-]/g, "") || "text";
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      out.push({ type: "code", lang, code: buf.join("\n") });
      continue;
    }
    const call = /^> (TIP|WARNING|PITFALL):\s?(.*)$/i.exec(line);
    if (call) {
      const kind = call[1].toLowerCase() as CalloutKind;
      const parts = [call[2] ?? ""];
      i += 1;
      while (i < lines.length && lines[i].startsWith(">")) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push({ type: "callout", kind, text: parts.join("\n").trim() });
      continue;
    }
    if (line.startsWith("# ")) {
      out.push({ type: "h1", text: line.slice(2) });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push({ type: "h2", text: line.slice(3) });
      i += 1;
      continue;
    }
    if (/^- \[[ xX]\] /.test(line)) {
      out.push({ type: "check", done: /^- \[[xX]\] /.test(line), text: line.replace(/^- \[[ xX]\] /, "") });
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      out.push({ type: "li", text: line.slice(2) });
      i += 1;
      continue;
    }
    const ol = /^(\d{1,3})\. (.*)$/.exec(line);
    if (ol) {
      out.push({ type: "ol", n: Number(ol[1]), text: ol[2] });
      i += 1;
      continue;
    }
    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith(">") && !/^> (TIP|WARNING|PITFALL):/i.test(lines[i])) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push({ type: "quote", text: parts.join("\n").trim() });
      continue;
    }
    if (!line.trim()) {
      out.push({ type: "spacer" });
      i += 1;
      continue;
    }
    out.push({ type: "p", text: line });
    i += 1;
  }
  return out;
}

function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderMarkdown(src: string) {
  return parseMarkdownBlocks(src)
    .map((block) => {
      if (block.type === "h1") return `<h1 class="mb-2 text-lg font-semibold">${inline(esc(block.text))}</h1>`;
      if (block.type === "h2") return `<h2 class="mb-1 mt-3 text-sm font-semibold">${inline(esc(block.text))}</h2>`;
      if (block.type === "check") {
        return `<p class="flex gap-2 text-sm ${block.done ? "text-muted line-through" : ""}"><span>${block.done ? "[x]" : "[ ]"}</span><span>${inline(esc(block.text))}</span></p>`;
      }
      if (block.type === "li") return `<p class="text-sm">• ${inline(esc(block.text))}</p>`;
      if (block.type === "ol") return `<p class="text-sm"><span class="font-semibold tabular-nums">${block.n}.</span> ${inline(esc(block.text))}</p>`;
      if (block.type === "quote") return `<blockquote class="my-2 border-l-[3px] border-line pl-3 text-sm italic text-muted">${inline(esc(block.text))}</blockquote>`;
      if (block.type === "code") {
        return `<pre class="overflow-x-auto rounded-lg bg-hover p-3 font-mono text-[13px] leading-5"><code>${esc(block.code)}</code></pre>`;
      }
      if (block.type === "callout") {
        const tip = block.kind === "tip";
        const box = tip ? "border-accent bg-accent-soft text-accent" : "border-overdue bg-[#FDF2F0] text-overdue";
        return `<div class="my-2 rounded-lg border-l-[3px] p-3 ${box}"><p class="text-[11px] font-semibold uppercase tracking-wide">${block.kind}</p><p class="mt-1 text-sm leading-[22px] text-ink">${inline(esc(block.text))}</p></div>`;
      }
      if (block.type === "spacer") return "<div class='h-2'></div>";
      return `<p class="text-sm leading-6">${inline(esc(block.text))}</p>`;
    })
    .join("");
}

function inline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code class="rounded bg-hover px-1 font-mono text-[12px]">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a class="text-accent underline" href="$2" target="_blank" rel="noreferrer">$1</a>');
}

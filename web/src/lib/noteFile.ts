import JSZip from "jszip";
import { workspaceId } from "./api";

const MAX_TXT_BYTES = 1_500_000;
const MAX_ZIP_BYTES = 50 * 1024 * 1024;
const SERVER_IMAGE = /!\[([^\]]*)\]\((\/api\/notes\/[^)\s]+)\)/g;
const ANY_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "image/svg+xml": "svg" };
const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };

export const NOTE_IMPORT_ACCEPT = ".md,.markdown,.txt,.zip,text/plain,text/markdown,application/zip";

export type NoteBundle = { title: string; body: string; images: Record<string, Blob> };

export function titleFromFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() || "Untitled";
  return (
    base
      .replace(/\.(txt|md|markdown|zip)$/i, "")
      .replace(/\s+[0-9a-f]{32}$/i, "")
      .trim()
      .slice(0, 160) || "Untitled"
  );
}

function safeName(title: string) {
  return (title || "note").replace(/[\\/:*?"<>|]+/g, "-").trim() || "note";
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTxt(title: string, body: string) {
  const safe = safeName(title);
  const filename = safe.toLowerCase().endsWith(".txt") ? safe : `${safe}.txt`;
  save(new Blob([body ?? ""], { type: "text/plain;charset=utf-8" }), filename);
}

export function downloadMd(title: string, body: string) {
  save(new Blob([body ?? ""], { type: "text/markdown;charset=utf-8" }), `${safeName(title)}.md`);
}

/** Zip with `<title>.md` plus `images/`, image links rewritten to relative paths. */
export async function downloadZip(title: string, body: string) {
  const zip = new JSZip();
  const folder = zip.folder("images")!;
  const ws = workspaceId();
  const seen = new Map<string, string>();
  let n = 0;
  for (const m of (body ?? "").matchAll(SERVER_IMAGE)) {
    const src = m[2];
    if (seen.has(src)) continue;
    const res = await fetch(src, { credentials: "include", headers: ws ? { "X-Workspace-Id": ws } : {} });
    if (!res.ok) continue;
    const blob = await res.blob();
    n += 1;
    const stem = (m[1] || "image").replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "image";
    const ext = EXT[blob.type] ?? (/\.([a-z0-9]+)$/i.exec(m[1])?.[1]?.toLowerCase() || "png");
    const name = `${n}-${stem}.${ext}`;
    folder.file(name, blob);
    seen.set(src, `images/${name}`);
  }
  const md = (body ?? "").replace(SERVER_IMAGE, (all, alt: string, src: string) => (seen.has(src) ? `![${alt}](${seen.get(src)})` : all));
  zip.file(`${safeName(title)}.md`, md);
  save(await zip.generateAsync({ type: "blob" }), `${safeName(title)}.zip`);
}

function dropTitleHeading(body: string, title: string) {
  const m = /^\s*# (.+)\n+/.exec(body);
  return m && m[1].trim() === title ? body.slice(m[0].length) : body;
}

function joinPath(dir: string, rel: string) {
  const parts = (dir ? `${dir}/${rel}` : rel).split("/");
  const out: string[] = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p && p !== ".") out.push(p);
  }
  return out.join("/");
}

/** Reads .md / .txt / .zip (Work OS or Notion Markdown export) into a note bundle. */
export async function readNoteFile(file: File): Promise<NoteBundle> {
  if (!/\.zip$/i.test(file.name)) {
    const { title, body } = await readTxtFile(file);
    return { title, body: dropTitleHeading(body, title), images: {} };
  }
  if (file.size > MAX_ZIP_BYTES) throw new Error("Zip is larger than 50 MB.");
  const zip = await JSZip.loadAsync(file);
  const mds = Object.values(zip.files)
    .filter((f) => !f.dir && /\.(md|markdown)$/i.test(f.name) && !f.name.startsWith("__MACOSX/"))
    .sort((a, b) => a.name.split("/").length - b.name.split("/").length);
  if (!mds.length) throw new Error("No .md file in the zip.");
  const entry = mds[0];
  const title = titleFromFilename(entry.name);
  const body = dropTitleHeading(await entry.async("string"), title);
  const dir = entry.name.includes("/") ? entry.name.slice(0, entry.name.lastIndexOf("/")) : "";
  const images: Record<string, Blob> = {};
  for (const m of body.matchAll(ANY_IMAGE)) {
    const src = m[2];
    if (/^(https?:|data:|\/)/i.test(src) || images[src]) continue;
    let path = src;
    try {
      path = decodeURIComponent(src);
    } catch {}
    const hit = zip.file(joinPath(dir, path));
    if (!hit) continue;
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    images[src] = new Blob([await hit.async("arraybuffer")], { type: MIME[ext] ?? "application/octet-stream" });
  }
  return { title, body, images };
}

/** Uploads bundled images and returns the body with links pointing at the uploads. */
export async function attachBundleImages(bundle: NoteBundle, upload: (file: File) => Promise<string>): Promise<string> {
  const urls = new Map<string, string>();
  for (const [src, blob] of Object.entries(bundle.images)) {
    let name = src.split("/").pop() || "image";
    try {
      name = decodeURIComponent(name);
    } catch {}
    urls.set(src, await upload(new File([blob], name, { type: blob.type })));
  }
  return bundle.body.replace(ANY_IMAGE, (all, alt: string, src: string) => (urls.has(src) ? `![${alt}](${urls.get(src)})` : all));
}

export async function uploadNoteImage(noteId: string, file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  const ws = workspaceId();
  const res = await fetch(`/api/notes/${noteId}/attachments`, { method: "POST", body: data, credentials: "include", headers: ws ? { "X-Workspace-Id": ws } : {} });
  if (!res.ok) throw new Error(`Couldn’t upload ${file.name}.`);
  const row = (await res.json()) as { id: string };
  return `/api/notes/${noteId}/attachments/${row.id}`;
}

export async function readTxtFile(file: File): Promise<{ title: string; body: string }> {
  if (file.size > MAX_TXT_BYTES) {
    throw new Error("File is larger than 1.5 MB.");
  }
  const body = await file.text();
  return { title: titleFromFilename(file.name), body };
}

export function caretLineCol(text: string, pos: number): { line: number; col: number } {
  const upto = text.slice(0, Math.max(0, pos));
  const parts = upto.split("\n");
  return { line: parts.length, col: (parts[parts.length - 1] ?? "").length + 1 };
}

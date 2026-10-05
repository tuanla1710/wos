const MAX_TXT_BYTES = 1_500_000;

export function titleFromFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() || "Untitled";
  return base.replace(/\.txt$/i, "").trim().slice(0, 160) || "Untitled";
}

export function downloadTxt(title: string, body: string) {
  const safe = (title || "note").replace(/[\\/:*?"<>|]+/g, "-").trim() || "note";
  const filename = safe.toLowerCase().endsWith(".txt") ? safe : `${safe}.txt`;
  const blob = new Blob([body ?? ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

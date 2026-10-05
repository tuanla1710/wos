"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeftGlyph } from "@/components/icons/AppIcons";
import { caretLineCol } from "@/lib/noteFile";

const LINE_H = 20;

export function NotePad({
  title,
  body,
  saved,
  onTitle,
  onBody,
  onBack,
  onImport,
  onExport,
}: {
  title: string;
  body: string;
  saved: boolean;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onBack: () => void;
  onImport: (files: FileList) => void;
  onExport: () => void;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ line: 1, col: 1 });
  const lines = Math.max(1, body.split("\n").length);

  const numbers = useMemo(() => Array.from({ length: lines }, (_, i) => i + 1), [lines]);

  function syncCaret() {
    const el = area.current;
    if (!el) return;
    setPos(caretLineCol(el.value, el.selectionStart ?? 0));
  }

  return (
    <div className="npp flex min-h-[calc(100vh-5.5rem)] flex-col overflow-hidden rounded-2xl">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-3">
        <button type="button" className="icon-btn h-8 w-8" onClick={onBack}>
          <ArrowLeftGlyph size={15} />
        </button>
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Untitled"
          className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm font-medium outline-none"
        />
        <input
          ref={file}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onImport(e.target.files);
            e.target.value = "";
          }}
        />
        <button type="button" className="h-8 rounded px-2 text-[12px] text-ink hover:bg-hover" onClick={() => file.current?.click()}>
          Import .txt
        </button>
        <button type="button" className="h-8 rounded px-2 text-[12px] text-ink hover:bg-hover" onClick={onExport}>
          Export .txt
        </button>
      </div>
      <div className="flex h-8 shrink-0 items-end gap-1 border-b border-line px-2">
        <span className="npp-tab rounded-t px-3 py-1 text-[12px]">
          {(title || "Untitled").slice(0, 32)}
          {(title || "Untitled").length > 32 ? "…" : ""}.txt
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div ref={gutter} className="npp-gutter shrink-0 overflow-hidden py-3 text-right font-mono text-[13px] leading-5">
          {numbers.map((n) => (
            <div key={n} className={`px-3 ${n === pos.line ? "text-ink" : ""}`} style={{ height: LINE_H }}>
              {n}
            </div>
          ))}
        </div>
        <textarea
          ref={area}
          value={body}
          spellCheck={false}
          wrap="off"
          onChange={(e) => {
            onBody(e.target.value);
            syncCaret();
          }}
          onClick={syncCaret}
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onScroll={(e) => {
            if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
          }}
          className="npp-editor min-h-0 w-full flex-1 resize-none border-0 p-3 font-mono text-[13px] leading-5 outline-none"
        />
      </div>
      <div className="npp-status flex h-6 shrink-0 items-center justify-between px-3 font-mono text-[11px]">
        <span>{saved ? "Saved" : "Saving…"}</span>
        <span>
          Ln {pos.line}, Col {pos.col} · {body.length} chars · {lines} lines · UTF-8
        </span>
      </div>
    </div>
  );
}

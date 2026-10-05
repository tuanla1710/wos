"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { findHits, replaceAllHits, replaceHit, stepIndex } from "@/lib/noteFind";

export function NoteFindReplace({
  open,
  replaceMode,
  body,
  canReplace,
  textarea,
  initialQuery = "",
  onBody,
  onClose,
  onReplaceMode,
}: {
  open: boolean;
  replaceMode: boolean;
  body: string;
  canReplace: boolean;
  textarea: React.RefObject<HTMLTextAreaElement | null>;
  initialQuery?: string;
  onBody: (next: string) => void;
  onClose: () => void;
  onReplaceMode: (on: boolean) => void;
}) {
  const findBox = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [index, setIndex] = useState(0);

  const hits = useMemo(() => findHits(body, query, matchCase), [body, query, matchCase]);
  const current = hits[Math.min(index, Math.max(0, hits.length - 1))];

  useEffect(() => {
    if (!open) return;
    if (initialQuery) setQuery(initialQuery);
    findBox.current?.focus();
    findBox.current?.select();
  }, [open, initialQuery]);

  useEffect(() => {
    setIndex((i) => (hits.length ? Math.min(i, hits.length - 1) : 0));
  }, [hits.length]);

  useEffect(() => {
    if (!open || !query || !current || !textarea.current) return;
    const el = textarea.current;
    el.focus();
    el.setSelectionRange(current.start, current.end);
    const before = body.slice(0, current.start);
    const line = before.split("\n").length;
    el.scrollTop = Math.max(0, (line - 4) * 28);
    findBox.current?.focus();
  }, [open, current?.start, current?.end, hits.length]);

  if (!open) return null;

  function jump(dir: 1 | -1) {
    if (!hits.length) return;
    setIndex((i) => stepIndex(i, hits.length, dir));
  }

  function doReplace() {
    if (!canReplace || !current || !query) return;
    const next = replaceHit(body, current, replace);
    onBody(next);
  }

  function doReplaceAll() {
    if (!canReplace || !query) return;
    const { next } = replaceAllHits(body, query, replace, matchCase);
    onBody(next);
  }

  return (
    <div className="rounded-lg border border-line bg-elev p-2 shadow-popover">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={findBox}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              jump(e.shiftKey ? -1 : 1);
            }
            if (e.key === "Escape") onClose();
          }}
          placeholder="Find"
          className="h-8 min-w-[160px] flex-1 rounded-md border-0 bg-hover px-2 text-sm outline-none"
        />
        <span className="min-w-[48px] text-center text-[12px] tabular-nums text-muted">
          {query ? (hits.length ? `${index + 1}/${hits.length}` : "0/0") : ""}
        </span>
        <button type="button" className="h-8 rounded px-2 text-sm text-muted hover:bg-hover hover:text-ink" onClick={() => jump(-1)} disabled={!hits.length}>
          Prev
        </button>
        <button type="button" className="h-8 rounded px-2 text-sm text-muted hover:bg-hover hover:text-ink" onClick={() => jump(1)} disabled={!hits.length}>
          Next
        </button>
        {canReplace && (
          <button
            type="button"
            className={`h-8 rounded px-2 text-sm ${replaceMode ? "bg-hover text-ink" : "text-muted hover:bg-hover"}`}
            onClick={() => onReplaceMode(!replaceMode)}
          >
            Replace
          </button>
        )}
        <label className="flex items-center gap-1.5 text-[12px] text-muted">
          <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
          Match case
        </label>
        <button type="button" className="ml-auto h-8 rounded px-2 text-sm text-muted hover:bg-hover" onClick={onClose}>
          Close
        </button>
      </div>
      {canReplace && replaceMode && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                doReplace();
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="Replace with"
            className="h-8 min-w-[160px] flex-1 rounded-md border-0 bg-hover px-2 text-sm outline-none"
          />
          <button type="button" className="h-8 rounded px-2 text-sm text-ink hover:bg-hover" onClick={doReplace} disabled={!current}>
            Replace
          </button>
          <button type="button" className="h-8 rounded px-2 text-sm text-ink hover:bg-hover" onClick={doReplaceAll} disabled={!hits.length}>
            Replace all
          </button>
        </div>
      )}
    </div>
  );
}

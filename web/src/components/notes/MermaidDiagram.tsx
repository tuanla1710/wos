"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mermaidEngine, mermaidSource, nextMermaidId } from "@/lib/mermaid";

export function MermaidDiagram({ source }: { source: string }) {
  const [svg, setSvg] = useState("");
  const [fullSvg, setFullSvg] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const text = mermaidSource(source);
    if (!text) {
      setSvg("");
      setError("");
      return;
    }
    let live = true;
    setError("");
    void mermaidEngine()
      .then(async (mermaid) => {
        await mermaid.parse(text);
        return mermaid.render(nextMermaidId(), text);
      })
      .then((out) => {
        if (!live) return;
        setSvg(out.svg);
        setError("");
      })
      .catch(() => {
        if (!live) return;
        setSvg("");
        setError("Couldn’t draw this diagram. Check the Mermaid syntax.");
      });
    return () => {
      live = false;
    };
  }, [source]);

  useEffect(() => {
    if (!open) {
      setFullSvg("");
      return;
    }
    const text = mermaidSource(source);
    if (!text) return;
    let live = true;
    void mermaidEngine()
      .then(async (mermaid) => {
        await mermaid.parse(text);
        return mermaid.render(nextMermaidId(), text);
      })
      .then((out) => {
        if (live) setFullSvg(out.svg);
      })
      .catch(() => {
        if (live) setFullSvg("");
      });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      live = false;
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, source]);

  if (error) {
    return (
      <div className="rounded-lg border border-line bg-hover px-3 py-2 text-sm text-muted">
        {error}
      </div>
    );
  }
  if (!svg) {
    return <div className="rounded-lg border border-line bg-white px-3 py-6 text-[12px] text-muted">Drawing diagram…</div>;
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          className="mermaid-frame block w-full overflow-x-auto rounded-lg border border-line bg-white px-3 py-3 text-left"
          aria-label="Open mermaid diagram full view"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button
          type="button"
          className="absolute right-2 top-2 h-7 rounded-md border border-line bg-white/85 px-2 text-[12px] font-semibold text-muted backdrop-blur hover:text-ink"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
        >
          Full view
        </button>
      </div>
      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-[#091322]/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Mermaid diagram"
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                className="absolute right-4 top-4 h-8 rounded-md border border-white/25 bg-white/10 px-3 text-[12px] font-semibold text-white hover:bg-white/20"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <div
                className="mermaid-lightbox max-h-[92vh] max-w-[96vw] overflow-auto rounded-xl bg-white p-6 shadow-modal"
                onClick={(event) => event.stopPropagation()}
              >
                {fullSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: fullSvg }} />
                ) : (
                  <p className="px-8 py-12 text-center text-sm text-muted">Drawing diagram…</p>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

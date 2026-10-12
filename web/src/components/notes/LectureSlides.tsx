"use client";

import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftGlyph, ArrowRightGlyph } from "@/components/icons/AppIcons";
import { LectureCoach } from "@/components/notes/LectureCoach";
import { NoteMarkdown } from "@/components/notes/NoteMarkdown";
import { lectureSlides, outlineLabel, type BeatPhase } from "@/lib/noteMd";

const W = 1280;
const H = 720;

const PHASE: Record<BeatPhase, { label: string; color: string; soft: string }> = {
  start: { label: "Start", color: "#57534E", soft: "#F5F5F4" },
  hook: { label: "Hook", color: "#B54708", soft: "#FEF6EE" },
  explore: { label: "Explore", color: "#175CD3", soft: "#EFF4FF" },
  build: { label: "Build", color: "#1B365D", soft: "#E4EAF3" },
  practice: { label: "Practice", color: "#6941C6", soft: "#F4F3FF" },
  wrap: { label: "Wrap up", color: "#067647", soft: "#ECFDF3" },
};

function Fit({ children, center }: { children: ReactNode; center?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const z = sizer.current;
    const n = inner.current;
    if (!o || !z || !n) return;
    const room = o.clientHeight;
    let s = 1;
    for (let pass = 0; pass < 4; pass++) {
      n.style.width = `${100 / s}%`;
      const need = n.offsetHeight;
      if (need * s <= room) break;
      s = Math.max(0.4, (room / need) * 0.98);
    }
    n.style.transform = s < 1 ? `scale(${s})` : "";
    z.style.height = s < 1 ? `${n.offsetHeight * s}px` : "";
  });
  return (
    <div ref={outer} className={`flex h-full min-h-0 flex-col overflow-hidden ${center ? "justify-center" : "justify-start"}`}>
      <div ref={sizer} className="shrink-0">
        <div ref={inner} className="origin-top-left">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LectureSlides({ title, body, visit, onClose }: { title: string; body: string; visit: number; onClose: () => void }) {
  const slides = useMemo(() => lectureSlides(body, visit), [body, visit]);
  const total = slides.length;
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slide = slides[Math.min(i, total - 1)];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      let hit = true;
      if (e.key === "ArrowRight" || e.key === "PageDown") setI((n) => Math.min(total - 1, n + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") setI((n) => Math.max(0, n - 1));
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(total - 1);
      else if (e.key === "f") toggleFull();
      else if (e.key === "Escape" && !document.fullscreenElement) onClose();
      else hit = false;
      if (hit) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [total, onClose]);

  function toggleFull() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.();
  }

  if (!slide) return null;
  const p = PHASE[slide.phase];
  const sameBeat = slides.filter((s) => s.beat === slide.beat);
  const part = sameBeat.indexOf(slide) + 1;
  const imgs = slide.images.slice(0, 2);
  const text = slide.text ? (
    <div className="[&_li]:text-[22px] [&_p]:text-[22px] [&_p]:leading-[34px] [&_table]:text-[18px]">
      <NoteMarkdown src={slide.text} teach />
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex flex-col bg-[#1C1917] text-ink">
      <div className="flex h-12 shrink-0 items-center gap-3 px-5 text-[13px] text-[#D6D3D1]">
        <span className="truncate font-semibold text-white">{title}</span>
        <span className="tabular-nums">
          {i + 1} / {total}
        </span>
        <div className="ml-auto flex gap-2">
          <button type="button" className="h-8 rounded-lg border border-[#44403C] px-3 hover:bg-[#292524]" onClick={toggleFull}>
            Fullscreen
          </button>
          <button type="button" className="h-8 rounded-lg border border-[#44403C] px-3 hover:bg-[#292524]" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 px-5">
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale * 0.98})` }}
        >
          <div className="h-2" style={{ background: p.color }} />
          <div className="flex h-[88px] items-center gap-4 px-14">
            <span className="rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-wide" style={{ background: p.soft, color: p.color }}>
              {p.label}
            </span>
            <h2 className="min-w-0 flex-1 truncate text-[32px] font-bold tracking-tight">{slide.title}</h2>
            {sameBeat.length > 1 && (
              <span className="flex gap-1.5">
                {sameBeat.map((s, k) => (
                  <span key={k} className="h-2.5 w-2.5 rounded-full" style={{ background: p.color, opacity: k + 1 === part ? 1 : 0.2 }} />
                ))}
              </span>
            )}
          </div>
          <div className="px-14 pb-10" style={{ height: H - 8 - 88 }}>
            {imgs.length && text ? (
              <div className="grid h-full grid-cols-[1.35fr_1fr] gap-12">
                <div className="flex min-h-0 flex-col items-center justify-center gap-4">
                  {imgs.map((m) => (
                    <img key={m.src} src={m.src} alt={m.alt} className="min-h-0 max-w-full flex-1 rounded-xl object-contain" />
                  ))}
                </div>
                <Fit center>{text}</Fit>
              </div>
            ) : imgs.length ? (
              <div className="flex h-full items-center justify-center gap-8">
                {imgs.map((m) => (
                  <img key={m.src} src={m.src} alt={m.alt} className="max-h-full min-w-0 rounded-xl object-contain" style={{ maxWidth: `${100 / imgs.length}%` }} />
                ))}
              </div>
            ) : text ? (
              <div className="mx-auto h-full max-w-[1000px]">
                <Fit center>{text}</Fit>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-[18px] font-semibold uppercase tracking-wide" style={{ color: p.color }}>
                  {i === 0 ? outlineLabel(slide.title) : p.label}
                </p>
                <p className="mt-3 text-[56px] font-bold leading-tight tracking-tight">{i === 0 ? title : outlineLabel(slide.title)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1280px] shrink-0 items-center gap-3 px-5 py-3">
        <button
          type="button"
          aria-label="Previous slide"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#292524] text-white disabled:opacity-30"
          disabled={i === 0}
          onClick={() => setI((n) => Math.max(0, n - 1))}
        >
          <ArrowLeftGlyph size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <LectureCoach lines={slide.lines} beatKey={i} onDone={() => setI((n) => Math.min(total - 1, n + 1))} className="w-full" />
        </div>
        <button
          type="button"
          aria-label="Next slide"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-30"
          style={{ background: p.color }}
          disabled={i >= total - 1}
          onClick={() => setI((n) => Math.min(total - 1, n + 1))}
        >
          <ArrowRightGlyph size={16} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftGlyph, ArrowRightGlyph } from "@/components/icons/AppIcons";
import { LectureCoach } from "@/components/notes/LectureCoach";
import { LectureSlides } from "@/components/notes/LectureSlides";
import { NoteMarkdown } from "@/components/notes/NoteMarkdown";
import { beatPhases, beatVariant, coachLines, lectureBeats, lectureMeta, outlineLabel, withoutCoach, type BeatPhase } from "@/lib/noteMd";

const PHASE: Record<BeatPhase, { label: string; color: string; soft: string }> = {
  start: { label: "Start", color: "#57534E", soft: "#F5F5F4" },
  hook: { label: "Hook", color: "#B54708", soft: "#FEF6EE" },
  explore: { label: "Explore", color: "#175CD3", soft: "#EFF4FF" },
  build: { label: "Build", color: "#1D4E4A", soft: "#E6F0EF" },
  practice: { label: "Practice", color: "#6941C6", soft: "#F4F3FF" },
  wrap: { label: "Wrap up", color: "#067647", soft: "#ECFDF3" },
};

export function LectureTeach({
  title,
  body,
  onAuthor,
}: {
  title: string;
  body: string;
  onAuthor?: () => void;
}) {
  const beats = lectureBeats(body);
  const phases = beatPhases(beats);
  const meta = lectureMeta(body);
  const [beat, setBeat] = useState(1);
  const [full, setFull] = useState(false);
  const [slides, setSlides] = useState(false);
  const [visit, setVisit] = useState(0);

  useEffect(() => {
    const key = `coach-visit:${title}`;
    let prev = { n: -1, at: 0 };
    try {
      prev = { ...prev, ...JSON.parse(window.localStorage.getItem(key) ?? "{}") };
    } catch {}
    const now = Date.now();
    const n = now - prev.at > 30 * 60 * 1000 ? prev.n + 1 : Math.max(0, prev.n);
    window.localStorage.setItem(key, JSON.stringify({ n, at: now }));
    setVisit(n);
  }, [title]);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = beats.length;
  const index = total ? Math.min(Math.max(1, beat), total) : 0;
  const raw = total ? beats[index - 1] : null;
  const current = raw ? { ...raw, body: withoutCoach(raw.body) } : null;
  const coach = raw ? coachLines(raw.body, visit) : [];
  const hasCoach = beats.some((b) => coachLines(b.body).length > 0);

  useEffect(() => {
    if (total === 0) {
      setBeat(1);
      return;
    }
    setBeat((n) => Math.min(Math.max(1, n), total));
  }, [total]);

  useEffect(() => {
    function onChange() {
      setFull(document.fullscreenElement === rootRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFull() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!total) return;
      const next = () => setBeat((n) => Math.min(total, n + 1));
      const prev = () => setBeat((n) => Math.max(1, n - 1));
      if (e.key === "ArrowRight" || e.key === "j" || (e.key === " " && tag !== "BUTTON")) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setBeat(1);
      } else if (e.key === "End") {
        e.preventDefault();
        setBeat(total);
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFull();
      } else if (/^[1-9]$/.test(e.key)) {
        const n = Number(e.key);
        if (n <= total) {
          e.preventDefault();
          setBeat(n);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!total) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted">Add ## headings in Author to split the lesson into beats.</p>
        {onAuthor && (
          <button type="button" className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover" onClick={onAuthor}>
            Author
          </button>
        )}
      </div>
    );
  }

  const phase = PHASE[phases[index - 1]];
  const variant = beatVariant(current?.title ?? "");
  const homework = variant === "homework" || /^- \[[ xX]\] /m.test(current?.body ?? "");
  const empty = !(current?.body ?? "").trim();
  const prevBeat = index > 1 ? beats[index - 2] : null;
  const nextBeat = index < total ? beats[index] : null;
  const chips = [meta.level, meta.duration, meta.language, meta.when, meta.project].filter(Boolean);
  const groups: { phase: BeatPhase; items: number[] }[] = [];
  phases.forEach((p, i) => {
    const last = groups[groups.length - 1];
    if (last && last.phase === p) last.items.push(i + 1);
    else groups.push({ phase: p, items: [i + 1] });
  });

  return (
    <div ref={rootRef} className={`flex flex-col gap-5 ${full ? "overflow-y-auto bg-white px-10 py-8" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-bold tracking-tight ${full ? "text-3xl leading-10" : "text-2xl leading-8"}`}>{title || "Untitled"}</p>
          {chips.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span key={c} className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[12px] font-medium text-muted">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover"
            onClick={() => setSlides(true)}
            title="Widescreen slides with the coach voice"
          >
            Slides
          </button>
          <button
            type="button"
            className="h-9 rounded-lg border border-line px-3 text-sm font-medium hover:bg-hover"
            onClick={toggleFull}
            title="Present (F)"
          >
            {full ? "Exit present" : "Present"}
          </button>
        </div>
      </div>
      {slides && <LectureSlides title={title} body={body} visit={visit} onClose={() => setSlides(false)} />}

      <div className="flex gap-1" role="tablist" aria-label="Lesson progress">
        {beats.map((row, i) => {
          const p = PHASE[phases[i]];
          const done = i + 1 <= index;
          return (
            <button
              key={`${row.title}-${i}`}
              type="button"
              role="tab"
              aria-selected={i + 1 === index}
              title={row.title}
              className="h-2 flex-1 rounded-full transition-opacity"
              style={{ background: p.color, opacity: done ? 1 : 0.18 }}
              onClick={() => setBeat(i + 1)}
            />
          );
        })}
      </div>

      <label className="md:hidden">
        <span className="sr-only">Outline</span>
        <select value={index} onChange={(e) => setBeat(Number(e.target.value))} className="h-9 w-full rounded border border-line px-2 text-sm">
          {beats.map((row, i) => (
            <option key={`${row.title}-${i}`} value={i + 1}>
              {i + 1}. {outlineLabel(row.title)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="hidden md:block">
          {groups.map((g) => {
            const p = PHASE[g.phase];
            return (
              <div key={`${g.phase}-${g.items[0]}`} className="mb-3">
                <p className="mb-1 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: p.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </p>
                <ul>
                  {g.items.map((n) => {
                    const row = beats[n - 1];
                    const on = n === index;
                    return (
                      <li key={`${row.title}-${n}`}>
                        <button
                          type="button"
                          className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm ${on ? "font-semibold" : "text-ink hover:bg-hover"}`}
                          style={on ? { background: p.soft, color: p.color } : undefined}
                          onClick={() => setBeat(n)}
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums"
                            style={n < index ? { background: p.color, color: "#fff" } : on ? { border: `2px solid ${p.color}` } : { border: "1px solid #E4E2DB", color: "#78716C" }}
                          >
                            {n}
                          </span>
                          <span className="truncate">{outlineLabel(row.title)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="min-w-0">
          {hasCoach && !slides && <LectureCoach lines={coach} beatKey={index} big={full} />}
          <section
            className={`overflow-hidden rounded-2xl border bg-white ${full ? "min-h-[60vh]" : "min-h-[420px]"}`}
            style={{ borderColor: variant === "pass" ? "#ABEFC6" : "#E4E2DB" }}
          >
            <div className="h-1.5" style={{ background: phase.color }} />
            <div className={full ? "px-12 py-10" : "px-8 py-7"}>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ background: phase.soft, color: phase.color }}>
                  {phase.label}
                </span>
                <span className="text-[12px] font-medium tabular-nums text-muted">
                  {index} / {total}
                </span>
              </div>
              <h2 className={`mt-3 font-bold tracking-tight ${full ? "text-4xl leading-[48px]" : "text-3xl leading-10"}`}>{current?.title}</h2>
              <div className="mt-6">
                {empty ? (
                  <p className="text-sm text-muted">This beat is empty.</p>
                ) : variant === "objective" ? (
                  <div className="rounded-xl px-5 py-4" style={{ background: phase.soft }}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: phase.color }}>
                      Today
                    </p>
                    <div className="[&_p]:text-[20px] [&_p]:font-medium [&_p]:leading-[34px]">
                      <NoteMarkdown src={current?.body ?? ""} teach />
                    </div>
                  </div>
                ) : variant === "pass" ? (
                  <div className="flex gap-4 rounded-xl bg-[#ECFDF3] px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#067647] text-white" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#067647]">Pass when</p>
                      <div className="[&_p]:text-[19px] [&_p]:font-medium [&_p]:leading-[32px]">
                        <NoteMarkdown src={current?.body ?? ""} teach />
                      </div>
                    </div>
                  </div>
                ) : variant === "next" ? (
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-line px-5 py-4">
                    <ArrowRightGlyph size={20} />
                    <NoteMarkdown src={current?.body ?? ""} teach />
                  </div>
                ) : variant === "homework" ? (
                  <div className="rounded-xl border border-line bg-[#FFFCF5] px-5 py-4">
                    <NoteMarkdown src={current?.body ?? ""} teach />
                  </div>
                ) : (
                  <NoteMarkdown src={current?.body ?? ""} teach variant={variant} />
                )}
              </div>
              {homework && <p className="mt-4 text-[12px] text-muted">Edit checkboxes in Author.</p>}
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium hover:bg-hover disabled:opacity-40"
              disabled={!prevBeat}
              onClick={() => setBeat((n) => Math.max(1, n - 1))}
              aria-label="Previous beat"
            >
              <ArrowLeftGlyph size={15} />
              <span className="truncate">{prevBeat ? outlineLabel(prevBeat.title) : "Start"}</span>
            </button>
            <button
              type="button"
              className="flex h-11 min-w-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: nextBeat ? PHASE[phases[index]].color : "#A8A29E" }}
              disabled={!nextBeat}
              onClick={() => setBeat((n) => Math.min(total, n + 1))}
              aria-label="Next beat"
            >
              <span className="truncate">{nextBeat ? outlineLabel(nextBeat.title) : "Done"}</span>
              <ArrowRightGlyph size={15} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-faint">← → to move · 1–9 to jump · F to present</p>
        </div>
      </div>
    </div>
  );
}

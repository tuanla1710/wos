"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CoachLine } from "@/lib/noteMd";

type Phase = "off" | "speaking" | "paused" | "waiting" | "done";

export function LectureCoach({
  lines,
  beatKey,
  big,
  onDone,
  className = "sticky top-2 z-10 mb-4",
}: {
  lines: CoachLine[];
  beatKey: number;
  big?: boolean;
  onDone?: () => void;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("off");
  const [idx, setIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null);
  const mouthRef = useRef<SVGEllipseElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const fakeTalk = useRef(false);
  const linesRef = useRef(lines);
  const runRef = useRef(0);
  const doneRef = useRef(onDone);
  linesRef.current = lines;
  doneRef.current = onDone;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    let raf = 0;
    const buf = new Uint8Array(256);
    const tick = () => {
      let level = 0;
      const a = ctxRef.current;
      if (a && !audio.paused) {
        a.analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        level = Math.min(1, Math.sqrt(sum / buf.length) * 5);
      } else if (fakeTalk.current) {
        level = 0.35 + 0.35 * Math.sin(performance.now() / 70);
      }
      mouthRef.current?.setAttribute("ry", String(1.2 + level * 8));
      bodyRef.current?.setAttribute("transform", `translate(0 ${-level * 2.5})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      audio.pause();
      window.speechSynthesis?.cancel();
      void ctxRef.current?.ctx.close();
    };
  }, []);

  const stop = useCallback(() => {
    runRef.current += 1;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    fakeTalk.current = false;
  }, []);

  const speak = useCallback(
    (i: number) => {
      const list = linesRef.current;
      const line = list[i];
      stop();
      if (!line) {
        setPhase("done");
        return;
      }
      const run = runRef.current;
      setIdx(i);
      setPhase("speaking");
      const finished = () => {
        if (run !== runRef.current) return;
        fakeTalk.current = false;
        if (line.wait) setPhase("waiting");
        else if (i + 1 < list.length) window.setTimeout(() => run === runRef.current && speak(i + 1), 450);
        else {
          setPhase("done");
          window.setTimeout(() => run === runRef.current && doneRef.current?.(), 900);
        }
      };
      const audio = audioRef.current;
      if (line.audio && audio) {
        if (!ctxRef.current) {
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          ctx.createMediaElementSource(audio).connect(analyser);
          analyser.connect(ctx.destination);
          ctxRef.current = { ctx, analyser };
        }
        void ctxRef.current.ctx.resume();
        audio.src = line.audio;
        audio.onended = finished;
        audio.play().catch(() => run === runRef.current && setPhase("paused"));
        return;
      }
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(line.text);
        u.lang = "en-US";
        u.rate = 0.92;
        u.onend = finished;
        fakeTalk.current = true;
        window.speechSynthesis.speak(u);
      } else finished();
    },
    [stop],
  );

  const onRef = useRef(false);
  onRef.current = phase !== "off";

  useEffect(() => {
    setIdx(0);
    if (!onRef.current) return;
    stop();
    const t = window.setTimeout(() => speak(0), 350);
    return () => window.clearTimeout(t);
  }, [beatKey, speak, stop]);

  if (!lines.length && phase === "off") return null;

  const line = lines[idx];
  const on = phase !== "off";
  const size = big ? 112 : 84;
  const btn = "h-9 rounded-lg border border-[#F5D9A8] bg-white px-3 text-sm font-medium text-[#7A4A00] hover:bg-[#FFF3DC]";

  function pauseResume() {
    const audio = audioRef.current;
    if (phase === "speaking") {
      if (line?.audio && audio) audio.pause();
      else window.speechSynthesis?.pause();
      fakeTalk.current = false;
      setPhase("paused");
    } else if (phase === "paused") {
      if (line?.audio && audio && audio.src) {
        void ctxRef.current?.ctx.resume();
        void audio.play();
      } else if (window.speechSynthesis?.paused) {
        window.speechSynthesis.resume();
        fakeTalk.current = true;
      } else {
        speak(idx);
        return;
      }
      setPhase("speaking");
    }
  }

  return (
    <div className={`${className} flex items-center gap-4 rounded-2xl border border-[#F5D9A8] bg-[#FFFAF0] px-4 py-3 shadow-sm`}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="shrink-0" aria-label="Coach Kit">
        <g ref={bodyRef}>
          <path d="M30 52 L26 18 L52 36 Z" fill="#FFAB19" stroke="#C86E00" strokeWidth="3" strokeLinejoin="round" />
          <path d="M90 52 L94 18 L68 36 Z" fill="#FFAB19" stroke="#C86E00" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="60" cy="66" r="36" fill="#FFAB19" stroke="#C86E00" strokeWidth="3" />
          <path d="M28 46 Q60 14 92 46 Z" fill="#E53935" stroke="#A42222" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 42 Q86 40 104 48" fill="none" stroke="#A42222" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="60" cy="80" rx="22" ry="16" fill="#FFF4E0" />
          <ellipse cx="46" cy="62" rx="6" ry="7" fill="#fff" stroke="#3A2A1A" strokeWidth="2">
            <animate attributeName="ry" values="7;7;0.8;7" keyTimes="0;0.93;0.96;1" dur="4.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="74" cy="62" rx="6" ry="7" fill="#fff" stroke="#3A2A1A" strokeWidth="2">
            <animate attributeName="ry" values="7;7;0.8;7" keyTimes="0;0.93;0.96;1" dur="4.2s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="47" cy="63" r="2.8" fill="#3A2A1A" />
          <circle cx="75" cy="63" r="2.8" fill="#3A2A1A" />
          <path d="M56 72 L64 72 L60 76 Z" fill="#F06292" />
          <ellipse ref={mouthRef} cx="60" cy="84" rx="7" ry="1.2" fill="#7A2E1A" />
          <path d="M34 78 L18 75 M34 83 L18 85 M86 78 L102 75 M86 83 L102 85" stroke="#C86E00" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 100 L60 108" stroke="#546E7A" strokeWidth="2" />
          <rect x="54" y="106" width="16" height="8" rx="3" fill="#B0BEC5" stroke="#546E7A" strokeWidth="2" />
        </g>
      </svg>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B54708]">
          Coach Kit{on && lines.length ? ` · ${Math.min(idx + 1, lines.length)}/${lines.length}` : ""}
        </p>
        {!on ? (
          <p className={`${big ? "text-xl" : "text-[15px]"} mt-1 text-[#7A4A00]`}>Press Start and I will teach this part with you!</p>
        ) : phase === "done" ? (
          <p className={`${big ? "text-xl" : "text-[15px]"} mt-1 text-[#7A4A00]`}>Done! Press Next when you are ready.</p>
        ) : (
          <p className={`${big ? "text-2xl leading-9" : "text-[17px] leading-7"} mt-1 font-medium text-ink`}>{line?.text}</p>
        )}
        {phase === "waiting" && (
          <p className="mt-1 text-sm font-semibold text-[#067647]">
            {line?.wait === "task" ? "Your turn! Do it in Scratch, then press Continue." : "Your turn! Say your answer, then press Continue."}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        {!on ? (
          <button
            type="button"
            className="h-10 rounded-lg bg-[#FB8C00] px-4 text-sm font-semibold text-white hover:bg-[#EF6C00]"
            onClick={() => speak(0)}
          >
            ▶ Start
          </button>
        ) : (
          <>
            {phase === "waiting" ? (
              <button
                type="button"
                className="h-9 rounded-lg bg-[#067647] px-3 text-sm font-semibold text-white"
                onClick={() => {
                  if (idx + 1 < lines.length) speak(idx + 1);
                  else {
                    setPhase("done");
                    doneRef.current?.();
                  }
                }}
              >
                Continue
              </button>
            ) : phase === "speaking" || phase === "paused" ? (
              <button type="button" className={btn} onClick={pauseResume}>
                {phase === "speaking" ? "Pause" : "Play"}
              </button>
            ) : null}
            <button type="button" className={btn} onClick={() => speak(0)} title="Replay this part">
              Replay
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                stop();
                setPhase("off");
                setIdx(0);
              }}
              title="Turn the coach off"
            >
              Off
            </button>
          </>
        )}
      </div>
    </div>
  );
}

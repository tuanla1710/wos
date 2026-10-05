"use client";

import { type ReactNode, useEffect, useState } from "react";
import { parseMarkdownBlocks, type BeatVariant, type CalloutKind, type MdBlock } from "@/lib/noteMd";

export function NoteMarkdown({ src, teach, variant = "default" }: { src: string; teach?: boolean; variant?: BeatVariant }) {
  const blocks = parseMarkdownBlocks(src);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setToast("Copied.");
    } catch {
      setToast("Couldn’t copy.");
    }
  }

  const text = teach ? "text-[17px] leading-[30px]" : "text-sm leading-[22px]";
  let question = 0;

  function render(block: MdBlock, i: number): ReactNode {
    if (teach && variant === "questions" && (block.type === "ol" || block.type === "li" || block.type === "p")) {
      question += 1;
      return <QuestionCard key={i} n={block.type === "ol" ? block.n : question} text={block.text} />;
    }
    if (teach && variant === "mistakes" && (block.type === "p" || block.type === "li")) {
      return <MistakeCard key={i} text={block.text} />;
    }
    if (teach && variant === "story" && block.type === "p") {
      return (
        <p key={i} className="border-l-4 border-[#F7B27A] pl-4 text-[20px] font-medium leading-[34px] text-ink">
          <Inline text={block.text} />
        </p>
      );
    }
    if (block.type === "h1") {
      return (
        <h1 key={i} className="text-xl font-semibold leading-7">
          <Inline text={block.text} />
        </h1>
      );
    }
    if (block.type === "h2") {
      return (
        <h2 key={i} className="mt-4 text-xl font-semibold leading-7">
          <Inline text={block.text} />
        </h2>
      );
    }
    if (block.type === "check") {
      return (
        <p key={i} className={`flex items-start gap-3 ${text} ${block.done ? "text-muted line-through" : ""}`}>
          <span
            className={`mt-[5px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 ${block.done ? "border-accent bg-accent text-white" : "border-faint bg-white"}`}
            aria-hidden
          >
            {block.done ? <CheckMark /> : null}
          </span>
          <span>
            <Inline text={block.text} />
          </span>
        </p>
      );
    }
    if (block.type === "li") {
      return (
        <p key={i} className={`flex gap-3 ${text}`}>
          <span className={`shrink-0 rounded-full bg-faint ${teach ? "mt-[12px] h-[7px] w-[7px]" : "mt-[8px] h-[5px] w-[5px]"}`} aria-hidden />
          <span>
            <Inline text={block.text} />
          </span>
        </p>
      );
    }
    if (block.type === "ol") {
      return (
        <p key={i} className={`flex gap-3 ${text}`}>
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-hover font-semibold tabular-nums text-ink ${teach ? "mt-[3px] h-6 w-6 text-[13px]" : "mt-[1px] h-5 w-5 text-[11px]"}`}
          >
            {block.n}
          </span>
          <span>
            <Inline text={block.text} />
          </span>
        </p>
      );
    }
    if (block.type === "quote") {
      return (
        <blockquote key={i} className={`border-l-4 border-line pl-4 italic text-muted ${text}`}>
          <Inline text={block.text} />
        </blockquote>
      );
    }
    if (block.type === "code") {
      return <CodeBlock key={i} lang={block.lang} code={block.code} teach={teach} onCopy={() => void copy(block.code)} />;
    }
    if (block.type === "callout") {
      return <Callout key={i} kind={block.kind} text={block.text} teach={teach} />;
    }
    if (block.type === "spacer") return <div key={i} className={teach ? "h-1" : "h-2"} />;
    return (
      <p key={i} className={text}>
        <Inline text={block.text} />
      </p>
    );
  }

  return (
    <div className={teach ? "max-w-[720px] space-y-3" : "space-y-2"}>
      {blocks.map(render)}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-line bg-elev px-3 py-2 text-sm shadow-popover">
          {toast}
        </div>
      )}
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionCard({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-line bg-white px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF6EE] text-[15px] font-bold tabular-nums text-[#B54708]">
        {n}
      </span>
      <p className="pt-[2px] text-[17px] leading-[28px]">
        <Inline text={text} />
      </p>
    </div>
  );
}

function MistakeCard({ text }: { text: string }) {
  const at = text.search(/\s(Bố|Hỏi):/);
  const problem = at > 0 ? text.slice(0, at).trim() : text;
  const fix = at > 0 ? text.slice(at).trim() : "";
  return (
    <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3">
      <p className="text-[17px] font-medium leading-[28px] text-[#912018]">
        <Inline text={problem} />
      </p>
      {fix ? (
        <p className="mt-1 text-[15px] leading-[26px] text-ink">
          <Inline text={fix} />
        </p>
      ) : null}
    </div>
  );
}

function CodeBlock({ lang, code, teach, onCopy }: { lang: string; code: string; teach?: boolean; onCopy: () => void }) {
  if (teach) {
    return (
      <div className="overflow-hidden rounded-xl bg-[#1C1917] shadow-popover">
        <div className="flex h-9 items-center gap-2 border-b border-white/10 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F97066]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FDB022]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#32D583]" />
          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">{lang || "text"}</span>
          <button type="button" className="ml-auto text-[12px] text-white/60 hover:text-white" onClick={onCopy}>
            Copy
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[16px] leading-7 text-[#F5F5F4]">
          <code>{code}</code>
        </pre>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg bg-hover">
      <div className="flex h-7 items-center px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{lang || "text"}</span>
        <button type="button" className="ml-auto text-[12px] text-muted hover:text-ink" onClick={onCopy}>
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto px-3 pb-3 font-mono text-[13px] leading-5 text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({ kind, text, teach }: { kind: CalloutKind; text: string; teach?: boolean }) {
  const tip = kind === "tip";
  return (
    <div className={`rounded-lg border-l-[3px] p-3 ${tip ? "border-accent bg-accent-soft" : "border-overdue bg-[#FDF2F0]"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${tip ? "text-accent" : "text-overdue"}`}>{kind.toUpperCase()}</p>
      {text ? (
        <p className={`mt-1 text-ink ${teach ? "text-[16px] leading-[28px]" : "text-sm leading-[22px]"}`}>
          <Inline text={text} />
        </p>
      ) : null}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\((https?:[^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      nodes.push(
        <code key={key++} className="rounded bg-hover px-1 font-mono text-[0.85em]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else if (m[2] && m[3]) {
      nodes.push(
        <a key={key++} className="text-accent underline" href={m[3]} target="_blank" rel="noreferrer">
          {m[2]}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

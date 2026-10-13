"use client";

import { useMemo } from "react";
import { highlightHtml } from "@/lib/highlight";

export function HighlightedCode({ lang, code }: { lang: string; code: string }) {
  const html = useMemo(() => highlightHtml(lang, code), [lang, code]);
  return <code className="note-code-hl" dangerouslySetInnerHTML={{ __html: html }} />;
}

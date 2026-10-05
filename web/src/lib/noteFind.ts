export type FindHit = { start: number; end: number };

export function findHits(text: string, query: string, matchCase: boolean): FindHit[] {
  if (!query) return [];
  const src = matchCase ? text : text.toLowerCase();
  const q = matchCase ? query : query.toLowerCase();
  const hits: FindHit[] = [];
  let from = 0;
  while (from <= src.length - q.length) {
    const at = src.indexOf(q, from);
    if (at < 0) break;
    hits.push({ start: at, end: at + query.length });
    from = at + Math.max(1, q.length);
  }
  return hits;
}

export function replaceHit(text: string, hit: FindHit, replacement: string): string {
  return text.slice(0, hit.start) + replacement + text.slice(hit.end);
}

export function replaceAllHits(text: string, query: string, replacement: string, matchCase: boolean): { next: string; count: number } {
  const hits = findHits(text, query, matchCase);
  if (!hits.length) return { next: text, count: 0 };
  let next = "";
  let last = 0;
  for (const hit of hits) {
    next += text.slice(last, hit.start) + replacement;
    last = hit.end;
  }
  next += text.slice(last);
  return { next, count: hits.length };
}

export function stepIndex(current: number, total: number, dir: 1 | -1): number {
  if (total <= 0) return 0;
  return (current + dir + total) % total;
}

export function isoWeekMonday(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function reviewStorageKey(weekStart: string) {
  return `review_done:${weekStart}`;
}

export function isReviewDone(weekStart: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(reviewStorageKey(weekStart)) === "1";
}

export function markReviewDone(weekStart: string) {
  localStorage.setItem(reviewStorageKey(weekStart), "1");
  window.dispatchEvent(new Event("workos:changed"));
}

export function needsWeekendReviewPrompt(weekStart: string) {
  const dow = new Date().getDay();
  const weekend = dow === 0 || dow >= 5;
  return weekend && !isReviewDone(weekStart);
}

export function formatReviewRange(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function formatDue(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

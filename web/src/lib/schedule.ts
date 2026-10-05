export function workDays(start: string, due: string, holidays: string[] = []): number | null {
  if (!start || !due) return null;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${due}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) return null;
    const off = new Set(holidays);
  let n = 0;
  const cur = new Date(a);
  while (cur <= b) {
    const wd = cur.getDay();
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    if (wd !== 0 && wd !== 6 && !off.has(key)) n += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}

export function workDaysLabel(days: number | null | undefined): string {
  if (days == null) return "Set start and due to see workdays.";
  if (days === 1) return "1 workday";
  return `${days} workdays`;
}

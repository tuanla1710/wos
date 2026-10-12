export function slugPart(value?: string | null, limit = 48) {
  if (!value) return "";
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}._-]+/gu, "")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, limit);
}

export function stampTitle(timezone: string | undefined, ...parts: Array<string | null | undefined>) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone || "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const bag: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date())) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  const stamp = `${bag.year}-${bag.month}-${bag.day}_${bag.hour}-${bag.minute}`;
  const extra = parts.map((part) => slugPart(part)).filter(Boolean);
  return [stamp, ...extra].join("_").slice(0, 160);
}

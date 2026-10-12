export function descendantIds<T extends { id: string; parent_id?: string | null }>(nodes: T[], id: string) {
  const kids = new Map<string, string[]>();
  for (const node of nodes) {
    if (!node.parent_id) continue;
    const list = kids.get(node.parent_id) ?? [];
    list.push(node.id);
    kids.set(node.parent_id, list);
  }
  const out = new Set<string>();
  const stack = [...(kids.get(id) ?? [])];
  while (stack.length) {
    const current = stack.pop()!;
    if (out.has(current)) continue;
    out.add(current);
    stack.push(...(kids.get(current) ?? []));
  }
  return out;
}

export function canMoveUnder<T extends { id: string; parent_id?: string | null }>(nodes: T[], fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return false;
  if (descendantIds(nodes, fromId).has(toId)) return false;
  return true;
}

export function ancestorIds<T extends { id: string; parent_id?: string | null }>(nodes: T[], id: string) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const out = new Set<string>();
  let current = byId.get(id)?.parent_id ?? undefined;
  while (current && !out.has(current)) {
    out.add(current);
    current = byId.get(current)?.parent_id ?? undefined;
  }
  return out;
}

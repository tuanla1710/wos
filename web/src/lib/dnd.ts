import type { DragEvent as ReactDragEvent } from "react";

export const PROJECT_MIME = "application/x-workos-project";
export const TASK_MIME = "application/x-workos-task";

let dragging: { kind: "project" | "task"; id: string } | null = null;

export function beginDrag(kind: "project" | "task", id: string) {
  dragging = { kind, id };
}

export function endDrag() {
  dragging = null;
}

export function currentDrag() {
  return dragging;
}

export function setDragData(event: ReactDragEvent, kind: "project" | "task", id: string) {
  event.dataTransfer.setData("text/plain", `${kind}:${id}`);
  event.dataTransfer.setData(kind === "project" ? PROJECT_MIME : TASK_MIME, id);
  event.dataTransfer.effectAllowed = "move";
  beginDrag(kind, id);
}

export function parseDragData(event: ReactDragEvent | DragEvent): { kind: "project" | "task"; id: string } | null {
  const transfer = event.dataTransfer;
  if (transfer) {
    const projectId = transfer.getData(PROJECT_MIME);
    if (projectId) return { kind: "project", id: projectId };
    const taskId = transfer.getData(TASK_MIME);
    if (taskId) return { kind: "task", id: taskId };
    const raw = transfer.getData("text/plain") || "";
    if (raw.startsWith("project:")) return { kind: "project", id: raw.slice(8) };
    if (raw.startsWith("task:")) return { kind: "task", id: raw.slice(5) };
    if (/^[0-9a-f-]{36}$/i.test(raw)) return { kind: "task", id: raw };
  }
  return currentDrag();
}

export function allowDrop(event: ReactDragEvent) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

export function dragKind(event: ReactDragEvent): "project" | "task" | null {
  const types = Array.from(event.dataTransfer.types);
  if (types.includes(PROJECT_MIME)) return "project";
  if (types.includes(TASK_MIME)) return "task";
  return currentDrag()?.kind ?? null;
}

import type { IconName } from "@/components/icons/AppIcons";
import type { Project } from "@/lib/types";

export const FAVORITE_MAX = 8;
export const FAVORITES_EVENT = "workos:favorites";

export type FavoriteKind = "route" | "project" | "task" | "note";

export type Favorite = {
  href: string;
  label: string;
  kind: FavoriteKind;
  id?: string;
  icon?: IconName;
};

export const ROUTE_PAGES: Favorite[] = [
  { href: "/", label: "Home", kind: "route", icon: "home" },
  { href: "/inbox", label: "Inbox", kind: "route", icon: "inbox" },
  { href: "/tasks", label: "My Tasks", kind: "route", icon: "tasks" },
  { href: "/calendar", label: "Calendar", kind: "route", icon: "calendar" },
  { href: "/review", label: "Weekly Review", kind: "route", icon: "review" },
  { href: "/statistics", label: "Statistics", kind: "route", icon: "stats" },
  { href: "/notes", label: "Notes", kind: "route", icon: "notes" },
  { href: "/team", label: "Team", kind: "route", icon: "team" },
  { href: "/settings", label: "Settings", kind: "route", icon: "settings" },
];

const GUEST_HREF = new Set(["/", "/calendar", "/statistics", "/notes"]);

function storageKey(workspaceId: string) {
  return `workos:favorites:${workspaceId}`;
}

export function guestMayOpen(href: string) {
  if (GUEST_HREF.has(href)) return true;
  return /^\/(projects|tasks|notes)\/[^/]+$/.test(href);
}

export function canFavoritePath(pathname: string) {
  if (!pathname || pathname.startsWith("/login") || pathname.startsWith("/register")) return false;
  if (pathname.startsWith("/invite") || pathname.startsWith("/verify-phone")) return false;
  if (pathname === "/notes/new") return false;
  return Boolean(pageFromPath(pathname, []));
}

export function pageFromPath(pathname: string, projects: Project[]): Favorite | null {
  const route = ROUTE_PAGES.find((item) => item.href === pathname);
  if (route) return { ...route };

  const project = pathname.match(/^\/projects\/([^/]+)$/)?.[1];
  if (project) {
    const row = projects.find((item) => item.id === project);
    return { href: `/projects/${project}`, label: row?.name ?? "Project", kind: "project", id: project, icon: "folder" };
  }

  const task = pathname.match(/^\/tasks\/([^/]+)$/)?.[1];
  if (task) return { href: `/tasks/${task}`, label: "Task", kind: "task", id: task, icon: "tasks" };

  const note = pathname.match(/^\/notes\/([^/]+)$/)?.[1];
  if (note) return { href: `/notes/${note}`, label: "Note", kind: "note", id: note, icon: "notes" };

  return null;
}

export function favoriteActive(pathname: string, href: string) {
  return pathname === href;
}

export function loadFavorites(workspaceId: string): Favorite[] {
  if (!workspaceId || typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(workspaceId)) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is Favorite => Boolean(item && typeof item.href === "string" && typeof item.label === "string"))
      .slice(0, FAVORITE_MAX);
  } catch {
    return [];
  }
}

export function saveFavorites(workspaceId: string, items: Favorite[]) {
  if (!workspaceId || typeof window === "undefined") return;
  localStorage.setItem(storageKey(workspaceId), JSON.stringify(items.slice(0, FAVORITE_MAX)));
}

export function sourceLabel(item: Favorite, projects: Project[]) {
  if (item.kind === "project" && item.id) {
    return projects.find((project) => project.id === item.id)?.name ?? item.label;
  }
  return ROUTE_PAGES.find((page) => page.href === item.href)?.label ?? item.label;
}

export function hydrateFavorites(items: Favorite[], projects: Project[], guest: boolean) {
  return items
    .filter((item) => !guest || guestMayOpen(item.href))
    .filter((item) => item.kind !== "project" || projects.some((project) => project.id === item.id))
    .map((item) => {
      const route = ROUTE_PAGES.find((page) => page.href === item.href);
      return route ? { ...item, icon: route.icon } : item;
    });
}

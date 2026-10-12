"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { BrandLockup, ChevronRightGlyph, IconTile } from "@/components/icons/AppIcons";
import { api } from "@/lib/api";
import { APP_VERSION, copyrightLine } from "@/lib/appInfo";
import { useApp } from "@/lib/AppContext";
import { allowDrop, currentDrag, endDrag, parseDragData, setDragData } from "@/lib/dnd";
import { ancestorIds, canMoveUnder } from "@/lib/nesting";
import { isoWeekMonday, needsWeekendReviewPrompt, todayIso } from "@/lib/review";
import type { Project } from "@/lib/types";

type ProjectNode = Omit<Project, "children"> & { children: ProjectNode[] };

const TREE_KEY = "workos:projectTree:collapsed";

function nestProjects(projects: Project[]): ProjectNode[] {
  const map = new Map<string, ProjectNode>();
  projects.forEach((p) => map.set(p.id, { ...p, children: [] }));
  const roots: ProjectNode[] = [];
  map.forEach((node) => {
    const parent = node.parent_id ? map.get(node.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function folderIds(nodes: ProjectNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children.length) {
      out.push(node.id);
      folderIds(node.children, out);
    }
  }
  return out;
}

function loadCollapsed(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(TREE_KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function navClass(active: boolean) {
  return `nav-item ${active ? "nav-item-active" : ""}`;
}

function ProjectLink({
  node,
  pathname,
  depth,
  guest,
  projects,
  overId,
  setOverId,
  collapsed,
  onToggle,
  onEnsureOpen,
  onMoved,
}: {
  node: ProjectNode;
  pathname: string;
  depth: number;
  guest: boolean;
  projects: Project[];
  overId: string | null;
  setOverId: Dispatch<SetStateAction<string | null>>;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onEnsureOpen: (id: string) => void;
  onMoved: () => Promise<void>;
}) {
  const dragged = useRef(false);
  const active = pathname === `/projects/${node.id}`;
  const over = overId === node.id;
  const hasKids = node.children.length > 0;
  const open = hasKids && !collapsed.has(node.id);

  async function accept(childId: string) {
    try {
      await api(`/api/projects/${childId}`, { method: "PATCH", body: JSON.stringify({ parent_id: node.id }) });
    } catch {
      /* cycle or depth limit */
    }
    onEnsureOpen(node.id);
    await onMoved();
  }

  return (
    <>
      <div
        draggable={!guest}
        onDragStart={(e) => {
          if (guest) return;
          dragged.current = true;
          setDragData(e, "project", node.id);
        }}
        onDragEnd={() => {
          endDrag();
          setOverId(null);
          window.setTimeout(() => {
            dragged.current = false;
          }, 0);
        }}
        onDragOver={(e) => {
          const d = currentDrag();
          if (d?.kind !== "project" || !canMoveUnder(projects, d.id, node.id)) return;
          allowDrop(e);
          setOverId(node.id);
        }}
        onDragLeave={() => {
          setOverId((current) => (current === node.id ? null : current));
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOverId(null);
          const d = parseDragData(e);
          endDrag();
          if (d?.kind === "project" && canMoveUnder(projects, d.id, node.id)) void accept(d.id);
        }}
        className={`flex items-center rounded ${over ? "bg-accent-soft ring-1 ring-inset ring-accent" : ""} ${guest ? "" : "cursor-grab active:cursor-grabbing"}`}
      >
        {hasKids ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
            title={open ? "Collapse" : "Expand"}
            style={{ marginLeft: 2 + depth * 12 }}
            className="flex h-7 w-5 shrink-0 items-center justify-center rounded text-sidebar-muted hover:bg-hover hover:text-sidebar-ink"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            <ChevronRightGlyph size={12} className={`transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="inline-block h-7 w-5 shrink-0" style={{ marginLeft: 2 + depth * 12 }} />
        )}
        <Link
          href={`/projects/${node.id}`}
          className={`${navClass(active)} min-w-0 flex-1 pr-2`}
          onClick={(e) => {
            if (dragged.current) e.preventDefault();
          }}
        >
          <IconTile name="folder" size={22} active={active} />
          <span className="truncate">{node.name}</span>
          {hasKids && !open && (
            <span className="ml-auto shrink-0 text-[11px] tabular-nums text-sidebar-muted">{node.children.length}</span>
          )}
        </Link>
      </div>
      {open &&
        node.children.map((child) => (
          <ProjectLink
            key={child.id}
            node={child}
            pathname={pathname}
            depth={depth + 1}
            guest={guest}
            projects={projects}
            overId={overId}
            setOverId={setOverId}
            collapsed={collapsed}
            onToggle={onToggle}
            onEnsureOpen={onEnsureOpen}
            onMoved={onMoved}
          />
        ))}
    </>
  );
}

const nav = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/inbox", label: "Inbox", icon: "inbox" as const },
  { href: "/tasks", label: "My Tasks", icon: "tasks" as const },
  { href: "/calendar", label: "Calendar", icon: "calendar" as const },
  { href: "/review", label: "Review", icon: "review" as const },
  { href: "/statistics", label: "Statistics", icon: "stats" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { me, projects, inboxCount, refresh } = useApp();
  const role = me?.workspace?.role;
  const guest = role === "guest";
  const solo = (me?.workspace?.member_count ?? 1) < 2;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [reviewDot, setReviewDot] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);
  const [projectDrag, setProjectDrag] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [treeReady, setTreeReady] = useState(false);
  const tree = nestProjects(projects);
  const folders = folderIds(tree);

  useEffect(() => {
    const update = () => setReviewDot(needsWeekendReviewPrompt(isoWeekMonday(todayIso())));
    update();
    window.addEventListener("workos:changed", update);
    return () => window.removeEventListener("workos:changed", update);
  }, []);

  useEffect(() => {
    setCollapsed(loadCollapsed());
    setTreeReady(true);
  }, []);

  useEffect(() => {
    if (!treeReady) return;
    localStorage.setItem(TREE_KEY, JSON.stringify([...collapsed]));
  }, [collapsed, treeReady]);

  useEffect(() => {
    const id = pathname.match(/^\/projects\/([^/?#]+)/)?.[1];
    if (!id) return;
    const open = ancestorIds(projects, id);
    if (!open.size) return;
    setCollapsed((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const ancestor of open) {
        if (next.delete(ancestor)) changed = true;
      }
      return changed ? next : prev;
    });
  }, [pathname, projects]);

  function toggleFolder(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function ensureOpen(id: string) {
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function createProject() {
    const n = name.trim();
    if (!n) return;
    const p = await api<{ id: string }>("/api/projects", { method: "POST", body: JSON.stringify({ name: n }) });
    setName("");
    setAdding(false);
    await refresh();
    router.push(`/projects/${p.id}`);
  }

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-sidebar text-sidebar-ink"
      onDragStart={() => {
        if (currentDrag()?.kind === "project") setProjectDrag(true);
      }}
      onDragEnd={() => setProjectDrag(false)}
    >
      <Link href="/" className="flex h-14 items-center px-4 hover:bg-hover">
        <BrandLockup size={22} subtitle={me?.workspace.name ?? "Personal"} />
      </Link>
      <div className="section-label px-4 pb-1 pt-4">Workflow</div>
      <nav className="px-2">
        {nav
          .filter((item) => !guest || item.href === "/" || item.href === "/calendar" || item.href === "/statistics")
          .map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={navClass(active)}>
                <IconTile name={item.icon} size={22} active={active} />
                <span className="flex-1">{item.label}</span>
                {item.href === "/inbox" && inboxCount > 0 && (
                  <span className="min-w-5 rounded bg-overdue px-1.5 text-center text-[11px] font-semibold tabular-nums text-white">{inboxCount}</span>
                )}
                {item.href === "/review" && reviewDot && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Review this week" />}
              </Link>
            );
          })}
        {!guest && !solo && (
          <Link href="/team" className={navClass(pathname.startsWith("/team"))}>
            <IconTile name="team" size={22} active={pathname.startsWith("/team")} /> Team
          </Link>
        )}
        <Link href="/notes" className={navClass(pathname.startsWith("/notes"))}>
          <IconTile name="notes" size={22} active={pathname.startsWith("/notes")} /> Notes
        </Link>
      </nav>
      <div
        className={`mt-4 flex items-center gap-1 px-2 ${overId === "root" ? "rounded bg-accent-soft text-accent" : ""}`}
        onDragOver={(e) => {
          if (guest || currentDrag()?.kind !== "project") return;
          allowDrop(e);
          setOverId("root");
        }}
        onDragLeave={() => {
          if (overId === "root") setOverId(null);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setOverId(null);
          const d = parseDragData(e);
          endDrag();
          if (guest || d?.kind !== "project") return;
          try {
            await api(`/api/projects/${d.id}`, { method: "PATCH", body: JSON.stringify({ clear_parent: true }) });
          } catch {
            /* already top-level */
          }
          await refresh();
        }}
      >
        <div className="section-label min-w-0 flex-1 px-2 pb-1">
          Projects{projectDrag ? " · drop to top level" : ""}
        </div>
        {folders.length > 0 && (
          <div className="flex shrink-0 pb-1">
            <button
              type="button"
              title="Expand all"
              aria-label="Expand all"
              className="flex h-6 w-6 items-center justify-center rounded text-sidebar-muted hover:bg-hover hover:text-sidebar-ink"
              onClick={() => setCollapsed(new Set())}
            >
              <ChevronRightGlyph size={12} className="rotate-90" />
            </button>
            <button
              type="button"
              title="Collapse all"
              aria-label="Collapse all"
              className="flex h-6 w-6 items-center justify-center rounded text-sidebar-muted hover:bg-hover hover:text-sidebar-ink"
              onClick={() => setCollapsed(new Set(folders))}
            >
              <ChevronRightGlyph size={12} />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {!guest && (
          <button type="button" onClick={() => setAdding(true)} className="nav-item w-full text-sidebar-muted">
            <IconTile name="plus" size={22} /> New project
          </button>
        )}
        {adding && (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name.trim() && setAdding(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void createProject();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Project name"
            className="mb-1 h-9 w-full rounded border-0 bg-hover px-2 text-sm text-ink placeholder:text-sidebar-muted"
          />
        )}
        {tree.map((node) => (
          <ProjectLink
            key={node.id}
            node={node}
            pathname={pathname}
            depth={0}
            guest={guest}
            projects={projects}
            overId={overId}
            setOverId={setOverId}
            collapsed={collapsed}
            onToggle={toggleFolder}
            onEnsureOpen={ensureOpen}
            onMoved={refresh}
          />
        ))}
      </div>
      <div className="mx-2 mb-3 mt-1">
        {!guest && (
          <Link href="/settings" className={navClass(pathname.startsWith("/settings"))}>
            <IconTile name="settings" size={22} active={pathname.startsWith("/settings")} /> Settings
          </Link>
        )}
        <p className="px-2 pt-2 text-[11px] leading-4 text-sidebar-muted">
          {copyrightLine}
          <span className="mt-0.5 block tabular-nums">Version {APP_VERSION}</span>
        </p>
      </div>
    </aside>
  );
}

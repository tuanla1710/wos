"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup, IconTile } from "@/components/icons/AppIcons";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { isoWeekMonday, needsWeekendReviewPrompt, todayIso } from "@/lib/review";
import type { Project } from "@/lib/types";

type ProjectNode = Project & { children: ProjectNode[] };

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

function navClass(active: boolean) {
  return `nav-item ${active ? "nav-item-active" : ""}`;
}

function ProjectLink({ node, pathname, depth }: { node: ProjectNode; pathname: string; depth: number }) {
  const active = pathname === `/projects/${node.id}`;
  return (
    <>
      <Link href={`/projects/${node.id}`} style={{ paddingLeft: 8 + depth * 14 }} className={`${navClass(active)} pr-2`}>
        <IconTile name="folder" size={18} active={active} />
        <span className="truncate">{node.name}</span>
      </Link>
      {node.children.map((child) => (
        <ProjectLink key={child.id} node={child} pathname={pathname} depth={depth + 1} />
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

  useEffect(() => {
    const update = () => setReviewDot(needsWeekendReviewPrompt(isoWeekMonday(todayIso())));
    update();
    window.addEventListener("workos:changed", update);
    return () => window.removeEventListener("workos:changed", update);
  }, []);

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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line bg-sidebar text-sidebar-ink">
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
                <IconTile name={item.icon} size={18} active={active} />
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
            <IconTile name="team" size={18} active={pathname.startsWith("/team")} /> Team
          </Link>
        )}
        <Link href="/notes" className={navClass(pathname.startsWith("/notes"))}>
          <IconTile name="notes" size={18} active={pathname.startsWith("/notes")} /> Notes
        </Link>
      </nav>
      <div className="section-label mt-4 px-4 pb-1">Projects</div>
      <div className="flex-1 overflow-y-auto px-2">
        {!guest && (
          <button type="button" onClick={() => setAdding(true)} className="nav-item w-full text-sidebar-muted">
            <IconTile name="plus" size={18} /> New project
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
        {nestProjects(projects).map((node) => (
          <ProjectLink key={node.id} node={node} pathname={pathname} depth={0} />
        ))}
      </div>
      {!guest && (
        <Link href="/settings" className={`mx-2 mb-2 ${navClass(pathname.startsWith("/settings"))}`}>
          <IconTile name="settings" size={18} active={pathname.startsWith("/settings")} /> Settings
        </Link>
      )}
    </aside>
  );
}

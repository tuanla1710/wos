"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconTile, PlusGlyph, ProjectLevelTile, type IconName } from "@/components/icons/AppIcons";
import { useApp } from "@/lib/AppContext";
import { FAVORITE_MAX, ROUTE_PAGES, favoriteActive, guestMayOpen, type Favorite } from "@/lib/favorites";
import { projectDepth } from "@/lib/nesting";
import { useFavorites } from "@/lib/useFavorites";

function FavoriteMark({ item }: { item: Favorite }) {
  const { projects } = useApp();
  if (item.kind === "project" && item.id) {
    return <ProjectLevelTile depth={projectDepth(projects, item.id)} size={22} />;
  }
  return <IconTile name={(item.icon ?? "star") as IconName} size={22} />;
}

function FavoriteTab({
  item,
  active,
  onRemove,
  onRename,
}: {
  item: Favorite;
  active: boolean;
  onRemove: () => void;
  onRename: (label: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);

  function startEdit() {
    setDraft(item.label);
    setEditing(true);
  }

  function save() {
    onRename(draft);
    setEditing(false);
  }

  return (
    <div className={`group flex h-9 shrink-0 items-center rounded-lg ${active ? "bg-active" : "hover:bg-hover"}`}>
      {editing ? (
        <span className="flex min-w-0 items-center gap-2 px-2">
          <FavoriteMark item={item} />
          <input
            autoFocus
            value={draft}
            maxLength={40}
            aria-label="Favorite name"
            className="h-7 w-[120px] rounded border border-line bg-elev px-1.5 text-sm outline-none"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      ) : (
        <Link
          href={item.href}
          className="flex min-w-0 items-center gap-2 px-2"
          title={`${item.label} · double-click to rename`}
          onDoubleClick={(e) => {
            e.preventDefault();
            startEdit();
          }}
        >
          <FavoriteMark item={item} />
          <span className="max-w-[120px] truncate text-sm">{item.label}</span>
        </Link>
      )}
      {!editing && (
        <button
          type="button"
          className="mr-1 hidden h-6 w-6 items-center justify-center rounded text-sidebar-muted hover:bg-hover hover:text-ink group-hover:inline-flex"
          title="Remove"
          aria-label={`Remove ${item.label}`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function FavoriteDock() {
  const pathname = usePathname();
  const { me, projects } = useApp();
  const { items, current, pinned, full, guest, add, remove, rename } = useFavorites();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const solo = (me?.workspace?.member_count ?? 1) < 2;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const routes = ROUTE_PAGES.filter((page) => {
    if (guest && !guestMayOpen(page.href)) return false;
    if (page.href === "/team" && (guest || solo)) return false;
    if (page.href === "/settings" && guest) return false;
    return !items.some((item) => item.href === page.href);
  });
  const projectChoices = projects.filter((project) => !items.some((item) => item.id === project.id && item.kind === "project"));
  const currentChoice = current && !pinned ? current : null;

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-t border-line bg-sidebar px-4">
      <p className="section-label shrink-0">Favorites</p>
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {items.length === 0 && (
          <p className="truncate text-[12px] text-sidebar-muted">Star a page, or add one here.</p>
        )}
        {items.map((item) => (
          <FavoriteTab
            key={item.href}
            item={item}
            active={favoriteActive(pathname, item.href)}
            onRemove={() => remove(item.href)}
            onRename={(label) => rename(item.href, label)}
          />
        ))}
      </nav>
      <div className="relative shrink-0" ref={box}>
        <button
          type="button"
          className="icon-btn"
          title={full ? `Favorites are full (${FAVORITE_MAX}).` : "Add a favorite"}
          aria-label="Add a favorite"
          disabled={full}
          onClick={() => setOpen((v) => !v)}
        >
          <PlusGlyph size={16} boxed={false} />
        </button>
        {open && !full && (
          <div className="absolute bottom-11 right-0 z-30 max-h-[320px] w-[280px] overflow-y-auto rounded-lg border border-line bg-elev p-2 shadow-popover">
            <p className="px-2 pb-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Add page</p>
            {currentChoice && (
              <button type="button" className="flex h-9 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { void add(currentChoice); setOpen(false); }}>
                <FavoriteMark item={currentChoice} />
                <span className="truncate">{currentChoice.label} <span className="text-muted">· this page</span></span>
              </button>
            )}
            {routes.map((page) => (
              <button key={page.href} type="button" className="flex h-9 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { void add(page); setOpen(false); }}>
                <FavoriteMark item={page} />
                <span className="truncate">{page.label}</span>
              </button>
            ))}
            {projectChoices.length > 0 && <p className="px-2 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">Projects</p>}
            {projectChoices.map((project) => {
              const page: Favorite = { href: `/projects/${project.id}`, label: project.name, kind: "project", id: project.id, icon: "folder" };
              return (
                <button key={project.id} type="button" className="flex h-9 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-hover" onClick={() => { void add(page); setOpen(false); }}>
                  <FavoriteMark item={page} />
                  <span className="truncate">{project.name}</span>
                </button>
              );
            })}
            {!currentChoice && routes.length === 0 && projectChoices.length === 0 && (
              <p className="px-2 py-2 text-sm text-muted">Every listed page is already pinned.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

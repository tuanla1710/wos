"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import {
  FAVORITE_MAX,
  FAVORITES_EVENT,
  hydrateFavorites,
  loadFavorites,
  pageFromPath,
  saveFavorites,
  sourceLabel,
  type Favorite,
} from "@/lib/favorites";

async function enrich(page: Favorite): Promise<Favorite> {
  try {
    if (page.kind === "task" && page.id && page.label === "Task") {
      const row = await api<{ title: string }>(`/api/tasks/${page.id}`);
      return { ...page, label: row.title || page.label };
    }
    if (page.kind === "note" && page.id && page.label === "Note") {
      const row = await api<{ title: string }>(`/api/notes/${page.id}`);
      return { ...page, label: row.title || page.label };
    }
  } catch {
    /* keep fallback label */
  }
  return page;
}

export function useFavorites() {
  const pathname = usePathname();
  const { me, projects } = useApp();
  const workspaceId = me?.workspace.id ?? "";
  const guest = me?.workspace?.role === "guest";
  const [items, setItems] = useState<Favorite[]>([]);

  const refresh = useCallback(() => {
    if (!workspaceId) {
      setItems([]);
      return;
    }
    setItems(hydrateFavorites(loadFavorites(workspaceId), projects, guest));
  }, [guest, projects, workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(FAVORITES_EVENT, refresh);
    return () => window.removeEventListener(FAVORITES_EVENT, refresh);
  }, [refresh]);

  const commit = useCallback(
    (next: Favorite[]) => {
      if (!workspaceId) return;
      const clipped = hydrateFavorites(next, projects, guest).slice(0, FAVORITE_MAX);
      saveFavorites(workspaceId, clipped);
      setItems(clipped);
      window.dispatchEvent(new Event(FAVORITES_EVENT));
    },
    [guest, projects, workspaceId],
  );

  const current = pageFromPath(pathname, projects);
  const currentHref = current?.href;
  const pinned = Boolean(currentHref && items.some((item) => item.href === currentHref));

  const add = useCallback(
    async (page: Favorite) => {
      if (items.some((item) => item.href === page.href) || items.length >= FAVORITE_MAX) return;
      commit([...items, await enrich(page)]);
    },
    [commit, items],
  );

  const remove = useCallback(
    (href: string) => {
      commit(items.filter((item) => item.href !== href));
    },
    [commit, items],
  );

  const toggleCurrent = useCallback(async () => {
    if (!current) return;
    if (items.some((item) => item.href === current.href)) {
      remove(current.href);
      return;
    }
    await add(current);
  }, [add, current, items, remove]);

  const rename = useCallback(
    (href: string, label: string) => {
      commit(
        items.map((item) => {
          if (item.href !== href) return item;
          const next = label.trim().slice(0, 40);
          return { ...item, label: next || sourceLabel(item, projects) };
        }),
      );
    },
    [commit, items, projects],
  );

  return {
    items,
    current,
    pinned,
    full: items.length >= FAVORITE_MAX,
    guest,
    add,
    remove,
    rename,
    toggleCurrent,
  };
}

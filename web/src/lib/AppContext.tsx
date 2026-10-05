"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandLockup } from "@/components/icons/AppIcons";
import { api, ApiError, setWorkspaceId } from "./api";
import type { Holiday, Me, Project, WorkspaceRef } from "./types";

type Ctx = {
  me: Me | null;
  projects: Project[];
  workspaces: WorkspaceRef[];
  holidays: string[];
  inboxCount: number;
  unread: number;
  refresh: () => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
};

const AppCtx = createContext<Ctx>({
  me: null,
  projects: [],
  workspaces: [],
  holidays: [],
  inboxCount: 0,
  unread: 0,
  refresh: async () => {},
  switchWorkspace: async () => {},
});

export function useApp() {
  return useContext(AppCtx);
}

function isRetryable(e: unknown) {
  return e instanceof ApiError && (e.status === 500 || e.status === 502 || e.status === 503);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [workspaces, setWorkspaces] = useState<WorkspaceRef[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadSession = useCallback(async () => {
    const user = await api<Me>("/api/me");
    setMe(user);
    if (user.workspace?.id) setWorkspaceId(user.workspace.id);
    const role = user.workspace?.role;
    const [p, spaces, hol] = await Promise.all([
      api<{ projects: Project[] }>("/api/projects"),
      api<{ workspaces: WorkspaceRef[] }>("/api/workspaces"),
      api<{ holidays: Holiday[] }>("/api/workspace/holidays").catch(() => ({ holidays: [] })),
    ]);
    setProjects(p.projects);
    setWorkspaces(spaces.workspaces);
    setHolidays(hol.holidays.map((h) => h.day));
    if (role === "guest") {
      setInboxCount(0);
      setUnread(0);
    } else {
      const [inbox, notes] = await Promise.all([
        api<{ tasks: unknown[] }>("/api/tasks?tab=inbox"),
        api<{ unread: number }>("/api/notifications"),
      ]);
      setInboxCount(inbox.tasks.length);
      setUnread(notes.unread);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("workos:changed"));
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        try {
          await loadSession();
          setReady(true);
          return;
        } catch (e) {
          if (cancelled) return;
          if (e instanceof ApiError && e.status === 401) {
            setMe(null);
            setReady(true);
            if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
              router.replace("/login");
            }
            return;
          }
          if (!isRetryable(e)) {
            setReady(true);
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadSession, pathname, router]);

  if (!ready) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-[320px] rounded-lg border border-line bg-elev px-6 py-8 text-center shadow-modal">
          <div className="flex justify-center">
            <BrandLockup size={28} large />
          </div>
          <p className="mt-5 text-sm font-medium text-ink">Connecting…</p>
          <p className="mt-1 text-[12px] text-muted">Waiting for the API on port 8080</p>
          <span className="mt-5 inline-block h-1 w-16 animate-pulse rounded-full bg-accent" />
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Redirecting to sign in…</p>
      </div>
    );
  }

  async function switchWorkspace(id: string) {
    setWorkspaceId(id);
    await refresh();
  }

  return (
    <AppCtx.Provider value={{ me, projects, workspaces, holidays, inboxCount, unread, refresh, switchWorkspace }}>
      {children}
    </AppCtx.Provider>
  );
}

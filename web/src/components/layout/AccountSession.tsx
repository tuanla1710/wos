"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { logOut } from "@/lib/session";

export function TopBarAccount() {
  const { me } = useApp();
  const router = useRouter();
  if (!me) return null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0 text-right">
        <p className="text-[11px] leading-4 text-muted">Logged in as</p>
        <p className="truncate text-sm font-medium" title={me.email}>
          {me.name}
        </p>
      </div>
      <button type="button" className="btn-ghost shrink-0" onClick={() => void logOut(router)}>
        Log out
      </button>
    </div>
  );
}

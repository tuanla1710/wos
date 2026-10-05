"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Team = {
  solo: boolean;
  members: { id: string; name: string; open: number; progress: number | null; bar: number }[];
  blocked: { user: string; task_id: string; title: string; blocked_reason: string }[];
};

export default function TeamPage() {
  const [data, setData] = useState<Team | null>(null);
  const router = useRouter();

  useEffect(() => {
    void api<Team>("/api/team").then(setData).catch(() => {});
  }, []);

  if (!data) return null;
  if (data.solo) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Team</h1>
        <p className="mt-4 text-sm text-muted">Invite your team</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <h1 className="text-xl font-semibold">Team</h1>
      <div className="mt-6 space-y-1 rounded-xl glass p-4 text-sm">
        {data.members.map((m) => (
          <div key={m.id} className="flex h-11 items-center gap-3">
            <span className="w-32 truncate font-medium">{m.name}</span>
            <span className="w-10 tabular-nums text-muted">{m.open}</span>
            <span className="h-2 flex-1 rounded bg-line">
              <span className="block h-2 rounded bg-accent/70" style={{ width: `${m.bar}%` }} />
            </span>
            <span className="w-12 text-right tabular-nums text-muted">{m.progress == null ? "—" : `${m.progress}%`}</span>
          </div>
        ))}
      </div>
      <p className="section-label mt-8">Who is blocked</p>
      {data.blocked.map((b) => (
        <button key={b.task_id} type="button" className="mt-2 block text-sm text-overdue" onClick={() => router.push(`/tasks/${b.task_id}`)}>
          {b.user} · {b.title} {b.blocked_reason}
        </button>
      ))}
    </div>
  );
}

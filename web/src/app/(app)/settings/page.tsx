"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, downloadBackup, restoreBackup } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import type { Holiday, HolidaySettings, PublicHoliday } from "@/lib/types";

export default function SettingsPage() {
  const { me, refresh } = useApp();
  const router = useRouter();
  const [name, setName] = useState(me?.name ?? "");
  const [timezone, setTimezone] = useState(me?.timezone ?? "Asia/Seoul");
  const [ws, setWs] = useState(me?.workspace.name ?? "");
  const [msg, setMsg] = useState("");

  if (!me) return null;

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="mt-6 max-w-md space-y-6 text-sm">
      <div className="space-y-4 paper-section">
        <p className="section-label">Profile</p>
        <label className="block">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9 w-full rounded border border-line px-3" />
        </label>
        <label className="block">
          Email
          <input value={me.email} disabled className="mt-1 h-9 w-full rounded border border-line bg-hover px-3 text-muted" />
        </label>
        <label className="block">
          Timezone
          <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-1 h-9 w-full rounded border border-line px-3" />
        </label>
        <label className="block">
          Workspace name
          <input value={ws} onChange={(e) => setWs(e.target.value)} className="mt-1 h-9 w-full rounded border border-line px-3" />
        </label>
        <button
          type="button"
          className="h-9 rounded-lg bg-accent px-3 font-semibold text-white hover:bg-accent-hover"
          onClick={async () => {
            await api("/api/me", { method: "PATCH", body: JSON.stringify({ name, timezone }) });
            await api("/api/workspace", { method: "PATCH", body: JSON.stringify({ name: ws }) });
            await refresh();
            setMsg("Saved.");
          }}
        >
          Save
        </button>
        {msg && <p className="text-muted">{msg}</p>}
      </div>
        {me.workspace.role === "owner" && <BillingBlock onMessage={setMsg} />}
        <label className="flex items-center gap-2 paper-section">
          <input
            type="checkbox"
            checked={!!me.ai_enabled}
            onChange={async (e) => {
              await api("/api/me", { method: "PATCH", body: JSON.stringify({ ai_enabled: e.target.checked }) });
              await refresh();
            }}
          />
          Enable AI suggestions
        </label>
        <HolidaysBlock />
        {me.workspace.role === "owner" && <BackupRestoreBlock onMessage={setMsg} />}
        <MembersBlock />
        <button
          type="button"
          className="h-9 rounded px-3 text-muted hover:bg-hover hover:text-ink"
          onClick={async () => {
            await api("/api/auth/logout", { method: "POST" });
            router.replace("/login");
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function HolidaysBlock() {
  const { refresh } = useApp();
  const [rows, setRows] = useState<Holiday[]>([]);
  const [day, setDay] = useState("");
  const [name, setName] = useState("");

  async function load() {
    try {
      setRows((await api<{ holidays: Holiday[] }>("/api/workspace/holidays")).holidays);
    } catch {
      /* ignore while API is down */
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-3 paper-section">
      <p className="section-label">Holidays</p>
      <PublicHolidaysBlock />
      <p className="pt-2 text-[12px] font-semibold text-ink">Custom days off</p>
      <p className="text-[12px] text-muted">Company days or one-off government days. Workdays skip weekends, public holidays and these dates.</p>
      {rows.length === 0 && <p className="text-[12px] text-muted">No custom days yet.</p>}
      {rows.map((h) => (
        <div key={h.id} className="flex h-9 items-center gap-2">
          <span className="tabular-nums">{h.day}</span>
          <span className="flex-1 truncate text-muted">{h.name}</span>
          <button
            type="button"
            className="text-overdue"
            onClick={async () => {
              await api(`/api/workspace/holidays/${h.id}`, { method: "DELETE" });
              await load();
              await refresh();
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!day) return;
          await api("/api/workspace/holidays", { method: "POST", body: JSON.stringify({ day, name }) });
          setDay("");
          setName("");
          await load();
          await refresh();
        }}
      >
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="h-9 rounded border border-line px-2" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="h-9 min-w-0 flex-1 rounded border border-line px-2" />
        <button type="submit" className="h-9 rounded-lg bg-accent px-3 font-semibold text-white hover:bg-accent-hover">
          Add
        </button>
      </form>
    </div>
  );
}

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

function PublicHolidaysBlock() {
  const { refresh } = useApp();
  const [settings, setSettings] = useState<HolidaySettings | null>(null);
  const [list, setList] = useState<PublicHoliday[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const tz = browserTimezone();

  async function loadList(y = year) {
    const d = await api<{ holidays: PublicHoliday[] }>(`/api/holidays?from=${y}-01-01&to=${y}-12-31`);
    setList(d.holidays.filter((h) => h.kind !== "custom"));
  }

  useEffect(() => {
    void api<HolidaySettings>("/api/holidays/settings").then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    void loadList(year).catch(() => {});
  }, [year]);

  async function save(patch: Record<string, string | null>) {
    setSettings(await api<HolidaySettings>("/api/holidays/settings", { method: "PATCH", body: JSON.stringify(patch) }));
    await loadList();
    await refresh();
  }

  if (!settings) return null;
  const name = (code: string) => settings.countries.find((c) => c.code === code)?.name ?? code;
  const tzMismatch = tz && settings.timezone && tz !== settings.timezone;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-[12px] text-muted">
          Country (red days)
          <select
            value={settings.country === null ? "auto" : settings.country}
            onChange={(e) => void save({ country: e.target.value === "auto" ? null : e.target.value })}
            className="mt-1 h-9 w-full rounded border border-line px-2 text-sm text-ink"
          >
            <option value="auto">Auto — {settings.detected ? name(settings.detected) : "not detected"} ({settings.timezone})</option>
            <option value="">None</option>
            {settings.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] text-muted">
          Also show (not days off)
          <select
            value={settings.country2 ?? ""}
            onChange={(e) => void save({ country2: e.target.value || null })}
            className="mt-1 h-9 w-full rounded border border-line px-2 text-sm text-ink"
          >
            <option value="">None</option>
            {settings.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {tzMismatch && (
        <p className="text-[12px] text-muted">
          This browser is in {tz}, your profile uses {settings.timezone}.{" "}
          <button
            type="button"
            className="font-semibold text-accent"
            onClick={async () => {
              await api("/api/me", { method: "PATCH", body: JSON.stringify({ timezone: tz }) });
              setSettings(await api<HolidaySettings>("/api/holidays/settings"));
              await loadList();
              await refresh();
            }}
          >
            Use {tz}
          </button>
        </p>
      )}
      <div className="flex items-center gap-2">
        <button type="button" className="icon-btn h-8 w-8" onClick={() => setYear((y) => y - 1)}>
          ‹
        </button>
        <span className="text-sm font-semibold tabular-nums">{year}</span>
        <button type="button" className="icon-btn h-8 w-8" onClick={() => setYear((y) => y + 1)}>
          ›
        </button>
        <span className="text-[12px] text-muted">{settings.effective ? `${settings.effective_name} public holidays` : "No country selected"}</span>
      </div>
      <div className="max-h-[320px] space-y-0.5 overflow-y-auto">
        {list.length === 0 && <p className="text-[12px] text-muted">No public holidays.</p>}
        {list.map((h) => (
          <div key={`${h.kind}-${h.day}-${h.name}`} className="flex h-8 items-center gap-2 text-sm">
            <span className={`w-24 tabular-nums ${h.off ? "text-overdue" : "text-muted"}`}>{h.day}</span>
            <span className={`flex-1 truncate ${h.kind === "secondary" ? "text-muted" : h.off ? "" : "text-muted line-through"}`} title={h.name}>
              {h.kind === "secondary" ? `${h.country} · ${h.name}` : `${h.name_en}${h.name !== h.name_en ? ` · ${h.name}` : ""}`}
            </span>
            {h.kind === "primary" && (
              <label className="flex items-center gap-1 text-[12px] text-muted">
                <input type="checkbox" checked={h.off} onChange={(e) => void save(e.target.checked ? { unskip: h.day } : { skip: h.day })} />
                Day off
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingBlock({ onMessage }: { onMessage: (msg: string) => void }) {
  const [billing, setBilling] = useState<{ plan: string; plan_name: string; status: string; seats_used: number; seats_max: number } | null>(null);
  const [tokens, setTokens] = useState<{ id: string; name: string; prefix: string }[]>([]);
  const [analytics, setAnalytics] = useState<{ created: number; completed: number; overdue: number; active_members: number } | null>(null);
  const [tokenValue, setTokenValue] = useState("");

  useEffect(() => {
    void api<typeof billing>("/api/billing").then(setBilling);
    void api<{ tokens: typeof tokens }>("/api/api-tokens").then((d) => setTokens(d.tokens));
    void api<typeof analytics>("/api/analytics").then(setAnalytics);
  }, []);

  return (
    <div className="space-y-3 paper-section">
      <p className="section-label">Billing</p>
      {billing && (
        <p className="text-muted">
          {billing.plan_name} · {billing.status} · {billing.seats_used}/{billing.seats_max} seats
        </p>
      )}
      {billing?.plan !== "team" && (
        <button type="button" className="h-9 rounded border border-line px-3" onClick={() => void api("/api/billing/subscribe", { method: "POST" }).then(() => { onMessage("Team plan active."); void api<typeof billing>("/api/billing").then(setBilling); })}>
          Upgrade to Team
        </button>
      )}
      {analytics && (
        <p className="text-muted">
          Last 7 days: {analytics.created} created · {analytics.completed} done · {analytics.active_members} active
        </p>
      )}
      {billing?.plan === "team" && (
        <div className="space-y-2">
          <p className="font-semibold">API tokens</p>
          {tokens.map((t) => (
            <p key={t.id} className="text-muted">
              {t.name} · {t.prefix}…
            </p>
          ))}
          <button
            type="button"
            className="h-9 rounded border border-line px-3"
            onClick={async () => {
              const created = await api<{ token: string; id: string; name: string; prefix: string }>("/api/api-tokens", { method: "POST", body: JSON.stringify({ name: "ci" }) });
              setTokenValue(created.token);
              setTokens((prev) => [...prev, created]);
            }}
          >
            Create token
          </button>
          {tokenValue && <p className="break-all text-xs text-accent">{tokenValue}</p>}
        </div>
      )}
    </div>
  );
}

function BackupRestoreBlock({ onMessage }: { onMessage: (msg: string) => void }) {
  const [info, setInfo] = useState<{ uploads: number; counts: Record<string, number> } | null>(null);
  const [busy, setBusy] = useState<"download" | "restore" | "">("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void api<{ uploads: number; counts: Record<string, number> }>("/api/backup/status")
      .then(setInfo)
      .catch(() => {});
  }, []);

  const tasks = info?.counts.tasks ?? 0;
  const notes = info?.counts.notes ?? 0;
  const projects = info?.counts.projects ?? 0;

  return (
    <div className="space-y-3 paper-section">
      <p className="section-label">Backup & restore</p>
      <p className="text-[12px] text-muted">
        Download every workspace, task, note, and attachment. Restore replaces the current database.
        Keep the zip private — it includes account data.
      </p>
      {info && (
        <p className="text-[12px] text-muted">
          Now: {tasks} tasks · {projects} projects · {notes} notes · {info.uploads} files
        </p>
      )}
      <button
        type="button"
        disabled={!!busy}
        className="h-9 rounded-lg bg-accent px-3 font-semibold text-white hover:bg-accent-hover"
        onClick={async () => {
          setBusy("download");
          setError("");
          try {
            await downloadBackup();
            onMessage("Backup downloaded.");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not download backup.");
          } finally {
            setBusy("");
          }
        }}
      >
        {busy === "download" ? "Preparing…" : "Download backup"}
      </button>
      <p className="pt-2 text-[12px] font-semibold text-overdue">Restore replaces all current data.</p>
      <label className="block text-[12px] text-muted">
        Type RESTORE to confirm
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 h-9 w-full rounded border border-line px-3 text-sm text-ink"
          placeholder="RESTORE"
        />
      </label>
      <label className="block">
        <span className="sr-only">Backup file</span>
        <input
          type="file"
          accept=".zip,application/zip"
          disabled={confirm !== "RESTORE" || !!busy}
          className="block w-full text-[12px] text-muted file:mr-3 file:h-9 file:rounded-lg file:border file:border-line file:bg-transparent file:px-3 file:text-ink"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy("restore");
            setError("");
            try {
              const result = await restoreBackup(file);
              onMessage(`Restored ${result.rows} rows · ${result.uploads} files.`);
              window.location.reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not restore backup.");
              setBusy("");
            }
          }}
        />
      </label>
      {error && <p className="text-[12px] text-overdue">{error}</p>}
    </div>
  );
}

function MembersBlock() {
  const { me } = useApp();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [members, setMembers] = useState<{ id: string; name: string; role: string }[]>([]);
  const canInvite = me?.workspace.role === "owner" || me?.workspace.role === "admin";

  useEffect(() => {
    if (!canInvite) return;
    void api<{ members: { id: string; name: string; role: string }[] }>("/api/workspace/members").then((d) => setMembers(d.members));
  }, [canInvite]);

  if (!canInvite) return null;
  return (
    <div className="space-y-2 paper-section">
      <p className="section-label">Members</p>
      {members.map((m) => (
        <p key={m.id} className="text-muted">
          {m.name} · {m.role}
        </p>
      ))}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invite email" className="h-9 w-full rounded border border-line px-3" />
      <button
        type="button"
        className="h-9 rounded border border-line px-3"
        onClick={async () => {
          const inv = await api<{ url: string; token: string }>("/api/workspace/invites", { method: "POST", body: JSON.stringify({ email, role: "member" }) });
          setLink(`${window.location.origin}/invite/${inv.token}`);
        }}
      >
        Copy invite link
      </button>
      {link && <p className="break-all text-xs text-accent">{link}</p>}
    </div>
  );
}

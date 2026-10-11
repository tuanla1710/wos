"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/icons/AppIcons";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-[360px] rounded-lg border border-line bg-elev p-8 shadow-modal">
        <div className="mb-6">
          <BrandLockup size={28} large subtitle="Create your workspace" />
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 8) {
              setError("Password must be at least 8 characters.");
              return;
            }
            if (password !== confirm) {
              setError("Passwords don't match.");
              return;
            }
            try {
              localStorage.removeItem("workspaceId");
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
              await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, timezone: tz }) });
              router.replace("/");
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
            }
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm password" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          {error && <p className="text-[12px] text-overdue">{error}</p>}
          <button type="submit" className="h-9 w-full rounded bg-accent text-sm font-semibold text-white hover:bg-accent-hover">
            Create account
          </button>
        </form>
        <Link href="/login" className="mt-4 block text-center text-sm font-medium text-accent">
          Already have an account?
        </Link>
      </div>
    </main>
  );
}

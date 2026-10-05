"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/icons/AppIcons";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-[360px] rounded-lg border border-line bg-elev p-8 shadow-modal">
        <div className="mb-6">
          <BrandLockup size={28} large subtitle="Sign in to continue" />
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
              router.replace("/");
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "Email or password is wrong.");
            }
          }}
        >
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="h-9 w-full rounded border border-line px-3 text-sm" required />
          {error && <p className="text-[12px] text-overdue">{error}</p>}
          <button type="submit" className="h-9 w-full rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent-hover">
            Log in
          </button>
        </form>
        <Link href="/register" className="mt-4 block text-center text-sm font-medium text-accent">
          Create account
        </Link>
      </div>
    </main>
  );
}

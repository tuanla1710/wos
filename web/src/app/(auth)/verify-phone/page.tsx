"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/icons/AppIcons";
import { api, ApiError } from "@/lib/api";
import type { Me } from "@/lib/types";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<Me>("/api/me")
      .then((user) => {
        if (user.phone_verified) {
          router.replace("/");
          return;
        }
        setPhone(user.phone ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.replace("/login");
      });
  }, [router]);

  async function sendCode() {
    setError("");
    setBusy(true);
    try {
      const res = await api<{ phone: string; dev_code?: string }>("/api/auth/phone/send", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setPhone(res.phone);
      setSent(res.phone);
      setDevCode(res.dev_code ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-[360px] rounded-lg border border-line bg-elev p-8 shadow-modal">
        <div className="mb-6">
          <BrandLockup size={28} large subtitle="Verify your phone" />
        </div>
        <p className="mb-4 text-[12px] text-muted">A verified phone number is required before you can use Work OS.</p>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            try {
              await api("/api/auth/phone/verify", { method: "POST", body: JSON.stringify({ code }) });
              router.replace("/");
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "That code is wrong.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Phone (010-1234-5678)"
            className="h-9 w-full rounded border border-line px-3 text-sm"
            required
          />
          <button type="button" className="btn-ghost w-full" disabled={busy} onClick={() => void sendCode()}>
            {sent ? "Resend code" : "Send code"}
          </button>
          {sent && <p className="text-[12px] text-muted">Code sent to {sent}</p>}
          {devCode && <p className="text-[12px] text-muted">Local development code: {devCode}</p>}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="6-digit code"
            className="h-9 w-full rounded border border-line px-3 text-sm tabular-nums"
            required
            minLength={6}
          />
          {error && <p className="text-[12px] text-overdue">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy || code.length < 6}>
            Verify
          </button>
        </form>
      </div>
    </main>
  );
}

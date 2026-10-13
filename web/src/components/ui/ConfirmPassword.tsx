"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function ConfirmPassword({
  title,
  body,
  confirmLabel = "Delete",
  extra,
  onConfirm,
  onClose,
}: {
  title: string;
  body?: string;
  confirmLabel?: string;
  extra?: ReactNode;
  onConfirm: (password: string) => Promise<void>;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  async function submit() {
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t confirm.");
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/30" onClick={onClose}>
      <div
        className="w-[400px] rounded-lg border border-line bg-elev p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Enter" && !busy) void submit();
        }}
      >
        <p className="text-sm font-semibold text-ink">{title}</p>
        {body && <p className="mt-2 text-sm text-muted">{body}</p>}
        {extra}
        <label className="mt-4 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
          Your password
          <input
            ref={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 h-9 w-full rounded border border-line px-3 text-sm font-normal normal-case tracking-normal text-ink"
          />
        </label>
        {error && <p className="mt-2 text-[12px] text-overdue">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={() => void submit()} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/icons/AppIcons";

export default function RegisterPage() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-[360px] rounded-lg border border-line bg-elev p-8 shadow-modal">
        <div className="mb-6">
          <BrandLockup size={40} large subtitle="Accounts are invite-only" />
        </div>
        <p className="text-sm text-muted">New accounts are created by an admin. Ask your administrator to add you, then sign in.</p>
        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-accent">
          Back to log in
        </Link>
      </div>
    </main>
  );
}

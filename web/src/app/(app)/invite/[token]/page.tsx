"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, setWorkspaceId } from "@/lib/api";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">Join workspace</h1>
      {error && <p className="mt-3 text-sm text-overdue">{error}</p>}
      <button
        type="button"
        className="btn-primary mt-4"
        onClick={async () => {
          try {
            const me = await api<{ workspace: { id: string } }>(`/api/invites/${token}/accept`, { method: "POST" });
            setWorkspaceId(me.workspace.id);
            router.replace("/");
          } catch (e) {
            setError(e instanceof ApiError ? e.message : "Couldn’t save. Try again.");
          }
        }}
      >
        Accept invite
      </button>
    </div>
  );
}

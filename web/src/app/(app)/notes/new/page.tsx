"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { WorkNote } from "@/lib/types";

function CreateNote() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    void api<WorkNote>("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        kind: params.get("kind") || "work",
        task_id: params.get("task") || undefined,
        project_id: params.get("project") || undefined,
      }),
    })
      .then((n) => router.replace(`/notes/${n.id}`))
      .catch(() => router.replace("/notes"));
  }, [params, router]);

  return <p className="p-8 text-sm text-muted">Creating note…</p>;
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Creating note…</p>}>
      <CreateNote />
    </Suspense>
  );
}

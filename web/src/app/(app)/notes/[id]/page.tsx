"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { api } from "@/lib/api";
import type { WorkNote } from "@/lib/types";

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<WorkNote | null>(null);

  useEffect(() => {
    void api<WorkNote>(`/api/notes/${id}`)
      .then(setNote)
      .catch(() => router.replace("/notes"));
  }, [id, router]);

  if (!note) return null;
  return <NoteEditor initial={note} />;
}

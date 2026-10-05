"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { EntityLink } from "@/lib/types";

export function LinksEditor({
  links,
  createPath,
  onChange,
}: {
  links: EntityLink[];
  createPath: string;
  onChange: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase text-muted">Links</p>
      <div className="mt-2 space-y-2 text-sm">
        {links.map((link) =>
          editing === link.id ? (
            <form
              key={link.id}
              className="flex flex-wrap gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await api(`/api/links/${link.id}`, { method: "PATCH", body: JSON.stringify({ title: editTitle, url: editUrl }) });
                setEditing(null);
                onChange();
              }}
            >
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9 w-36 rounded border border-line px-2" />
              <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="h-9 min-w-48 flex-1 rounded border border-line px-2" />
              <button type="submit" className="h-9 text-accent">
                Save
              </button>
              <button type="button" className="h-9 text-muted" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <div key={link.id} className="flex items-center gap-2">
              <a href={link.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-accent">
                {link.title}
              </a>
              <button
                type="button"
                className="text-muted"
                onClick={() => {
                  setEditing(link.id);
                  setEditTitle(link.title);
                  setEditUrl(link.url);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-overdue"
                onClick={async () => {
                  await api(`/api/links/${link.id}`, { method: "DELETE" });
                  onChange();
                }}
              >
                Delete
              </button>
            </div>
          ),
        )}
      </div>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!url.trim()) return;
          await api(createPath, { method: "POST", body: JSON.stringify({ title: title.trim() || null, url: url.trim() }) });
          setTitle("");
          setUrl("");
          onChange();
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-9 w-36 rounded border border-line px-2 text-sm" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="h-9 min-w-48 flex-1 rounded border border-line px-2 text-sm" />
        <button type="submit" className="h-9 rounded border border-line px-3 text-sm">
          Add link
        </button>
      </form>
    </div>
  );
}

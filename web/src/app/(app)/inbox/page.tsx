"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { TaskRow } from "@/components/task/TaskRow";
import { useReloadOnChange } from "@/lib/useReloadOnChange";

export default function InboxPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await api<{ tasks: Task[] }>("/api/tasks?tab=inbox");
      setTasks(data.tasks);
    } catch {
      /* AppProvider handles session / API down */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useReloadOnChange(load);

  return (
    <div className="mx-auto max-w-[880px] p-8">
      <h1 className="text-xl font-semibold">Inbox{tasks.length ? ` · ${tasks.length}` : ""}</h1>
      <p className="mt-1 text-sm text-muted">Unorganized tasks</p>
      {tasks.length === 0 ? (
        <div className="mt-10 text-sm text-muted">
          <p>Inbox is empty.</p>
          <p className="mt-1">New tasks without a project or due date land here.</p>
        </div>
      ) : (
        <div className="mt-6">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} peers={tasks} onChange={() => void load()} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRestaurantLogs } from "@/lib/use-restaurant-logs";
import { LogCard } from "@/components/LogCard";
import { AddLogForm } from "@/components/AddLogForm";
import { AuthForm } from "@/components/AuthForm";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { logs, addLog, updateLog, deleteLog, loading: logsLoading, error } =
    useRestaurantLogs(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | (typeof logs)[number]>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const visibleLogs = useMemo(() => {
    if (!selectedTag) return logs;
    return logs.filter((l) => l.tags.includes(selectedTag));
  }, [logs, selectedTag]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Lunchboxd
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
            Like Letterboxd, but for where you eat. Sign in or create an account to log restaurants.
          </p>
          <AuthForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Lunchboxd
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400" title={user.email}>
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              + Log restaurant
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {allTags.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedTag === null
                  ? "bg-amber-500 text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedTag === t
                    ? "bg-amber-500 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {logsLoading ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Loading your diary…
          </p>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              No restaurants logged yet.
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              Like Letterboxd, but for where you eat.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Log your first restaurant
            </button>
          </div>
        ) : visibleLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              No restaurants match that tag.
            </p>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="mt-5 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {visibleLogs.map((log) => (
              <li key={log.id}>
                <LogCard
                  log={log}
                  onDelete={deleteLog}
                  onEdit={(l) => {
                    setEditing(l);
                    setShowForm(true);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {showForm && (
        <AddLogForm
          existingTags={allTags}
          initial={
            editing
              ? {
                  name: editing.name,
                  location: editing.location,
                  rating: editing.rating,
                  dateVisited: editing.dateVisited,
                  review: editing.review,
                  tags: editing.tags,
                }
              : undefined
          }
          title={editing ? "Edit log" : "Log a restaurant"}
          submitLabel={editing ? "Save changes" : "Log it"}
          onSubmit={async (draft) => {
            if (editing) await updateLog(editing.id, draft);
            else await addLog(draft);
            setEditing(null);
          }}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

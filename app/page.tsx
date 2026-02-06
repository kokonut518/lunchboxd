"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRestaurantLogs } from "@/lib/use-restaurant-logs";
import { useEatLater } from "@/lib/use-eat-later";
import { LogCard } from "@/components/LogCard";
import { AddLogForm } from "@/components/AddLogForm";
import { EatLaterCard } from "@/components/EatLaterCard";
import { EatLaterForm } from "@/components/EatLaterForm";
import { AuthForm } from "@/components/AuthForm";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { logs, addLog, updateLog, deleteLog, loading: logsLoading, error } =
    useRestaurantLogs(user?.id);
  const {
    items: eatLater,
    addItem,
    updateItem,
    deleteItem,
    loading: eatLaterLoading,
    error: eatLaterError,
  } = useEatLater(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | (typeof logs)[number]>(null);
  const [showEatLaterForm, setShowEatLaterForm] = useState(false);
  const [editingEatLater, setEditingEatLater] =
    useState<null | (typeof eatLater)[number]>(null);
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
              className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-pink-600"
            >
              + Log restaurant
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingEatLater(null);
                setShowEatLaterForm(true);
              }}
              className="hidden rounded-full border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-400/10 sm:inline-flex"
            >
              Eat Later
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
        {eatLaterError && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400" role="alert">
            {eatLaterError}
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
                  ? "bg-pink-500 text-white"
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
                    ? "bg-pink-500 text-white"
                    : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <section aria-labelledby="visited-heading" className="mb-10">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2
              id="visited-heading"
              className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Visited
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="inline-flex items-center rounded-full border border-pink-500 px-3 py-1 text-xs font-medium text-pink-600 hover:bg-pink-50 dark:border-pink-400 dark:text-pink-300 dark:hover:bg-pink-400/10 sm:hidden"
            >
              + Log restaurant
            </button>
          </div>

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
              className="mt-6 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
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
              className="mt-5 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
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
        </section>

        <section aria-labelledby="eat-later-heading">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2
              id="eat-later-heading"
              className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Eat Later
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingEatLater(null);
                setShowEatLaterForm(true);
              }}
              className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              + Add
            </button>
          </div>

          {eatLaterLoading ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Loading your list…
            </p>
          ) : eatLater.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Save restaurants you want to try here.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {eatLater.map((item) => (
                <li key={item.id}>
                  <EatLaterCard
                    item={item}
                    onDelete={deleteItem}
                    onEdit={(it) => {
                      setEditingEatLater(it);
                      setShowEatLaterForm(true);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
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

      {showEatLaterForm && (
        <EatLaterForm
          existingTags={allTags}
          initial={
            editingEatLater
              ? {
                  name: editingEatLater.name,
                  location: editingEatLater.location,
                  notes: editingEatLater.notes,
                  tags: editingEatLater.tags,
                }
              : undefined
          }
          title={editingEatLater ? "Edit Eat Later" : "Add to Eat Later"}
          submitLabel={editingEatLater ? "Save changes" : "Save"}
          onSubmit={async (draft) => {
            if (editingEatLater) await updateItem(editingEatLater.id, draft);
            else await addItem(draft);
            setEditingEatLater(null);
          }}
          onClose={() => {
            setShowEatLaterForm(false);
            setEditingEatLater(null);
          }}
        />
      )}
    </div>
  );
}

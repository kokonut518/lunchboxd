"use client";

import type { EatLaterEntry } from "@/lib/use-eat-later";

type Props = {
  item: EatLaterEntry;
  onEdit: (item: EatLaterEntry) => void;
  onDelete: (id: string) => void;
};

export function EatLaterCard({ item, onEdit, onDelete }: Props) {
  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {item.name}
          </h3>
          {item.location && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {item.location}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Added {date}
          </p>

          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {item.notes && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-3">
              {item.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-lg px-2 py-1 text-sm text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={`Edit ${item.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-lg px-2 py-1 text-sm text-zinc-400 transition hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
            aria-label={`Delete ${item.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}


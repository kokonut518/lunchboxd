"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { RestaurantLog } from "@/lib/types";
import { StarRatingInput } from "@/components/StarRating";

type Props = {
  onSubmit: (
    log: Omit<RestaurantLog, "id" | "createdAt">
  ) => void | Promise<void>;
  onClose: () => void;
  existingTags: string[];
  initial?: Partial<Omit<RestaurantLog, "id" | "createdAt">>;
  title?: string;
  submitLabel?: string;
};

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function AddLogForm({
  onSubmit,
  onClose,
  existingTags,
  initial,
  title = "Log a restaurant",
  submitLabel = "Log it",
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [rating, setRating] = useState<number>(initial?.rating ?? 0);
  const [dateVisited, setDateVisited] = useState(
    initial?.dateVisited ?? new Date().toISOString().slice(0, 10)
  );
  const [review, setReview] = useState(initial?.review ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const suggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    return existingTags
      .filter((t) => !tags.includes(t))
      .filter((t) => (q ? t.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [existingTags, tagInput, tags]);

  function addTag(raw: string) {
    const next = normalizeTag(raw);
    if (!next) return;
    if (tags.includes(next)) return;
    setTags((prev) => [...prev, next]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      location: location.trim() || undefined,
      rating,
      dateVisited,
      review: review.trim() || undefined,
      tags,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-log-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="add-log-title"
            className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Restaurant name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The French Laundry"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Yountville, CA"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Rating
              </label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label htmlFor="dateVisited" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Date visited
              </label>
              <input
                id="dateVisited"
                type="date"
                value={dateVisited}
                onChange={(e) => setDateVisited(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="tags"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Tags (what you ate)
            </label>
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                } else if (e.key === "," || e.key === "Tab") {
                  // comma / tab to accept tag quickly
                  if (tagInput.trim()) {
                    e.preventDefault();
                    addTag(tagInput.replace(/,$/, ""));
                  }
                } else if (e.key === "Backspace" && !tagInput && tags.length) {
                  removeTag(tags[tags.length - 1]);
                }
              }}
              placeholder="e.g. ramen, tacos, tiramisu (press Enter)"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    aria-label={`Remove tag ${t}`}
                    title="Click to remove"
                  >
                    {t} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTag(t)}
                    className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    title="Add tag"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="review" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Review / notes
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you order? Would you go back?"
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 py-2.5 font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-amber-500 py-2.5 font-medium text-white transition hover:bg-amber-600"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useId, useMemo, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundToStep(n: number, step: number) {
  if (step <= 0) return n;
  return Math.round(n / step) * step;
}

function getFillFraction(value: number, starIndex: number) {
  // starIndex: 1..5
  const delta = value - (starIndex - 1);
  return clamp(delta, 0, 1);
}

function StarShape({
  fillFraction,
  size = 18,
  filledClassName,
  emptyClassName,
}: {
  fillFraction: number;
  size?: number;
  filledClassName: string;
  emptyClassName: string;
}) {
  const id = useId();
  const clipId = `${id}-clip`;
  const clipWidth = `${clamp(fillFraction, 0, 1) * 100}%`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={clipWidth} height="24" />
        </clipPath>
      </defs>

      {/* outline */}
      <path
        className={emptyClassName}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M12 2.5l2.9 6.1 6.7.6-5 4.4 1.5 6.6-6.1-3.4-6.1 3.4 1.5-6.6-5-4.4 6.7-.6L12 2.5z"
      />

      {/* filled portion */}
      <g clipPath={`url(#${clipId})`}>
        <path
          className={filledClassName}
          fill="currentColor"
          d="M12 2.5l2.9 6.1 6.7.6-5 4.4 1.5 6.6-6.1-3.4-6.1 3.4 1.5-6.6-5-4.4 6.7-.6L12 2.5z"
        />
      </g>
    </svg>
  );
}

export function StarRatingDisplay({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  const stars = useMemo(
    () => Array.from({ length: 5 }, (_, i) => i + 1),
    []
  );

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} out of 5 stars`}
    >
      {stars.map((i) => (
        <StarShape
          key={i}
          size={size}
          fillFraction={getFillFraction(value, i)}
          filledClassName="text-amber-500"
          emptyClassName="text-zinc-300 dark:text-zinc-600"
        />
      ))}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.5,
  size = 22,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  function valueFromClientX(clientX: number) {
    const el = ref.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const raw = (x / rect.width) * max; // 0..max
    const stepped = roundToStep(raw, step);
    return clamp(stepped, min, max);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Rating"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} out of 5 stars`}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          setDragging(true);
          const next = valueFromClientX(e.clientX);
          setHoverValue(next);
          onChange(next);
        }}
        onPointerMove={(e) => {
          const next = valueFromClientX(e.clientX);
          setHoverValue(next);
          if (dragging) onChange(next);
        }}
        onPointerUp={() => {
          setDragging(false);
          setHoverValue(null);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setHoverValue(null);
        }}
        onPointerLeave={() => {
          if (!dragging) setHoverValue(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(clamp(roundToStep(value - step, step), min, max));
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(clamp(roundToStep(value + step, step), min, max));
          } else if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
          } else if (e.key === "End") {
            e.preventDefault();
            onChange(max);
          }
        }}
        className="inline-flex cursor-pointer items-center gap-0.5 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
      >
        {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
          <StarShape
            key={i}
            size={size}
            fillFraction={getFillFraction(displayValue, i)}
            filledClassName="text-amber-500"
            emptyClassName="text-zinc-300 dark:text-zinc-600"
          />
        ))}
      </div>

      <span className="min-w-[3rem] text-right text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {displayValue.toFixed(displayValue % 1 === 0 ? 0 : 1)}
      </span>
    </div>
  );
}


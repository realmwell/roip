"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number;
  /** true = higher is better (quality, cache rate), false = lower is better (cost, latency) */
  higherIsBetter?: boolean;
  unit?: string;
}

export default function MetricCard({
  label,
  value,
  delta,
  higherIsBetter = false,
  unit,
}: MetricCardProps) {
  const hasDelta = delta !== undefined && delta !== 0;
  const isImproved = hasDelta
    ? higherIsBetter
      ? delta > 0
      : delta < 0
    : false;

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4 flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-fg">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-fg tabular-nums">
          {value}
          {unit && (
            <span className="text-sm font-normal text-muted-fg ml-0.5">
              {unit}
            </span>
          )}
        </span>
        {hasDelta && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium pb-0.5 ${
              isImproved ? "text-green" : "text-red"
            }`}
          >
            {isImproved ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(delta > -1 && delta < 1 ? 3 : 1)}
          </span>
        )}
      </div>
    </div>
  );
}

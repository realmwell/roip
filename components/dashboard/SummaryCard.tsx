"use client";

import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string; // Tailwind bg class, e.g. "bg-navy"
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface border border-surface-border shadow-sm hover:shadow-md transition-shadow">
      {/* Colored left accent */}
      <div className={`absolute inset-y-0 left-0 w-1 ${color}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-fg">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-fg">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-fg">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex items-center justify-center h-10 w-10 rounded-lg ${color}/10`}
          >
            <Icon className={`h-5 w-5`} style={{ color: colorToHex(color) }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Map our Tailwind bg class names to hex values for the icon color. */
function colorToHex(cls: string): string {
  const map: Record<string, string> = {
    "bg-navy": "#1b2a4a",
    "bg-blue": "#2e75b6",
    "bg-teal": "#0ea5e9",
    "bg-green": "#10b981",
    "bg-amber": "#f59e0b",
    "bg-red": "#ef4444",
  };
  return map[cls] ?? "#0ea5e9";
}

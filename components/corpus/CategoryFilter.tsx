"use client";

import {
  Cloud,
  BookOpen,
  Layers,
  AlertTriangle,
  Briefcase,
  LayoutGrid,
} from "lucide-react";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
  counts?: Record<string, number>;
}

interface CategoryDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultCount: number;
}

const CATEGORIES: CategoryDef[] = [
  { id: "openai-platform", label: "OpenAI Platform", icon: Layers, defaultCount: 12 },
  { id: "aws-ml-lens", label: "AWS ML Lens", icon: Cloud, defaultCount: 6 },
  { id: "rag-patterns", label: "RAG Patterns", icon: BookOpen, defaultCount: 8 },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle, defaultCount: 6 },
  { id: "case-studies", label: "Case Studies", icon: Briefcase, defaultCount: 3 },
];

export default function CategoryFilter({
  selected,
  onSelect,
  counts,
}: CategoryFilterProps) {
  const totalDefault = CATEGORIES.reduce((s, c) => s + c.defaultCount, 0);
  const totalFromCounts = counts
    ? Object.values(counts).reduce((s, n) => s + n, 0)
    : undefined;

  return (
    <nav className="space-y-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-3 px-3">
        Categories
      </h2>

      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium
          ${
            selected === null
              ? "bg-teal/15 text-teal"
              : "text-muted-fg hover:text-fg hover:bg-muted"
          }`}
      >
        <span className="flex items-center gap-2.5">
          <LayoutGrid className="h-4 w-4" />
          All
        </span>
        <span className="text-xs tabular-nums opacity-70">
          {totalFromCounts ?? totalDefault}
        </span>
      </button>

      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const count = counts?.[cat.id] ?? cat.defaultCount;
        const isActive = selected === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium
              ${
                isActive
                  ? "bg-teal/15 text-teal"
                  : "text-muted-fg hover:text-fg hover:bg-muted"
              }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4" />
              {cat.label}
            </span>
            <span className="text-xs tabular-nums opacity-70">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { CATEGORIES };

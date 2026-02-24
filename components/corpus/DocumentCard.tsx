"use client";

import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentCardProps {
  id: string;
  title: string;
  category: string;
  score: number;
  content: string;
  sourceUrl?: string;
  tags?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "openai-platform": "bg-blue/20 text-blue",
  "aws-ml-lens": "bg-amber/20 text-amber",
  "rag-patterns": "bg-teal/20 text-teal",
  troubleshooting: "bg-red/20 text-red",
  "case-studies": "bg-green/20 text-green",
};

function categoryLabel(cat: string) {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DocumentCard({
  title,
  category,
  score,
  content,
  tags,
}: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const pct = Math.round(score * 100);
  const colorClass = CATEGORY_COLORS[category] ?? "bg-muted text-muted-fg";
  const preview =
    content.length > 220 ? content.slice(0, 220).trimEnd() + "..." : content;

  return (
    <div
      className="rounded-xl border border-surface-border bg-surface p-5
                 hover:border-teal/40 group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-fg leading-snug line-clamp-2">
          {title}
        </h3>
        <span
          className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-teal/15 text-teal tabular-nums"
          title="Relevance score"
        >
          {pct}%
        </span>
      </div>

      {/* Category badge */}
      <span
        className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${colorClass}`}
      >
        {categoryLabel(category)}
      </span>

      {/* Preview / full content */}
      {expanded ? (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-3 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-muted-fg leading-relaxed mb-3">{preview}</p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(typeof tags === "string" ? (tags as string).split(",") : tags).map(
            (tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-fg"
              >
                {tag.trim()}
              </span>
            )
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-surface-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-teal hover:text-blue"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Expand
            </>
          )}
        </button>

        <a
          href={`/chat?q=${encodeURIComponent(title)}`}
          className="flex items-center gap-1 text-xs font-medium text-green hover:text-teal ml-auto"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ask about this
        </a>
      </div>
    </div>
  );
}

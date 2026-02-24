"use client";

import { ChevronDown, ChevronUp, MessageSquare, ExternalLink } from "lucide-react";
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

/** Shorten a URL to its domain + first path segment for display */
function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    const path = segments.length > 1
      ? `/${segments[0]}/...`
      : u.pathname === "/" ? "" : u.pathname;
    return `${u.hostname}${path}`;
  } catch {
    return url;
  }
}

export default function DocumentCard({
  title,
  category,
  content,
  sourceUrl,
  tags,
}: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const colorClass = CATEGORY_COLORS[category] ?? "bg-muted text-muted-fg";
  const preview =
    content.length > 220 ? content.slice(0, 220).trimEnd() + "..." : content;

  function openSource() {
    if (sourceUrl) {
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      onClick={openSource}
      role={sourceUrl ? "link" : undefined}
      className={`rounded-xl border border-surface-border bg-surface
                  hover:border-teal/40 transition-all group
                  ${sourceUrl ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      {/* Source URL banner */}
      {sourceUrl && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-0 text-xs text-muted-fg">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate group-hover:text-teal transition-colors">
            {prettyUrl(sourceUrl)}
          </span>
        </div>
      )}

      <div className="p-5 pt-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-fg leading-snug line-clamp-2 group-hover:text-teal transition-colors">
            {title}
          </h3>
          {sourceUrl && (
            <ExternalLink className="h-4 w-4 text-muted-fg shrink-0 mt-0.5 group-hover:text-teal transition-colors" />
          )}
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
        <div
          className="flex items-center gap-3 pt-1 border-t border-surface-border"
          onClick={(e) => e.stopPropagation()}
        >
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

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-blue hover:text-teal"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View source doc
            </a>
          )}

          <a
            href={`/chat?q=${encodeURIComponent(title)}`}
            className="flex items-center gap-1 text-xs font-medium text-green hover:text-teal ml-auto"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask about this
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  MessageSquare,
} from "lucide-react";
import type { Finding } from "@/lib/assessment-narrative";

interface FindingsPanelProps {
  findings: Finding[];
}

const severityConfig = {
  critical: {
    bg: "bg-red/5",
    border: "border-red/20",
    text: "text-red",
    icon: AlertCircle,
    label: "Critical",
  },
  warning: {
    bg: "bg-amber/5",
    border: "border-amber/20",
    text: "text-amber",
    icon: AlertTriangle,
    label: "Warning",
  },
  info: {
    bg: "bg-blue/5",
    border: "border-blue/20",
    text: "text-blue",
    icon: Info,
    label: "Info",
  },
};

export default function FindingsPanel({ findings }: FindingsPanelProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (findings.length === 0) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-6 text-center text-sm text-muted-fg">
        No findings generated. Try loading sample data to see the analysis.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-fg">Findings</h3>
      {findings.map((finding, idx) => {
        const config = severityConfig[finding.severity];
        const Icon = config.icon;
        const isOpen = expanded.has(idx);

        return (
          <div
            key={idx}
            className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <Icon className={`h-4 w-4 ${config.text} flex-shrink-0`} />
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.text} bg-white/50 dark:bg-white/10`}
              >
                {config.label}
              </span>
              <span className="text-sm font-medium text-fg flex-1">
                {finding.title}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-fg" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-fg" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-fg/80 leading-relaxed pl-7">
                  {finding.detail}
                </p>
                <a
                  href={`/chat?q=${encodeURIComponent(finding.chatQuery)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue hover:underline ml-7"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask about this
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

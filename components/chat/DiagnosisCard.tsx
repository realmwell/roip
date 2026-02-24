"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  ShieldAlert,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types matching the troubleshooting JSON schema from rag-pipeline.ts
// ---------------------------------------------------------------------------

export interface DiagnosisData {
  diagnosis: {
    primary_cause: string;
    confidence: "high" | "medium" | "low";
    evidence: string[];
  };
  recommended_actions: {
    action: string;
    priority: "immediate" | "short-term" | "medium-term";
    impact: string;
    implementation: string;
  }[];
  sources: { title: string; url: string }[];
  follow_up_questions: string[];
  explanation: string;
}

interface DiagnosisCardProps {
  data: DiagnosisData;
  onFollowUp?: (question: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONFIDENCE_CONFIG = {
  high: {
    bg: "bg-green/20",
    text: "text-green",
    border: "border-green/30",
    icon: CheckCircle2,
  },
  medium: {
    bg: "bg-amber/20",
    text: "text-amber",
    border: "border-amber/30",
    icon: AlertTriangle,
  },
  low: {
    bg: "bg-red/20",
    text: "text-red",
    border: "border-red/30",
    icon: ShieldAlert,
  },
} as const;

const PRIORITY_CONFIG = {
  immediate: { bg: "bg-red/20", text: "text-red", border: "border-red/30" },
  "short-term": {
    bg: "bg-amber/20",
    text: "text-amber",
    border: "border-amber/30",
  },
  "medium-term": {
    bg: "bg-blue/20",
    text: "text-blue",
    border: "border-blue/30",
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiagnosisCard({ data, onFollowUp }: DiagnosisCardProps) {
  const { diagnosis, recommended_actions, sources, follow_up_questions, explanation } =
    data;

  const conf = CONFIDENCE_CONFIG[diagnosis.confidence];
  const ConfIcon = conf.icon;

  return (
    <div className="space-y-4 w-full max-w-2xl">
      {/* Diagnosis header */}
      <div className="rounded-lg border border-surface-border bg-surface p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-fg">Diagnosis</h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${conf.bg} ${conf.text} ${conf.border}`}
          >
            <ConfIcon className="h-3 w-3" />
            {diagnosis.confidence} confidence
          </span>
        </div>
        <p className="text-sm text-fg">{diagnosis.primary_cause}</p>
        {diagnosis.evidence.length > 0 && (
          <ul className="space-y-1 pl-4 list-disc text-xs text-muted-fg">
            {diagnosis.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="rounded-lg border border-surface-border bg-surface p-4">
          <p className="text-sm text-fg leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Recommended actions */}
      {recommended_actions.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface p-4 space-y-3">
          <h3 className="text-sm font-semibold text-fg flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-teal" />
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {recommended_actions.map((ra, i) => {
              const pri = PRIORITY_CONFIG[ra.priority];
              return (
                <div
                  key={i}
                  className="rounded-md border border-surface-border bg-muted/50 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-fg">{ra.action}</span>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${pri.bg} ${pri.text} ${pri.border}`}
                    >
                      {ra.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-fg">{ra.impact}</p>
                  <p className="text-xs text-muted-fg italic">{ra.implementation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface p-4 space-y-2">
          <h3 className="text-sm font-semibold text-fg flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4 text-teal" />
            Sources
          </h3>
          <ul className="space-y-1">
            {sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal hover:underline inline-flex items-center gap-1"
                >
                  {s.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up questions */}
      {follow_up_questions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-fg flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            Follow-up questions
          </h3>
          <div className="flex flex-wrap gap-2">
            {follow_up_questions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowUp?.(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-teal/30 text-teal bg-teal/10 hover:bg-teal/20 transition-colors cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

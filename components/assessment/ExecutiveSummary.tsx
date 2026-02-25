"use client";

import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ShieldX,
  MessageSquare,
  TrendingDown,
} from "lucide-react";
import type { RiskLevel, AssessmentReport } from "@/lib/assessment-engine";
import type { NarrativeReport } from "@/lib/assessment-narrative";

interface ExecutiveSummaryProps {
  report: AssessmentReport;
  narrative: NarrativeReport;
}

const riskConfig: Record<
  RiskLevel,
  { bg: string; border: string; text: string; icon: typeof Shield; label: string }
> = {
  low: {
    bg: "bg-green/5",
    border: "border-green/30",
    text: "text-green",
    icon: ShieldCheck,
    label: "Low Risk",
  },
  medium: {
    bg: "bg-amber/5",
    border: "border-amber/30",
    text: "text-amber",
    icon: Shield,
    label: "Medium Risk",
  },
  high: {
    bg: "bg-red/5",
    border: "border-red/30",
    text: "text-red",
    icon: ShieldAlert,
    label: "High Risk",
  },
  critical: {
    bg: "bg-red/10",
    border: "border-red/50",
    text: "text-red",
    icon: ShieldX,
    label: "Critical Risk",
  },
};

export default function ExecutiveSummary({
  report,
  narrative,
}: ExecutiveSummaryProps) {
  const risk = riskConfig[report.overallRisk];
  const RiskIcon = risk.icon;

  return (
    <div
      className={`rounded-xl border ${risk.border} ${risk.bg} p-6 space-y-4`}
    >
      {/* Risk badge + summary */}
      <div className="flex items-start gap-4">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${risk.text} bg-white/60 dark:bg-white/10 border ${risk.border} flex-shrink-0`}
        >
          <RiskIcon className="h-4 w-4" />
          {risk.label}
        </div>
        <p className="text-sm text-fg leading-relaxed">
          {narrative.executiveSummary}
        </p>
      </div>

      {/* Savings headline */}
      <div className="flex items-center gap-2 rounded-lg bg-white/50 dark:bg-white/5 border border-surface-border px-4 py-3">
        <TrendingDown className="h-5 w-5 text-green flex-shrink-0" />
        <span className="text-sm font-medium text-fg">
          {narrative.savingsHeadline}
        </span>
      </div>

      {/* Top 3 actions */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-fg mb-2">
          Top Actions
        </p>
        <ol className="space-y-1.5">
          {narrative.topActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-fg">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue/10 text-blue text-xs font-medium flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {action}
            </li>
          ))}
        </ol>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-surface-border/50 text-xs text-muted-fg">
        <span>
          {report.totalRequests.toLocaleString()} requests analyzed
        </span>
        <span>
          {report.dataRange.from.slice(0, 10)} to{" "}
          {report.dataRange.to.slice(0, 10)}
        </span>
        <span>
          Generated {new Date(report.generatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

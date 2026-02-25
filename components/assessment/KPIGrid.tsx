"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  DollarSign,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import type { KPICheck, KPIStatus } from "@/lib/assessment-engine";

interface KPIGridProps {
  kpis: KPICheck[];
}

const statusConfig: Record<
  KPIStatus,
  { bg: string; border: string; text: string; icon: typeof CheckCircle2; label: string }
> = {
  pass: {
    bg: "bg-green/5",
    border: "border-green/30",
    text: "text-green",
    icon: CheckCircle2,
    label: "Pass",
  },
  warning: {
    bg: "bg-amber/5",
    border: "border-amber/30",
    text: "text-amber",
    icon: AlertTriangle,
    label: "Warning",
  },
  critical: {
    bg: "bg-red/5",
    border: "border-red/30",
    text: "text-red",
    icon: XCircle,
    label: "Critical",
  },
};

const kpiIcons: Record<string, typeof DollarSign> = {
  "Cost per Query": DollarSign,
  "P95 Latency": Clock,
  "Error Rate": AlertCircle,
  "Retrieval Quality": Search,
};

function formatKPIValue(kpi: KPICheck): string {
  if (kpi.unit === "$/query") return `$${kpi.actual.toFixed(4)}`;
  if (kpi.unit === "ms") return `${Math.round(kpi.actual)}ms`;
  if (kpi.unit === "%") return `${(kpi.actual * 100).toFixed(2)}%`;
  if (kpi.unit === "score") return kpi.actual.toFixed(2);
  return kpi.actual.toFixed(2);
}

function formatTarget(kpi: KPICheck): string {
  if (kpi.unit === "$/query") return `< $${kpi.target}`;
  if (kpi.unit === "ms") return `< ${kpi.target}ms`;
  if (kpi.unit === "%") return `< ${(kpi.target * 100).toFixed(0)}%`;
  if (kpi.unit === "score") return `> ${kpi.target}`;
  return `${kpi.target}`;
}

export default function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const config = statusConfig[kpi.status];
        const StatusIcon = config.icon;
        const KPIIcon = kpiIcons[kpi.name] || AlertCircle;

        return (
          <div
            key={kpi.name}
            className={`rounded-xl border ${config.border} ${config.bg} p-4 space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KPIIcon className="h-4 w-4 text-muted-fg" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                  {kpi.name}
                </span>
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${config.text}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>
            </div>

            <div>
              <span className="text-2xl font-semibold text-fg tabular-nums">
                {formatKPIValue(kpi)}
              </span>
              <p className="text-xs text-muted-fg mt-1">
                Target: {formatTarget(kpi)}
                {kpi.name === "Retrieval Quality" && (
                  <span className="italic"> (estimated)</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

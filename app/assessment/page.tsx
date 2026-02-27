"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ClipboardCheck,
  Loader2,
  AlertCircle,
  RotateCcw,
  Printer,
  Eye,
  Wrench,
} from "lucide-react";
import UploadZone from "@/components/assessment/UploadZone";
import KPIGrid from "@/components/assessment/KPIGrid";
import ExecutiveSummary from "@/components/assessment/ExecutiveSummary";
import FindingsPanel from "@/components/assessment/FindingsPanel";
import RemediationTable from "@/components/assessment/RemediationTable";
import ScenarioModeler from "@/components/assessment/ScenarioModeler";
import type { AssessmentReport } from "@/lib/assessment-engine";
import type { NarrativeReport } from "@/lib/assessment-narrative";

type Phase = "idle" | "analyzing" | "complete" | "error";
type ViewMode = "executive" | "technical";

const STORAGE_KEY = "ragoip-assessment";

function loadPersistedState(): {
  phase: Phase;
  report: AssessmentReport | null;
  narrative: NarrativeReport | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.phase === "complete" && parsed.report && parsed.narrative) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [narrative, setNarrative] = useState<NarrativeReport | null>(null);
  const [error, setError] = useState<string>("");

  // Restore persisted state on mount
  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      setPhase(saved.phase);
      setReport(saved.report);
      setNarrative(saved.narrative);
    }
  }, []);

  // Persist state when assessment completes
  useEffect(() => {
    if (phase === "complete" && report && narrative) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ phase, report, narrative })
        );
      } catch {
        // storage full or unavailable
      }
    }
  }, [phase, report, narrative]);

  const runAssessment = useCallback(
    async (body: Record<string, unknown>) => {
      setPhase("analyzing");
      setError("");

      try {
        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        const data = await res.json();
        setReport(data.report);
        setNarrative(data.narrative);
        setPhase("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Assessment failed");
        setPhase("error");
      }
    },
    []
  );

  const handleLoadSample = useCallback(() => {
    runAssessment({ useSampleData: true });
  }, [runAssessment]);

  const handleUpload = useCallback(
    (files: Record<string, string>) => {
      runAssessment({ files });
    },
    [runAssessment]
  );

  const handleReset = useCallback(() => {
    setPhase("idle");
    setReport(null);
    setNarrative(null);
    setError("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-surface-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue/10">
              <ClipboardCheck className="h-5 w-5 text-blue" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-fg">Assessment</h1>
              <p className="text-xs text-muted-fg">
                RAG pipeline health analysis and cost optimization
              </p>
            </div>
          </div>

          {phase === "complete" && (
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex rounded-lg border border-surface-border overflow-hidden">
                <button
                  onClick={() => setViewMode("executive")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                    viewMode === "executive"
                      ? "bg-blue/10 text-blue"
                      : "bg-surface text-muted-fg hover:text-fg"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Executive
                </button>
                <button
                  onClick={() => setViewMode("technical")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-surface-border ${
                    viewMode === "technical"
                      ? "bg-blue/10 text-blue"
                      : "bg-surface text-muted-fg hover:text-fg"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Technical
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-fg hover:text-fg rounded-lg border border-surface-border bg-surface"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-fg hover:text-fg rounded-lg border border-surface-border bg-surface"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Idle: Upload zone */}
        {phase === "idle" && (
          <UploadZone
            onLoadSample={handleLoadSample}
            onUpload={handleUpload}
            loading={false}
          />
        )}

        {/* Analyzing: Spinner */}
        {phase === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 text-blue animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-fg">
                Analyzing telemetry data...
              </p>
              <p className="text-xs text-muted-fg mt-1">
                Computing KPIs, running scenario projections, generating
                narrative report
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <AlertCircle className="h-10 w-10 text-red mx-auto" />
            <div>
              <p className="text-sm font-medium text-fg">Analysis Failed</p>
              <p className="text-xs text-muted-fg mt-1">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue bg-blue/10 rounded-lg hover:bg-blue/20"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Complete: Full report */}
        {phase === "complete" && report && narrative && (
          <div className="space-y-8">
            {/* Executive Summary -- always visible */}
            <ExecutiveSummary report={report} narrative={narrative} />

            {/* KPI Grid -- always visible */}
            <KPIGrid kpis={report.kpis} />

            {/* Executive view */}
            {viewMode === "executive" && (
              <div className="space-y-8">
                <FindingsPanel findings={narrative.findings} />
                <RemediationTable plan={narrative.remediationPlan} />
              </div>
            )}

            {/* Technical view */}
            {viewMode === "technical" && (
              <div className="space-y-8">
                <TechnicalMetrics report={report} />
              </div>
            )}

            {/* Scenario Modeler -- always visible */}
            <ScenarioModeler
              scenarios={report.scenarios}
              combinedSavings={report.combinedSavings}
              baselineCost={report.costAnalysis.totalCost}
              baselineP95={report.latencyAnalysis.totalP95}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Technical metrics sub-component (inline, uses Recharts if available)
// ---------------------------------------------------------------------------

function TechnicalMetrics({ report }: { report: AssessmentReport }) {
  return (
    <div className="space-y-6">
      {/* Cost breakdown */}
      <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-medium text-fg">Cost Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricBlock
            label="Total Cost"
            value={`$${report.costAnalysis.totalCost.toFixed(2)}`}
          />
          <MetricBlock
            label="Avg/Query"
            value={`$${report.costAnalysis.avgCostPerQuery.toFixed(4)}`}
          />
          <MetricBlock
            label="Trend"
            value={report.costAnalysis.trendDirection}
          />
          <MetricBlock
            label="Models"
            value={report.costAnalysis.byModel.map((m) => m.model).join(", ")}
          />
        </div>

        {/* Daily cost table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-2 text-muted-fg font-medium">Date</th>
                <th className="text-right py-2 text-muted-fg font-medium">Queries</th>
                <th className="text-right py-2 text-muted-fg font-medium">Total Cost</th>
                <th className="text-right py-2 text-muted-fg font-medium">Avg/Query</th>
              </tr>
            </thead>
            <tbody>
              {report.costAnalysis.byDay.map((d) => (
                <tr key={d.date} className="border-b border-surface-border/50">
                  <td className="py-1.5 text-fg tabular-nums">{d.date}</td>
                  <td className="py-1.5 text-right text-fg tabular-nums">{d.queryCount}</td>
                  <td className="py-1.5 text-right text-fg tabular-nums">
                    ${d.totalCost.toFixed(2)}
                  </td>
                  <td className="py-1.5 text-right text-fg tabular-nums">
                    ${d.avgCost.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latency breakdown */}
      <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-medium text-fg">Latency Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricBlock
            label="P50"
            value={`${Math.round(report.latencyAnalysis.totalP50)}ms`}
          />
          <MetricBlock
            label="P95"
            value={`${Math.round(report.latencyAnalysis.totalP95)}ms`}
          />
          <MetricBlock
            label="P99"
            value={`${Math.round(report.latencyAnalysis.totalP99)}ms`}
          />
          <MetricBlock
            label="Cold Start Impact"
            value={`+${Math.round(report.latencyAnalysis.coldStartImpactMs)}ms`}
          />
        </div>

        {/* Span breakdown */}
        <div className="space-y-2">
          {report.latencyAnalysis.bySpan.map((s) => (
            <div key={s.span} className="flex items-center gap-3">
              <span className="text-xs text-muted-fg w-28 flex-shrink-0">
                {s.span}
              </span>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-blue/30 rounded-full"
                  style={{ width: `${Math.min(100, s.pctOfTotal * 100)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-fg tabular-nums">
                  P50: {Math.round(s.p50)}ms / P95: {Math.round(s.p95)}ms
                </span>
              </div>
              <span className="text-xs text-muted-fg w-12 text-right tabular-nums">
                {(s.pctOfTotal * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error breakdown */}
      <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-medium text-fg">Error Analysis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricBlock
            label="Total Errors"
            value={`${report.errorAnalysis.totalErrors}`}
          />
          <MetricBlock
            label="Error Rate"
            value={`${(report.errorAnalysis.errorRate * 100).toFixed(2)}%`}
          />
          <MetricBlock
            label="Peak Error Rate"
            value={`${(report.errorAnalysis.peakErrorRate * 100).toFixed(2)}%`}
          />
          <MetricBlock
            label="Off-Peak Error Rate"
            value={`${(report.errorAnalysis.offPeakErrorRate * 100).toFixed(2)}%`}
          />
        </div>

        {report.errorAnalysis.byType.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-2 text-muted-fg font-medium">Error Type</th>
                  <th className="text-right py-2 text-muted-fg font-medium">Count</th>
                  <th className="text-right py-2 text-muted-fg font-medium">% of Errors</th>
                  <th className="text-right py-2 text-muted-fg font-medium">Peak</th>
                  <th className="text-right py-2 text-muted-fg font-medium">Off-Peak</th>
                </tr>
              </thead>
              <tbody>
                {report.errorAnalysis.byType.map((e) => (
                  <tr
                    key={e.errorType}
                    className="border-b border-surface-border/50"
                  >
                    <td className="py-1.5 text-fg font-medium">{e.errorType}</td>
                    <td className="py-1.5 text-right text-fg tabular-nums">
                      {e.count}
                    </td>
                    <td className="py-1.5 text-right text-fg tabular-nums">
                      {(e.pctOfTotal * 100).toFixed(0)}%
                    </td>
                    <td className="py-1.5 text-right text-fg tabular-nums">
                      {e.peakCount}
                    </td>
                    <td className="py-1.5 text-right text-fg tabular-nums">
                      {e.offPeakCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Route distribution */}
      <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-medium text-fg">Route Distribution</h3>
        <div className="space-y-2">
          {Object.entries(report.routeDistribution).map(
            ([route, { count, pct }]) => (
              <div key={route} className="flex items-center gap-3">
                <span className="text-xs text-muted-fg w-24 flex-shrink-0">
                  {route}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-teal/30 rounded-full"
                    style={{ width: `${pct * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-fg tabular-nums">
                    {count} ({(pct * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Simple metric display block
function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-fg block">{label}</span>
      <span className="text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}

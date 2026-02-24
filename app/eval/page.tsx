"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  FlaskConical,
  BarChart3,
  GitCompareArrows,
} from "lucide-react";
import ConfigPanel from "@/components/eval/ConfigPanel";
import ResultsTable, { type EvalResult } from "@/components/eval/ResultsTable";
import MetricCard from "@/components/eval/MetricCard";
import ComparePanel from "@/components/eval/ComparePanel";

type Tab = "run" | "results" | "compare";

interface RunSummary {
  avgCost?: number;
  avgCostPerQuery?: number;
  p50LatencyMs?: number;
  p50Latency?: number;
  p95LatencyMs?: number;
  p95Latency?: number;
  avgRelevance?: number;
  avgCompleteness?: number;
  avgQuality?: number;
  cacheHitRate: number;
  totalQueries: number;
}

interface EvalRun {
  runId?: string;
  id?: string;
  querySet?: string;
  config?: Record<string, unknown>;
  summary: RunSummary;
  results?: EvalResult[];
  timestamp?: string;
}

interface ListedRun {
  id: string;
  querySet: string;
  config: { model: string; routing: string };
  summary: RunSummary;
  timestamp: string;
}

/** Normalize the summary fields across different API shapes */
function normalizeSummary(s: RunSummary) {
  return {
    avgCost: s.avgCost ?? s.avgCostPerQuery ?? 0,
    p50: s.p50LatencyMs ?? s.p50Latency ?? 0,
    p95: s.p95LatencyMs ?? s.p95Latency ?? 0,
    avgQuality:
      s.avgQuality ??
      ((s.avgRelevance ?? 0) + (s.avgCompleteness ?? 0)) / 2,
    cacheHitRate: s.cacheHitRate ?? 0,
    totalQueries: s.totalQueries ?? 0,
  };
}

export default function EvalPage() {
  const [tab, setTab] = useState<Tab>("run");
  const [currentRun, setCurrentRun] = useState<EvalRun | null>(null);
  const [pastRuns, setPastRuns] = useState<ListedRun[]>([]);

  const fetchPastRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/eval/run");
      if (res.ok) {
        const data = await res.json();
        setPastRuns(data.runs || []);
      }
    } catch {
      // silently ignore fetch failures
    }
  }, []);

  useEffect(() => {
    fetchPastRuns();
  }, [fetchPastRuns]);

  function handleRunComplete(data: unknown) {
    const run = data as EvalRun;
    setCurrentRun(run);
    setTab("results");
    // Refresh the runs list so compare panel sees the new run
    fetchPastRuns();
  }

  const summary = currentRun?.summary
    ? normalizeSummary(currentRun.summary)
    : null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "run",
      label: "Run Evaluation",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      id: "results",
      label: "Results",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <GitCompareArrows className="h-4 w-4" />,
    },
  ];

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-muted-fg hover:text-fg transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
          <div className="h-5 w-px bg-surface-border" />
          <h1 className="text-lg font-semibold text-fg">
            Evaluation Harness
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-surface-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1" aria-label="Tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-teal text-teal"
                    : "border-transparent text-muted-fg hover:text-fg hover:border-muted-fg/30"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* ---- Run Tab ---- */}
        {tab === "run" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ConfigPanel onRunComplete={handleRunComplete} />
            </div>
            <div className="lg:col-span-2 flex items-center justify-center">
              {currentRun ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-fg">
                    Last run completed with{" "}
                    <span className="font-medium text-fg">
                      {summary?.totalQueries}
                    </span>{" "}
                    queries.
                  </p>
                  <button
                    onClick={() => setTab("results")}
                    className="text-sm text-teal hover:underline"
                  >
                    View Results
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2 text-muted-fg">
                  <FlaskConical className="h-12 w-12 mx-auto opacity-30" />
                  <p className="text-sm">
                    Configure and run an evaluation to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Results Tab ---- */}
        {tab === "results" && (
          <div className="space-y-6">
            {summary ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <MetricCard
                    label="Avg Cost"
                    value={`$${summary.avgCost.toFixed(4)}`}
                  />
                  <MetricCard
                    label="P50 Latency"
                    value={`${Math.round(summary.p50)}`}
                    unit="ms"
                  />
                  <MetricCard
                    label="P95 Latency"
                    value={`${Math.round(summary.p95)}`}
                    unit="ms"
                  />
                  <MetricCard
                    label="Avg Quality"
                    value={summary.avgQuality.toFixed(3)}
                    higherIsBetter
                  />
                  <MetricCard
                    label="Cache Hit Rate"
                    value={`${(summary.cacheHitRate * 100).toFixed(1)}%`}
                    higherIsBetter
                  />
                </div>

                {/* Results Table */}
                <ResultsTable results={currentRun?.results || []} />
              </>
            ) : (
              <div className="rounded-xl border border-surface-border bg-surface p-12 text-center text-muted-fg space-y-2">
                <BarChart3 className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm">
                  No results to display. Run an evaluation first.
                </p>
                <button
                  onClick={() => setTab("run")}
                  className="text-sm text-teal hover:underline"
                >
                  Go to Run Evaluation
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---- Compare Tab ---- */}
        {tab === "compare" && <ComparePanel runs={pastRuns} />}
      </div>
    </main>
  );
}

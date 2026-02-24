"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Loader2, GitCompareArrows } from "lucide-react";

interface RunSummary {
  id: string;
  querySet: string;
  config: { model: string; routing: string };
  timestamp: string;
}

interface DeltaEntry {
  a: number;
  b: number;
  delta: number;
  improved: boolean;
}

interface CompareData {
  runA: RunSummary & { summary: Record<string, number> };
  runB: RunSummary & { summary: Record<string, number> };
  deltas: Record<string, DeltaEntry>;
}

const METRIC_LABELS: Record<string, { label: string; format: (v: number) => string; unit?: string }> = {
  avgCost: {
    label: "Avg Cost / Query",
    format: (v) => `$${v.toFixed(4)}`,
  },
  p50Latency: {
    label: "P50 Latency",
    format: (v) => `${Math.round(v)}`,
    unit: "ms",
  },
  p95Latency: {
    label: "P95 Latency",
    format: (v) => `${Math.round(v)}`,
    unit: "ms",
  },
  avgQuality: {
    label: "Avg Quality",
    format: (v) => v.toFixed(3),
  },
  cacheHitRate: {
    label: "Cache Hit Rate",
    format: (v) => `${(v * 100).toFixed(1)}%`,
  },
};

interface ComparePanelProps {
  runs: RunSummary[];
}

export default function ComparePanel({ runs }: ComparePanelProps) {
  const [runAId, setRunAId] = useState("");
  const [runBId, setRunBId] = useState("");
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select first two runs if available
  useEffect(() => {
    if (runs.length >= 2 && !runAId && !runBId) {
      setRunAId(runs[0].id);
      setRunBId(runs[1].id);
    }
  }, [runs, runAId, runBId]);

  async function handleCompare() {
    if (!runAId || !runBId) return;
    if (runAId === runBId) {
      setError("Select two different runs to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompareData(null);

    try {
      const res = await fetch(
        `/api/eval/compare?runA=${encodeURIComponent(runAId)}&runB=${encodeURIComponent(runBId)}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }
      const data: CompareData = await res.json();
      setCompareData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatRunLabel(run: RunSummary) {
    const date = new Date(run.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${run.id.slice(0, 6)} - ${run.querySet} (${date})`;
  }

  if (runs.length < 2) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-8 text-center text-muted-fg text-sm">
        Need at least two completed runs to compare. Run more evaluations first.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Run Selectors */}
      <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
          Compare Runs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <fieldset className="space-y-1.5">
            <label htmlFor="runA" className="block text-sm font-medium text-fg">
              Run A (Baseline)
            </label>
            <select
              id="runA"
              value={runAId}
              onChange={(e) => setRunAId(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-surface-border bg-muted px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-teal/50"
            >
              <option value="">Select a run</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatRunLabel(r)}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="runB" className="block text-sm font-medium text-fg">
              Run B (Candidate)
            </label>
            <select
              id="runB"
              value={runBId}
              onChange={(e) => setRunBId(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-surface-border bg-muted px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-teal/50"
            >
              <option value="">Select a run</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatRunLabel(r)}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        {error && (
          <p className="text-sm text-red bg-red/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleCompare}
          disabled={loading || !runAId || !runBId}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompareArrows className="h-4 w-4" />
              Compare
            </>
          )}
        </button>
      </div>

      {/* Comparison Results */}
      {compareData && (
        <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-fg">
                    Metric
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-fg">
                    Run A
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-fg">
                    Run B
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-fg">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(compareData.deltas).map(([key, d]) => {
                  const meta = METRIC_LABELS[key];
                  if (!meta) return null;
                  return (
                    <tr
                      key={key}
                      className="border-b border-surface-border hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium text-fg">
                        {meta.label}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-fg">
                        {meta.format(d.a)}
                        {meta.unit && (
                          <span className="text-xs ml-0.5">{meta.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-fg">
                        {meta.format(d.b)}
                        {meta.unit && (
                          <span className="text-xs ml-0.5">{meta.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            d.improved ? "text-green" : "text-red"
                          }`}
                        >
                          {d.improved ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {meta.format(Math.abs(d.delta))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

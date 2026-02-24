"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  FlaskConical,
  BarChart3,
  GitCompareArrows,
  HelpCircle,
  Upload,
  CheckCircle2,
  Info,
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
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
    fetchPastRuns();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isNdjson = file.name.endsWith(".ndjson");

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;

        if (isNdjson) {
          // Parse newline-delimited JSON: each line is a separate JSON object
          const lines = content.split("\n").filter((l) => l.trim());
          const parsed = lines.map((line, idx) => {
            try {
              return JSON.parse(line);
            } catch {
              throw new Error(`Invalid JSON on line ${idx + 1}`);
            }
          });
          setUploadStatus(
            `Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB, ${parsed.length} records). NDJSON query set ready.`
          );
        } else {
          JSON.parse(content); // validate standard JSON
          setUploadStatus(
            `Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Custom query set ready.`
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown parse error";
        setUploadStatus(
          `Error: "${file.name}" could not be parsed. ${msg}. Upload a .json array or .ndjson file (one JSON object per line).`
        );
      }
    };
    reader.readAsText(file);
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
          <button
            onClick={() => setShowGuide((v) => !v)}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-teal hover:text-blue transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            {showGuide ? "Hide guide" : "What is this?"}
          </button>
        </div>
      </header>

      {/* Explanation / Guide Section */}
      {showGuide && (
        <div className="border-b border-surface-border bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="rounded-xl border border-teal/20 bg-teal/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-semibold text-fg mb-1">
                    What is the Evaluation Harness?
                  </h2>
                  <p className="text-sm text-muted-fg leading-relaxed">
                    This tool evaluates the <strong className="text-fg">retail enterprise&apos;s RAG chatbot</strong> (the
                    customer&apos;s Internal Search Assistant), not the ROIP troubleshooting chatbot on this site.
                    It sends a batch of test questions through the customer&apos;s pipeline, scores each response
                    for quality, and records the cost and speed of every query. The goal: find the configuration
                    that delivers the best answers at the lowest cost and latency.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <TermCard
                  term="Query Set"
                  description="A predefined batch of test questions grouped by topic. Each set targets a specific area: latency troubleshooting (15 queries), cost optimization (15), scaling readiness (15), or general FAQ (10). These are the questions the eval will run through the pipeline."
                />
                <TermCard
                  term="Model Selection"
                  description='Choose which OpenAI model processes each query. "Auto (Query Router)" uses GPT-4.1-nano to classify each question and route it to the cheapest model that can handle it. Or force all queries through a single model (GPT-4.1, mini, or nano) to compare performance.'
                />
                <TermCard
                  term="Top-K Results"
                  description="How many relevant documents the pipeline retrieves from the vector store (Pinecone) for each query. Higher values give the model more context but increase cost and latency. Default is 5. Range: 1-10."
                />
                <TermCard
                  term="Quality Score"
                  description="A 0-1 score generated by GPT-4.1-nano acting as a judge. It evaluates each response for relevance (did it answer the question?) and completeness (did it cover the key points?). Higher is better. This follows the RAGAS evaluation framework."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <TermCard
                  term="Cache Hit Rate"
                  description="The percentage of queries that were answered from the Redis semantic cache instead of making a full pipeline call. Cached responses return in under 50ms and cost nothing. A higher cache hit rate means lower cost and faster responses."
                />
                <TermCard
                  term="P50 / P95 Latency"
                  description="P50 is the median response time (half of queries are faster). P95 is the 95th percentile (only 5% of queries are slower). Together they show typical performance and worst-case tail latency."
                />
              </div>

              <div className="rounded-lg border border-surface-border bg-surface p-4">
                <h3 className="text-sm font-semibold text-fg mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue" />
                  Where does the data come from?
                </h3>
                <p className="text-xs text-muted-fg leading-relaxed mb-3">
                  The evaluation runs queries live against the deployed RAG pipeline. Each query goes
                  through the same path a real user question would: query routing, cache check, vector
                  retrieval from Pinecone, and response generation via OpenAI. The quality scores, costs,
                  and latencies you see are from actual API calls made during the eval run, not historical data.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-border bg-muted/50 text-sm font-medium text-fg hover:bg-muted transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload custom query set
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.ndjson"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="text-xs text-muted-fg">
                    Accepts <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">.json</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">.ndjson</code> (one JSON object per line)
                  </span>
                </div>
                {uploadStatus && (
                  <p className={`text-xs mt-2 ${uploadStatus.startsWith("Error") ? "text-red" : "text-green"}`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="text-center space-y-4 text-muted-fg max-w-sm">
                  <FlaskConical className="h-12 w-12 mx-auto opacity-30" />
                  <p className="text-sm">
                    Configure your evaluation on the left, then hit Run. The harness sends
                    each query through the retail firm&apos;s live RAG pipeline and scores the responses.
                  </p>
                  <div className="text-left space-y-2">
                    {[
                      "Pick a query set (or upload your own)",
                      "Choose a model or let the router decide",
                      "Adjust retrieval depth (top-K) and caching",
                      "Review quality, cost, and latency per query",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
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

// ---------------------------------------------------------------------------
// Term Card Component
// ---------------------------------------------------------------------------

function TermCard({ term, description }: { term: string; description: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3">
      <h4 className="text-xs font-semibold text-fg mb-1">{term}</h4>
      <p className="text-[11px] text-muted-fg leading-relaxed">{description}</p>
    </div>
  );
}

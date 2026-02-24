"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

const QUERY_SETS = [
  { value: "latency-troubleshooting", label: "Latency Troubleshooting" },
  { value: "cost-optimization", label: "Cost Optimization" },
  { value: "scaling-readiness", label: "Scaling Readiness" },
  { value: "general-faq", label: "General FAQ" },
];

const MODELS = [
  { value: "auto", label: "Auto (Query Router)" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
];

export interface EvalConfig {
  querySet: string;
  config: {
    model: string;
    routing: "auto" | "single";
    topK: number;
    cacheEnabled: boolean;
  };
}

interface ConfigPanelProps {
  onRunComplete: (data: unknown) => void;
}

export default function ConfigPanel({ onRunComplete }: ConfigPanelProps) {
  const [querySet, setQuerySet] = useState(QUERY_SETS[0].value);
  const [model, setModel] = useState("auto");
  const [topK, setTopK] = useState(5);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routing = model === "auto" ? "auto" : "single";

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const body: EvalConfig = {
        querySet,
        config: {
          model: model === "auto" ? "gpt-4.1-mini" : model,
          routing: routing as "auto" | "single",
          topK,
          cacheEnabled,
        },
      };

      const res = await fetch("/api/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      onRunComplete(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
        Configuration
      </h3>

      {/* Query Set */}
      <fieldset className="space-y-1.5">
        <label
          htmlFor="querySet"
          className="block text-sm font-medium text-fg"
        >
          Query Set
        </label>
        <select
          id="querySet"
          value={querySet}
          onChange={(e) => setQuerySet(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-surface-border bg-muted px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-teal/50"
        >
          {QUERY_SETS.map((qs) => (
            <option key={qs.value} value={qs.value}>
              {qs.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* Model Override */}
      <fieldset className="space-y-1.5">
        <label htmlFor="model" className="block text-sm font-medium text-fg">
          Model
        </label>
        <select
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-surface-border bg-muted px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-teal/50"
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-fg">
          {routing === "auto"
            ? "Query router picks the model per-query based on complexity."
            : `All queries will use ${model}.`}
        </p>
      </fieldset>

      {/* Top-K Slider */}
      <fieldset className="space-y-1.5">
        <label htmlFor="topK" className="block text-sm font-medium text-fg">
          Top-K Results:{" "}
          <span className="font-mono text-teal">{topK}</span>
        </label>
        <input
          id="topK"
          type="range"
          min={1}
          max={10}
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          disabled={loading}
          className="w-full accent-teal"
        />
        <div className="flex justify-between text-xs text-muted-fg">
          <span>1</span>
          <span>10</span>
        </div>
      </fieldset>

      {/* Cache Toggle */}
      <fieldset className="flex items-center justify-between">
        <label htmlFor="cache" className="text-sm font-medium text-fg">
          Cache Enabled
        </label>
        <button
          id="cache"
          type="button"
          role="switch"
          aria-checked={cacheEnabled}
          onClick={() => setCacheEnabled((v) => !v)}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            cacheEnabled ? "bg-teal" : "bg-muted-fg/30"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              cacheEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </fieldset>

      {/* Error */}
      {error && (
        <p className="text-sm text-red bg-red/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Running Evaluation...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Run Evaluation
          </>
        )}
      </button>

      {loading && (
        <p className="text-xs text-muted-fg text-center">
          This may take a few minutes depending on the query set size.
        </p>
      )}
    </div>
  );
}

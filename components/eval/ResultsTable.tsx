"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export interface EvalResult {
  query: string;
  response?: string;
  latency: number;
  cost: number;
  model: string;
  cacheHit: boolean;
  scores: {
    relevance: number;
    completeness: number;
  };
  error?: string;
}

type SortKey =
  | "query"
  | "model"
  | "latency"
  | "cost"
  | "relevance"
  | "completeness"
  | "cacheHit";
type SortDir = "asc" | "desc";

interface ResultsTableProps {
  results: EvalResult[];
}

function scoreColor(score: number): string {
  if (score > 0.8) return "text-green";
  if (score >= 0.5) return "text-amber";
  return "text-red";
}

function scoreBg(score: number): string {
  if (score > 0.8) return "bg-green/10";
  if (score >= 0.5) return "bg-amber/10";
  return "bg-red/10";
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("latency");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const sorted = useMemo(() => {
    const copy = [...results];
    copy.sort((a, b) => {
      let va: number | string;
      let vb: number | string;

      switch (sortKey) {
        case "query":
          va = a.query;
          vb = b.query;
          break;
        case "model":
          va = a.model;
          vb = b.model;
          break;
        case "latency":
          va = a.latency;
          vb = b.latency;
          break;
        case "cost":
          va = a.cost;
          vb = b.cost;
          break;
        case "relevance":
          va = a.scores.relevance;
          vb = b.scores.relevance;
          break;
        case "completeness":
          va = a.scores.completeness;
          vb = b.scores.completeness;
          break;
        case "cacheHit":
          va = a.cacheHit ? 1 : 0;
          vb = b.cacheHit ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }
      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
    return copy;
  }, [results, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) {
      return <ChevronsUpDown className="h-3 w-3 text-muted-fg/50" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-teal" />
    ) : (
      <ChevronDown className="h-3 w-3 text-teal" />
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-8 text-center text-muted-fg text-sm">
        No results yet. Run an evaluation to see data here.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-muted/50">
              {(
                [
                  ["query", "Query"],
                  ["model", "Model"],
                  ["latency", "Latency"],
                  ["cost", "Cost"],
                  ["relevance", "Relevance"],
                  ["completeness", "Completeness"],
                  ["cacheHit", "Cache"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-fg cursor-pointer hover:text-fg select-none"
                  onClick={() => toggleSort(key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <>
                <tr
                  key={`row-${i}`}
                  className={`border-b border-surface-border hover:bg-muted/30 cursor-pointer ${
                    expandedRow === i ? "bg-muted/20" : ""
                  }`}
                  onClick={() =>
                    setExpandedRow(expandedRow === i ? null : i)
                  }
                >
                  <td className="px-3 py-2.5 max-w-[280px] truncate text-fg">
                    {r.query}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-fg whitespace-nowrap">
                    {r.model}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">
                    {r.latency.toLocaleString()}ms
                  </td>
                  <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">
                    ${r.cost.toFixed(4)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ${scoreColor(r.scores.relevance)} ${scoreBg(r.scores.relevance)}`}
                    >
                      {r.scores.relevance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ${scoreColor(r.scores.completeness)} ${scoreBg(r.scores.completeness)}`}
                    >
                      {r.scores.completeness.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        r.cacheHit ? "bg-green" : "bg-muted-fg/30"
                      }`}
                    />
                  </td>
                </tr>
                {expandedRow === i && (
                  <tr key={`exp-${i}`} className="bg-muted/10">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">
                          Full Query
                        </p>
                        <p className="text-sm text-fg">{r.query}</p>
                        {r.error ? (
                          <>
                            <p className="text-xs font-medium uppercase tracking-wide text-red mt-3">
                              Error
                            </p>
                            <p className="text-sm text-red/80">{r.error}</p>
                          </>
                        ) : (
                          r.response && (
                            <>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-fg mt-3">
                                Response
                              </p>
                              <p className="text-sm text-fg/80 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                                {r.response}
                              </p>
                            </>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

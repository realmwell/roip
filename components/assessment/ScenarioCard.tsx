"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, TrendingDown, Clock } from "lucide-react";
import type { ScenarioProjection } from "@/lib/assessment-engine";

interface ScenarioCardProps {
  scenario: ScenarioProjection;
  enabled: boolean;
  onToggle: (id: string) => void;
}

export default function ScenarioCard({
  scenario,
  enabled,
  onToggle,
}: ScenarioCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        enabled
          ? "border-blue/30 bg-blue/5"
          : "border-surface-border bg-surface"
      }`}
    >
      {/* Header with toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-fg">{scenario.name}</h4>
          <p className="text-xs text-muted-fg mt-0.5">{scenario.description}</p>
        </div>
        <button
          onClick={() => onToggle(scenario.id)}
          className="flex-shrink-0 mt-0.5"
          aria-label={`Toggle ${scenario.name}`}
        >
          {enabled ? (
            <ToggleRight className="h-6 w-6 text-blue" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-muted-fg" />
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-muted-fg flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Cost Savings
          </span>
          <span className="text-lg font-semibold text-fg tabular-nums">
            {(scenario.savingsPct * 100).toFixed(0)}%
          </span>
          <span className="text-xs text-muted-fg block">
            ${scenario.savingsAbsolute.toFixed(2)} saved
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-fg flex items-center gap-1">
            <Clock className="h-3 w-3" /> Latency
          </span>
          <span className="text-lg font-semibold text-fg tabular-nums">
            {scenario.latencyImprovementPct > 0
              ? `-${(scenario.latencyImprovementPct * 100).toFixed(0)}%`
              : "No change"}
          </span>
          <span className="text-xs text-muted-fg block">
            {Math.round(scenario.projectedLatencyP95)}ms P95
          </span>
        </div>
      </div>

      {/* Assumptions (show when enabled) */}
      {enabled && (
        <div className="pt-2 border-t border-surface-border/50">
          <p className="text-xs font-medium text-muted-fg mb-1.5">
            Assumptions
          </p>
          <ul className="space-y-1">
            {scenario.assumptions.map((a, i) => (
              <li key={i} className="text-xs text-muted-fg leading-relaxed">
                &bull; {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

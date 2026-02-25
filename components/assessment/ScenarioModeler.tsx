"use client";

import { useState, useMemo } from "react";
import { TrendingDown, Zap } from "lucide-react";
import ScenarioCard from "./ScenarioCard";
import type { ScenarioProjection, AssessmentReport } from "@/lib/assessment-engine";

interface ScenarioModelerProps {
  scenarios: ScenarioProjection[];
  combinedSavings: AssessmentReport["combinedSavings"];
  baselineCost: number;
  baselineP95: number;
}

export default function ScenarioModeler({
  scenarios,
  combinedSavings,
  baselineCost,
  baselineP95,
}: ScenarioModelerProps) {
  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(scenarios.map((s) => s.id))
  );

  const toggle = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Recompute combined impact based on enabled scenarios
  const impact = useMemo(() => {
    const activeScenarios = scenarios.filter((s) => enabled.has(s.id));

    if (activeScenarios.length === 0) {
      return {
        projectedCost: baselineCost,
        savingsPct: 0,
        savingsAbsolute: 0,
        projectedP95: baselineP95,
        latencyPct: 0,
      };
    }

    // Multiplicative cost reduction
    let costMultiplier = 1;
    for (const s of activeScenarios) {
      costMultiplier *= 1 - s.savingsPct;
    }
    const projectedCost = baselineCost * costMultiplier;

    // Multiplicative latency reduction
    let latencyMultiplier = 1;
    for (const s of activeScenarios) {
      if (s.latencyImprovementPct > 0) {
        latencyMultiplier *= 1 - s.latencyImprovementPct;
      }
    }
    const projectedP95 = baselineP95 * latencyMultiplier;

    return {
      projectedCost,
      savingsPct: baselineCost > 0 ? (baselineCost - projectedCost) / baselineCost : 0,
      savingsAbsolute: baselineCost - projectedCost,
      projectedP95,
      latencyPct: baselineP95 > 0 ? (baselineP95 - projectedP95) / baselineP95 : 0,
    };
  }, [enabled, scenarios, baselineCost, baselineP95]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-fg">Scenario Modeling</h3>
        <span className="text-xs text-muted-fg">
          {enabled.size} of {scenarios.length} enabled
        </span>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            enabled={enabled.has(s.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* Combined impact summary */}
      <div className="rounded-xl border border-blue/30 bg-blue/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue" />
          <span className="text-sm font-medium text-fg">
            Combined Impact
          </span>
          <span className="text-xs text-muted-fg">
            ({enabled.size} scenario{enabled.size !== 1 ? "s" : ""} active)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-muted-fg block">Baseline Cost</span>
            <span className="text-lg font-semibold text-fg tabular-nums">
              ${baselineCost.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-fg block">Projected Cost</span>
            <span className="text-lg font-semibold text-green tabular-nums">
              ${impact.projectedCost.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-fg block">Total Savings</span>
            <span className="text-lg font-semibold text-green tabular-nums">
              {(impact.savingsPct * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-muted-fg block">
              ${impact.savingsAbsolute.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-fg block">P95 Latency</span>
            <span className="text-lg font-semibold text-fg tabular-nums">
              {Math.round(impact.projectedP95)}ms
            </span>
            {impact.latencyPct > 0 && (
              <span className="text-xs text-green block">
                -{(impact.latencyPct * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

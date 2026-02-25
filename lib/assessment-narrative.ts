import openai from "./openai";
import type { AssessmentReport } from "./assessment-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Finding {
  title: string;
  severity: "critical" | "warning" | "info";
  detail: string;
  chatQuery: string; // pre-filled query for "Ask about this" link
}

export interface Remediation {
  action: string;
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  expectedImpact: string;
  chatQuery: string;
}

export interface NarrativeReport {
  executiveSummary: string;
  topActions: string[];
  savingsHeadline: string;
  findings: Finding[];
  remediationPlan: Remediation[];
}

// ---------------------------------------------------------------------------
// Narrative generation
// ---------------------------------------------------------------------------

export async function generateNarrative(
  report: AssessmentReport
): Promise<NarrativeReport> {
  // Serialize the report into a compact prompt (~2K tokens)
  const metrics = serializeForPrompt(report);

  const result = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `You are a senior AI operations consultant analyzing a customer's RAG pipeline telemetry. Write in a direct, technical tone without marketing language or filler. Be specific about numbers and actionable about recommendations. Every finding and remediation must include a chatQuery field -- a natural-language question a user could ask the ROIP chatbot to learn more about that topic.`,
      },
      {
        role: "user",
        content: `Analyze this RAG pipeline assessment and produce a structured report.

${metrics}

Respond with JSON matching this schema:
{
  "executiveSummary": "2-3 sentence overview of pipeline health, biggest risk, and estimated savings opportunity",
  "topActions": ["action 1", "action 2", "action 3"],
  "savingsHeadline": "one-line cost savings callout, e.g. 'Projected 85% cost reduction from $X to $Y per query'",
  "findings": [
    {
      "title": "short finding title",
      "severity": "critical|warning|info",
      "detail": "2-3 sentences explaining the finding with specific numbers",
      "chatQuery": "question to ask the chatbot about this finding"
    }
  ],
  "remediationPlan": [
    {
      "action": "specific action to take",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "expectedImpact": "quantified impact statement",
      "chatQuery": "question to ask the chatbot about implementing this"
    }
  ]
}

Include 4-6 findings and 4-6 remediation steps. Sort findings by severity (critical first) and remediation by priority (high first).`,
      },
    ],
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  try {
    const parsed = JSON.parse(result.output_text) as NarrativeReport;
    return parsed;
  } catch {
    // Fallback if GPT returns malformed JSON
    return {
      executiveSummary:
        "Unable to generate narrative summary. Review the quantitative metrics below for pipeline health assessment.",
      topActions: [
        "Implement tiered model routing",
        "Enable prompt caching",
        "Add semantic caching layer",
      ],
      savingsHeadline: `Potential savings of $${report.combinedSavings.savingsAbsolute.toFixed(2)} (${(report.combinedSavings.savingsPct * 100).toFixed(0)}% reduction)`,
      findings: [],
      remediationPlan: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Prompt serialization
// ---------------------------------------------------------------------------

function serializeForPrompt(report: AssessmentReport): string {
  const kpiLines = report.kpis
    .map(
      (k) =>
        `- ${k.name}: ${k.actual.toFixed(4)} (target: ${k.target}, status: ${k.status})`
    )
    .join("\n");

  const costLines = report.costAnalysis.byModel
    .map(
      (m) =>
        `- ${m.model}: ${m.count} queries, $${m.totalCost.toFixed(2)} total, $${m.avgCost.toFixed(4)}/query`
    )
    .join("\n");

  const latencyLines = report.latencyAnalysis.bySpan
    .map(
      (s) =>
        `- ${s.span}: P50=${Math.round(s.p50)}ms, P95=${Math.round(s.p95)}ms, P99=${Math.round(s.p99)}ms (${(s.pctOfTotal * 100).toFixed(0)}% of total)`
    )
    .join("\n");

  const errorLines = report.errorAnalysis.byType
    .map(
      (e) =>
        `- ${e.errorType}: ${e.count} (${(e.pctOfTotal * 100).toFixed(0)}% of errors, peak: ${e.peakCount}, off-peak: ${e.offPeakCount})`
    )
    .join("\n");

  const scenarioLines = report.scenarios
    .map(
      (s) =>
        `- ${s.name}: ${(s.savingsPct * 100).toFixed(0)}% cost savings, ${(s.latencyImprovementPct * 100).toFixed(0)}% latency improvement`
    )
    .join("\n");

  const routeLines = Object.entries(report.routeDistribution)
    .map(([route, { count, pct }]) => `- ${route}: ${count} (${(pct * 100).toFixed(0)}%)`)
    .join("\n");

  return `## Pipeline Overview
- Total requests: ${report.totalRequests}
- Date range: ${report.dataRange.from.slice(0, 10)} to ${report.dataRange.to.slice(0, 10)}
- Overall risk: ${report.overallRisk}

## Route Distribution
${routeLines}

## KPI Status
${kpiLines}

## Cost Analysis
- Total: $${report.costAnalysis.totalCost.toFixed(2)}
- Avg per query: $${report.costAnalysis.avgCostPerQuery.toFixed(4)}
- Trend: ${report.costAnalysis.trendDirection}
${costLines}

## Latency Analysis
- Total P50: ${Math.round(report.latencyAnalysis.totalP50)}ms
- Total P95: ${Math.round(report.latencyAnalysis.totalP95)}ms
- Total P99: ${Math.round(report.latencyAnalysis.totalP99)}ms
- Cold start impact: +${Math.round(report.latencyAnalysis.coldStartImpactMs)}ms
${latencyLines}

## Error Analysis
- Total errors: ${report.errorAnalysis.totalErrors} (${(report.errorAnalysis.errorRate * 100).toFixed(2)}%)
- Peak error rate: ${(report.errorAnalysis.peakErrorRate * 100).toFixed(2)}%
- Off-peak error rate: ${(report.errorAnalysis.offPeakErrorRate * 100).toFixed(2)}%
${errorLines}

## Scenario Projections
${scenarioLines}
- Combined: ${(report.combinedSavings.savingsPct * 100).toFixed(0)}% cost savings, ${(report.combinedSavings.latencyImprovementPct * 100).toFixed(0)}% latency improvement`;
}

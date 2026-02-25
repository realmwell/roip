import { MODEL_PRICING, percentile } from "./eval-engine";

// ---------------------------------------------------------------------------
// Input types (from NDJSON telemetry)
// ---------------------------------------------------------------------------

export interface RequestSummary {
  request_id: string;
  ts: string;
  latency_ms_total: number;
  http_status: number;
  route: "inventory" | "policy_only" | "mixed";
  status: string;
  error_type: string | null;
  cache_inventory_hit: boolean;
  cache_policy_hit: boolean;
  lambda_cold_start: boolean;
  lambda_concurrency_est: number;
  peak_window: boolean;
  store_id: string;
  user_id_hash: string;
  trace_id: string;
}

export interface OpenAIUsage {
  request_id: string;
  ts: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number; // in mills -- divide by 1000
  latency_ms_openai: number;
  finish_reason: string;
  tool_calls_count: number;
  route: string;
  status: string;
}

export interface SpanRecord {
  request_id: string;
  span: string;
  duration_ms: number;
  cache_hit: boolean;
  status: string;
  http_status: number | null;
  payload_size_bytes: number;
  timeout_ms: number;
  attempt: number;
  downstream_status?: string;
}

export interface ParsedTelemetry {
  requests: RequestSummary[];
  openaiUsage: OpenAIUsage[];
  spansRetrieval: SpanRecord[];
  spansOpenaiChat: SpanRecord[];
  spansInventoryCall: SpanRecord[];
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type KPIStatus = "pass" | "warning" | "critical";

export interface KPICheck {
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: KPIStatus;
  description: string;
}

export interface CostBreakdown {
  model: string;
  count: number;
  totalCost: number;
  avgCost: number;
  pctOfTotal: number;
}

export interface DailyCost {
  date: string;
  totalCost: number;
  queryCount: number;
  avgCost: number;
}

export interface CostAnalysis {
  totalCost: number;
  avgCostPerQuery: number;
  byModel: CostBreakdown[];
  byDay: DailyCost[];
  trendDirection: "increasing" | "decreasing" | "stable";
  trendSlopePerDay: number;
}

export interface SpanLatency {
  span: string;
  p50: number;
  p95: number;
  p99: number;
  count: number;
  pctOfTotal: number;
}

export interface LatencyAnalysis {
  totalP50: number;
  totalP95: number;
  totalP99: number;
  bySpan: SpanLatency[];
  coldStartImpactMs: number;
}

export interface ErrorBucket {
  errorType: string;
  count: number;
  pctOfTotal: number;
  peakCount: number;
  offPeakCount: number;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorRate: number;
  byType: ErrorBucket[];
  peakErrorRate: number;
  offPeakErrorRate: number;
}

export interface ScenarioProjection {
  id: string;
  name: string;
  description: string;
  baselineCost: number;
  projectedCost: number;
  savingsAbsolute: number;
  savingsPct: number;
  baselineLatencyP95: number;
  projectedLatencyP95: number;
  latencyImprovementPct: number;
  assumptions: string[];
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AssessmentReport {
  generatedAt: string;
  dataRange: { from: string; to: string };
  totalRequests: number;
  routeDistribution: Record<string, { count: number; pct: number }>;
  kpis: KPICheck[];
  costAnalysis: CostAnalysis;
  latencyAnalysis: LatencyAnalysis;
  errorAnalysis: ErrorAnalysis;
  scenarios: ScenarioProjection[];
  combinedSavings: {
    projectedCost: number;
    savingsAbsolute: number;
    savingsPct: number;
    projectedLatencyP95: number;
    latencyImprovementPct: number;
  };
  overallRisk: RiskLevel;
}

// ---------------------------------------------------------------------------
// KPI Targets
// ---------------------------------------------------------------------------

const KPI_TARGETS = {
  costPerQuery: { target: 0.01, warningThreshold: 1.5, unit: "$/query" },
  p95Latency: { target: 3000, warningThreshold: 1.2, unit: "ms" },
  errorRate: { target: 0.01, warningThreshold: 1.5, unit: "%" },
  retrievalQuality: { target: 0.8, warningThreshold: 0.9, unit: "score" },
};

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------

export function computeAssessment(data: ParsedTelemetry): AssessmentReport {
  const { requests, openaiUsage, spansRetrieval, spansOpenaiChat, spansInventoryCall } = data;

  // Date range
  const timestamps = requests.map((r) => new Date(r.ts).getTime());
  const from = new Date(Math.min(...timestamps)).toISOString();
  const to = new Date(Math.max(...timestamps)).toISOString();

  // Route distribution
  const routeCounts: Record<string, number> = {};
  for (const r of requests) {
    routeCounts[r.route] = (routeCounts[r.route] || 0) + 1;
  }
  const routeDistribution: Record<string, { count: number; pct: number }> = {};
  for (const [route, count] of Object.entries(routeCounts)) {
    routeDistribution[route] = { count, pct: count / requests.length };
  }

  // Analyses
  const costAnalysis = computeCostAnalysis(openaiUsage);
  const latencyAnalysis = computeLatencyAnalysis(
    requests,
    spansRetrieval,
    spansOpenaiChat,
    spansInventoryCall
  );
  const errorAnalysis = computeErrorAnalysis(requests);

  // Retrieval quality proxy
  const retrievalQuality = computeRetrievalQualityProxy(spansRetrieval);

  // KPI checks
  const kpis = computeKPIs(costAnalysis, latencyAnalysis, errorAnalysis, retrievalQuality);

  // Scenario projections
  const scenarios = computeScenarios(
    costAnalysis,
    latencyAnalysis,
    openaiUsage,
    routeDistribution,
    requests.length
  );

  // Combined savings (multiplicative)
  const combinedSavings = computeCombinedSavings(
    scenarios,
    costAnalysis,
    latencyAnalysis
  );

  // Overall risk
  const overallRisk = determineRisk(kpis);

  return {
    generatedAt: new Date().toISOString(),
    dataRange: { from, to },
    totalRequests: requests.length,
    routeDistribution,
    kpis,
    costAnalysis,
    latencyAnalysis,
    errorAnalysis,
    scenarios,
    combinedSavings,
    overallRisk,
  };
}

// ---------------------------------------------------------------------------
// Cost analysis
// ---------------------------------------------------------------------------

function computeCostAnalysis(usage: OpenAIUsage[]): CostAnalysis {
  // Convert mills to dollars
  const costs = usage.map((u) => u.estimated_cost_usd / 1000);
  const totalCost = costs.reduce((s, c) => s + c, 0);
  const avgCostPerQuery = usage.length > 0 ? totalCost / usage.length : 0;

  // By model
  const modelMap = new Map<string, { count: number; totalCost: number }>();
  for (let i = 0; i < usage.length; i++) {
    const model = usage[i].model;
    const entry = modelMap.get(model) || { count: 0, totalCost: 0 };
    entry.count++;
    entry.totalCost += costs[i];
    modelMap.set(model, entry);
  }
  const byModel: CostBreakdown[] = Array.from(modelMap.entries()).map(
    ([model, { count, totalCost: mc }]) => ({
      model,
      count,
      totalCost: mc,
      avgCost: mc / count,
      pctOfTotal: totalCost > 0 ? mc / totalCost : 0,
    })
  );

  // By day
  const dayMap = new Map<string, { totalCost: number; queryCount: number }>();
  for (let i = 0; i < usage.length; i++) {
    const day = usage[i].ts?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    const entry = dayMap.get(day) || { totalCost: 0, queryCount: 0 };
    entry.totalCost += costs[i];
    entry.queryCount++;
    dayMap.set(day, entry);
  }
  const byDay: DailyCost[] = Array.from(dayMap.entries())
    .map(([date, { totalCost: dc, queryCount }]) => ({
      date,
      totalCost: dc,
      queryCount,
      avgCost: dc / queryCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Trend (linear regression slope on daily avg cost)
  const { direction, slope } = computeTrend(byDay.map((d) => d.avgCost));

  return {
    totalCost,
    avgCostPerQuery,
    byModel,
    byDay,
    trendDirection: direction,
    trendSlopePerDay: slope,
  };
}

// ---------------------------------------------------------------------------
// Latency analysis
// ---------------------------------------------------------------------------

function computeLatencyAnalysis(
  requests: RequestSummary[],
  spansRetrieval: SpanRecord[],
  spansOpenaiChat: SpanRecord[],
  spansInventoryCall: SpanRecord[]
): LatencyAnalysis {
  const totalLatencies = requests.map((r) => r.latency_ms_total).sort((a, b) => a - b);

  const spanGroups: { name: string; records: SpanRecord[] }[] = [
    { name: "retrieval", records: spansRetrieval },
    { name: "openai_chat", records: spansOpenaiChat },
    { name: "inventory_call", records: spansInventoryCall },
  ];

  const totalP50 = percentile(totalLatencies, 50);
  const totalP95 = percentile(totalLatencies, 95);

  const bySpan: SpanLatency[] = spanGroups.map(({ name, records }) => {
    const durations = records.map((r) => r.duration_ms).sort((a, b) => a - b);
    const spanP50 = percentile(durations, 50);
    return {
      span: name,
      p50: spanP50,
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      count: records.length,
      pctOfTotal: totalP50 > 0 ? spanP50 / totalP50 : 0,
    };
  });

  // Cold start impact
  const coldStarts = requests.filter((r) => r.lambda_cold_start);
  const warmStarts = requests.filter((r) => !r.lambda_cold_start);
  const avgCold =
    coldStarts.length > 0
      ? coldStarts.reduce((s, r) => s + r.latency_ms_total, 0) / coldStarts.length
      : 0;
  const avgWarm =
    warmStarts.length > 0
      ? warmStarts.reduce((s, r) => s + r.latency_ms_total, 0) / warmStarts.length
      : 0;

  return {
    totalP50,
    totalP95,
    totalP99: percentile(totalLatencies, 99),
    bySpan,
    coldStartImpactMs: Math.max(0, avgCold - avgWarm),
  };
}

// ---------------------------------------------------------------------------
// Error analysis
// ---------------------------------------------------------------------------

function computeErrorAnalysis(requests: RequestSummary[]): ErrorAnalysis {
  const errors = requests.filter((r) => r.error_type !== null);
  const errorRate = requests.length > 0 ? errors.length / requests.length : 0;

  const typeMap = new Map<
    string,
    { count: number; peakCount: number; offPeakCount: number }
  >();
  for (const r of errors) {
    const et = r.error_type!;
    const entry = typeMap.get(et) || { count: 0, peakCount: 0, offPeakCount: 0 };
    entry.count++;
    if (r.peak_window) entry.peakCount++;
    else entry.offPeakCount++;
    typeMap.set(et, entry);
  }

  const byType: ErrorBucket[] = Array.from(typeMap.entries())
    .map(([errorType, { count, peakCount, offPeakCount }]) => ({
      errorType,
      count,
      pctOfTotal: errors.length > 0 ? count / errors.length : 0,
      peakCount,
      offPeakCount,
    }))
    .sort((a, b) => b.count - a.count);

  const peakRequests = requests.filter((r) => r.peak_window);
  const offPeakRequests = requests.filter((r) => !r.peak_window);
  const peakErrors = peakRequests.filter((r) => r.error_type !== null);
  const offPeakErrors = offPeakRequests.filter((r) => r.error_type !== null);

  return {
    totalErrors: errors.length,
    errorRate,
    byType,
    peakErrorRate:
      peakRequests.length > 0 ? peakErrors.length / peakRequests.length : 0,
    offPeakErrorRate:
      offPeakRequests.length > 0
        ? offPeakErrors.length / offPeakRequests.length
        : 0,
  };
}

// ---------------------------------------------------------------------------
// Retrieval quality proxy
// ---------------------------------------------------------------------------

function computeRetrievalQualityProxy(spans: SpanRecord[]): number {
  if (spans.length === 0) return 0;

  // Success rate (primary signal)
  const successful = spans.filter((s) => s.status === "ok").length;
  const successRate = successful / spans.length;

  // Payload size as secondary signal -- larger payloads suggest more
  // context was retrieved. Normalize against a reference size (2KB).
  const avgPayload =
    spans.reduce((s, r) => s + r.payload_size_bytes, 0) / spans.length;
  const payloadScore = Math.min(1, avgPayload / 2000);

  // Weighted combination: 70% success rate, 30% payload quality
  return successRate * 0.7 + payloadScore * 0.3;
}

// ---------------------------------------------------------------------------
// KPI checks
// ---------------------------------------------------------------------------

function computeKPIs(
  cost: CostAnalysis,
  latency: LatencyAnalysis,
  errors: ErrorAnalysis,
  retrievalQuality: number
): KPICheck[] {
  return [
    checkKPI(
      "Cost per Query",
      KPI_TARGETS.costPerQuery.target,
      cost.avgCostPerQuery,
      KPI_TARGETS.costPerQuery.unit,
      KPI_TARGETS.costPerQuery.warningThreshold,
      true // lower is better
    ),
    checkKPI(
      "P95 Latency",
      KPI_TARGETS.p95Latency.target,
      latency.totalP95,
      KPI_TARGETS.p95Latency.unit,
      KPI_TARGETS.p95Latency.warningThreshold,
      true
    ),
    checkKPI(
      "Error Rate",
      KPI_TARGETS.errorRate.target,
      errors.errorRate,
      KPI_TARGETS.errorRate.unit,
      KPI_TARGETS.errorRate.warningThreshold,
      true
    ),
    checkKPI(
      "Retrieval Quality",
      KPI_TARGETS.retrievalQuality.target,
      retrievalQuality,
      KPI_TARGETS.retrievalQuality.unit,
      KPI_TARGETS.retrievalQuality.warningThreshold,
      false // higher is better
    ),
  ];
}

function checkKPI(
  name: string,
  target: number,
  actual: number,
  unit: string,
  warningMultiplier: number,
  lowerIsBetter: boolean
): KPICheck {
  let status: KPIStatus;
  let description: string;

  if (lowerIsBetter) {
    if (actual <= target) {
      status = "pass";
      description = `${name} is within target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    } else if (actual <= target * warningMultiplier) {
      status = "warning";
      description = `${name} is slightly above target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    } else {
      status = "critical";
      description = `${name} significantly exceeds target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    }
  } else {
    if (actual >= target) {
      status = "pass";
      description = `${name} meets target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    } else if (actual >= target * warningMultiplier) {
      status = "warning";
      description = `${name} is slightly below target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    } else {
      status = "critical";
      description = `${name} is well below target (${formatValue(actual, unit)} vs ${formatValue(target, unit)} target)`;
    }
  }

  return { name, target, actual, unit, status, description };
}

function formatValue(val: number, unit: string): string {
  if (unit === "$/query") return `$${val.toFixed(4)}`;
  if (unit === "ms") return `${Math.round(val)}ms`;
  if (unit === "%") return `${(val * 100).toFixed(2)}%`;
  if (unit === "score") return val.toFixed(2);
  return val.toFixed(2);
}

// ---------------------------------------------------------------------------
// Scenario projections
// ---------------------------------------------------------------------------

function computeScenarios(
  cost: CostAnalysis,
  latency: LatencyAnalysis,
  usage: OpenAIUsage[],
  routeDist: Record<string, { count: number; pct: number }>,
  totalRequests: number
): ScenarioProjection[] {
  const baselineCost = cost.totalCost;
  const baselineP95 = latency.totalP95;

  // Average tokens per request
  const avgPromptTokens =
    usage.length > 0
      ? usage.reduce((s, u) => s + u.prompt_tokens, 0) / usage.length
      : 0;
  const avgCompletionTokens =
    usage.length > 0
      ? usage.reduce((s, u) => s + u.completion_tokens, 0) / usage.length
      : 0;

  const policyPct = routeDist["policy_only"]?.pct ?? 0;
  const nonPolicyPct = 1 - policyPct;

  return [
    modelRoutingScenario(
      baselineCost,
      baselineP95,
      avgPromptTokens,
      avgCompletionTokens,
      policyPct,
      nonPolicyPct,
      totalRequests
    ),
    promptCachingScenario(baselineCost, baselineP95, avgPromptTokens, totalRequests),
    semanticCachingScenario(baselineCost, baselineP95, totalRequests),
    batchAPIScenario(baselineCost, baselineP95, totalRequests),
  ];
}

function modelRoutingScenario(
  baselineCost: number,
  baselineP95: number,
  avgPrompt: number,
  avgCompletion: number,
  policyPct: number,
  nonPolicyPct: number,
  totalRequests: number
): ScenarioProjection {
  // Route policy_only -> gpt-4.1-nano, inventory+mixed -> gpt-4.1-mini
  const nanoPricing = MODEL_PRICING["gpt-4.1-nano"];
  const miniPricing = MODEL_PRICING["gpt-4.1-mini"];

  const nanoCostPerQuery =
    (avgPrompt / 1_000_000) * nanoPricing.input +
    (avgCompletion / 1_000_000) * nanoPricing.output;
  const miniCostPerQuery =
    (avgPrompt / 1_000_000) * miniPricing.input +
    (avgCompletion / 1_000_000) * miniPricing.output;

  const projectedCost =
    (policyPct * nanoCostPerQuery + nonPolicyPct * miniCostPerQuery) *
    totalRequests;

  // Latency: nano ~40% faster, mini ~20% faster (weighted)
  const latencyReduction = policyPct * 0.4 + nonPolicyPct * 0.2;
  const projectedP95 = baselineP95 * (1 - latencyReduction);

  return {
    id: "model-routing",
    name: "Tiered Model Routing",
    description:
      "Route simple policy queries to GPT-4.1-nano and complex inventory/mixed queries to GPT-4.1-mini instead of using GPT-4o for everything.",
    baselineCost,
    projectedCost,
    savingsAbsolute: baselineCost - projectedCost,
    savingsPct: baselineCost > 0 ? (baselineCost - projectedCost) / baselineCost : 0,
    baselineLatencyP95: baselineP95,
    projectedLatencyP95: projectedP95,
    latencyImprovementPct:
      baselineP95 > 0 ? (baselineP95 - projectedP95) / baselineP95 : 0,
    assumptions: [
      `${(policyPct * 100).toFixed(0)}% of queries routed to GPT-4.1-nano (simple policy lookups)`,
      `${(nonPolicyPct * 100).toFixed(0)}% of queries routed to GPT-4.1-mini (inventory + mixed)`,
      "GPT-4.1-nano is 25x cheaper than GPT-4o per token",
      "GPT-4.1-mini is ~6x cheaper than GPT-4o per token",
      "Assumes similar output quality for routed query types",
    ],
  };
}

function promptCachingScenario(
  baselineCost: number,
  baselineP95: number,
  avgPromptTokens: number,
  totalRequests: number
): ScenarioProjection {
  // ~30% of prompt tokens are system prompt, cached at 50% discount
  const systemPromptPct = 0.3;
  const cacheDiscount = 0.5;
  const savingsPct = systemPromptPct * cacheDiscount;

  // Cost savings apply only to input token costs. Estimate input is ~60% of total cost.
  const inputCostPct = 0.6;
  const totalSavingsPct = savingsPct * inputCostPct;

  const projectedCost = baselineCost * (1 - totalSavingsPct);
  const projectedP95 = baselineP95 * 0.92; // ~8% latency improvement

  return {
    id: "prompt-caching",
    name: "Prompt Caching",
    description:
      "Cache static system prompt tokens across requests for a 50% discount on repeated input tokens.",
    baselineCost,
    projectedCost,
    savingsAbsolute: baselineCost - projectedCost,
    savingsPct: totalSavingsPct,
    baselineLatencyP95: baselineP95,
    projectedLatencyP95: projectedP95,
    latencyImprovementPct: 0.08,
    assumptions: [
      `~${(systemPromptPct * 100).toFixed(0)}% of input tokens are cacheable system prompt`,
      "50% cost discount on cached tokens",
      `Average ${Math.round(avgPromptTokens)} prompt tokens per request`,
      "~8% latency improvement from cached prompt processing",
    ],
  };
}

function semanticCachingScenario(
  baselineCost: number,
  baselineP95: number,
  totalRequests: number
): ScenarioProjection {
  // 20% cache hit rate (conservative)
  const cacheHitRate = 0.2;
  const cachedLatencyMs = 50;

  const projectedCost = baselineCost * (1 - cacheHitRate);
  // P95 improvement: 20% of queries return in 50ms instead of baseline
  const projectedP95 = baselineP95 * 0.75; // ~25% improvement from tail reduction

  return {
    id: "semantic-caching",
    name: "Semantic Caching",
    description:
      "Cache responses for semantically similar queries using vector similarity. Repeated or near-duplicate queries return instantly from cache.",
    baselineCost,
    projectedCost,
    savingsAbsolute: baselineCost * cacheHitRate,
    savingsPct: cacheHitRate,
    baselineLatencyP95: baselineP95,
    projectedLatencyP95: projectedP95,
    latencyImprovementPct:
      baselineP95 > 0 ? (baselineP95 - projectedP95) / baselineP95 : 0,
    assumptions: [
      "20% cache hit rate (conservative estimate)",
      "Cached responses served in ~50ms",
      "Cache invalidation on policy/inventory data updates",
      "Cosine similarity threshold of 0.95 for cache matching",
    ],
  };
}

function batchAPIScenario(
  baselineCost: number,
  baselineP95: number,
  totalRequests: number
): ScenarioProjection {
  // 30% of requests are async-eligible, 50% cost discount
  const asyncPct = 0.3;
  const batchDiscount = 0.5;
  const savingsPct = asyncPct * batchDiscount;

  const projectedCost = baselineCost * (1 - savingsPct);

  return {
    id: "batch-api",
    name: "Batch API",
    description:
      "Process non-time-sensitive requests (scheduled reports, bulk analysis) through the Batch API at 50% cost discount with 24-hour turnaround.",
    baselineCost,
    projectedCost,
    savingsAbsolute: baselineCost * savingsPct,
    savingsPct,
    baselineLatencyP95: baselineP95,
    projectedLatencyP95: baselineP95, // No real-time latency change
    latencyImprovementPct: 0,
    assumptions: [
      "30% of requests are async-eligible (reports, batch analysis)",
      "50% cost discount via Batch API",
      "No impact on real-time request latency",
      "24-hour turnaround window for batch requests",
    ],
  };
}

// ---------------------------------------------------------------------------
// Combined savings (multiplicative)
// ---------------------------------------------------------------------------

function computeCombinedSavings(
  scenarios: ScenarioProjection[],
  cost: CostAnalysis,
  latency: LatencyAnalysis
): AssessmentReport["combinedSavings"] {
  const baselineCost = cost.totalCost;
  const baselineP95 = latency.totalP95;

  // Multiplicative cost reduction: baseline * (1-s1) * (1-s2) * ...
  let costMultiplier = 1;
  for (const s of scenarios) {
    costMultiplier *= 1 - s.savingsPct;
  }
  const projectedCost = baselineCost * costMultiplier;

  // Latency: take the best (lowest) projected P95 from individual scenarios
  // that actually improve latency, then apply a small additional combined benefit
  const latencyScenarios = scenarios.filter((s) => s.latencyImprovementPct > 0);
  let latencyMultiplier = 1;
  for (const s of latencyScenarios) {
    latencyMultiplier *= 1 - s.latencyImprovementPct;
  }
  const projectedP95 = baselineP95 * latencyMultiplier;

  return {
    projectedCost,
    savingsAbsolute: baselineCost - projectedCost,
    savingsPct: baselineCost > 0 ? (baselineCost - projectedCost) / baselineCost : 0,
    projectedLatencyP95: projectedP95,
    latencyImprovementPct:
      baselineP95 > 0 ? (baselineP95 - projectedP95) / baselineP95 : 0,
  };
}

// ---------------------------------------------------------------------------
// Risk determination
// ---------------------------------------------------------------------------

function determineRisk(kpis: KPICheck[]): RiskLevel {
  const criticalCount = kpis.filter((k) => k.status === "critical").length;
  const warningCount = kpis.filter((k) => k.status === "warning").length;

  if (criticalCount >= 3) return "critical";
  if (criticalCount >= 2) return "high";
  if (criticalCount >= 1 || warningCount >= 2) return "medium";
  return "low";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeTrend(values: number[]): {
  direction: "increasing" | "decreasing" | "stable";
  slope: number;
} {
  if (values.length < 2) return { direction: "stable", slope: 0 };

  // Simple linear regression
  const n = values.length;
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = values.reduce((s, y) => s + y, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) * (xs[i] - meanX);
  }

  const slope = den !== 0 ? num / den : 0;

  // Consider "stable" if slope is within 5% of mean
  const threshold = Math.abs(meanY) * 0.05;
  let direction: "increasing" | "decreasing" | "stable";
  if (slope > threshold) direction = "increasing";
  else if (slope < -threshold) direction = "decreasing";
  else direction = "stable";

  return { direction, slope };
}

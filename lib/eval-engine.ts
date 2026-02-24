import openai from "./openai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EvaluationResult {
  relevance: number; // 0-1
  completeness: number; // 0-1
  query: string;
  latencyMs: number;
  cost: number;
  cacheHit: boolean;
}

export interface AggregatedResults {
  avgCost: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  avgRelevance: number;
  avgCompleteness: number;
  cacheHitRate: number;
  totalQueries: number;
}

// ---------------------------------------------------------------------------
// Model pricing (per 1M tokens, as of Feb 2026)
// ---------------------------------------------------------------------------

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4.1": { input: 2.0, output: 8.0 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, output: 0.4 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "text-embedding-3-small": { input: 0.02, output: 0 },
  "text-embedding-3-large": { input: 0.13, output: 0 },
};

// ---------------------------------------------------------------------------
// LLM-as-Judge evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a RAG response using GPT-4.1-nano as judge.
 * Scores relevance and completeness on a 0-1 scale.
 */
export async function evaluateResponse(
  query: string,
  response: string,
  context: string[]
): Promise<{ relevance: number; completeness: number }> {
  const prompt = `You are an expert evaluator for a RAG system. Score the following response on two dimensions.

**Relevance** (0.0 to 1.0): Does the response directly address the user's query? Is the information accurate and on-topic? 1.0 means perfectly relevant, 0.0 means completely irrelevant.

**Completeness** (0.0 to 1.0): Does the response cover all aspects of the query? Does it provide actionable, specific recommendations? 1.0 means fully complete, 0.0 means empty or useless.

User query: ${query}

Retrieved context:
${context.map((c, i) => `[${i + 1}] ${c}`).join("\n")}

Response to evaluate:
${response}

Respond with JSON only. Fields: relevance (number), completeness (number). Both must be between 0.0 and 1.0.`;

  const result = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: prompt }],
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  let parsed: { relevance: number; completeness: number };
  try {
    parsed = JSON.parse(result.output_text);
  } catch {
    return { relevance: 0, completeness: 0 };
  }

  // Clamp values to [0, 1]
  return {
    relevance: Math.max(0, Math.min(1, parsed.relevance ?? 0)),
    completeness: Math.max(0, Math.min(1, parsed.completeness ?? 0)),
  };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregate evaluation results across multiple queries.
 */
export function aggregateResults(results: EvaluationResult[]): AggregatedResults {
  if (results.length === 0) {
    return {
      avgCost: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      avgRelevance: 0,
      avgCompleteness: 0,
      cacheHitRate: 0,
      totalQueries: 0,
    };
  }

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const cacheHits = results.filter((r) => r.cacheHit).length;

  return {
    avgCost: results.reduce((s, r) => s + r.cost, 0) / results.length,
    p50LatencyMs: percentile(latencies, 50),
    p95LatencyMs: percentile(latencies, 95),
    avgRelevance: results.reduce((s, r) => s + r.relevance, 0) / results.length,
    avgCompleteness:
      results.reduce((s, r) => s + r.completeness, 0) / results.length,
    cacheHitRate: cacheHits / results.length,
    totalQueries: results.length,
  };
}

// ---------------------------------------------------------------------------
// Cost calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the dollar cost of an API call given token usage and model.
 */
export function calculateCost(
  usage: { inputTokens: number; outputTokens: number },
  model: string
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // Unknown model -- return 0 and let the caller handle it
    return 0;
  }

  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

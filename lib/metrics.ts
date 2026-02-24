import redis from "./redis";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetricEntry {
  id: string;
  timestamp: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
  cacheHit: boolean;
  intent: string;
  conversationId: string;
}

export interface DailySummary {
  date: string;
  totalQueries: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  totalTokens: number;
  totalCost: number;
  cacheHitRate: number;
  intentBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METRICS_SORTED_SET = "metrics:all";
const METRICS_DATA_PREFIX = "metrics:data:";

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

/**
 * Record a single query metric. Stores the data as a hash and adds to
 * a sorted set keyed by timestamp for range queries.
 */
export async function recordMetric(
  data: Omit<MetricEntry, "id" | "timestamp">
): Promise<MetricEntry> {
  const id = nanoid();
  const timestamp = Date.now();

  const entry: MetricEntry = {
    id,
    timestamp,
    ...data,
  };

  const dataKey = `${METRICS_DATA_PREFIX}${id}`;

  // Store the full metric object
  await redis.set(dataKey, JSON.stringify(entry));

  // Index by timestamp in a sorted set
  await redis.zadd(METRICS_SORTED_SET, {
    score: timestamp,
    member: id,
  });

  // Also maintain daily counters for fast aggregation
  const dateKey = new Date(timestamp).toISOString().split("T")[0];
  await redis.rpush(`metrics:daily:${dateKey}`, id);

  return entry;
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieve metrics within a time range.
 * @param startMs - Start timestamp in milliseconds (inclusive)
 * @param endMs   - End timestamp in milliseconds (inclusive, defaults to now)
 */
export async function getMetrics(
  startMs: number,
  endMs: number = Date.now()
): Promise<MetricEntry[]> {
  // Get IDs from the sorted set within the time range
  const ids = await redis.zrange<string[]>(METRICS_SORTED_SET, startMs, endMs, {
    byScore: true,
  });

  if (ids.length === 0) return [];

  // Fetch all metric data in parallel
  const entries = await Promise.all(
    ids.map(async (id) => {
      const raw = await redis.get<string>(`${METRICS_DATA_PREFIX}${id}`);
      if (!raw) return null;
      return typeof raw === "string" ? (JSON.parse(raw) as MetricEntry) : (raw as unknown as MetricEntry);
    })
  );

  return entries.filter((e): e is MetricEntry => e !== null);
}

/**
 * Get aggregated daily summary for a given date string (YYYY-MM-DD).
 */
export async function getDailySummary(date: string): Promise<DailySummary> {
  const ids = await redis.lrange<string>(`metrics:daily:${date}`, 0, -1);

  const summary: DailySummary = {
    date,
    totalQueries: 0,
    avgLatencyMs: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    totalTokens: 0,
    totalCost: 0,
    cacheHitRate: 0,
    intentBreakdown: {},
    modelBreakdown: {},
  };

  if (ids.length === 0) return summary;

  // Fetch all entries
  const entries = await Promise.all(
    ids.map(async (id) => {
      const raw = await redis.get<string>(`${METRICS_DATA_PREFIX}${id}`);
      if (!raw) return null;
      return typeof raw === "string" ? (JSON.parse(raw) as MetricEntry) : (raw as unknown as MetricEntry);
    })
  );

  const valid = entries.filter((e): e is MetricEntry => e !== null);

  if (valid.length === 0) return summary;

  // Compute aggregates
  const latencies = valid.map((e) => e.latencyMs).sort((a, b) => a - b);
  let cacheHits = 0;

  for (const entry of valid) {
    summary.totalTokens += entry.totalTokens;
    summary.totalCost += entry.cost;
    if (entry.cacheHit) cacheHits++;

    summary.intentBreakdown[entry.intent] =
      (summary.intentBreakdown[entry.intent] || 0) + 1;
    summary.modelBreakdown[entry.model] =
      (summary.modelBreakdown[entry.model] || 0) + 1;
  }

  summary.totalQueries = valid.length;
  summary.avgLatencyMs =
    latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  summary.p50LatencyMs = percentile(latencies, 50);
  summary.p95LatencyMs = percentile(latencies, 95);
  summary.cacheHitRate = cacheHits / valid.length;

  return summary;
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

// GET: Compare two eval runs side-by-side
// Query params: runA, runB

import redis from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runA = searchParams.get('runA');
    const runB = searchParams.get('runB');

    if (!runA || !runB) {
      return Response.json({ error: 'Both runA and runB are required' }, { status: 400 });
    }

    const [dataA, dataB] = await Promise.all([
      redis.get(`eval:run:${runA}`),
      redis.get(`eval:run:${runB}`),
    ]);

    if (!dataA || !dataB) {
      return Response.json({ error: 'One or both runs not found' }, { status: 404 });
    }

    const parsedA = typeof dataA === 'string' ? JSON.parse(dataA) : dataA;
    const parsedB = typeof dataB === 'string' ? JSON.parse(dataB) : dataB;

    // Calculate deltas
    const deltas = {
      avgCost: {
        a: parsedA.summary.avgCostPerQuery,
        b: parsedB.summary.avgCostPerQuery,
        delta: parsedB.summary.avgCostPerQuery - parsedA.summary.avgCostPerQuery,
        improved: parsedB.summary.avgCostPerQuery < parsedA.summary.avgCostPerQuery,
      },
      p50Latency: {
        a: parsedA.summary.p50Latency,
        b: parsedB.summary.p50Latency,
        delta: parsedB.summary.p50Latency - parsedA.summary.p50Latency,
        improved: parsedB.summary.p50Latency < parsedA.summary.p50Latency,
      },
      p95Latency: {
        a: parsedA.summary.p95Latency,
        b: parsedB.summary.p95Latency,
        delta: parsedB.summary.p95Latency - parsedA.summary.p95Latency,
        improved: parsedB.summary.p95Latency < parsedA.summary.p95Latency,
      },
      avgQuality: {
        a: parsedA.summary.avgQuality,
        b: parsedB.summary.avgQuality,
        delta: parsedB.summary.avgQuality - parsedA.summary.avgQuality,
        improved: parsedB.summary.avgQuality > parsedA.summary.avgQuality,
      },
      cacheHitRate: {
        a: parsedA.summary.cacheHitRate,
        b: parsedB.summary.cacheHitRate,
        delta: parsedB.summary.cacheHitRate - parsedA.summary.cacheHitRate,
        improved: parsedB.summary.cacheHitRate > parsedA.summary.cacheHitRate,
      },
    };

    return Response.json({
      runA: { id: parsedA.id, config: parsedA.config, summary: parsedA.summary, timestamp: parsedA.timestamp },
      runB: { id: parsedB.id, config: parsedB.config, summary: parsedB.summary, timestamp: parsedB.timestamp },
      deltas,
    });
  } catch (error) {
    console.error('Eval compare error:', error);
    return Response.json({ error: 'Comparison failed' }, { status: 500 });
  }
}

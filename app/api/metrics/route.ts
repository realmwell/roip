// GET: Dashboard metrics
// Query params: range (7d, 30d, today)

import { getMetrics, getDailySummary } from '@/lib/metrics';

function rangeToMs(range: string): number {
  const now = Date.now();
  switch (range) {
    case 'today': return now - 24 * 60 * 60 * 1000;
    case '30d': return now - 30 * 24 * 60 * 60 * 1000;
    case '7d':
    default: return now - 7 * 24 * 60 * 60 * 1000;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    const metrics = await getMetrics(rangeToMs(range));
    const today = await getDailySummary(new Date().toISOString().split('T')[0]);

    return Response.json({
      today,
      trend: metrics,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return Response.json({
      today: {
        totalQueries: 0,
        avgLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        errorRate: 0,
        totalCost: 0,
        cacheHitRate: 0,
      },
      trend: [],
    });
  }
}

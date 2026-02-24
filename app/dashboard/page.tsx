"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Zap, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SummaryCard from "@/components/dashboard/SummaryCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardMetrics {
  totalQueries: number;
  avgLatencyMs: number;
  cacheHitRate: number;
  totalCost: number;
}

interface TrendPoint {
  name: string;
  queries: number;
  latency: number;
  cost: number;
}

// ---------------------------------------------------------------------------
// Mock / fallback data
// ---------------------------------------------------------------------------

const MOCK_METRICS: DashboardMetrics = {
  totalQueries: 1284,
  avgLatencyMs: 342,
  cacheHitRate: 0.73,
  totalCost: 14.52,
};

const MOCK_TREND: TrendPoint[] = [
  { name: "Mon", queries: 180, latency: 420, cost: 1.8 },
  { name: "Tue", queries: 210, latency: 380, cost: 2.1 },
  { name: "Wed", queries: 195, latency: 350, cost: 1.9 },
  { name: "Thu", queries: 240, latency: 310, cost: 2.4 },
  { name: "Fri", queries: 220, latency: 290, cost: 2.2 },
  { name: "Sat", queries: 130, latency: 360, cost: 1.3 },
  { name: "Sun", queries: 109, latency: 400, cost: 1.1 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_METRICS);
  const [trend, setTrend] = useState<TrendPoint[]>(MOCK_TREND);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics?range=7d");
        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (cancelled) return;

        // Only update if the API returned real data
        if (data.today && data.today.totalQueries > 0) {
          setMetrics({
            totalQueries: data.today.totalQueries,
            avgLatencyMs: Math.round(data.today.avgLatencyMs ?? 0),
            cacheHitRate: data.today.cacheHitRate ?? 0,
            totalCost: data.today.totalCost ?? 0,
          });
        }

        // Build trend from raw metric entries if available
        if (data.trend && data.trend.length > 0) {
          const grouped = groupByDay(data.trend);
          if (grouped.length > 0) {
            setTrend(grouped);
          }
        }
      } catch {
        // Silently fall back to mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: "Total Queries",
      value: metrics.totalQueries.toLocaleString(),
      subtitle: "Last 7 days",
      icon: Activity,
      color: "bg-navy",
    },
    {
      title: "Avg Latency",
      value: `${metrics.avgLatencyMs}ms`,
      subtitle: "Response time",
      icon: Clock,
      color: "bg-blue",
    },
    {
      title: "Cache Hit Rate",
      value: `${Math.round(metrics.cacheHitRate * 100)}%`,
      subtitle: "Redis cache",
      icon: Zap,
      color: "bg-teal",
    },
    {
      title: "Total Cost",
      value: `$${metrics.totalCost.toFixed(2)}`,
      subtitle: "API spend",
      icon: DollarSign,
      color: "bg-green",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-fg mt-1">
          RAG pipeline performance at a glance
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Query Volume" loading={loading}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gradQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--card-border)" }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--card-border)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="queries"
                stroke="#0EA5E9"
                strokeWidth={2}
                fill="url(#gradQueries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Latency (ms)" loading={loading}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gradLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E75B6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E75B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--card-border)" }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--card-border)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#2E75B6"
                strokeWidth={2}
                fill="url(#gradLatency)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart card wrapper
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface border border-surface-border p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-muted-fg mb-4">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center h-[260px]">
          <div className="h-8 w-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg border border-navy-light">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-gray-300">
          {p.dataKey}: <span className="text-teal font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RawMetricEntry {
  timestamp: number;
  latencyMs: number;
  cost: number;
}

function groupByDay(entries: RawMetricEntry[]): TrendPoint[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped: Record<string, { queries: number; totalLatency: number; cost: number }> = {};

  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const dayName = days[d.getDay()];

    if (!grouped[dayName]) {
      grouped[dayName] = { queries: 0, totalLatency: 0, cost: 0 };
    }

    grouped[dayName].queries += 1;
    grouped[dayName].totalLatency += entry.latencyMs;
    grouped[dayName].cost += entry.cost;
  }

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    queries: data.queries,
    latency: Math.round(data.totalLatency / data.queries),
    cost: Math.round(data.cost * 100) / 100,
  }));
}

---
title: "Scaling Readiness Checklist"
category: "troubleshooting"
tags: ["scaling", "checklist", "rate-limits", "load-testing", "slos"]
source_url: "https://platform.openai.com/docs/guides/rate-limits"
last_updated: "2026-02-24"
---

# Scaling Readiness Checklist

Before expanding your RAG deployment to more users or teams, work through this checklist. Skipping these steps leads to outages, cost blowouts, and a loss of stakeholder confidence that's hard to recover.

## 1. Calculate Current TPM/RPM Utilization

Pull your actual tokens per minute and requests per minute from the last 30 days. Calculate peak utilization as a percentage of your tier limit. If peak utilization exceeds 70%, you need a tier upgrade before adding any load.

Formula for projected needs:

```
New users x avg queries/user/hour x avg tokens/query = additional TPM needed
Current peak TPM + additional TPM = projected peak TPM
```

Add a 1.5-2x multiplier for burst capacity. Traffic is never evenly distributed.

## 2. Request Rate Limit Tier Upgrade Proactively

OpenAI tier upgrades take 1-3 business days to process. Do not wait until you're hitting 429 errors in production. Submit the upgrade request at least 2 weeks before your planned expansion date. Include your current usage, projected usage, and expansion timeline in the request.

## 3. Implement Semantic Caching Before Adding Users

Every cache hit is a request that doesn't hit the LLM. At a 30-40% hit rate, caching effectively gives you 30-40% more capacity without any API tier changes. If you haven't deployed semantic caching yet, do it before scaling. The cost-to-capacity ratio is far better than requesting higher rate limits.

## 4. Pre-Embed New Knowledge Bases via Batch API

If the new teams bring their own knowledge bases, embed them using the Batch API before go-live. Batch embedding runs asynchronously at 50% cost savings and doesn't consume your real-time API quota. Don't embed new corpora using the synchronous API during production hours.

## 5. Load Test at Target Scale

Simulate the projected query volume in a staging environment. Use realistic query patterns, not synthetic benchmarks. Measure:

- P50 and P95 latency under load.
- Error rate (especially 429s) under sustained traffic.
- Vector DB query latency at the projected index size.
- Cache performance under realistic query distributions.

If any metric fails to meet SLOs, fix it before going live.

## 6. Set Up Per-Team API Keys

Issue separate API keys (or OpenAI project keys) for each team. This provides cost attribution, independent rate limiting, and the ability to revoke access for a single team without affecting others. Configure these before onboarding; retrofitting key separation after launch is painful.

## 7. Establish SLOs

Define and publish service level objectives before expanding:

- **P50 latency**: <500ms. Half of all requests should complete in under half a second.
- **P95 latency**: <2,000ms. Only 5% of requests should take longer than 2 seconds.
- **Error rate**: <1%. Measured as non-2xx responses divided by total requests.
- **Cost per query**: <$0.015. All-in cost including embedding, retrieval, caching, and generation.

These SLOs give you clear targets to test against and clear thresholds for incident response. If P95 latency exceeds 2s after expansion, you know something is wrong and needs immediate attention.

## 8. Monitoring and Alerting

Verify that your monitoring covers all pipeline stages and that alerts fire before users notice problems. At minimum, alert on: error rate >1% over 5 minutes, P95 latency >3s over 5 minutes, 429 rate >5% of requests, and daily cost >1.5x trailing 7-day average.

---
title: "Case Study: Retail RAG Optimization for Enterprise Scale"
category: "case-studies"
tags: ["retail", "optimization", "model-routing", "semantic-caching", "prompt-caching", "cost-reduction"]
source_url: "https://platform.openai.com/docs/guides/optimizing-llm-accuracy"
last_updated: "2026-02-24"
---

# Case Study: Retail RAG Optimization

## Scenario

A retail enterprise with 1,000+ store employees deployed an internal Q&A assistant powered by RAG. The assistant answers questions about product information, store policies, return procedures, inventory lookup, and HR guidelines. Employees use it 10-30 times per shift across all store locations.

## Problem

Six months after launch, the platform was showing serious strain:

- **Latency climbing**: P50 had drifted from 600ms to 1.8s. P95 was hitting 5s+ regularly. Employees were abandoning queries and calling the help desk instead.
- **Error rates rising**: 429 errors were hitting 8% of requests during peak hours (10am-2pm). The API tier couldn't handle concentrated weekday usage patterns.
- **Costs growing linearly with usage**: Every query hit GPT-4o regardless of complexity. Monthly API spend had tripled since launch and was trending toward $45K/month.
- **Leadership wanted 3x expansion**: Plans to roll out to three additional business units (logistics, corporate, and field services) were on hold because the current deployment couldn't handle 3x the traffic on the existing budget.

## Solution

The optimization was structured in four phases, each building on the previous one.

### Phase 1: Stabilize (Weeks 1-2)

Stopped the bleeding. Pinned the model to a dated snapshot to eliminate version drift. Added circuit breakers for 500/503 errors. Implemented exponential backoff for 429 retries. Set `max_tokens` to 500 on all requests to cap runaway generation. Requested an API tier upgrade.

Result: Error rate dropped from 8% to 2% immediately.

### Phase 2: Optimize (Weeks 3-6)

Deployed three cost reduction techniques in sequence:

**Model routing** with a 70/25/5 split. GPT-4.1-nano handled simple lookups (store hours, basic policy questions). GPT-4.1-mini handled comparisons and multi-step questions. GPT-4.1 handled complex policy interpretation and ambiguous queries. The routing classifier (also GPT-4.1-nano) added less than $0.001 per query.

**Semantic caching** using Redis with cosine similarity at a 0.95 threshold. Retail Q&A is highly repetitive. "What's the return policy?" gets asked hundreds of times a day across stores. Cache hit rate stabilized at 38%, meaning 38% of queries never touched the LLM.

**Prompt caching** by restructuring the system prompt to front-load static instructions. The 2,800-token system prompt was cached on nearly every request, cutting input costs on that portion by 50%.

### Phase 3: Pilot (Weeks 7-9)

Onboarded the logistics team as the first expansion group. Issued them a separate API key for cost isolation. Set up their namespace in the vector database with logistics-specific documents. Ran a 2-week burn-in with 8 pilot users, monitoring quality and cost per query.

### Phase 4: Expand (Weeks 10-12)

Rolled out to the full logistics team, then corporate. Each team followed the same burn-in process.

## Results

- **Cost reduction**: 60-80% reduction in per-query cost. Monthly spend dropped from $45K to $12K despite serving 40% more queries.
- **P50 latency**: Under 500ms. Cache hits returned in under 15ms. Nano-model queries completed in 200-400ms.
- **Error rate**: Below 1% sustained, including during peak hours.
- **Capacity**: The platform handled 3x the original query volume within the existing API tier after optimization.

The cost per query dropped from ~$0.045 to ~$0.010, well under the $0.015 SLO target.

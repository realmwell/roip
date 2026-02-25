---
title: "Case Study: Multi-Team RAG Scaling Playbook"
category: "case-studies"
tags: ["scaling", "multi-team", "phased-rollout", "api-keys", "burn-in", "enterprise"]
source_url: "https://developers.openai.com/api/docs/guides/rate-limits"
last_updated: "2026-02-24"
---

# Case Study: Multi-Team RAG Scaling

## Scenario

An enterprise had a working RAG deployment serving one team (retail operations, ~300 users). Leadership approved expansion to four additional teams over a 12-week timeline: logistics (200 users), corporate communications (150 users), field services (400 users), and HR (100 users). Total projected user base: 1,150 users, roughly 4x the original.

The infrastructure needed to support this without degrading service for the original team.

## Phase 0: Stabilize (Weeks 1-2)

Before adding any new teams, the existing deployment needed to be solid.

**Actions taken:**
- Audited current performance: P50 latency at 1.2s (target: <500ms), error rate at 3.5% (target: <1%), no semantic caching, no model routing.
- Implemented model routing with a 70/25/5 nano/mini/full split. Immediate cost reduction of 55%.
- Deployed semantic caching. Hit rate reached 34% within the first week as the cache warmed.
- Optimized the system prompt: reduced from 3,200 tokens to 2,100 tokens by removing redundant instructions and replacing verbose formatting rules with a structured output schema.
- Pinned model to a dated snapshot.
- Set up monitoring dashboards covering latency (P50, P95), error rate, cost per query, cache hit rate, and model routing distribution.

**Results after Phase 0:**
- P50 latency: 450ms (down from 1.2s).
- Error rate: 0.6% (down from 3.5%).
- Cost per query: $0.011 (down from $0.038).

## Phase 1: Optimize Infrastructure (Weeks 3-6)

Prepared the shared infrastructure for multi-tenancy.

**API key architecture:** Created a separate OpenAI project key for each team. Each key maps to a team in the billing dashboard. Set per-key rate limits proportional to each team's projected usage plus 50% headroom.

**Vector database namespaces:** Created isolated namespaces for each team's knowledge base. The retail namespace already contained ~15,000 chunks. Added a shared namespace for company-wide policies (2,000 chunks) accessible to all teams.

**Cache namespace separation:** Implemented cache key prefixing by team. Retail cache entries don't leak to logistics queries.

**Rate limit planning:** Calculated projected TPM needs:
- Retail: 300 users x 15 queries/hour x 4,000 tokens/query = 18M TPM peak.
- All teams projected: ~50M TPM peak.
- Requested tier upgrade to handle 80M TPM (with headroom).

**Load testing:** Simulated 4x current traffic in staging. Identified that the vector database needed an index rebuild for the combined corpus size. Rebuilt the HNSW index with higher ef_construction (400 vs. 200) to maintain search quality at scale.

## Phase 2: Pilot (Weeks 7-9)

Onboarded the first new team (logistics) through a structured burn-in.

**Week 7:** Ingested the logistics knowledge base (8,000 documents covering shipping procedures, warehouse protocols, carrier agreements). Embedded via Batch API at 50% cost savings. Loaded into the logistics namespace.

**Weeks 7-8:** 8 pilot users from logistics used the system. Logged every query and response. Ran daily quality evaluations using LLM-as-judge. Identified 3 query patterns where retrieval quality was poor (carrier-specific terminology not matching well). Adjusted chunking for carrier documents and added synonym mappings.

**Week 9:** Expanded to the full logistics team (200 users). Monitored for 5 days. All SLOs held.

## Phase 3: Expand (Weeks 10-12)

Onboarded remaining teams in sequence, each with a 2-week burn-in:

- **Week 10:** Corporate communications (150 users). Knowledge base: press releases, brand guidelines, communication templates. Burn-in identified that this team needed a higher proportion of mid-tier model routing due to nuanced writing-style questions.
- **Week 11:** Field services (400 users). Knowledge base: equipment manuals, safety procedures, service protocols. Largest team, required the most rate limit headroom.
- **Week 12:** HR (100 users). Knowledge base: benefits documentation, hiring procedures, compliance policies. Sensitive content required additional moderation configuration.

## Outcome

All five teams were live by week 12. Aggregate metrics across all teams:
- P50 latency: 480ms (within 500ms SLO).
- P95 latency: 1,400ms (within 2,000ms SLO).
- Error rate: 0.8% (within 1% SLO).
- Average cost per query: $0.012 (within $0.015 SLO).
- Monthly cost: $28K for 1,150 users (vs. projected $120K+ without optimization).

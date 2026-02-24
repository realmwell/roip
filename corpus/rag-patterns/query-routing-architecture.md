---
title: "Query Routing Architecture for Cost-Efficient RAG"
category: "rag-patterns"
tags: ["routing", "cost-optimization", "latency", "model-selection", "structured-outputs"]
source_url: "https://platform.openai.com/docs/guides/optimizing-llm-accuracy"
last_updated: "2026-02-24"
---

# Query Routing Architecture

Most RAG deployments waste money by sending every query to a frontier model. A routing layer fixes this by matching query complexity to the cheapest model that can handle it.

## Traffic Distribution

The target split for a mature deployment looks like this:

- **60-70% to small/cheap models** (GPT-4.1-nano, GPT-4.1-mini): Factual lookups, FAQ-style questions, simple retrieval. These queries have a clear answer in the knowledge base and need minimal reasoning.
- **25-30% to mid-tier models** (GPT-4.1): Multi-step reasoning, comparisons, summarization across multiple sources. The query needs synthesis but not deep analysis.
- **<10% to frontier models** (GPT-4.1 with extended thinking, o3): Ambiguous queries, complex policy interpretation, multi-turn reasoning chains, anything where accuracy is critical and the cost is justified.

## Classification Layer

Use GPT-4.1-nano as the routing classifier. At $0.10 per 1M input tokens, classification costs less than $0.001 per query. The classifier evaluates three signals:

1. **Intent**: What is the user trying to do? Lookup, comparison, analysis, creative generation.
2. **Complexity**: How many reasoning steps are needed? Single-hop retrieval vs. multi-hop synthesis.
3. **Required accuracy**: What's the cost of a wrong answer? Policy questions need higher accuracy than general FAQs.

Use structured outputs from the nano model to enforce a consistent routing schema:

```json
{
  "route": "nano | mini | full",
  "confidence": 0.0-1.0,
  "reasoning": "string"
}
```

When confidence drops below 0.7, bump the query up one tier. This catches edge cases without over-routing.

## Cost Impact

A well-tuned routing layer delivers 40-70% cost reduction compared to sending everything to a single frontier model. The exact savings depend on query mix. Retail Q&A skews heavily toward simple lookups (70%+ nano-eligible), while legal or compliance use cases skew toward mid-tier and frontier.

## Latency Gains

Routing also improves latency by 30-60%. Nano and mini models respond faster, and you avoid queuing behind heavier requests. P50 latency typically drops from 1.5-2s to under 500ms once routing is in place.

## Implementation Notes

Build the router as a standalone service so you can update routing logic without redeploying the full pipeline. Log every routing decision with the classification output, actual model used, and response quality score. This data feeds back into tuning the classifier over time.

Start conservative: route more to mid-tier initially, then shift traffic to nano as you validate quality holds. Monitor answer quality per tier weekly using LLM-as-judge evaluation.

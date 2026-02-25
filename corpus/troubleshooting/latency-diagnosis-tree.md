---
title: "Latency Diagnosis Decision Tree"
category: "troubleshooting"
tags: ["latency", "diagnosis", "decision-tree", "performance", "debugging"]
source_url: "https://developers.openai.com/api/docs/guides/latency-optimization"
last_updated: "2026-02-24"
---

# Latency Diagnosis Decision Tree

When response times increase, work through this tree systematically. Each step eliminates a category of causes so you converge on the root cause without guessing.

## Step 1: Check Platform Status

Go to status.openai.com. If there's a degraded performance incident or outage, that's your answer. Wait for resolution. Nothing in your pipeline can fix a platform-level issue.

If status is green, move to step 2.

## Step 2: Isolate OpenAI Latency vs. Infrastructure Latency

The OpenAI API response includes the `x-request-id` header and, in many cases, a `processing-ms` or equivalent timing indicator in the response. Compare the OpenAI processing time against your total end-to-end latency.

- **If OpenAI processing time is high** (say, 1500ms when it was previously 800ms): The issue is on the model/API side. Check for model version drift (step 3) or token consumption changes (step 4).
- **If OpenAI processing time is normal but total latency is high**: The bottleneck is in your infrastructure. Jump to step 6 (vector DB) or step 7 (embedding).

Log both values on every request so you can trend them over time.

## Step 3: Check Model Version Drift

If you're not pinning to a dated model snapshot (e.g., `gpt-4.1-2025-04-14`), OpenAI may have updated the model. New versions can have different latency characteristics. Check your logs for model version changes. Pin to a specific snapshot to prevent unexpected drift.

## Step 4: Review Token Consumption Trends

Pull average input and output token counts over the last 7-14 days. If input tokens are trending up, something is stuffing more context into the prompt. Common causes: retrieval depth increased (top-k crept from 5 to 10), system prompt grew as developers added instructions, or conversation history isn't being truncated properly.

If output tokens are trending up, the model is generating longer responses. Set `max_tokens` explicitly or switch to structured outputs to cap generation length.

## Step 5: Rate Limit Analysis

Check 429 error frequency in your logs. If you're hitting rate limits, requests queue behind retries and total latency spikes. Check your TPM and RPM utilization against your tier limits. If you're consistently above 80% utilization, request a tier upgrade.

Implement exponential backoff with jitter for retries. Hard retry loops without backoff create cascading latency spikes.

## Step 6: Vector Database Performance

Profile your vector search latency independently. If similarity search is taking more than 50-100ms, investigate:

- Index size growth (more chunks = slower search without index optimization).
- Index configuration (HNSW parameters: ef_construction, M values).
- Hardware constraints (RAM pressure if the index outgrew memory).
- Query filter complexity (metadata filters add overhead).

## Step 7: Embedding Bottleneck

If you're generating embeddings synchronously at query time (for the user's query), this adds 100-300ms to every request. Measure embedding API latency separately.

Mitigations: Cache query embeddings for repeated queries. Use the smaller embedding model (`text-embedding-3-small`). Batch embedding calls if processing multiple queries. Consider pre-computing embeddings for common query patterns.

## Using the Tree in Practice

Instrument your pipeline to log timing at each stage: embedding generation, vector search, context assembly, LLM call, post-processing. When latency rises, the per-stage timings tell you immediately which step degraded. Without this instrumentation, you're diagnosing blind.

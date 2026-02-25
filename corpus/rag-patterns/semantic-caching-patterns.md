---
title: "Semantic Caching Patterns for RAG Pipelines"
category: "rag-patterns"
tags: ["caching", "redis", "cosine-similarity", "latency", "cost-optimization"]
source_url: "https://developers.openai.com/api/docs/guides/prompt-caching"
last_updated: "2026-02-24"
---

# Semantic Caching Patterns

Traditional exact-match caching misses most opportunities in RAG because users phrase the same question differently. Semantic caching solves this by matching on meaning rather than string equality.

## Architecture

The core setup uses Redis as the cache store with vector similarity search. Each cache entry stores:

- **Cache key**: The query's embedding vector (generated from the same embedding model used in retrieval).
- **Cache value**: The full response text, plus metadata including the model used, token counts, retrieval context IDs, and a timestamp.

When a new query comes in, embed it, then run a cosine similarity search against cached query embeddings. If the top match scores above the similarity threshold, return the cached response. If not, proceed with the full RAG pipeline and cache the result.

## Similarity Threshold

Set the cosine similarity threshold at 0.95 or higher. Lower thresholds increase hit rates but risk returning wrong answers for queries that are semantically close but meaningfully different. Start at 0.97 and lower gradually while monitoring answer quality.

A threshold of 0.95 typically yields a 30-40% cache hit rate in retail deployments where employees ask similar questions about policies, procedures, and product info. Knowledge worker deployments with more varied queries see 15-25% hit rates.

## TTL-Based Invalidation

Set a default TTL of 3600 seconds (1 hour) for cached responses. This balances freshness against hit rate. For rapidly changing data (inventory, pricing), drop TTL to 300-600 seconds. For stable reference content (HR policies, product specs), extend to 86400 seconds or longer.

Implement explicit invalidation when source documents are updated. Tag cache entries with their source document IDs so you can purge related entries when a document changes.

## Performance Impact

Cache hits deliver 95%+ latency improvement because you skip embedding search, retrieval, and LLM generation entirely. A cached response returns in 5-15ms compared to 500-2000ms for a full pipeline execution.

The cost savings follow directly: cached responses cost essentially nothing (just the embedding call for similarity matching, which is negligible).

## Implementation Details

Use Redis with the RediSearch module for vector similarity search. Store embeddings as FLOAT32 vectors with HNSW indexing for sub-millisecond search at scale. Keep the cache index in memory; the response payloads can spill to disk if memory is constrained.

Monitor cache hit rate, similarity score distribution, and the staleness of returned results. If hit rate drops below 20%, check whether the query distribution has shifted or if TTL is too aggressive.

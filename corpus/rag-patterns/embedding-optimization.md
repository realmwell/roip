---
title: "Embedding Optimization for RAG Pipelines"
category: "rag-patterns"
tags: ["embeddings", "text-embedding-3-small", "mrl", "batch-api", "storage-optimization"]
source_url: "https://platform.openai.com/docs/guides/embeddings"
last_updated: "2026-02-24"
---

# Embedding Optimization

Embeddings are the foundation of vector retrieval. Optimizing how you generate, store, and manage them affects cost, latency, and storage across the entire pipeline.

## Model Selection and Dimensionality

Use `text-embedding-3-small` as the default embedding model for most RAG use cases. It offers strong retrieval quality at a fraction of the cost of larger models. The key optimization is Matryoshka Representation Learning (MRL), which lets you truncate embedding dimensions without retraining.

The full output is 1536 dimensions. Truncating to 512 dimensions delivers 66% storage savings with minimal quality loss on standard retrieval benchmarks. For most enterprise RAG deployments, 512 dimensions is the right tradeoff. If retrieval quality is critical and storage is cheap, keep 1024. Going below 256 dimensions typically degrades retrieval noticeably.

## Storage Impact

At 512 dimensions with FLOAT32 encoding, each embedding takes 2KB. A corpus of 100,000 chunks requires ~200MB of vector storage. At 1536 dimensions, that same corpus takes ~600MB. The 66% reduction matters more at scale, and it also speeds up similarity search because the index is smaller.

## Batch Embedding Calls

Never embed one chunk at a time in a loop. The OpenAI embeddings endpoint accepts up to 2048 inputs per request. Batch your chunks to minimize API round trips. For a corpus of 50,000 chunks, that's ~25 API calls instead of 50,000.

## Pre-Embed Static Corpus via Batch API

For initial corpus loading or periodic re-indexing, use the Batch API to generate embeddings. Batch API requests run asynchronously at 50% cost savings compared to synchronous calls. Submit the full corpus as a batch job, poll for completion, then load the embeddings into your vector database.

This is particularly valuable for nightly re-indexing workflows where latency doesn't matter and cost does.

## Cache Embeddings for Repeated Queries

Query embeddings are worth caching when users ask similar questions. Store the mapping from query text to embedding vector in Redis or an in-memory cache with a TTL of 3600 seconds. This avoids redundant embedding API calls for common queries.

At high query volumes (10,000+ queries/day), embedding caching saves meaningful cost and shaves 50-100ms off each cached query's latency.

## Embedding Versioning

Pin your embedding model version. If OpenAI updates the model, your existing embeddings won't be compatible with new ones. Track which model version generated each set of embeddings and re-embed the full corpus when you upgrade models.

## Monitoring

Track embedding generation latency per batch, API error rates, and dimension utilization. If you're using MRL truncation, periodically validate retrieval quality at your chosen dimension count against a test set to catch any drift.

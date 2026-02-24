---
title: "Performance Efficiency for ML Workloads"
category: "aws-ml-lens"
tags: ["performance-efficiency", "inference-latency", "caching", "routing", "cold-start"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/performance-efficiency.html"
last_updated: "2026-02-24"
---

# Performance Efficiency for ML Workloads

Users notice latency. A retrieval-augmented generation pipeline that takes 8 seconds to respond will lose engagement regardless of answer quality. Performance efficiency in ML systems requires optimizing every link in the chain, from the initial request through retrieval, inference, and response delivery.

## Right-Size Inference Endpoints

Match compute resources to actual workload characteristics rather than provisioning for theoretical peaks. Profile your traffic patterns: average request rate, burst patterns, token distribution per request, and concurrency requirements. GPU instances are expensive when idle. Use auto-scaling policies tuned to inference-specific metrics like queue depth and GPU utilization rather than generic CPU thresholds. For self-hosted models, benchmark different instance types against your specific model to find the best price-performance ratio.

## Request-Level Routing by Complexity

Not all queries need the same processing path. Implement a routing layer that evaluates incoming requests and directs them to the appropriate pipeline. Short factual queries can skip reranking and use a smaller context window. Complex analytical questions may need multi-step retrieval with reranking and a larger model. This routing reduces average latency because simpler requests avoid unnecessary processing stages.

## Semantic Caching

Many production systems see repeated or near-identical queries. Implement semantic caching that stores responses keyed by embedding similarity rather than exact string match. When a new query falls within a configurable similarity threshold of a cached query, return the cached result. This eliminates redundant LLM calls entirely for common questions. Set TTL values appropriate to your data freshness requirements and invalidate cache entries when the underlying corpus changes.

## Data Pipeline Throughput

Optimize the data ingestion and embedding pipeline so it can keep pace with corpus updates. Parallelize document chunking and embedding generation. Use batch APIs for bulk processing. Index updates to the vector store should be incremental rather than full rebuilds when possible. Measure end-to-end pipeline throughput and set targets for how quickly new documents become searchable.

## Cold Start Latency

Serverless inference deployments trade cost for cold start penalties. Minimize this by keeping model artifacts small, using provisioned concurrency for critical paths, and pre-warming endpoints before anticipated traffic spikes. For container-based deployments, keep images lean and load model weights from fast storage. Measure cold start latency separately from warm latency and ensure your SLOs account for the startup penalty.

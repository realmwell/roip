---
title: "Reliability for ML Workloads"
category: "aws-ml-lens"
tags: ["reliability", "fault-tolerance", "circuit-breaker", "graceful-degradation", "multi-region"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/reliability.html"
last_updated: "2026-02-24"
---

# Reliability for ML Workloads

ML systems have a dependency problem. They rely on external model APIs, vector databases, embedding services, and data pipelines that each introduce their own failure modes. A reliable ML system is one that continues providing value even when individual components fail.

## Design for Horizontal Scaling

Stateless inference services scale horizontally without coordination overhead. Keep request processing independent: no shared mutable state between inference workers, no session affinity requirements. Store conversation context and user state in external stores (Redis, DynamoDB) so any worker can handle any request. This lets auto-scaling respond to demand without complex orchestration. Load test at 2-3x your expected peak to verify scaling behavior before you need it.

## Graceful Degradation

When a component fails, serve a reduced experience rather than an error page. If the LLM API is throttled or unavailable, fall back to cached responses for common queries. If the vector store is slow, reduce the number of retrieved chunks rather than timing out entirely. If the reranker is down, return results based on vector similarity alone. Each degradation path should be tested and documented so the system fails predictably.

## Recovery Procedures for Service Outages

External dependencies will go down. Have documented recovery procedures for each one. When your model provider has an outage, what's the switchover process? When the vector database needs recovery, how long does reindexing take? Run these procedures in practice, not just on paper. Measure recovery time and set targets: if reindexing takes 4 hours, your architecture needs to tolerate a 4-hour stale index.

## Circuit Breaker Patterns

Wrap all external API calls (OpenAI, Anthropic, Cohere, etc.) in circuit breakers. When error rates exceed a threshold, the circuit opens and requests fail fast instead of queuing and compounding latency. Configure half-open states that periodically test whether the service has recovered. Pair circuit breakers with retry logic that uses exponential backoff and jitter to avoid thundering herd problems when a provider comes back online.

## Multi-Region Fallback

For production systems with strict availability requirements, deploy across multiple regions. This covers both your own infrastructure and your choice of model providers. Maintain a secondary vector store replica in another region. Configure DNS-based or application-level failover so traffic routes to the healthy region automatically. Test failover regularly, because an untested failover mechanism is not a failover mechanism.

---
title: "Cost Optimization for ML Workloads"
category: "aws-ml-lens"
tags: ["cost-optimization", "inference-cost", "unit-economics", "tiered-inference", "capacity-planning"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/cost-optimization.html"
last_updated: "2026-02-24"
---

# Cost Optimization for ML Workloads

ML inference costs scale with traffic in ways that catch teams off guard. A single LLM call can cost 10-100x more than a traditional API call, and those costs compound fast when you're processing thousands of requests per hour. Cost optimization starts with visibility and follows with architectural choices.

## Cost-Per-Inference as a Primary Metric

Track cost-per-inference alongside latency and error rate as a first-class operational metric. Break it down by component: embedding generation, vector retrieval, LLM input tokens, LLM output tokens, and any reranking steps. Publish this metric to dashboards and set alerts when it drifts above target thresholds. If you don't measure it, you can't manage it.

## Right-Size Model Selection

Match model capability to task requirements. Routing every query through GPT-4.1 or Claude Opus when a smaller model handles 80% of requests just fine is the most common source of unnecessary spend. Evaluate smaller models (GPT-4.1 nano, Claude Haiku, Llama variants) against your actual workload. Many classification, extraction, and simple Q&A tasks perform equally well on lighter models at a fraction of the cost.

## Tiered Inference Strategies

Build a routing layer that classifies incoming requests by complexity and sends them to the appropriate model tier. Simple factual lookups go to a small, fast model. Complex reasoning or multi-step tasks route to a larger model. This can cut inference costs by 40-60% without meaningful quality loss. Use a lightweight classifier or heuristic rules based on query length, topic, and required output format.

## Monitor Unit Economics Continuously

Calculate the fully loaded cost per user action, per conversation, and per feature. Include not just inference costs but also embedding generation, storage, retrieval, and compute overhead. Review unit economics weekly and set budget alerts at the project level. Costs that look fine at 100 requests per minute can become unsustainable at 10,000.

## Reserved and Batch Capacity

For predictable workloads like nightly batch processing, document re-embedding, or scheduled evaluation runs, use reserved capacity or batch APIs. Batch inference pricing is typically 50% cheaper than real-time pricing. Queue non-urgent work and process it during off-peak windows. For sustained real-time traffic, committed use contracts with model providers or reserved instances for self-hosted models reduce per-unit costs significantly.

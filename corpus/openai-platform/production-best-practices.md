---
title: "Production Best Practices"
category: "openai-platform"
tags: ["production", "reliability", "monitoring", "retry-logic", "best-practices"]
source_url: "https://platform.openai.com/docs/guides/production-best-practices"
last_updated: "2026-02-24"
---

# Production Best Practices

This document covers the operational practices that keep OpenAI API integrations stable, cost-effective, and debuggable in production.

## Retry with Exponential Backoff and Jitter

Every production integration must handle transient failures gracefully. The three error codes that warrant automatic retries are:

- **429 (Rate Limited):** You have exceeded your tier limits. Back off and retry.
- **500 (Internal Server Error):** Something went wrong on OpenAI's side. Retry.
- **503 (Service Unavailable):** The service is temporarily down. Retry.

Use exponential backoff: start with a short delay (1 second), double it on each attempt, and cap at a maximum (e.g., 60 seconds). Add random jitter to each delay to prevent multiple clients from retrying in lockstep, which makes the congestion worse.

```
delay = min(base * 2^attempt, max_delay) + random(0, jitter_range)
```

Set a maximum retry count (3-5 attempts is typical). If the request still fails after all retries, log it and surface the failure to your monitoring system rather than retrying indefinitely.

Do not retry 400 errors. These indicate a problem with your request, and resending the same request will produce the same error.

## Set Explicit Timeouts Per Pipeline Stage

A typical LLM-powered pipeline has multiple stages: preprocessing, embedding, retrieval, generation, post-processing. Each stage should have its own timeout.

Without per-stage timeouts, a single slow API call can block your entire pipeline and cascade into queue buildup, memory pressure, and user-visible latency. Set timeouts that reflect the expected duration of each stage with reasonable headroom.

For example, an embedding call might have a 10-second timeout, while a generation call with a long output might allow 60 seconds. If any stage times out, fail fast, log the incident, and either retry that stage or return a degraded response to the user.

## Pin Model Versions in Production

Always use dated model snapshots (e.g., `gpt-4.1-2025-04-14`) in production rather than model aliases (e.g., `gpt-4.1`). Aliases resolve to the latest version and can change without notice, which means your system's behavior can change without any code deployment on your side.

Pinning to a snapshot gives you control over when you adopt new model versions. Test new snapshots in staging, run your evaluation suite, and only promote to production after validation. Keep the previous snapshot configured as a rollback option.

## Monitor Token Consumption Trends for Drift Detection

Token consumption should be relatively stable for a given workload. If your average tokens per request starts creeping up without a corresponding code change, something is drifting.

Common causes of token drift:

- **Prompt drift:** System prompts or few-shot examples grow over time as team members add context. A prompt that started at 500 tokens can quietly reach 2,000.
- **Context accumulation:** Multi-turn conversations or agent loops that carry forward growing context without summarization or truncation.
- **Data drift:** Changes in input data characteristics (longer documents, more complex queries) that increase token counts.

Track average input tokens, output tokens, and total tokens per request over time. Set alerts for sustained increases (e.g., 20% above the trailing 7-day average). When drift is detected, audit your prompt templates, context management, and input preprocessing.

## Additional Practices

**Log everything.** Log request IDs, model versions, token counts, latencies, and error codes for every API call. When something goes wrong, these logs are your primary debugging tool.

**Use project-based API keys.** Separate keys per team, application, or environment. This gives you clean cost attribution and limits the blast radius if a key is compromised.

**Test with your production prompt suite.** When evaluating a new model version or configuration change, run your actual production prompts through it, not just synthetic benchmarks. Real data exposes edge cases that synthetic tests miss.

**Set cost alerts.** Configure threshold alerts in the Usage Dashboard so that runaway costs get caught early, not at the end of the billing cycle.

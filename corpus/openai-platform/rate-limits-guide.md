---
title: "Rate Limits Guide"
category: "openai-platform"
tags: ["rate-limits", "429-errors", "tiers", "throttling", "production"]
source_url: "https://platform.openai.com/docs/guides/rate-limits"
last_updated: "2026-02-24"
---

# Rate Limits Guide

OpenAI enforces rate limits per organization and per model. Understanding your tier limits and handling 429 errors correctly is essential for stable production systems.

## Tier Table

Rate limits scale with your usage tier. Here is the full breakdown:

| Tier   | Requests Per Minute (RPM) | Tokens Per Minute (TPM) |
|--------|---------------------------|--------------------------|
| Tier 1 | 500 RPM                   | 200,000 TPM              |
| Tier 2 | 1,000 RPM                | 2,000,000 TPM            |
| Tier 3 | 3,000 RPM                | 4,000,000 TPM            |
| Tier 4 | 5,000 RPM                | 8,000,000 TPM            |
| Tier 5 | 10,000 RPM               | 10,000,000+ TPM          |

Limits vary by model within each tier. The numbers above represent typical maximums. Embedding models and older models may have different per-model limits even within the same tier.

## Handling 429 Errors

The 429 (Too Many Requests) status code is the most common production error when working with the OpenAI API. It means you have exceeded either your RPM or TPM limit for the current time window.

The correct response is exponential backoff with jitter. Start with a short delay (e.g., 1 second), double it on each retry, and add random jitter to prevent thundering herd problems when multiple clients retry simultaneously. Cap the maximum delay at something reasonable like 60 seconds.

A basic pattern:

```
delay = min(base_delay * 2^attempt + random_jitter, max_delay)
```

Do not retry immediately. Do not retry on a fixed interval. Both of these make the problem worse under load.

## Monitoring and Proactive Upgrades

Check your current utilization in the Usage Dashboard. It shows request counts, token consumption, and error rates broken down by model and time period.

At 70% utilization of your current tier limits, proactively request a tier upgrade. Don't wait until you start hitting 429s in production. Tier upgrades are not instant, so build in lead time.

## Requesting Higher Limits

You can request rate limit increases through the OpenAI dashboard or by contacting your account management team (for enterprise customers). Provide your use case, expected traffic patterns, and current utilization data to support the request.

For spiky workloads, consider smoothing your request rate with a client-side queue rather than relying solely on a higher tier. A token bucket or leaky bucket rate limiter in your application layer gives you more control than depending on the API to absorb bursts.

## Per-Model Limits

Different models within the same tier can have different limits. For example, embedding models typically have higher TPM limits than chat models because embedding requests are computationally cheaper. Always check the specific limits for each model you use, not just the tier-level defaults.

## Best Practices

- Implement exponential backoff with jitter on all API calls
- Monitor utilization and request upgrades at 70% capacity
- Use client-side rate limiting for predictable traffic shaping
- Separate high-priority and batch traffic into different API keys if possible
- Log 429 occurrences and track them as a key production metric

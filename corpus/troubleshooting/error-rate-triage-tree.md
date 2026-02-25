---
title: "Error Rate Triage Decision Tree"
category: "troubleshooting"
tags: ["errors", "429", "500", "rate-limits", "circuit-breaker", "moderation"]
source_url: "https://developers.openai.com/api/docs/guides/error-codes"
last_updated: "2026-02-24"
---

# Error Rate Triage Decision Tree

Errors in a RAG pipeline come from multiple sources. This triage tree categorizes by HTTP status code and guides you to the right fix.

## 429: Rate Limit Exhaustion

The most common error in scaling deployments. The API is rejecting requests because you've exceeded your tier's TPM (tokens per minute) or RPM (requests per minute) limit.

**Diagnosis:**
- Check your current tier and its limits in the OpenAI dashboard.
- Pull 429 frequency from your logs. Calculate what percentage of requests are being rejected.
- Identify whether you're hitting TPM or RPM limits (the error response specifies which).

**Fixes:**
- Implement exponential backoff with jitter. Start at 1s, double each retry, add random jitter of 0-500ms. Cap at 60s.
- Request a tier upgrade. Provide OpenAI with your current usage and projected needs. Upgrades typically take 1-3 business days.
- Reduce token consumption via semantic caching, prompt optimization, and model routing to smaller models.
- Spread traffic more evenly. Bursty patterns hit RPM limits even when average usage is within bounds.

## 500 and 503: Platform Issues

Server errors on OpenAI's side. These are typically transient.

**Diagnosis:**
- Check status.openai.com for active incidents.
- If status is green but you're seeing 500/503 errors, check whether they're isolated to a specific model or endpoint.

**Fixes:**
- Implement a circuit breaker. After 3 consecutive failures within 30 seconds, open the circuit and stop sending requests for 60 seconds. This prevents cascading failures and gives the platform time to recover.
- For non-urgent requests, queue and retry. For user-facing requests, return a degraded response (cached result or fallback message) rather than an error.

## 400: Bad Request

The request is malformed. Two common causes:

**Token overflow:** The combined input exceeds the model's context window. This happens when retrieval returns too many chunks or conversation history grows unchecked. Validate total token count before sending. Truncate if needed.

**Schema mismatch:** When using structured outputs or function calling, the request schema doesn't match what the model expects. Validate your schema against the API spec. Check for breaking changes after model updates.

**Fix:** Add pre-send validation that checks token count and schema conformance. Reject or fix invalid requests before they hit the API.

## 504: Gateway Timeout

The request took too long and your infrastructure (load balancer, API gateway, or reverse proxy) timed out before the model responded.

**Diagnosis:**
- Profile each pipeline stage to find the bottleneck.
- Check if the model is generating an unusually long response (high output token count).
- Verify your gateway timeout is set appropriately (recommend 30-60s for LLM calls).

**Fix:** Increase gateway timeouts for LLM endpoints. Set `max_tokens` to cap generation length. Optimize the pipeline to reduce total processing time.

## Moderation Endpoint False Positives

The OpenAI moderation endpoint flags legitimate content as policy-violating. This blocks queries or responses that should be allowed.

**Diagnosis:**
- Log the moderation response categories and scores for flagged content.
- Identify whether specific categories (violence, self-harm, etc.) are triggering on domain-specific terminology.

**Fix:** Use the moderation endpoint (`/v1/moderations`) as a pre-check with tuned thresholds rather than a hard block. Set per-category thresholds based on your domain. Medical content might need a higher threshold for "self-harm" categories, for example.

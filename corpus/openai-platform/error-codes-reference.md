---
title: "Error Codes Reference"
category: "openai-platform"
tags: ["errors", "429", "500", "debugging", "troubleshooting"]
source_url: "https://developers.openai.com/api/docs/guides/error-codes"
last_updated: "2026-02-24"
---

# Error Codes Reference

This document covers the most common error codes returned by the OpenAI API, what causes them, and how to handle each one in production systems.

## 429: Rate Limited

**Cause:** You have exceeded your requests per minute (RPM) or tokens per minute (TPM) limit for the current tier and model.

**Handling:** Implement exponential backoff with jitter. Start with a 1-second delay, double on each retry, and add random jitter to avoid synchronized retry storms across multiple clients.

```
delay = min(base_delay * 2^attempt + random(0, base_delay), max_delay)
```

**Diagnosis:** Check the Usage Dashboard to see your current consumption relative to your tier limits. The response headers include `x-ratelimit-remaining-requests` and `x-ratelimit-remaining-tokens` which tell you exactly where you stand.

429 is the most common production error. Every production integration should have backoff logic for this code from day one.

## 500 and 503: Platform Instability

**Cause:** Internal server error (500) or service temporarily unavailable (503). These indicate problems on OpenAI's side, not with your request.

**Handling:** Retry with exponential backoff. These errors are typically transient and resolve within seconds to minutes. Do not change your request; just resend it after a delay.

**Diagnosis:** Check status.openai.com for ongoing incidents. If you see sustained 500/503 errors and the status page shows no issues, contact support.

## 400: Bad Request

**Cause:** Your request is malformed or exceeds model constraints. Common triggers include:

- Invalid JSON in the request body
- Context window overflow (total tokens exceed the model's maximum)
- Invalid parameter values or combinations
- Schema validation failures

**Handling:** Do not retry 400 errors with the same request. The request itself is the problem. Validate your token count before sending. Use a tokenizer library to count tokens client-side and truncate or chunk inputs that approach the context limit.

**Diagnosis:** The error response body includes a `message` field that usually describes what went wrong. Read it carefully before debugging further.

## 504: Gateway Timeout

**Cause:** The request took too long to complete. This can happen with very large inputs, complex reasoning tasks, or during periods of high platform load.

**Handling:** Profile your pipeline stages to identify which step is slow. Set per-stage timeouts so a single slow call does not block your entire pipeline indefinitely. For long-running requests, consider breaking the task into smaller subtasks.

**Diagnosis:** If timeouts are frequent, check whether your prompts are excessively long or whether you are requesting very long outputs. Reducing max_tokens or simplifying the prompt can help.

## Content Moderation Triggers

**Cause:** The input or requested output triggered OpenAI's content filter. This can include false positives where legitimate content is flagged.

**Handling:** Use the moderation endpoint to pre-screen inputs before sending them to the completions API. This lets you catch and handle flagged content before it causes a request failure.

For false positives, review the moderation response categories to understand which filter was triggered. You can adjust your input phrasing or, for enterprise customers, work with OpenAI to tune filter sensitivity for your use case.

## General Error Handling Strategy

Build your error handling around these principles:

- Retry on 429, 500, 503 with exponential backoff and jitter
- Do not retry on 400; fix the request
- Set explicit timeouts to handle 504 scenarios
- Pre-screen with the moderation endpoint to reduce content filter failures
- Log all errors with full request context for post-incident debugging

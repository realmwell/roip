---
title: "Prompt Caching Guide"
category: "openai-platform"
tags: ["caching", "latency", "cost-optimization", "tokens"]
source_url: "https://platform.openai.com/docs/guides/prompt-caching"
last_updated: "2026-02-24"
---

# Prompt Caching Guide

Prompt caching on the OpenAI platform reduces both cost and latency for repeated prompt prefixes. It is automatic for all API customers and requires no code changes.

## How It Works

When you send a request, OpenAI checks whether the beginning of your prompt matches a previously cached prefix. If it does, the cached portion is reused instead of being reprocessed from scratch. This happens transparently on every API call.

Cached input tokens receive a 50% discount compared to standard input token pricing. On top of the cost savings, cached prefixes can deliver up to 80% latency reduction since the model skips recomputation of the cached segment.

## Minimum Token Threshold

Caching activates only when the shared prefix reaches at least 1,024 tokens. Prompts shorter than this threshold will not trigger caching. In practice, most production prompts that include system instructions, few-shot examples, or reference documents easily clear this bar.

## Prompt Structure Strategy

To get the most out of caching, put static content at the beginning of your prompt. This means system instructions, persona definitions, few-shot examples, and any reference material that stays the same across requests should come first. Variable content like the user's actual query or dynamic context should go at the end.

This ordering maximizes the length of the cacheable prefix. If your static block is 3,000 tokens and your dynamic query is 200 tokens, the 3,000-token prefix gets cached and reused across every request. Only the 200-token variable portion gets processed fresh each time.

## Practical Impact on RAG Pipelines

Prompt caching is especially useful in retrieval-augmented generation setups. A typical RAG prompt includes a long system instruction block, retrieval formatting rules, and sometimes fixed few-shot examples. These can total thousands of tokens that repeat identically across requests.

By keeping this static block at the top, you cache it once and reuse it on every query. The per-request cost drops significantly since you only pay full price for the retrieved chunks and the user query.

## Monitoring Cache Hits

The API response includes `cached_tokens` in the usage object, which tells you how many input tokens were served from cache. Track this metric to verify that your prompt ordering is actually producing cache hits.

If you see low cache hit rates, check whether your prompt structure is consistent across requests. Minor variations in the prefix (even whitespace changes) can break the cache match.

## Summary

- Automatic for all customers, no setup required
- 50% discount on cached input tokens
- Up to 80% latency reduction
- Minimum 1,024 tokens to activate
- Static content first, dynamic content last

---
title: "Cost Spike Investigation Playbook"
category: "troubleshooting"
tags: ["cost", "investigation", "tokens", "debugging", "billing"]
source_url: "https://platform.openai.com/docs/guides/rate-limits"
last_updated: "2026-02-24"
---

# Cost Spike Investigation Playbook

When your OpenAI bill jumps unexpectedly, resist the urge to cut features or throttle traffic immediately. Most cost spikes have a specific, fixable root cause. Work through these checks in order.

## Check 1: Token Consumption Trends

Pull daily token consumption broken down by input tokens vs. output tokens. This is the single most revealing metric.

**Input tokens rising:** Something is sending more context to the model. Common culprits:
- System prompt grew. Developers added instructions, examples, or guardrails without removing old ones. Diff the current system prompt against the version from two weeks ago.
- Retrieval depth increased. Someone changed top-k from 5 to 10, or a code change removed the chunk limit. Each additional chunk adds 300-500 tokens.
- Conversation history isn't being truncated. Multi-turn conversations accumulate history without a cap. A 20-turn conversation can easily hit 5,000+ tokens of history alone.

**Output tokens rising:** The model is generating longer responses. Check whether `max_tokens` was removed or increased. Check if a prompt change encouraged more verbose answers ("explain in detail" vs. "answer briefly").

## Check 2: Model Mix Changes

If you're using query routing, check the tier distribution. A routing bug that sends 50% of traffic to the frontier model instead of 10% blows up costs fast. Pull the model field from your request logs and compute the daily distribution. Compare against your target split (70/25/5 nano/mini/full).

Even without routing, check whether someone changed the default model in a config file. A swap from GPT-4.1-mini to GPT-4.1 multiplies costs significantly.

## Check 3: System Prompt Growth

System prompts tend to grow monotonically. Every developer adds instructions; nobody removes them. Measure your system prompt in tokens monthly. If it's grown from 1,500 to 3,000 tokens, that's a 1,500-token increase on every single request.

At 100,000 queries/day, 1,500 extra input tokens per query adds up to 150M additional tokens daily. At GPT-4.1 input pricing ($2.00/1M tokens), that's $300/day in unnecessary cost.

## Check 4: Cache Miss Rate

If you have semantic caching, check the hit rate. A drop from 35% to 10% means 25% more requests are hitting the full pipeline. Common causes: cache was flushed (intentionally or by accident), TTL was reduced, or the query distribution shifted away from cached patterns.

## Check 5: Retrieval Depth (Top-K Creep)

Check the number of chunks being passed to the LLM per query. "Top-k creep" happens when someone increases retrieval depth to improve answer quality without considering the cost impact. Going from top-5 to top-10 doubles the retrieval context tokens.

Verify that the top-k value matches what's documented. Check both the retrieval configuration and any code that assembles the prompt, because a mismatch can mean chunks are being added twice.

## Response Protocol

Once you identify the cause, fix the immediate issue and then set up monitoring to catch it earlier next time. Useful alerts:

- Daily cost exceeds 1.5x the 7-day moving average.
- Average input tokens per request exceeds the budgeted amount.
- Cache hit rate drops below the baseline by more than 10 percentage points.
- Model distribution deviates from target by more than 5 percentage points.

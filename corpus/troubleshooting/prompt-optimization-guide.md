---
title: "Prompt Optimization Guide for Cost and Performance"
category: "troubleshooting"
tags: ["prompts", "optimization", "prompt-caching", "structured-outputs", "token-reduction"]
source_url: "https://developers.openai.com/api/docs/guides/prompt-caching"
last_updated: "2026-02-24"
---

# Prompt Optimization Guide

Prompt optimization is the highest-leverage cost reduction technique in a RAG pipeline. Every token you remove from the prompt is removed from every single request. Small reductions compound into significant savings at scale.

## Move Static Content to the Beginning

OpenAI's prompt caching automatically caches the longest prefix of your prompt that matches previous requests. Cached input tokens receive a 50% discount and process faster. To maximize cache hits, structure your prompt so all static content comes first:

1. System instructions (persona, rules, output format)
2. Static few-shot examples (if any)
3. Retrieved context chunks (semi-variable)
4. Conversation history (variable)
5. User query (variable)

The cache matches from the beginning of the prompt. If static content is at position 1-2, every request with the same system instructions gets a cache hit on that portion, regardless of the variable content that follows.

For a system prompt of 2,500 tokens, prompt caching saves $1.25 per million requests at GPT-4.1 input pricing. At 100,000 requests/day, that's ~$125/day in savings from caching alone.

## Reduce System Prompt Verbosity

System prompts accumulate instructions over time. Audit yours quarterly. Common bloat patterns:

- **Redundant instructions**: "Always be helpful" and "Provide helpful responses" say the same thing. Pick one.
- **Over-specified formatting**: Three paragraphs explaining output format when a structured output schema would enforce it automatically.
- **Defensive instructions**: "Do not hallucinate. Do not make things up. Only use provided context." These three sentences all say the same thing. One clear instruction works.
- **Unused examples**: Few-shot examples added during development that are no longer needed now that the model handles the task well.

Measure your system prompt in tokens before and after cleanup. A typical cleanup removes 20-40% of tokens without changing behavior.

## Use Structured Outputs to Constrain Response Length

Free-form text generation is unpredictable in length. A question that needs a one-sentence answer might get three paragraphs. Structured outputs solve this by defining a response schema:

```json
{
  "answer": "string (max 200 words)",
  "sources": ["array of source references"],
  "confidence": "high | medium | low"
}
```

The model follows the schema, which naturally constrains output length. This reduces output tokens (which are more expensive than input tokens on most models) and makes responses more consistent.

## Remove Redundant Instructions

GPT-4.1 follows instructions more precisely than earlier models. Instructions that were necessary workarounds for GPT-4o may be redundant now. Test removing them one at a time and evaluate quality. Common candidates:

- Repeated instructions (saying the same thing in different words for emphasis).
- Chain-of-thought prompting that the model no longer needs for the task.
- Explicit "step by step" instructions for tasks the model handles directly.

## Benchmark Token Count Before and After

Never optimize prompts without measuring. Count tokens before the change and after. Run your eval harness on both versions. The goal is fewer tokens with equal or better quality.

Track these metrics for every prompt change:

- Input tokens (system prompt portion).
- Input tokens (total, including context and history).
- Output tokens (average per response).
- Quality scores from your evaluation framework.

A prompt change that reduces input tokens by 30% but drops faithfulness by 5% isn't a good trade. Optimize for the best quality-per-token ratio.

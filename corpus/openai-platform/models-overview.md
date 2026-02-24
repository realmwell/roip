---
title: "OpenAI Models Overview and Pricing"
category: "openai-platform"
tags: ["models", "pricing", "context-window", "gpt-4.1", "embeddings"]
source_url: "https://platform.openai.com/docs/models"
last_updated: "2026-02-24"
---

# OpenAI Models Overview and Pricing

This document covers the current OpenAI model lineup, context windows, and per-token pricing as of February 2026.

## GPT-4.1 Family

The GPT-4.1 family launched in April 2025 and represents the primary production model line. All three variants support a 1M token context window.

**GPT-4.1** is the flagship model, priced at $2.00 per 1M input tokens and $8.00 per 1M output tokens. Cached input tokens cost $0.50 per 1M. It is the best choice for complex RAG workflows, multi-step reasoning over large document sets, and tasks requiring long-context fidelity.

**GPT-4.1-mini** costs $0.40 per 1M input tokens and $1.60 per 1M output tokens, with cached inputs at $0.10 per 1M. This makes it 93% cheaper than GPT-4o while maintaining strong performance across most tasks. It suits high-volume production workloads where cost matters more than peak capability.

**GPT-4.1-nano** is the lightest variant at $0.10 per 1M input tokens and $0.40 per 1M output tokens, with cached inputs at $0.025 per 1M. It is purpose-built for classification, routing, and other low-latency tasks where speed and cost outweigh reasoning depth.

## GPT-4o Family (Sunsetting)

**GPT-4o** supports 128K context at $2.50/$10.00 per 1M input/output tokens, with cached inputs at $1.25. GPT-4o is sunsetting in February 2026. Migrate to GPT-4.1.

**GPT-4o-mini** supports 128K context at $0.15/$0.60 per 1M input/output tokens, with cached inputs at $0.075.

## Reasoning Models

**o3** supports a 200K context window at $2.00 per 1M input tokens and $8.00 per 1M output tokens. It handles open-ended reasoning, planning, and multi-step problem solving.

**o3-mini** is a smaller reasoning model with the same 200K context window, priced at $1.10/$4.40 per 1M input/output tokens.

**o4-mini** also uses a 200K context window at $1.10/$4.40 per 1M input/output tokens.

## Embedding Models

**text-embedding-3-small** produces 1536-dimensional vectors by default and supports Matryoshka Representation Learning (MRL) to reduce dimensions to 512 or 256. Priced at $0.02 per 1M tokens with a max input of 8,191 tokens per call.

**text-embedding-3-large** produces 3072-dimensional vectors with MRL support. Priced at $0.13 per 1M tokens with the same 8,191 token max input.

## Choosing a Model

For new projects, start with GPT-4.1-mini. Move up to GPT-4.1 if you need stronger reasoning or longer-context fidelity. Use GPT-4.1-nano for high-throughput classification or routing layers. If you are still on GPT-4o, plan your migration to GPT-4.1 before the February 2026 sunset.

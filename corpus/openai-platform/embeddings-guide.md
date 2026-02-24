---
title: "Embeddings Guide"
category: "openai-platform"
tags: ["embeddings", "vectors", "mrl", "text-embedding-3", "retrieval"]
source_url: "https://platform.openai.com/docs/guides/embeddings"
last_updated: "2026-02-24"
---

# Embeddings Guide

OpenAI provides two embedding models in the text-embedding-3 family. Both support Matryoshka Representation Learning (MRL) for flexible dimensionality reduction.

## Model Specifications

**text-embedding-3-small** produces 1536-dimensional vectors by default. It costs $0.02 per 1M tokens. Maximum input is 8,191 tokens per embedding call.

With MRL, you can reduce the output to 512 or 256 dimensions at request time by setting the `dimensions` parameter. This is done at the API level, so you don't need to truncate vectors yourself.

**text-embedding-3-large** produces 3072-dimensional vectors by default. It costs $0.13 per 1M tokens. Maximum input is 8,191 tokens per embedding call. MRL is also supported, allowing you to request smaller dimensions.

## Matryoshka Representation Learning (MRL)

MRL is a training technique that makes the leading dimensions of a vector carry the most information. This means you can truncate the vector to a shorter length and still retain most of the retrieval quality.

Reducing from 1536 to 512 dimensions cuts storage by 66% with minimal quality loss. For many workloads, especially those with large corpora, this tradeoff is worth it. The smaller vectors also mean faster similarity searches since distance calculations run on shorter arrays.

Going down to 256 dimensions saves even more storage but comes with a steeper quality tradeoff. Test on your specific dataset before committing to aggressive dimensionality reduction.

## Choosing Between Small and Large

For most production use cases, text-embedding-3-small at 512 dimensions offers a strong balance of cost, storage, and quality. It handles standard document retrieval, FAQ matching, and semantic search well.

Use text-embedding-3-large when you need the highest possible retrieval accuracy and your corpus contains subtle semantic distinctions that smaller models miss. The 6.5x price difference means this only makes sense when quality is the top priority.

## Input Handling

Both models accept up to 8,191 tokens per call. If your text exceeds this limit, you need to chunk it before embedding. Common chunking strategies include fixed-size token windows with overlap, sentence-boundary chunking, or semantic paragraph splitting.

For retrieval workloads, chunk sizes between 256 and 512 tokens tend to work well. Shorter chunks give more precise retrieval hits but require more storage and more search-time comparisons.

## Batching

The API accepts an array of inputs in a single call, which is more efficient than sending one text at a time. Batch your embedding requests to reduce HTTP overhead and improve throughput. The maximum batch size depends on the total token count across all inputs in the request.

## Storage Considerations

At 512 dimensions with float32 values, each vector takes 2,048 bytes. For a million-document corpus, that is roughly 2 GB of raw vector storage. Using quantization (int8 or binary) at the vector database level can reduce this further, though that is outside the OpenAI API and depends on your database choice.

## Practical Recommendations

- Start with text-embedding-3-small at 512 dimensions
- Benchmark retrieval quality on your actual data before reducing to 256
- Use text-embedding-3-large only when retrieval accuracy justifies the cost
- Chunk inputs to stay under the 8,191 token limit
- Batch requests for throughput

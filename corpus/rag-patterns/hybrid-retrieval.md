---
title: "Hybrid Retrieval: Combining Dense and Sparse Search"
category: "rag-patterns"
tags: ["retrieval", "bm25", "vector-search", "reciprocal-rank-fusion", "recall"]
source_url: "https://developers.openai.com/api/docs/guides/embeddings"
last_updated: "2026-02-24"
---

# Hybrid Retrieval

Vector search alone misses queries that depend on exact terms. Hybrid retrieval combines dense vector search with sparse keyword search (BM25) to cover both semantic meaning and specific terminology.

## Why Vector-Only Falls Short

Dense embeddings capture semantic similarity well. "How do I return an item?" and "What's your refund process?" land close together in embedding space. But embeddings struggle with specifics. A query for SKU "WH-1000XM5" or policy number "RET-2024-003" won't reliably match the right chunk because the embedding treats these as opaque tokens rather than meaningful identifiers.

BM25 (or other TF-IDF-based methods) excels at exact and partial term matching. It finds the chunk containing "WH-1000XM5" reliably because it matches the literal string.

## How Hybrid Retrieval Works

Run both search methods in parallel against the same corpus:

1. **Dense search**: Embed the query, run approximate nearest neighbor search against the vector index. Return top-k results with similarity scores.
2. **Sparse search**: Run BM25 against a keyword index built from the same chunks. Return top-k results with relevance scores.
3. **Merge**: Combine the two result sets using Reciprocal Rank Fusion (RRF).

## Reciprocal Rank Fusion

RRF merges ranked lists without requiring score normalization. For each document, sum the reciprocal of its rank in each list:

```
RRF_score(d) = sum(1 / (k + rank_i(d))) for each ranker i
```

The constant `k` (typically 60) prevents high-ranked documents from dominating. Documents that appear in both lists get boosted; documents in only one list still contribute.

## Performance Gains

Hybrid retrieval delivers 10-25% recall improvement over vector-only search across diverse query types. The gains are largest for queries involving:

- **Product names and SKUs**: "Nike Air Max 90 size 11"
- **Policy numbers and codes**: "Refer to section 4.2.1"
- **Proper nouns**: "Ask Sarah in the Portland warehouse"
- **Technical identifiers**: Error codes, part numbers, ticket IDs

For purely semantic queries ("how do I handle an angry customer"), the improvement is smaller (5-10%) because vector search already handles these well.

## Implementation Notes

Most vector databases (Pinecone, Weaviate, Qdrant) support hybrid search natively or via plugins. If your vector DB doesn't, run BM25 separately using Elasticsearch or a lightweight library like rank_bm25, then merge client-side.

Index both the chunk text and metadata fields for BM25. This lets keyword search match on document titles, section headings, and tags in addition to body text.

Set the retrieval depth (top-k) independently for each method. A common starting point is k=10 for vector search and k=10 for BM25, merged to a final top-5 or top-10 for the LLM context window.

---
title: "Chunking Strategies for RAG Knowledge Bases"
category: "rag-patterns"
tags: ["chunking", "preprocessing", "embeddings", "retrieval-quality", "document-processing"]
source_url: "https://developers.openai.com/api/docs/guides/embeddings"
last_updated: "2026-02-24"
---

# Chunking Strategies

How you split documents into chunks directly affects retrieval quality. Bad chunking is the most common root cause of poor RAG answers.

## Fixed-Size Chunking and Its Limits

The simplest approach splits text into chunks of a fixed token count, typically 500 tokens. This works acceptably for homogeneous corpora (all similar document types) but degrades as the corpus diversifies. A 500-token split can land in the middle of a table, cut a procedure in half, or merge the end of one section with the start of an unrelated one. The embedding for that chunk becomes a noisy average of two topics, and retrieval suffers.

## Semantic and Document-Aware Chunking

Better approaches respect the structure of the source document:

- **Section-boundary chunking**: Split at headings (H1, H2, H3). Each chunk maps to a logical section of the document. This preserves topical coherence within each chunk.
- **Paragraph-level chunking**: Use paragraph breaks as split points. Good for narrative documents without clear heading structure.
- **Recursive chunking**: Try splitting at section boundaries first. If a section exceeds the token limit, split at paragraph boundaries. If a paragraph is still too long, fall back to sentence-level splits.

## Optimal Chunk Size

Target 300-500 tokens per chunk. Below 300, chunks lose context and retrieval returns fragments that are hard to use. Above 500, chunks contain multiple topics and embedding quality drops. The sweet spot depends on your content. Dense technical documentation benefits from smaller chunks (300-350). Conversational or narrative content works better at 400-500.

## Metadata Enrichment

Attach metadata to every chunk at indexing time:

- **Source**: Document title, URL, or file path.
- **Section**: The heading hierarchy (e.g., "Returns Policy > International Orders").
- **Date**: When the source document was last updated.
- **Document type**: Policy, FAQ, product spec, training material.

This metadata enables filtered retrieval. A query about return policies can filter to only policy documents before running vector search, improving precision.

## Overlap Between Chunks

Add 50-100 tokens of overlap between adjacent chunks. This ensures that information at chunk boundaries isn't lost. Without overlap, a sentence that spans a split point gets cut, and neither chunk contains the complete thought.

The overlap tokens add ~15-25% to storage and embedding costs but meaningfully improve retrieval quality at boundaries. Start with 50 tokens of overlap and increase if you see answers missing information that sits at chunk edges.

## Re-Chunking Triggers

Plan to re-chunk when the corpus composition changes significantly. Adding a new document type (e.g., going from just FAQs to FAQs plus technical manuals) often requires revisiting chunk size and splitting strategy.

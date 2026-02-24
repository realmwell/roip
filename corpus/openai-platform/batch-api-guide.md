---
title: "Batch API Guide"
category: "openai-platform"
tags: ["batch-api", "cost-optimization", "bulk-processing", "async"]
source_url: "https://platform.openai.com/docs/guides/batch"
last_updated: "2026-02-24"
---

# Batch API Guide

The Batch API lets you submit large sets of API requests as a single batch job and receive results asynchronously. It provides a 50% cost discount on all models compared to standard synchronous API pricing.

## Pricing and SLA

All models receive a flat 50% discount when called through the Batch API. The tradeoff is a 24-hour completion window. OpenAI guarantees your batch will finish within 24 hours of submission, though most batches complete faster depending on size and current platform load.

This is not suitable for real-time queries, user-facing latency-sensitive requests, or anything that needs a response in seconds. It is designed for workloads where you can afford to wait hours for results.

## When to Use the Batch API

**Re-indexing.** If you maintain an embedding index and need to re-embed a corpus after changing your chunking strategy or upgrading to a new embedding model, the Batch API cuts that cost in half.

**Bulk processing.** Summarizing thousands of documents, extracting structured data from a backlog of records, or classifying a large dataset all fit naturally into batch workflows.

**Analytics and reporting.** Periodic jobs that process accumulated data (weekly summaries, monthly trend analysis, cohort-level extraction) benefit from the cost savings without any latency penalty since the output is not time-sensitive.

**Evaluation runs.** Running your test suite across a new model version or prompt variation typically involves hundreds or thousands of requests. Batch processing halves the cost of each eval cycle, which matters when you run evals frequently.

## How It Works

You upload a JSONL file where each line is a standard API request object. The Batch API validates the file, queues the job, and begins processing. You poll for status or set up a webhook to get notified on completion. Results come back as a downloadable JSONL file with one response per line, matched to the original request IDs.

Each request in the batch is independent. If one request fails (e.g., hits a content filter or has malformed input), the others still process normally. The results file includes both successes and failures with appropriate error details.

## Limits

Batch jobs have a maximum file size and request count that depend on your account tier. Check the API documentation for current limits. If your workload exceeds a single batch, split it into multiple batches and run them in parallel.

## Integration Pattern

A typical integration looks like this:

1. Accumulate requests during the day or on a schedule
2. Write them to a JSONL file
3. Upload and submit the batch
4. Poll or wait for the webhook callback
5. Download and process results
6. Handle any per-request errors

Keep your batch submission and result processing as separate pipeline stages so failures in one don't block the other.

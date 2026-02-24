---
title: "ML Lifecycle Overview for RAG and LLM Systems"
category: "aws-ml-lens"
tags: ["ml-lifecycle", "rag", "llm", "data-preparation", "continuous-improvement"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/well-architected-machine-learning.html"
last_updated: "2026-02-24"
---

# ML Lifecycle Overview for RAG and LLM Systems

The traditional ML lifecycle (collect data, train model, deploy, monitor) applies to RAG and LLM systems, but the emphasis shifts. You're not training foundation models from scratch. Instead, the lifecycle centers on corpus curation, retrieval pipeline tuning, prompt engineering, and evaluation. Each phase feeds the next in a loop that should tighten over time.

## Data Preparation: Corpus Curation, Chunking, and Embedding

The quality of a RAG system is bounded by the quality of its corpus. Start with source selection: which documents, knowledge bases, and data feeds belong in the system and which don't. Deduplicate, clean, and normalize content before it enters the pipeline.

Chunking strategy directly impacts retrieval quality. Chunks that are too large dilute relevance; chunks that are too small lose context. Experiment with chunk sizes (typically 256-1024 tokens), overlap ratios, and boundary strategies (split on paragraphs, sections, or semantic shifts). There's no universal best setting. It depends on your content and your queries.

Generate embeddings using a model appropriate to your domain. General-purpose embedding models work for broad use cases, but domain-specific fine-tuned models often outperform them on specialized content. Store embeddings in a vector database with metadata that supports filtering and hybrid search.

## Model Selection and Evaluation

Choose models based on measured performance against your specific tasks, not on benchmarks published by the provider. Build an evaluation suite that covers your actual query distribution: factual recall, reasoning, summarization, edge cases, and adversarial inputs. Compare models on quality, latency, and cost together because the cheapest model that meets your quality bar is usually the right one.

## Deployment and Monitoring

Deploy inference endpoints with the same rigor as any production service: health checks, auto-scaling, canary deployments, and rollback capabilities. Monitor both infrastructure metrics (latency, errors, throughput) and quality metrics (retrieval relevance, answer correctness, hallucination rate). Quality monitoring requires automated evaluation pipelines that sample production traffic and score responses continuously.

## Continuous Improvement Loop

The lifecycle doesn't end at deployment. Run evaluations regularly, identify failure patterns, and feed findings back into the system. The improvement loop is: evaluate production quality, identify weak spots, optimize (adjust chunking, update prompts, swap models, expand the corpus), deploy changes, and evaluate again. Each iteration should produce measurable improvement on the metrics that matter to your users. Track what you changed and what effect it had so you can distinguish real gains from noise.

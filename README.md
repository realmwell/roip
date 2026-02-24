# ROIP — RAG Operations Intelligence Platform

A working demo of enterprise RAG operations tooling, built as a supplement to the OpenAI AI Success Engineer take-home assignment.

Instead of submitting only a document, ROIP ships a **deployed application** that demonstrates the exact skills the role requires: diagnosing production RAG issues, recommending OpenAI API optimizations, advising on tradeoffs with concrete numbers, and planning phased enterprise rollouts.

## What It Does

**1. RAG Troubleshooting Chatbot** — An OpenAI-powered assistant that diagnoses latency, error rate, and cost issues in enterprise RAG deployments. Uses query routing (GPT-4.1-nano → mini → full), semantic caching, and structured diagnosis outputs.

**2. Knowledge Corpus** — A curated, searchable collection of 30+ documents covering OpenAI platform docs, AWS ML Well-Architected Lens best practices, RAG architecture patterns, and troubleshooting decision trees.

**3. Evaluation Harness** — Automated quality, cost, and latency benchmarking with A/B comparison of optimization strategies across 55 predefined test queries.

## Architecture

This repo is the **functional demo**. The ideal enterprise deployment uses AWS managed services (OpenSearch Serverless, ElastiCache, CDK). See the companion architecture document for the full enterprise spec.

### Demo Stack (Zero Idle Cost)
- **Frontend + API**: Next.js 14+ on Vercel (free tier)
- **RAG Engine**: OpenAI Responses API (GPT-4.1-mini, GPT-4.1-nano for routing)
- **Embeddings**: text-embedding-3-small at 512 dimensions
- **Vector Store**: Pinecone (free tier — 100K vectors)
- **Cache + State**: Upstash Redis (free tier — serverless)
- **Total cost at rest: $0/month**

### Data Flow
```
User Query → Query Router (GPT-4.1-nano) → Semantic Cache Check (Redis)
  ├── Cache Hit → Stream cached response (<50ms)
  └── Cache Miss → Embed query → Pinecone vector search
       → Build prompt (system + context + history)
       → OpenAI Responses API (streaming)
       → Post-process (cache, store history, record metrics)
```

## Quick Start

```bash
git clone https://github.com/realmwell/roip.git
cd roip
npm install
cp .env.example .env.local   # Fill in your API keys
npm run ingest                # Embed and upload corpus to Pinecone
npm run dev                   # http://localhost:3000
```

## Environment Variables

See `.env.example` for the full list. You need:
- `OPENAI_API_KEY` — OpenAI API key
- `PINECONE_API_KEY` — Pinecone API key
- `PINECONE_INDEX` — `roip-corpus`
- `UPSTASH_REDIS_REST_URL` — Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST token

## Deployment

Push to GitHub → connect to Vercel → deploy. Environment variables set in Vercel dashboard.

## Author

**Max Greenberg** — OpenAI AI Success Engineer candidate

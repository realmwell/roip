# ROIP Project Handoff

## What This Is

ROIP (RAG Operations Intelligence Platform) is a take-home assignment for OpenAI's AI Success Engineer role. Instead of writing a static 2-3 page brief, Max built a working web application that demonstrates the troubleshooting expertise the role requires. The app is live, the corpus is indexed, and the companion documents are generated.

**Deadline:** 48 hours from Feb 24, 2026
**Assignment:** Analyze a retail enterprise's struggling RAG system, produce a brief + 5-min Loom video
**Approach:** Build and deploy the actual platform you'd use to diagnose the problem

---

## Live URLs & Accounts

| Resource | URL |
|----------|-----|
| **Live App** | https://roip-47q5.vercel.app |
| **GitHub Repo** | https://github.com/realmwell/roip |
| **Vercel Project** | Connected to `realmwell/roip`, auto-deploys on push to `main` |

### Services (all free tier)

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **OpenAI API** | GPT-4.1-mini, GPT-4.1-nano, text-embedding-3-small | platform.openai.com |
| **Pinecone** | Vector store, index `roip-corpus`, 512d, cosine, us-east-1 | app.pinecone.io |
| **Upstash Redis** | Semantic cache, conversation history, metrics | console.upstash.com |
| **Vercel** | Hosting, serverless functions | vercel.com |

### Environment Variables

All stored in `.env.local` (not in git) and in Vercel's environment settings. See `.env.example` for the template:
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`, `PINECONE_INDEX` (= `roip-corpus`)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

---

## Hard Requirements

These were established early and apply to all decisions:

1. **$0/month at rest.** Every service must be free tier. No always-on compute, no paid database plans, no provisioned capacity. The app should cost nothing when nobody is using it.

2. **Scale only when needed.** Architecture should support scaling up (tiered inference, prompt caching, batch API) but should not pre-provision anything. Scaling is documented as a path, not pre-built.

3. **OpenAI-exclusive stack.** All AI inference uses OpenAI models. No mixing in Anthropic, Cohere, etc. This is an OpenAI role application.

4. **Presentation outputs stay out of git.** All `.pptx`, `.docx`, and `.html` presentation files are in `.gitignore`. They live locally on the Desktop, not in the repo.

5. **No emojis in code or prose** unless explicitly requested.

6. **Humanized writing.** All prose output goes through an internal humanizer pass -- no AI-sounding language, no significance inflation, no promotional tone.

---

## What Was Built (Architecture)

### Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **AI:** OpenAI Responses API (GPT-4.1-mini for generation, GPT-4.1-nano for routing/classification)
- **Embeddings:** text-embedding-3-small @ 512 dimensions
- **Vector DB:** Pinecone (serverless, us-east-1)
- **Cache:** Upstash Redis (semantic caching, conversation history, metrics)
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Charts:** Recharts
- **Markdown:** react-markdown + remark-gfm

### Pages (6)

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero, feature overview, model badges |
| `/dashboard` | Telemetry data explorer -- real NDJSON data visualizations from the customer's RAG system |
| `/chat` | RAG troubleshooting chatbot with streaming, diagnosis cards, model badges, source citations |
| `/corpus` | Knowledge corpus browser -- 35 docs across 5 categories, search + browse |
| `/eval` | Evaluation harness -- run query sets, compare configs, RAGAS-style scoring |
| `/about` | About page explaining the platform and the assignment context |

### API Routes (7)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Streaming RAG chat (Vercel AI SDK) |
| `/api/corpus/list` | GET | List all 35 corpus docs from Pinecone (no embeddings needed) |
| `/api/corpus/search` | GET | Semantic vector search with deduplication (topK: 80) |
| `/api/corpus/ingest` | POST | Trigger corpus re-ingestion |
| `/api/eval/run` | POST/GET | Run eval set, get results |
| `/api/eval/compare` | GET | Compare two eval runs |
| `/api/metrics` | GET | Dashboard metrics from Redis |

### Library Modules (8)

| Module | Purpose |
|--------|---------|
| `lib/openai.ts` | OpenAI client wrapper |
| `lib/pinecone.ts` | Pinecone client, index `roip-corpus` |
| `lib/redis.ts` | Upstash Redis client |
| `lib/embeddings.ts` | text-embedding-3-small @ 512d helper |
| `lib/query-router.ts` | GPT-4.1-nano intent classification with structured outputs |
| `lib/rag-pipeline.ts` | Full pipeline: route -> cache check -> retrieve -> generate (streaming) |
| `lib/eval-engine.ts` | RAGAS-style scoring with GPT-4.1-nano as judge |
| `lib/metrics.ts` | Metrics recording/retrieval to Redis |

### Knowledge Corpus (35 documents, 212 vectors in Pinecone)

| Category | Count | Topics |
|----------|-------|--------|
| `openai-platform` | 12 | Models, rate limits, embeddings, structured outputs, batch API, prompt caching, Responses API, error codes, deprecation, enterprise features, usage dashboard, production best practices |
| `aws-ml-lens` | 6 | Operational excellence, cost optimization, performance efficiency, reliability, security, ML lifecycle |
| `rag-patterns` | 8 | Chunking, hybrid retrieval, embedding optimization, context windows, query routing, semantic caching, evaluation frameworks, scaling enterprise RAG |
| `troubleshooting` | 6 | Latency diagnosis tree, error rate triage, cost spike investigation, scaling readiness checklist, model migration playbook, prompt optimization |
| `case-studies` | 3 | Retail RAG optimization, multi-team scaling, batch API migration |

Each doc has frontmatter (title, category, tags, source_url, last_updated). Documents are chunked by `##` headings (300-500 tokens), embedded, and upserted to Pinecone. Ingestion script: `npx tsx scripts/ingest-corpus.ts` (requires env vars loaded).

### Evaluation Query Sets (4 sets, 55 queries)

| File | Focus |
|------|-------|
| `cost-optimization.json` | Cost reduction strategies |
| `general-faq.json` | Broad platform questions |
| `latency-troubleshooting.json` | Latency diagnosis |
| `scaling-readiness.json` | Scaling preparation |

### Telemetry Data (5 NDJSON files in `data/`)

Real telemetry from the customer's RAG system, used by the dashboard:
- OpenAI usage logs
- Request summaries
- Span traces across retrieval, OpenAI chat, and inventory call stages

---

## What Was Fixed (Bug History)

### Session 1-2: Initial Build + 8 UI Fixes
- Streaming JSON parsing (chat responses showing raw JSON)
- Text rendering in message bubbles
- Eval guide content
- Dashboard data display
- Added landing page and about page

### Session 2: Dashboard Overhaul
- Replaced placeholder dashboard with real telemetry visualizations from NDJSON data
- Fixed corpus links
- Added NDJSON data parsing support

### Session 3: Corpus Page (Major Fix)
**Problem:** Corpus page showed "All: 20" instead of 35, categories showed "No documents found"
**Root causes:**
1. Search endpoint had `topK: 20` (only returned 20 of 35 docs)
2. No endpoint existed to list all docs without embeddings
3. Category browsing used semantic search instead of local filtering

**Fix:**
- Created `/api/corpus/list` endpoint using Pinecone `listPaginated()` + `fetch()` with deduplication (one entry per title, prefer chunk-0)
- Bumped search `topK` to 80 with deduplication by title (best score wins)
- Rewrote corpus page to load all docs on mount, filter categories locally
- Hero cards show live counts from loaded data

### Session 3: Source URL Migration
**Problem:** OpenAI migrated docs from `platform.openai.com` to `developers.openai.com`. Two URLs were fully broken (404).
**Fix:**
- `guides/enterprise` -> `guides/your-data` (covers ZDR, EKM, data controls)
- `guides/responses` -> `guides/text` (primary Responses API / text generation guide)
- `guides/text-generation` -> `guides/text` (path shortened on new site)
- Updated all 27 corpus files to new domain
- Re-ingested all 212 vectors to Pinecone

---

## Generated Outputs (Local, Not in Git)

All on Max's Desktop or in the roip project root (excluded by `.gitignore`):

| File | Description |
|------|-------------|
| `~/Desktop/ROIP_Presentation.pptx` | Swiss Modern slide deck (10 slides, PptxGenJS) |
| `ROIP_Architecture_Brief.docx` | 8-12 page architecture brief (generated via `npx tsx scripts/generate-architecture-doc.ts`) |
| `RAG_Pipeline_Operator_Brief.pptx` | Earlier version of the slide deck |
| `RAG_Pipeline_Visualizations.docx` | Telemetry data visualizations document |
| `OpenAI_ASE_Call_Prep_Brief.docx` | Call preparation brief |
| `OpenAI_ASE_Recruiter_CheatSheet.docx` | Recruiter cheat sheet |
| `ROIP_Telemetry_Data_Exploration.docx` | Telemetry exploration document |
| Various other `.docx` files | Supporting documents for the assignment |

### PPTX Build Script

The presentation is built programmatically at `/tmp/roip-pptx/build.js` using PptxGenJS. To rebuild:
```bash
cd /tmp/roip-pptx && node build.js
```
Output goes to `~/Desktop/ROIP_Presentation.pptx`.

Design: Swiss Modern -- white (#FFFFFF) + black (#0A0A0A) + red (#FF3300), Arial Black + Calibri, red vertical rule, geometric accents. 10 slides covering: title, problem, approach, cost findings, error findings, latency findings, recommendations, model routing, live platform demo, closing.

---

## Git State

**Branch:** `main`, up to date with `origin/main`
**9 commits total** (oldest to newest):
1. `e15926e` Initial project setup
2. `0433f84` Add complete ROIP platform
3. `346cba7` Add live Vercel URL to README
4. `52222cd` Add landing page, about page, improved frontend
5. `325431a` Fix 8 UI issues
6. `bec350d` Replace dashboard with real telemetry
7. `99c7129` Fix corpus links, add NDJSON support
8. `3e1f897` Fix corpus page: load all 35 docs, deduplicate
9. `09a6501` Fix all corpus source URLs for OpenAI docs migration

**Untracked (intentionally not committed):**
- `.claude/` (local launch config)
- `cowork_prompt_v2.md` (working notes)
- `public/` (needs review before committing)

---

## .gitignore (Notable Exclusions)

```
*.pptx
*.html (except app/**/*.html and public/**/*.html)
*.docx
~$* (Word temp files)
.claude-design/
```

---

## How to Run Locally

```bash
cd /Users/maxmac/Desktop/roip
npm run dev          # Start Next.js dev server on port 3000
```

### Re-ingest corpus (if you change any markdown files):
```bash
# Env vars must be loaded
export $(grep -v '^#' .env.local | xargs)
npx tsx scripts/ingest-corpus.ts
```

### Regenerate companion documents:
```bash
export $(grep -v '^#' .env.local | xargs)
npx tsx scripts/generate-architecture-doc.ts    # -> ROIP_Architecture_Brief.docx
npx tsx scripts/generate-slide-deck.ts          # -> ROIP slide deck
```

### Dev server via Claude Preview:
Config at `~/.claude/launch.json`:
```json
{
  "version": "0.0.1",
  "configurations": [{
    "name": "next-dev",
    "runtimeExecutable": "bash",
    "runtimeArgs": ["-c", "cd /Users/maxmac/Desktop/roip && npm run dev"],
    "port": 3000
  }]
}
```
Must kill any existing process on port 3000 and remove `.next/dev/lock` before starting.

---

## Known Issues / Remaining Work

1. **`public/` directory is untracked.** Review contents and decide whether to commit. May contain favicons or static assets needed for production.

2. **Loom video not yet recorded.** The assignment requires a 5-minute Loom walkthrough of the brief and platform.

3. **The assignment brief itself.** The `.docx` exists but may need a final review pass to ensure it maps cleanly to the assignment's specific questions (Section 1: key questions, Section 2: action plan, Section 3: tradeoffs, Section 4: deployment plan).

4. **Dashboard uses local NDJSON data.** The telemetry visualizations pull from static files in `data/`. This is by design (the assignment provides these files), but it means the dashboard doesn't show live metrics from actual chatbot usage.

5. **OpenAI URLs return 403 from curl.** This is Cloudflare bot protection on `developers.openai.com`, not broken links. All URLs work in actual browsers. If you need to test URLs programmatically, you'll get 403s for all OpenAI docs -- ignore them.

6. **Word temp files (`~$...`) in project root.** These are created by Word when documents are open. They'll disappear when you close the documents. Already in `.gitignore`.

---

## Key Design Decisions (For Context)

- **Query routing with GPT-4.1-nano:** Simple queries go to nano (cheap, fast), complex ones to mini. Classification uses structured outputs for reliability.
- **Semantic caching with Upstash Redis:** Repeated or similar queries hit cache instead of re-running the full pipeline. Cache key is the embedding vector with cosine similarity threshold.
- **Corpus chunking by `##` headings:** Rather than fixed-size chunks, documents are split at section boundaries for better retrieval coherence.
- **Deduplication in search results:** Since each doc produces ~6 chunks, search results deduplicate by title, keeping the highest-scoring chunk per document.
- **Browse vs. search separation:** The corpus list endpoint uses Pinecone's `listPaginated()` + `fetch()` (no embeddings needed) while search uses actual vector similarity. Category filtering is done client-side from the full list.

---

*Last updated: Feb 24, 2026*
*Author: Claude (sessions 1-3 with Max Greenberg)*

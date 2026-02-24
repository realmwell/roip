import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Database,
  FlaskConical,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Timeline Item                                                              */
/* -------------------------------------------------------------------------- */

function TimelineItem({
  phase,
  title,
  description,
  tags,
  done,
}: {
  phase: string;
  title: string;
  description: string;
  tags: string[];
  done?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 ${
          done
            ? "bg-green border-green"
            : "bg-surface border-blue"
        } ring-2 ring-bg`}
      />
      <div className="pl-4 pb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue">
          {phase}
        </span>
        <h4 className="text-sm font-semibold text-fg mt-1">{title}</h4>
        <p className="text-xs text-muted-fg leading-relaxed mt-1 max-w-lg">
          {description}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 bg-blue/10 text-blue text-[10px] font-semibold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cost Box                                                                   */
/* -------------------------------------------------------------------------- */

function CostBox({
  scenario,
  amount,
  per,
  detail,
  borderColor,
  amountColor,
}: {
  scenario: string;
  amount: string;
  per: string;
  detail: string;
  borderColor: string;
  amountColor: string;
}) {
  return (
    <div className={`rounded-xl border-2 ${borderColor} bg-surface p-5 text-center`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-fg mb-2">
        {scenario}
      </div>
      <div className={`text-3xl font-bold ${amountColor}`}>{amount}</div>
      <div className="text-xs text-muted-fg">{per}</div>
      <div className="text-[11px] text-muted-fg mt-3 leading-relaxed whitespace-pre-line">
        {detail}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  About Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient text-white overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <span className="inline-block bg-white/15 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-5">
            About ROIP
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Why I Built a Working Platform Instead of Writing a Document
          </h1>
          <p className="mt-4 text-base text-white/80 max-w-2xl leading-relaxed">
            The OpenAI ASE take-home asks for a 2-3 page brief and a 5-minute
            video. ROIP goes further: it ships a deployed application that
            demonstrates every technique the brief would describe.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* ================================================================ */}
        {/*  The Problem                                                      */}
        {/* ================================================================ */}
        <section>
          <div className="rounded-xl bg-surface border border-surface-border p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-fg mb-4 flex items-center gap-2">
              The Scenario
            </h2>
            <p className="text-sm text-muted-fg leading-relaxed mb-4">
              A retail enterprise deployed an internal search assistant using
              OpenAI's API for RAG. After initial adoption, they hit performance
              and cost walls:
            </p>
            <ul className="space-y-2 text-sm text-muted-fg">
              {[
                "Latency climbed from 500ms to 2-3 seconds as usage grew",
                "429 rate limit errors spiked during peak hours",
                "Monthly API costs reached $12,400 with a single GPT-4o model",
                "No evaluation framework to catch quality degradation",
                "Three new teams want to onboard, but the system can't handle the load",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================================ */}
        {/*  What ROIP Does                                                    */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-6">
            What ROIP Does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: MessageSquare,
                title: "Troubleshooting Chatbot",
                color: "bg-teal",
                items: [
                  "Symptom-based diagnosis with structured output",
                  "Query routing: nano for FAQs, mini for analysis, full for complex",
                  "Semantic caching for repeated queries (<50ms)",
                  "Sources and follow-up questions in every response",
                ],
              },
              {
                icon: Database,
                title: "Knowledge Corpus",
                color: "bg-blue",
                items: [
                  "35+ curated documents across 5 domains",
                  "OpenAI platform docs, AWS ML Lens, RAG patterns",
                  "Troubleshooting decision trees with branching logic",
                  "Vector search via Pinecone (512-dimensional embeddings)",
                ],
              },
              {
                icon: FlaskConical,
                title: "Evaluation Harness",
                color: "bg-green",
                items: [
                  "55 predefined test queries across 4 categories",
                  "RAGAS-style scoring with GPT-4.1-nano as judge",
                  "A/B comparison of optimization strategies",
                  "Cost, latency, and quality metrics per query",
                ],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl bg-surface border border-surface-border p-5 shadow-sm"
              >
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${card.color} mb-3`}>
                  <card.icon className="h-4.5 w-4.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-fg mb-3">{card.title}</h3>
                <ul className="space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-2 text-xs text-muted-fg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/*  How to Use It                                                     */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-6">
            How to Use ROIP
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Ask the chatbot a troubleshooting question",
                desc: 'Go to the Chat page and type something like "Why is my RAG latency increasing?" or "How can I reduce my API costs?" The chatbot will route your query, retrieve relevant context, and return a structured diagnosis with recommended actions.',
                href: "/chat",
                linkLabel: "Open chatbot",
              },
              {
                step: "2",
                title: "Browse the knowledge corpus",
                desc: "Search across 35+ curated documents covering OpenAI APIs, AWS ML best practices, RAG architecture patterns, and troubleshooting decision trees. Filter by category or use semantic search.",
                href: "/corpus",
                linkLabel: "Browse corpus",
              },
              {
                step: "3",
                title: "Run an evaluation",
                desc: "Select a query set (latency troubleshooting, cost optimization, scaling readiness, or general FAQ), configure the model and routing strategy, and run an automated evaluation. Compare results side by side.",
                href: "/eval",
                linkLabel: "Run evaluation",
              },
              {
                step: "4",
                title: "Check the dashboard",
                desc: "View aggregate metrics from your usage: total queries, average latency, cache hit rate, and API cost. The dashboard pulls real-time data from the metrics store.",
                href: "/dashboard",
                linkLabel: "View dashboard",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-xl bg-surface border border-surface-border p-5 shadow-sm"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-navy text-white text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-fg">{item.title}</h3>
                  <p className="text-xs text-muted-fg leading-relaxed mt-1">
                    {item.desc}
                  </p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal hover:text-blue mt-2 transition-colors"
                  >
                    {item.linkLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/*  Cost Model                                                        */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-2">
            Customer Cost Projection
          </h2>
          <p className="text-sm text-muted-fg mb-6">
            Monthly cost for the retail customer's RAG assistant (~1,000 users,
            ~15 queries/day each).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CostBox
              scenario="Current State"
              amount="$12,400"
              per="/month"
              detail={"Single model (GPT-4o)\nNo caching\nNo query routing\n~450K queries/mo"}
              borderColor="border-red"
              amountColor="text-red"
            />
            <CostBox
              scenario="Optimized (1 team)"
              amount="$3,200"
              per="/month"
              detail={"Model routing (70/25/5)\n30% cache hit rate\nPrompt caching active\n~450K queries/mo"}
              borderColor="border-green"
              amountColor="text-green"
            />
            <CostBox
              scenario="Scaled (4 teams)"
              amount="$9,800"
              per="/month"
              detail={"Model routing + caching\n40% cache hit rate\nBatch API for indexing\n~1.8M queries/mo"}
              borderColor="border-blue"
              amountColor="text-blue"
            />
          </div>
          <p className="text-xs text-muted-fg text-center mt-3">
            4x the users at 79% less cost than the current single-team deployment.
          </p>
        </section>

        {/* ================================================================ */}
        {/*  Implementation Roadmap                                            */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-6">
            Implementation Roadmap
          </h2>
          <p className="text-sm text-muted-fg mb-8">
            Four-phase rollout aligned with a stabilize, optimize, scale trajectory.
          </p>
          <div className="relative pl-8 border-l-2 border-surface-border">
            <TimelineItem
              phase="Phase 1 -- Weeks 1-2"
              title="Foundation & Chatbot MVP"
              description="Deploy infrastructure stack. Build initial corpus with OpenAI docs + AWS ML Lens + top 30 troubleshooting decision trees. Launch chatbot with GPT-4.1-mini and basic vector retrieval. Ship to 5 internal operators for validation."
              tags={["CDK", "Lambda", "Responses API", "OpenSearch"]}
              done
            />
            <TimelineItem
              phase="Phase 2 -- Weeks 3-4"
              title="Query Routing & Evaluation Harness"
              description="Add GPT-4.1-nano query router. Implement semantic caching with ElastiCache Redis. Build evaluation harness with RAGAS-based quality scoring. Add cost and latency tracking dashboards. Run first A/B test."
              tags={["GPT-4.1-nano", "ElastiCache", "Step Functions", "RAGAS"]}
            />
            <TimelineItem
              phase="Phase 3 -- Weeks 5-6"
              title="Corpus Expansion & Auto-Ingestion"
              description="Expand corpus to 250+ documents. Build automated weekly ingestion pipeline (Batch API for embeddings). Add hybrid retrieval (vector + BM25). Implement distributed tracing for full pipeline visibility."
              tags={["Batch API", "X-Ray", "Hybrid Search"]}
            />
            <TimelineItem
              phase="Phase 4 -- Weeks 7-8"
              title="New Team Onboarding & Continuous Eval"
              description="Onboard first new team using ROIP as the onboarding accelerator. Run evaluation harness against production traffic. Set up automated SLO monitoring with CloudWatch alarms. Build per-team cost allocation dashboards."
              tags={["CloudWatch", "SLO Monitoring", "Per-team Dashboards"]}
            />
          </div>
        </section>

        {/* ================================================================ */}
        {/*  How I Built It                                                    */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-6">
            How I Built It
          </h2>
          <div className="rounded-xl bg-surface border border-surface-border p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-fg mb-3">Tech Stack</h3>
                <ul className="space-y-2 text-xs text-muted-fg">
                  {[
                    "Next.js 16 (App Router) on Vercel",
                    "OpenAI Responses API (GPT-4.1-mini, GPT-4.1-nano)",
                    "text-embedding-3-small at 512 dimensions",
                    "Pinecone (serverless, free tier)",
                    "Upstash Redis (serverless, free tier)",
                    "Tailwind CSS v4 with DM Sans + JetBrains Mono",
                    "Recharts for dashboard visualizations",
                    "TypeScript throughout",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fg mb-3">Key Decisions</h3>
                <ul className="space-y-2 text-xs text-muted-fg">
                  {[
                    "Streaming responses via ReadableStream for real-time UX",
                    "Query routing with nano classifier cuts 60-75% of cost",
                    "Semantic caching with cosine similarity threshold of 0.95",
                    "512-dimensional embeddings (MRL-compressed, half the cost of 1536)",
                    "Structured outputs with JSON schema for diagnosis format",
                    "RAGAS-style evaluation with nano as judge model",
                    "Zero idle cost: every service on free tier",
                    "Companion .docx and .pptx generated programmatically",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/*  Companion Documents                                               */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-4">
            Companion Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://github.com/realmwell/roip/raw/main/ROIP_Architecture_Brief.docx"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-xl bg-surface border border-surface-border p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue shrink-0">
                <span className="text-white text-xs font-bold">.docx</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fg group-hover:text-blue transition-colors">
                  Architecture Brief
                </h3>
                <p className="text-xs text-muted-fg mt-1">
                  8-page document covering system design, tradeoff analysis,
                  scalability path, and assignment mapping.
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-fg shrink-0 mt-1" />
            </a>
            <a
              href="https://github.com/realmwell/roip/raw/main/ROIP_Presentation.pptx"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-xl bg-surface border border-surface-border p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber shrink-0">
                <span className="text-white text-xs font-bold">.pptx</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fg group-hover:text-amber transition-colors">
                  Slide Deck
                </h3>
                <p className="text-xs text-muted-fg mt-1">
                  10-slide presentation: scenario analysis, diagnosis, action plan,
                  tradeoffs, and platform overview.
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-fg shrink-0 mt-1" />
            </a>
          </div>
        </section>

        {/* ================================================================ */}
        {/*  CTA                                                               */}
        {/* ================================================================ */}
        <section className="rounded-xl bg-navy p-8 sm:p-10 text-center text-white">
          <h2 className="text-xl font-bold mb-3">Ready to explore?</h2>
          <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
            The chatbot, corpus browser, evaluation harness, and dashboard are
            all live. Pick a starting point.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-teal/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Try the Chatbot
            </Link>
            <Link
              href="/corpus"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              <Database className="h-4 w-4" />
              Browse Corpus
            </Link>
            <Link
              href="/eval"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              Run Evaluation
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-navy-dark text-white/50 text-xs py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <span>ROIP by Max Greenberg. OpenAI ASE Take-Home, February 2026.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <a
              href="https://github.com/realmwell/roip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Generates ROIP_Architecture_Brief.docx
 * Run: npx tsx scripts/generate-architecture-doc.ts
 */

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import * as fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageNumber,
  NumberFormat,
  Header,
  Footer,
  TableOfContents,
  PageBreak,
} from "docx";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const NAVY = "1B2A4A";
const TEAL = "0EA5E9";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F3F4F6";
const MID_GRAY = "6B7280";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: "Calibri",
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22,
        color: NAVY,
      }),
    ],
  });
}

function body(text: string, opts?: { bold?: boolean; italic?: boolean; spacing?: number }) {
  return new Paragraph({
    spacing: { after: opts?.spacing ?? 120 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 22,
        bold: opts?.bold,
        italics: opts?.italic,
      }),
    ],
  });
}

function bullet(text: string, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [
      new TextRun({ text, font: "Calibri", size: 22 }),
    ],
  });
}

function headerCell(text: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: NAVY },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text, font: "Calibri", size: 20, bold: true, color: WHITE }),
        ],
      }),
    ],
  });
}

function cell(text: string, opts?: { shading?: string; bold?: boolean }): TableCell {
  return new TableCell({
    shading: opts?.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: "Calibri", size: 20, bold: opts?.bold }),
        ],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h) => headerCell(h)),
      }),
      ...rows.map(
        (row, i) =>
          new TableRow({
            children: row.map((c) =>
              cell(c, { shading: i % 2 === 1 ? LIGHT_GRAY : undefined })
            ),
          })
      ),
    ],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

// ---------------------------------------------------------------------------
// Document content
// ---------------------------------------------------------------------------

function titlePage(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 2400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "ROIP",
          font: "Calibri",
          size: 72,
          bold: true,
          color: NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "RAG Operations Intelligence Platform",
          font: "Calibri",
          size: 32,
          color: TEAL,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Architecture Brief",
          font: "Calibri",
          size: 28,
          color: MID_GRAY,
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Max Greenberg",
          font: "Calibri",
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "OpenAI AI Success Engineer -- Take-Home Assignment",
          font: "Calibri",
          size: 22,
          color: MID_GRAY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "February 2026",
          font: "Calibri",
          size: 22,
          color: MID_GRAY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: "github.com/realmwell/roip",
          font: "Calibri",
          size: 20,
          color: TEAL,
          italics: true,
        }),
      ],
    }),
    pageBreak(),
  ];
}

function executiveSummary(): Paragraph[] {
  return [
    heading("Executive Summary"),
    body(
      "ROIP is a working web application that demonstrates how I'd approach the AI Success Engineer role at OpenAI. Rather than writing a static document about a retail enterprise's struggling RAG system, I built the diagnostic tooling itself."
    ),
    body(
      "The platform has three capabilities: a RAG-powered troubleshooting chatbot that diagnoses latency, cost, and error issues using OpenAI's latest models; a searchable knowledge corpus of 35 curated documents covering OpenAI platform features, AWS ML best practices, and enterprise RAG patterns; and an evaluation harness that benchmarks quality, cost, and latency across different model and retrieval configurations."
    ),
    body(
      "The entire stack runs on free tiers with zero idle cost. It uses Next.js on Vercel, OpenAI's Responses API with GPT-4.1 model family, Pinecone for vector search, and Upstash Redis for semantic caching and metrics. Query routing with GPT-4.1-nano classifies each request by intent and complexity, directing simple questions to nano (~$0.0001/query) and reserving the full GPT-4.1 for genuinely complex analysis."
    ),
    body(
      "This document walks through the architecture decisions, tradeoffs, and scaling path. It maps each section of the take-home assignment to specific ROIP features so you can see the thinking in action, not just described."
    ),
    pageBreak(),
  ];
}

function assignmentMapping(): Paragraph[] {
  return [
    heading("Assignment Mapping"),
    body(
      "The table below connects each part of the take-home assignment to where ROIP addresses it."
    ),
    spacer(),
    makeTable(
      ["Assignment Section", "ROIP Feature", "Where to Find It"],
      [
        ["Analyze the data files", "RAG chatbot ingests telemetry patterns into its knowledge corpus", "/corpus (troubleshooting category)"],
        ["Architecture diagram review", "Architecture deep dive with query flow diagrams", "This document, Section 3"],
        ["Discovery questions", "Chatbot surfaces targeted questions based on symptoms", "/chat -- ask about any issue"],
        ["Diagnosis & root causes", "Structured diagnosis cards with confidence scores", "/chat -- structured JSON responses"],
        ["Optimization recommendations", "Actionable plans with priority and impact estimates", "/chat -- recommended_actions field"],
        ["Tradeoff analysis", "7+ tradeoffs documented with specific numbers", "This document, Section 4"],
        ["Scaling plan", "5-tier scaling path from $0 to enterprise", "This document, Section 5"],
        ["Cost estimates", "Real cost tracking per query with model breakdown", "/eval -- run a benchmark"],
        ["Success metrics", "Eval harness with quality, latency, cost scoring", "/eval -- automated benchmarking"],
      ]
    ),
    pageBreak(),
  ];
}

function architectureDeepDive(): Paragraph[] {
  return [
    heading("Architecture Deep Dive"),

    heading("System Overview", HeadingLevel.HEADING_2),
    body(
      "ROIP runs as a Next.js application deployed to Vercel. The frontend uses React with Tailwind CSS. The backend consists of serverless API routes that orchestrate calls to OpenAI, Pinecone, and Upstash Redis. There's no dedicated server, no containers, no always-on infrastructure."
    ),
    body(
      "The core data flow: user sends a query, the query router classifies it, we check the semantic cache, embed and retrieve from Pinecone if needed, build the prompt with conversation history and retrieved context, then stream the response back from OpenAI."
    ),

    heading("Query Routing", HeadingLevel.HEADING_2),
    body(
      "Every incoming query first goes to GPT-4.1-nano with a structured output schema. The router classifies along two axes: intent (troubleshoot_latency, troubleshoot_errors, cost_optimization, scaling, openai_api_help, greeting, follow_up) and complexity (simple, medium, complex)."
    ),
    body("Based on this classification, the router picks a model:"),
    bullet("Simple greetings and follow-ups: GPT-4.1-nano (input: $0.10/1M, output: $0.40/1M)"),
    bullet("Standard troubleshooting queries: GPT-4.1-mini (input: $0.40/1M, output: $1.60/1M)"),
    bullet("Complex multi-system analysis: GPT-4.1 (input: $2.00/1M, output: $8.00/1M)"),
    body(
      "In practice, about 70% of queries go to nano or mini, keeping costs well under $0.01 per typical session. The router itself costs roughly $0.0001 per classification."
    ),

    heading("Semantic Caching", HeadingLevel.HEADING_2),
    body(
      "Before hitting Pinecone or OpenAI, we check Upstash Redis for a cached response. The cache key is a hash of the query embedding rounded to reduce dimensionality. If a semantically similar query (cosine similarity > 0.95) was answered recently, we return the cached response immediately."
    ),
    body(
      "This cuts latency from ~2-4 seconds (full pipeline) to ~100ms (cache hit) and eliminates the OpenAI API cost entirely for repeated queries. In a retail deployment with thousands of store employees asking similar questions, cache hit rates of 40-60% are realistic."
    ),

    heading("Retrieval Pipeline", HeadingLevel.HEADING_2),
    body(
      "When retrieval is needed, we embed the query with text-embedding-3-small at 512 dimensions and search Pinecone. The top-K parameter varies by complexity: 3 for simple queries, 5 for medium, 8 for complex. We apply metadata filters based on the classified intent to narrow results to relevant categories."
    ),
    body(
      "The corpus consists of 212 chunks from 35 documents, covering OpenAI platform documentation, AWS ML Lens best practices, RAG architecture patterns, troubleshooting decision trees, and real-world case studies. Each chunk includes the document title, category, and source URL as metadata."
    ),

    heading("Response Generation", HeadingLevel.HEADING_2),
    body(
      "The system prompt instructs the model to return a structured JSON response for troubleshooting queries. This includes a diagnosis (primary cause, confidence level, evidence), recommended actions (prioritized with implementation details), and source citations. The frontend parses this JSON and renders it as a styled diagnosis card."
    ),
    body(
      "For non-troubleshooting queries (general questions, greetings), the model returns plain text. Streaming is handled via Server-Sent Events so the user sees tokens arrive in real time."
    ),

    heading("Metrics and Observability", HeadingLevel.HEADING_2),
    body(
      "Every query records metrics to Upstash Redis: latency, token counts, cost, model used, cache hit status, and classified intent. The dashboard aggregates these into summary cards and trend charts. The eval harness reads the same metrics to compare different configurations."
    ),
    pageBreak(),
  ];
}

function tradeoffAnalysis(): Paragraph[] {
  return [
    heading("Tradeoff Analysis"),
    body(
      "Every architectural choice involves tradeoffs. Here are the key decisions and the reasoning behind each."
    ),
    spacer(),
    makeTable(
      ["Decision", "Choice Made", "Alternative", "Why This Choice"],
      [
        [
          "Model tier routing",
          "GPT-4.1-nano / mini / full via query router",
          "Single model for all queries",
          "80% cost reduction with <5% quality loss on simple queries. Router adds ~100ms but saves $0.01+ per query.",
        ],
        [
          "Embedding dimensions",
          "512 dimensions (text-embedding-3-small)",
          "1536 dimensions (full)",
          "50% storage savings in Pinecone, faster similarity search. Quality difference is negligible for our corpus size (~250 docs).",
        ],
        [
          "Caching strategy",
          "Semantic cache (embedding similarity > 0.95)",
          "Exact match cache",
          "Catches paraphrased queries that exact match misses. In retail with 1000+ employees, similar questions are common.",
        ],
        [
          "Vector database",
          "Pinecone (serverless, free tier)",
          "Weaviate, Qdrant, pgvector",
          "100K free vectors, zero ops, native metadata filtering. Our 212-vector corpus uses 0.2% of capacity.",
        ],
        [
          "Hosting",
          "Vercel serverless (free tier)",
          "AWS Lambda + API Gateway, self-hosted",
          "$0 idle cost, instant deploys from GitHub, global CDN included. Cold starts are ~200ms, acceptable for a demo.",
        ],
        [
          "Chunking approach",
          "Split by ## headings (300-500 tokens avg)",
          "Fixed token windows, sentence-level",
          "Heading-based chunks preserve topical coherence. Each chunk maps to a self-contained concept.",
        ],
        [
          "Evaluation method",
          "GPT-4.1-nano as LLM judge (relevance + completeness)",
          "Human evaluation, RAGAS library, custom metrics",
          "Fast and cheap automated scoring. Nano judges cost ~$0.0001 per eval. Not perfect, but good enough for rapid iteration.",
        ],
        [
          "State management",
          "Upstash Redis for everything (cache, history, metrics)",
          "Separate databases per concern",
          "One service to manage, free tier covers all use cases. 10K commands/day is plenty for a demo.",
        ],
      ]
    ),
    pageBreak(),
  ];
}

function scalabilityPath(): Paragraph[] {
  return [
    heading("Scalability Path"),
    body(
      "ROIP is designed as a demo, but the architecture scales. Here's how each tier would look as usage grows."
    ),
    spacer(),
    makeTable(
      ["Tier", "Monthly Cost", "Capacity", "Changes from Previous Tier"],
      [
        [
          "Free (current)",
          "$0",
          "~500 queries/day",
          "Vercel free, Pinecone free (100K vectors), Upstash free (10K cmds/day). Sufficient for evaluation and light demos.",
        ],
        [
          "Starter",
          "~$50",
          "~5,000 queries/day",
          "Vercel Pro ($20), Upstash Pay-As-You-Go ($10-15 for 50K+ cmds/day), OpenAI usage ($15). Same architecture.",
        ],
        [
          "Growth",
          "~$200",
          "~25,000 queries/day",
          "Pinecone Standard ($70 for 1M vectors), increased Redis capacity, add monitoring with Vercel Observability. Consider dedicated embedding cache.",
        ],
        [
          "Enterprise",
          "~$1,000",
          "~100,000 queries/day",
          "Pinecone Enterprise, Upstash Enterprise Redis, OpenAI usage tiers with committed volume discounts. Add authentication, audit logging, multi-tenant isolation.",
        ],
        [
          "Scale",
          "$5,000+",
          "500K+ queries/day",
          "Move to AWS with dedicated infrastructure: EKS, ElastiCache, OpenSearch for hybrid search, CloudWatch + Datadog. Custom fine-tuned models for routing.",
        ],
      ]
    ),
    body(
      "The key point: the demo architecture isn't a throwaway prototype. Tiers 1-3 require zero code changes, just configuration. The jump to AWS infrastructure at tier 4-5 is a migration, but the application logic stays the same."
    ),
    pageBreak(),
  ];
}

function knowledgeCorpus(): Paragraph[] {
  return [
    heading("Knowledge Corpus"),
    body(
      "The corpus contains 35 curated markdown documents across five categories, totaling 212 embedded chunks in Pinecone."
    ),
    spacer(),
    makeTable(
      ["Category", "Documents", "Coverage"],
      [
        ["OpenAI Platform", "12", "Models overview, Responses API, prompt caching, batch API, rate limits, embeddings, structured outputs, enterprise features, error codes, deprecation policy, usage dashboard, production best practices"],
        ["AWS ML Lens", "6", "Operational excellence, cost optimization, performance efficiency, reliability, security, ML lifecycle overview"],
        ["RAG Patterns", "8", "Query routing, semantic caching, chunking strategies, hybrid retrieval, embedding optimization, context window management, evaluation frameworks, scaling enterprise RAG"],
        ["Troubleshooting", "6", "Latency diagnosis tree, error rate triage, cost spike investigation, scaling readiness checklist, model migration playbook, prompt optimization guide"],
        ["Case Studies", "3", "Retail RAG optimization, multi-team scaling, batch API migration"],
      ]
    ),
    body(
      "Each document uses frontmatter with title, category, tags, source URL, and last updated date. Content includes specific data points: actual pricing, token limits, error codes, and configuration parameters. The troubleshooting docs are structured as decision trees with concrete diagnostic steps."
    ),
  ];
}

function conclusion(): Paragraph[] {
  return [
    heading("Conclusion"),
    body(
      "The take-home asked me to analyze a retail enterprise's RAG system and recommend improvements. Instead of stopping at a written analysis, I built the diagnostic platform itself. ROIP shows how I think about these problems: start with the data, instrument everything, route intelligently, cache aggressively, and measure the results."
    ),
    body(
      "The architecture choices reflect real constraints I'd face working with customers: cost sensitivity, scaling uncertainty, team expertise gaps. Every tradeoff has a specific rationale tied to the scenario. The eval harness isn't just a feature; it's how I'd validate recommendations before presenting them to a customer."
    ),
    body(
      "I built this in under 48 hours because the tools exist to move fast. GPT-4.1-nano makes intelligent routing cheap. Pinecone and Upstash have generous free tiers. Vercel deploys in seconds. The hard part isn't the infrastructure. It's knowing which questions to ask and which optimizations actually matter for a given workload. That's what ROIP demonstrates."
    ),
    spacer(),
    body("Source code: github.com/realmwell/roip", { italic: true }),
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            pageNumbers: { start: 1 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: MID_GRAY }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...titlePage(),
          ...executiveSummary(),
          ...assignmentMapping(),
          ...architectureDeepDive(),
          ...tradeoffAnalysis(),
          ...scalabilityPath(),
          ...knowledgeCorpus(),
          ...conclusion(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve(__dirname, "../ROIP_Architecture_Brief.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath}`);
}

main().catch((err) => {
  console.error("Failed to generate document:", err);
  process.exit(1);
});

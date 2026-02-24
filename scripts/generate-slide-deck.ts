/**
 * Generates ROIP_Presentation.pptx
 * Run: npx tsx scripts/generate-slide-deck.ts
 */

import path from "path";
import PptxGenJS from "pptxgenjs";

// ---------------------------------------------------------------------------
// Colors & Constants
// ---------------------------------------------------------------------------
const NAVY = "1B2A4A";
const BLUE = "2E75B6";
const TEAL = "0EA5E9";
const GREEN = "10B981";
const AMBER = "F59E0B";
const RED = "EF4444";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F3F4F6";
const MID_GRAY = "6B7280";
const DARK_GRAY = "374151";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDarkSlide(pptx: PptxGenJS, title: string, subtitle?: string) {
  const slide = pptx.addSlide();
  slide.background = { color: NAVY };

  slide.addText(title, {
    x: 0.8,
    y: 2.0,
    w: 8.4,
    h: 1.2,
    fontSize: 36,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 3.2,
      w: 8.4,
      h: 0.6,
      fontSize: 16,
      fontFace: "Calibri",
      color: TEAL,
    });
  }

  // Accent bar
  slide.addShape("rect" as any, {
    x: 0.8,
    y: 3.85,
    w: 1.5,
    h: 0.04,
    fill: { color: TEAL },
  });

  return slide;
}

function addContentSlide(pptx: PptxGenJS, title: string) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  // Title bar
  slide.addShape("rect" as any, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.9,
    fill: { color: NAVY },
  });

  slide.addText(title, {
    x: 0.6,
    y: 0.15,
    w: 8.8,
    h: 0.6,
    fontSize: 22,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
  });

  return slide;
}

type BulletItem = { text: string; options?: Record<string, any> };

function addBullets(
  slide: any,
  items: (string | BulletItem)[],
  opts?: { x?: number; y?: number; w?: number; fontSize?: number }
) {
  const rows = items.map((item) => {
    if (typeof item === "string") {
      return {
        text: `\u2022  ${item}`,
        options: { fontSize: opts?.fontSize ?? 14, fontFace: "Calibri", color: DARK_GRAY, breakLine: true, lineSpacing: 26 },
      };
    }
    return {
      text: `\u2022  ${item.text}`,
      options: {
        fontSize: opts?.fontSize ?? 14,
        fontFace: "Calibri",
        color: DARK_GRAY,
        breakLine: true,
        lineSpacing: 26,
        ...item.options,
      },
    };
  });

  slide.addText(rows, {
    x: opts?.x ?? 0.6,
    y: opts?.y ?? 1.2,
    w: opts?.w ?? 8.8,
    h: 4.0,
    valign: "top",
  });
}

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

function main() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Max Greenberg";
  pptx.title = "ROIP: RAG Operations Intelligence Platform";

  // ─── Slide 1: Title ───────────────────────────────────────────────────────
  const s1 = pptx.addSlide();
  s1.background = { color: NAVY };

  s1.addText("ROIP", {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    h: 1.0,
    fontSize: 60,
    fontFace: "Calibri",
    bold: true,
    color: WHITE,
  });

  s1.addText("RAG Operations Intelligence Platform", {
    x: 0.8,
    y: 2.2,
    w: 8.4,
    h: 0.6,
    fontSize: 22,
    fontFace: "Calibri",
    color: TEAL,
  });

  s1.addShape("rect" as any, {
    x: 0.8,
    y: 3.0,
    w: 2.0,
    h: 0.04,
    fill: { color: TEAL },
  });

  s1.addText("Max Greenberg", {
    x: 0.8,
    y: 3.4,
    w: 8.4,
    h: 0.5,
    fontSize: 18,
    fontFace: "Calibri",
    color: WHITE,
  });

  s1.addText("OpenAI AI Success Engineer  |  February 2026", {
    x: 0.8,
    y: 3.9,
    w: 8.4,
    h: 0.5,
    fontSize: 14,
    fontFace: "Calibri",
    color: MID_GRAY,
  });

  s1.addText("github.com/realmwell/roip", {
    x: 0.8,
    y: 4.7,
    w: 8.4,
    h: 0.4,
    fontSize: 12,
    fontFace: "Calibri",
    italic: true,
    color: TEAL,
  });

  // ─── Slide 2: The Scenario ────────────────────────────────────────────────
  const s2 = addContentSlide(pptx, "The Scenario");

  s2.addText("A large retail enterprise runs a RAG-powered internal search assistant for thousands of store employees.", {
    x: 0.6, y: 1.1, w: 8.8, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: DARK_GRAY,
  });

  s2.addText("Over the past two weeks:", {
    x: 0.6, y: 1.7, w: 8.8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: NAVY,
  });

  // Issue cards as colored boxes
  const issues = [
    { label: "Latency", detail: "P95 response time exceeded SLA targets", color: RED, icon: "+" },
    { label: "Error rates", detail: "429 rate limit errors spiking during peak hours", color: AMBER, icon: "!" },
    { label: "API costs", detail: "Monthly spend increasing faster than query volume", color: BLUE, icon: "$" },
    { label: "Scaling pressure", detail: "Leadership wants to expand to 3 new teams next quarter", color: GREEN, icon: ">" },
  ];

  issues.forEach((issue, i) => {
    const yPos = 2.3 + i * 0.8;
    s2.addShape("rect" as any, {
      x: 0.6, y: yPos, w: 0.06, h: 0.6,
      fill: { color: issue.color },
    });
    s2.addText(issue.label, {
      x: 0.9, y: yPos, w: 2.0, h: 0.6,
      fontSize: 14, fontFace: "Calibri", bold: true, color: NAVY, valign: "middle",
    });
    s2.addText(issue.detail, {
      x: 3.0, y: yPos, w: 6.4, h: 0.6,
      fontSize: 13, fontFace: "Calibri", color: MID_GRAY, valign: "middle",
    });
  });

  s2.addText("Architecture: API Gateway > Lambda (Node.js) > Vector Store + GPT-4o + Inventory Lookup", {
    x: 0.6, y: 5.6, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: "Calibri", italic: true, color: MID_GRAY,
  });

  // ─── Slide 3: Root Cause Diagnosis ────────────────────────────────────────
  const s3 = addContentSlide(pptx, "Root Cause Diagnosis");

  s3.addText("What the data reveals:", {
    x: 0.6, y: 1.1, w: 8.8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true, color: NAVY,
  });

  const findings = [
    { cause: "Retrieval stage bottleneck", detail: "Vector search latency dominates total response time. Likely caused by unoptimized embedding dimensions and no result caching.", color: RED },
    { cause: "Rate limit saturation", detail: "429 errors correlate with peak traffic windows. No request queuing, backoff, or load shedding in place.", color: AMBER },
    { cause: "Prompt cost inflation", detail: "Full context window sent on every request. No prompt caching, no query routing to cheaper models for simple questions.", color: BLUE },
    { cause: "No observability", detail: "No per-stage latency instrumentation. Team is debugging blind without knowing which pipeline component is slow.", color: MID_GRAY },
  ];

  findings.forEach((f, i) => {
    const yPos = 1.7 + i * 1.0;
    s3.addShape("roundRect" as any, {
      x: 0.6, y: yPos, w: 8.8, h: 0.8,
      fill: { color: LIGHT_GRAY },
      rectRadius: 0.1,
    });
    s3.addShape("rect" as any, {
      x: 0.6, y: yPos, w: 0.06, h: 0.8,
      fill: { color: f.color },
    });
    s3.addText(f.cause, {
      x: 0.9, y: yPos + 0.05, w: 8.3, h: 0.3,
      fontSize: 13, fontFace: "Calibri", bold: true, color: NAVY,
    });
    s3.addText(f.detail, {
      x: 0.9, y: yPos + 0.35, w: 8.3, h: 0.4,
      fontSize: 11, fontFace: "Calibri", color: MID_GRAY,
    });
  });

  // ─── Slide 4: Key Questions ───────────────────────────────────────────────
  const s4 = addContentSlide(pptx, "Key Questions for the Customer");

  s4.addText("Before recommending changes, these are the questions I'd need answered:", {
    x: 0.6, y: 1.1, w: 8.8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: DARK_GRAY,
  });

  addBullets(s4, [
    "What's the traffic pattern? Steady load or spiky peaks tied to store hours?",
    "What are the actual SLAs? Is P95 latency under 3s acceptable, or do they need sub-second?",
    "How are prompts structured? Static system prompt + dynamic context, or fully dynamic?",
    "What embedding model and dimensions are they using? Have they benchmarked alternatives?",
    "Is there any caching layer today? If so, exact match or semantic?",
    "How many unique query patterns exist vs. repeated similar questions across stores?",
    "What does the inventory lookup integration look like? Is that a separate latency source?",
    "What's the team's deployment cadence? Can they iterate weekly or is this quarterly?",
  ], { y: 1.6, fontSize: 13 });

  // ─── Slide 5: Action Plan ─────────────────────────────────────────────────
  const s5 = addContentSlide(pptx, "Phased Action Plan");

  // Three columns for phases
  const phases = [
    {
      title: "Immediate\n(Week 1-2)",
      color: RED,
      items: [
        "Add request queuing with exponential backoff",
        "Implement semantic cache (Redis)",
        "Add per-stage latency instrumentation",
        "Set up rate limit monitoring alerts",
      ],
    },
    {
      title: "Short-term\n(Month 1)",
      color: AMBER,
      items: [
        "Deploy query routing (nano/mini/full)",
        "Enable prompt caching for static segments",
        "Optimize embedding to 512 dimensions",
        "Build evaluation harness for benchmarking",
      ],
    },
    {
      title: "Medium-term\n(Quarter)",
      color: GREEN,
      items: [
        "Scale to support 3 new teams",
        "Multi-tenant isolation and auth",
        "Automated quality regression testing",
        "Cost allocation dashboards per team",
      ],
    },
  ];

  phases.forEach((phase, i) => {
    const xPos = 0.4 + i * 3.15;

    // Phase header
    s5.addShape("roundRect" as any, {
      x: xPos, y: 1.1, w: 3.0, h: 0.75,
      fill: { color: phase.color },
      rectRadius: 0.08,
    });
    s5.addText(phase.title, {
      x: xPos, y: 1.1, w: 3.0, h: 0.75,
      fontSize: 12, fontFace: "Calibri", bold: true, color: WHITE,
      align: "center", valign: "middle",
    });

    // Phase items
    phase.items.forEach((item, j) => {
      s5.addShape("roundRect" as any, {
        x: xPos, y: 2.05 + j * 0.85, w: 3.0, h: 0.7,
        fill: { color: LIGHT_GRAY },
        rectRadius: 0.06,
      });
      s5.addText(item, {
        x: xPos + 0.15, y: 2.05 + j * 0.85, w: 2.7, h: 0.7,
        fontSize: 11, fontFace: "Calibri", color: DARK_GRAY, valign: "middle",
      });
    });
  });

  // ─── Slide 6: Architecture Tradeoffs ──────────────────────────────────────
  const s6 = addContentSlide(pptx, "Architecture Tradeoffs");

  const tradeoffs = [
    ["Model routing", "Nano/mini/full via classifier", "80% cost reduction, <5% quality loss"],
    ["Embedding dims", "512 vs 1536", "50% storage savings, negligible quality impact"],
    ["Cache strategy", "Semantic (cosine > 0.95)", "Catches paraphrased queries, 40-60% hit rate"],
    ["Vector DB", "Pinecone serverless", "100K free vectors, zero ops overhead"],
    ["Hosting", "Vercel serverless", "$0 idle cost, global CDN, instant deploys"],
    ["Chunking", "Heading-based (300-500 tokens)", "Preserves topical coherence per chunk"],
    ["Eval method", "GPT-4.1-nano as judge", "$0.0001 per eval, fast iteration cycles"],
  ];

  s6.addTable(
    [
      [
        { text: "Decision", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
        { text: "Choice", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
        { text: "Impact", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
      ],
      ...tradeoffs.map((row, i) =>
        row.map((cell) => ({
          text: cell,
          options: {
            fontSize: 10,
            fontFace: "Calibri",
            color: DARK_GRAY,
            fill: { color: i % 2 === 0 ? WHITE : LIGHT_GRAY },
          },
        }))
      ),
    ] as any,
    {
      x: 0.4,
      y: 1.15,
      w: 9.2,
      colW: [2.2, 3.0, 4.0],
      border: { type: "solid", pt: 0.5, color: "D1D5DB" },
      rowH: 0.45,
    }
  );

  // ─── Slide 7: Scaling Path ────────────────────────────────────────────────
  const s7 = addContentSlide(pptx, "Deployment & Scalability");

  const tiers = [
    ["Free (current)", "$0/mo", "~500 queries/day", "Vercel + Pinecone + Upstash free tiers"],
    ["Starter", "~$50/mo", "~5K queries/day", "Vercel Pro, Upstash PAYG, same code"],
    ["Growth", "~$200/mo", "~25K queries/day", "Pinecone Standard, dedicated cache"],
    ["Enterprise", "~$1K/mo", "~100K queries/day", "Volume discounts, multi-tenant, audit logs"],
    ["Scale", "$5K+/mo", "500K+ queries/day", "Migrate to AWS (EKS, ElastiCache, OpenSearch)"],
  ];

  s7.addTable(
    [
      [
        { text: "Tier", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
        { text: "Cost", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
        { text: "Capacity", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
        { text: "What Changes", options: { fill: { color: NAVY }, color: WHITE, bold: true, fontSize: 11, fontFace: "Calibri" } },
      ],
      ...tiers.map((row, i) =>
        row.map((c) => ({
          text: c,
          options: {
            fontSize: 10,
            fontFace: "Calibri",
            color: DARK_GRAY,
            fill: { color: i % 2 === 0 ? WHITE : LIGHT_GRAY },
          },
        }))
      ),
    ] as any,
    {
      x: 0.4,
      y: 1.15,
      w: 9.2,
      colW: [1.5, 1.2, 2.0, 4.5],
      border: { type: "solid", pt: 0.5, color: "D1D5DB" },
      rowH: 0.5,
    }
  );

  s7.addText("Tiers 1-3 require zero code changes. Just configuration.", {
    x: 0.6, y: 4.5, w: 8.8, h: 0.4,
    fontSize: 13, fontFace: "Calibri", bold: true, color: TEAL,
  });

  // ─── Slide 8: ROIP Demo ──────────────────────────────────────────────────
  const s8 = addContentSlide(pptx, "ROIP: What It Does");

  const features = [
    {
      title: "RAG Troubleshooting Chatbot",
      desc: "Ask about latency, errors, costs, scaling. Gets structured diagnosis with confidence scores, evidence, and prioritized actions.",
      route: "/chat",
      color: TEAL,
    },
    {
      title: "Knowledge Corpus Browser",
      desc: "35 curated documents. Semantic search across OpenAI docs, AWS ML Lens, RAG patterns, troubleshooting trees, and case studies.",
      route: "/corpus",
      color: BLUE,
    },
    {
      title: "Evaluation Harness",
      desc: "Run automated benchmarks across model configs. Compare quality, cost, and latency. GPT-4.1-nano judges relevance and completeness.",
      route: "/eval",
      color: GREEN,
    },
  ];

  features.forEach((f, i) => {
    const yPos = 1.2 + i * 1.5;

    s8.addShape("rect" as any, {
      x: 0.6, y: yPos, w: 0.06, h: 1.2,
      fill: { color: f.color },
    });

    s8.addText(f.title, {
      x: 0.9, y: yPos, w: 7.0, h: 0.4,
      fontSize: 15, fontFace: "Calibri", bold: true, color: NAVY,
    });

    s8.addText(f.desc, {
      x: 0.9, y: yPos + 0.4, w: 7.0, h: 0.7,
      fontSize: 12, fontFace: "Calibri", color: MID_GRAY,
    });

    s8.addText(f.route, {
      x: 8.2, y: yPos + 0.2, w: 1.4, h: 0.4,
      fontSize: 11, fontFace: "Calibri", italic: true, color: TEAL, align: "right",
    });
  });

  // ─── Slide 9: Why This Approach ───────────────────────────────────────────
  const s9 = addDarkSlide(pptx, "Why This Approach");

  const reasons = [
    "Shows I can diagnose RAG systems, not just describe them",
    "Uses OpenAI's latest APIs (Responses API, GPT-4.1 family, structured outputs)",
    "Demonstrates cost optimization thinking (query routing, caching, model selection)",
    "Includes a working evaluation framework -- I'd validate before recommending",
    "Ships fast: built in under 48 hours with zero-cost infrastructure",
    "Everything is measurable: latency, cost, quality, per query",
  ];

  reasons.forEach((r, i) => {
    s9.addText(`\u2022  ${r}`, {
      x: 0.8,
      y: 4.4 + i * 0.38,
      w: 8.4,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      color: WHITE,
    });
  });

  // ─── Slide 10: Thank You ──────────────────────────────────────────────────
  const s10 = pptx.addSlide();
  s10.background = { color: NAVY };

  s10.addText("Thank you.", {
    x: 0.8, y: 1.8, w: 8.4, h: 1.0,
    fontSize: 44, fontFace: "Calibri", bold: true, color: WHITE,
  });

  s10.addShape("rect" as any, {
    x: 0.8, y: 2.9, w: 1.5, h: 0.04,
    fill: { color: TEAL },
  });

  s10.addText("Max Greenberg", {
    x: 0.8, y: 3.3, w: 8.4, h: 0.5,
    fontSize: 20, fontFace: "Calibri", bold: true, color: WHITE,
  });

  s10.addText("github.com/realmwell/roip", {
    x: 0.8, y: 3.9, w: 8.4, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: TEAL,
  });

  // ─── Write file ───────────────────────────────────────────────────────────
  const outPath = path.resolve(__dirname, "../ROIP_Presentation.pptx");
  pptx.writeFile({ fileName: outPath }).then(() => {
    console.log(`Generated: ${outPath}`);
  });
}

main();

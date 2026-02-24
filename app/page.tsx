import Link from "next/link";
import {
  MessageSquare,
  Database,
  FlaskConical,
  BarChart3,
  ArrowRight,
  Zap,
  DollarSign,
  Layers,
  Search,
  Brain,
  GitCompareArrows,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data Flow Visualization                                                    */
/* -------------------------------------------------------------------------- */

function DataFlowDiagram() {
  const steps = [
    {
      label: "User Query",
      detail: "Natural language question",
      color: "border-teal",
      dotColor: "bg-teal",
    },
    {
      label: "Query Router",
      detail: "GPT-4.1-nano classifies intent",
      color: "border-blue",
      dotColor: "bg-blue",
    },
    {
      label: "Cache Check",
      detail: "Semantic match in Redis",
      color: "border-green",
      dotColor: "bg-green",
    },
    {
      label: "Vector Retrieval",
      detail: "Pinecone top-k search",
      color: "border-amber",
      dotColor: "bg-amber",
    },
    {
      label: "Response Generation",
      detail: "OpenAI Responses API (streaming)",
      color: "border-blue",
      dotColor: "bg-blue",
    },
    {
      label: "Structured Output",
      detail: "Diagnosis + actions + sources",
      color: "border-teal",
      dotColor: "bg-teal",
    },
  ];

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-surface-border" />
      <div className="space-y-5">
        {steps.map((step, i) => (
          <div key={step.label} className={`relative animate-fade-in-up stagger-${i + 1}`}>
            <div
              className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full ${step.dotColor} ring-2 ring-bg`}
            />
            <div className={`border-l-2 ${step.color} pl-4 py-1`}>
              <p className="text-sm font-semibold text-fg">{step.label}</p>
              <p className="text-xs text-muted-fg">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feature Card                                                               */
/* -------------------------------------------------------------------------- */

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  linkLabel,
  accentColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  accentColor: string;
  delay: string;
}) {
  return (
    <div
      className={`group relative rounded-xl bg-surface border border-surface-border p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-fade-in-up ${delay}`}
    >
      <div
        className={`flex items-center justify-center h-10 w-10 rounded-lg mb-4 ${accentColor}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-base font-semibold text-fg mb-2">{title}</h3>
      <p className="text-sm text-muted-fg leading-relaxed mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:text-blue transition-colors"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Metrics Row                                                                */
/* -------------------------------------------------------------------------- */

function MetricHighlight({
  value,
  label,
  sublabel,
  delay,
}: {
  value: string;
  label: string;
  sublabel: string;
  delay: string;
}) {
  return (
    <div className={`text-center animate-fade-in-up ${delay}`}>
      <div className="text-3xl font-bold text-blue">{value}</div>
      <div className="text-sm font-medium text-fg mt-1">{label}</div>
      <div className="text-xs text-green mt-0.5">{sublabel}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Architecture Layer                                                         */
/* -------------------------------------------------------------------------- */

function ArchLayer({
  label,
  labelColor,
  borderColor,
  services,
  delay,
}: {
  label: string;
  labelColor: string;
  borderColor: string;
  services: { icon: string; name: string; desc: string }[];
  delay: string;
}) {
  return (
    <div
      className={`relative rounded-xl border-2 ${borderColor} p-5 pt-6 animate-fade-in-up ${delay}`}
    >
      <span
        className={`absolute -top-2.5 left-4 bg-surface px-2 text-[11px] font-bold uppercase tracking-wider ${labelColor}`}
      >
        {label}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {services.map((s) => (
          <div
            key={s.name}
            className="bg-muted/50 rounded-lg p-3 text-center border border-surface-border hover:-translate-y-0.5 transition-transform cursor-default"
          >
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xs font-semibold text-fg">{s.name}</div>
            <div className="text-[10px] text-muted-fg mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Landing Page                                                               */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/*  Hero Section                                                       */}
      {/* ================================================================== */}
      <section className="hero-gradient text-white overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="animate-fade-in-up">
            <span className="inline-block bg-white/15 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-5">
              Enterprise RAG Tooling
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl animate-fade-in-up stagger-1">
            RAG Operations Intelligence Platform
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed animate-fade-in-up stagger-2">
            Diagnose production RAG issues, optimize OpenAI API usage, and plan
            phased enterprise rollouts. A working demo that ships the exact skills
            an AI Success Engineer needs.
          </p>

          <div className="flex flex-wrap gap-3 mt-8 animate-fade-in-up stagger-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-teal/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Try the Chatbot
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              How It Works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex gap-6 mt-10 text-[13px] text-white/60 animate-fade-in stagger-4">
            <span>Prepared by Max Greenberg</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">OpenAI ASE Take-Home</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">February 2026</span>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  Platform Highlights (Metrics Row)                                   */}
      {/* ================================================================== */}
      <section className="border-b border-surface-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <MetricHighlight value="$0" label="Monthly Hosting" sublabel="Free-tier stack" delay="stagger-1" />
            <MetricHighlight value="35+" label="Corpus Documents" sublabel="Curated knowledge" delay="stagger-2" />
            <MetricHighlight value="<50ms" label="Cache Hit Latency" sublabel="Redis semantic cache" delay="stagger-3" />
            <MetricHighlight value="3-tier" label="Model Routing" sublabel="nano / mini / full" delay="stagger-4" />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  What ROIP Does                                                      */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-fg">
              Three tools. One platform.
            </h2>
            <p className="mt-3 text-sm text-muted-fg max-w-xl mx-auto">
              ROIP bundles a troubleshooting chatbot, a searchable knowledge corpus,
              and an automated evaluation harness into a single deployed application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="RAG Troubleshooting Chatbot"
              description="An OpenAI-powered assistant that diagnoses latency, error rate, and cost issues in enterprise RAG deployments. Uses query routing and structured diagnosis outputs."
              href="/chat"
              linkLabel="Open chatbot"
              accentColor="bg-teal"
              delay="stagger-1"
            />
            <FeatureCard
              icon={Database}
              title="Knowledge Corpus"
              description="A curated, searchable collection of 35+ documents covering OpenAI platform docs, AWS ML best practices, RAG architecture patterns, and troubleshooting decision trees."
              href="/corpus"
              linkLabel="Browse corpus"
              accentColor="bg-blue"
              delay="stagger-2"
            />
            <FeatureCard
              icon={FlaskConical}
              title="Evaluation Harness"
              description="Automated quality, cost, and latency benchmarking with A/B comparison of optimization strategies across 55 predefined test queries."
              href="/eval"
              linkLabel="Run evaluation"
              accentColor="bg-green"
              delay="stagger-3"
            />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  How It Works (Data Flow)                                            */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-20 bg-surface border-y border-surface-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in">
                Data Flow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-fg mb-4 animate-fade-in-up stagger-1">
                Query to Diagnosis in Six Steps
              </h2>
              <p className="text-sm text-muted-fg leading-relaxed mb-8 max-w-lg animate-fade-in-up stagger-2">
                Every user question flows through a routing, caching, retrieval,
                and generation pipeline designed for speed and accuracy. Repeated
                queries hit the semantic cache and return in under 50ms.
              </p>

              <div className="code-block text-xs animate-fade-in-up stagger-3">
                <span className="comment">{"// Simplified pipeline"}</span>
                <br />
                <span className="func">query</span> {"->"}{" "}
                <span className="func">routeModel</span>(nano) {"->"}{" "}
                <span className="func">cacheCheck</span>(redis)
                <br />
                {"  "}<span className="keyword">HIT</span> {"->"} stream cached
                response {"(<50ms)"}
                <br />
                {"  "}<span className="keyword">MISS</span> {"->"}{" "}
                <span className="func">embed</span> {"->"}{" "}
                <span className="func">retrieve</span>(pinecone, top_k=5)
                <br />
                {"         "} {"->"}{" "}
                <span className="func">generate</span>(
                <span className="string">{'"gpt-4.1-mini"'}</span>, streaming)
                <br />
                {"         "} {"->"}{" "}
                <span className="func">cache</span> + <span className="func">record</span>{" "}
                metrics
              </div>
            </div>

            <div className="lg:pt-12">
              <DataFlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  Architecture Overview                                               */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-fg">
              Demo Stack Architecture
            </h2>
            <p className="mt-3 text-sm text-muted-fg max-w-xl mx-auto">
              Zero idle cost. Every service runs on a free tier. The ideal
              enterprise deployment uses AWS managed services; this demo proves
              the concept.
            </p>
          </div>

          <div className="space-y-4">
            <ArchLayer
              label="Presentation"
              labelColor="text-teal"
              borderColor="border-teal"
              delay="stagger-1"
              services={[
                { icon: "⚛️", name: "Next.js 16", desc: "App Router + SSR" },
                { icon: "🎨", name: "Tailwind CSS", desc: "Utility-first styling" },
                { icon: "🌙", name: "next-themes", desc: "Dark/light mode" },
                { icon: "☁️", name: "Vercel", desc: "Edge deployment" },
              ]}
            />
            <ArchLayer
              label="Intelligence"
              labelColor="text-green"
              borderColor="border-green"
              delay="stagger-2"
              services={[
                { icon: "🤖", name: "Responses API", desc: "GPT-4.1 mini/nano" },
                { icon: "🔍", name: "Embeddings", desc: "text-embedding-3-small" },
                { icon: "🧠", name: "Query Router", desc: "Nano-based classifier" },
                { icon: "💾", name: "Upstash Redis", desc: "Semantic cache layer" },
              ]}
            />
            <ArchLayer
              label="Data & Retrieval"
              labelColor="text-amber"
              borderColor="border-amber"
              delay="stagger-3"
              services={[
                { icon: "🔎", name: "Pinecone", desc: "Vector store (512d)" },
                { icon: "📚", name: "Corpus", desc: "35+ markdown docs" },
                { icon: "📊", name: "Metrics Store", desc: "Usage + latency tracking" },
                { icon: "🗂️", name: "Eval Sets", desc: "55 predefined queries" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  Why This Approach                                                   */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-20 bg-surface border-y border-surface-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-fg">
              Why build the tool instead of writing about it?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Demonstrates the techniques",
                text: "Query routing, prompt caching, semantic caching, and structured outputs are all used in the platform itself.",
                delay: "stagger-1",
              },
              {
                icon: Search,
                title: "Self-serve diagnostics",
                text: "Operators can troubleshoot common RAG issues without filing a ticket. Ask the chatbot, get a structured diagnosis.",
                delay: "stagger-2",
              },
              {
                icon: BarChart3,
                title: "Quantified optimization",
                text: "Run the evaluation harness to see exactly how much each optimization lever saves in cost and latency.",
                delay: "stagger-3",
              },
              {
                icon: Brain,
                title: "Onboarding accelerator",
                text: "New teams can explore RAG best practices and learn the system through the chatbot before going live.",
                delay: "stagger-4",
              },
              {
                icon: GitCompareArrows,
                title: "A/B testing built in",
                text: "Compare routing strategies, chunking configs, and retrieval parameters side by side with real metrics.",
                delay: "stagger-5",
              },
              {
                icon: DollarSign,
                title: "Zero idle cost",
                text: "Every service is on a free tier. The demo runs at $0/month when not in use. No infrastructure burden.",
                delay: "stagger-6",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`flex gap-4 animate-fade-in-up ${item.delay}`}
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-navy/10 dark:bg-navy-light/30 shrink-0">
                  <item.icon className="h-4.5 w-4.5 text-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-fg mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-fg leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  Query Routing Table                                                 */}
      {/* ================================================================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 animate-fade-in-up">
            <span className="inline-block bg-blue/10 text-blue px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              Query Routing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-fg">
              Three models. One pipeline.
            </h2>
            <p className="mt-3 text-sm text-muted-fg max-w-xl">
              A GPT-4.1-nano classifier routes each query to the cheapest model
              that can handle it, cutting inference cost by 60-75%.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-surface-border shadow-sm animate-fade-in-up stagger-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-4 py-3 font-semibold">Query Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Model</th>
                  <th className="text-left px-4 py-3 font-semibold">Cost/Query</th>
                  <th className="text-left px-4 py-3 font-semibold">Latency</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Example</th>
                </tr>
              </thead>
              <tbody className="bg-surface">
                {[
                  ["Simple FAQ", "GPT-4.1-nano", "~$0.001", "<300ms", '"What is prompt caching?"'],
                  ["Standard troubleshoot", "GPT-4.1-mini", "~$0.005", "<800ms", '"Why are my 429s spiking?"'],
                  ["Complex analysis", "GPT-4.1", "~$0.02", "<2s", '"Design a routing strategy for 3 teams"'],
                  ["Greeting / meta", "No retrieval", "~$0.0002", "<200ms", '"Hello" / "Thanks"'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                    <td className="px-4 py-3 font-medium text-fg">{row[0]}</td>
                    <td className="px-4 py-3 text-muted-fg">{row[1]}</td>
                    <td className="px-4 py-3 text-muted-fg">{row[2]}</td>
                    <td className="px-4 py-3 text-muted-fg">{row[3]}</td>
                    <td className="px-4 py-3 text-muted-fg text-xs hidden sm:table-cell">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  CTA Footer                                                          */}
      {/* ================================================================== */}
      <section className="hero-gradient text-white">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            See it in action
          </h2>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-8">
            The chatbot, corpus browser, and evaluation harness are all live.
            Ask a question, search the knowledge base, or run an eval.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-teal/20 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Open Chatbot
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              View Dashboard
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              <Layers className="h-4 w-4" />
              About ROIP
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  Footer                                                              */}
      {/* ================================================================== */}
      <footer className="bg-navy-dark text-white/50 text-xs py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <span>ROIP by Max Greenberg. OpenAI ASE Take-Home, February 2026.</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white/80 transition-colors">
              About
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

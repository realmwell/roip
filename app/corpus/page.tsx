"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Cloud,
  Layers,
  AlertTriangle,
  Briefcase,
  Loader2,
} from "lucide-react";
import SearchBar from "@/components/corpus/SearchBar";
import DocumentCard from "@/components/corpus/DocumentCard";
import CategoryFilter from "@/components/corpus/CategoryFilter";
import ThemeToggle from "@/components/layout/ThemeToggle";

/* ---------- Types ---------- */

interface SearchResult {
  id: string;
  score: number;
  title: string;
  category: string;
  content: string;
  sourceUrl?: string;
  tags?: string[];
}

/* ---------- Category cards for the default view ---------- */

const HERO_CARDS = [
  {
    id: "openai-platform",
    label: "OpenAI Platform",
    count: 12,
    icon: Layers,
    color: "border-blue/40 hover:border-blue",
    iconColor: "text-blue",
    desc: "Models, rate limits, structured outputs, batch API, and more.",
  },
  {
    id: "aws-ml-lens",
    label: "AWS ML Lens",
    count: 6,
    icon: Cloud,
    color: "border-amber/40 hover:border-amber",
    iconColor: "text-amber",
    desc: "Well-Architected ML workloads covering reliability, cost, and security.",
  },
  {
    id: "rag-patterns",
    label: "RAG Patterns",
    count: 8,
    icon: BookOpen,
    color: "border-teal/40 hover:border-teal",
    iconColor: "text-teal",
    desc: "Chunking, hybrid retrieval, evaluation frameworks, and caching.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    count: 6,
    icon: AlertTriangle,
    color: "border-red/40 hover:border-red",
    iconColor: "text-red",
    desc: "Diagnosis trees for latency, errors, costs, and migration issues.",
  },
  {
    id: "case-studies",
    label: "Case Studies",
    count: 3,
    icon: Briefcase,
    color: "border-green/40 hover:border-green",
    iconColor: "text-green",
    desc: "Real-world RAG optimization, migration, and scaling stories.",
  },
];

/* ---------- Page Component ---------- */

export default function CorpusPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState("");

  /* Derive counts from results */
  const categoryCounts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  /* Filtered results based on sidebar selection */
  const displayed = selectedCategory
    ? results.filter((r) => r.category === selectedCategory)
    : results;

  /* Search handler (passed to SearchBar) */
  const handleSearch = useCallback(
    async (query: string) => {
      setActiveQuery(query);

      if (!query) {
        setResults([]);
        setHasSearched(false);
        setSelectedCategory(null);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const params = new URLSearchParams({ q: query });
        const res = await fetch(`/api/corpus/search?${params}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* Click a hero category card to search by category name */
  function handleCategoryCardClick(categoryId: string, label: string) {
    setSelectedCategory(categoryId);
    setActiveQuery(label);
    setHasSearched(true);
    setLoading(true);

    const params = new URLSearchParams({ q: label, cat: categoryId });
    fetch(`/api/corpus/search?${params}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </a>
            <span className="text-surface-border">/</span>
            <h1 className="text-sm font-semibold text-fg">Knowledge Corpus</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            resultCount={hasSearched && !loading ? displayed.length : undefined}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="lg:sticky lg:top-20 rounded-xl border border-surface-border bg-surface p-3">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                counts={hasSearched ? categoryCounts : undefined}
              />
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
                <span className="ml-2 text-sm text-muted-fg">Searching...</span>
              </div>
            )}

            {/* Default view: category hero cards */}
            {!loading && !hasSearched && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-fg mb-1">
                    Browse by Category
                  </h2>
                  <p className="text-sm text-muted-fg">
                    Select a category or search above to explore the knowledge base.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {HERO_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        onClick={() =>
                          handleCategoryCardClick(card.id, card.label)
                        }
                        className={`text-left rounded-xl border bg-surface p-5 ${card.color} group`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                          <span className="font-semibold text-fg text-sm">
                            {card.label}
                          </span>
                          <span className="ml-auto text-xs text-muted-fg tabular-nums">
                            {card.count} docs
                          </span>
                        </div>
                        <p className="text-sm text-muted-fg leading-relaxed">
                          {card.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results grid */}
            {!loading && hasSearched && displayed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayed.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    category={doc.category}
                    score={doc.score}
                    content={doc.content}
                    sourceUrl={doc.sourceUrl}
                    tags={doc.tags}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && hasSearched && displayed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BookOpen className="h-10 w-10 text-muted-fg mb-3 opacity-40" />
                <p className="text-sm text-muted-fg">
                  No documents found
                  {activeQuery ? ` for "${activeQuery}"` : ""}.
                </p>
                <p className="text-xs text-muted-fg mt-1">
                  Try a different search term or clear the category filter.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

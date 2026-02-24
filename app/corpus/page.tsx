"use client";

import { useCallback, useEffect, useState } from "react";
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

interface CorpusDoc {
  id: string;
  score?: number;
  title: string;
  category: string;
  content: string;
  sourceUrl?: string;
  tags?: string[];
}

/* ---------- Category hero cards ---------- */

const HERO_CARDS = [
  {
    id: "openai-platform",
    label: "OpenAI Platform",
    icon: Layers,
    color: "border-blue/40 hover:border-blue",
    iconColor: "text-blue",
    desc: "Models, rate limits, structured outputs, batch API, and more.",
  },
  {
    id: "aws-ml-lens",
    label: "AWS ML Lens",
    icon: Cloud,
    color: "border-amber/40 hover:border-amber",
    iconColor: "text-amber",
    desc: "Well-Architected ML workloads covering reliability, cost, and security.",
  },
  {
    id: "rag-patterns",
    label: "RAG Patterns",
    icon: BookOpen,
    color: "border-teal/40 hover:border-teal",
    iconColor: "text-teal",
    desc: "Chunking, hybrid retrieval, evaluation frameworks, and caching.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: AlertTriangle,
    color: "border-red/40 hover:border-red",
    iconColor: "text-red",
    desc: "Diagnosis trees for latency, errors, costs, and migration issues.",
  },
  {
    id: "case-studies",
    label: "Case Studies",
    icon: Briefcase,
    color: "border-green/40 hover:border-green",
    iconColor: "text-green",
    desc: "Real-world RAG optimization, migration, and scaling stories.",
  },
];

/* ---------- Page Component ---------- */

export default function CorpusPage() {
  /* All corpus docs (loaded once from /api/corpus/list) */
  const [allDocs, setAllDocs] = useState<CorpusDoc[]>([]);
  const [allDocsLoading, setAllDocsLoading] = useState(true);

  /* Search state */
  const [searchResults, setSearchResults] = useState<CorpusDoc[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");

  /* Category filter */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /* Load all docs on mount */
  useEffect(() => {
    fetch("/api/corpus/list")
      .then((res) => res.json())
      .then((data) => setAllDocs(data.results ?? []))
      .catch(() => setAllDocs([]))
      .finally(() => setAllDocsLoading(false));
  }, []);

  /* Compute category counts from the full corpus */
  const categoryCounts = allDocs.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {});

  /* What to display */
  const source = isSearching ? searchResults : allDocs;
  const displayed = selectedCategory
    ? source.filter((d) => d.category === selectedCategory)
    : source;

  /* Whether we're in "browse" mode (show hero cards) vs "list" mode */
  const showHeroCards = !isSearching && !selectedCategory && !allDocsLoading;
  const showDocList = isSearching || selectedCategory !== null;

  /* Search handler */
  const handleSearch = useCallback(
    async (query: string) => {
      setActiveQuery(query);

      if (!query) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchLoading(true);

      try {
        const params = new URLSearchParams({ q: query });
        if (selectedCategory) params.set("cat", selectedCategory);
        const res = await fetch(`/api/corpus/search?${params}`);
        const data = await res.json();
        setSearchResults(data.results ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [selectedCategory]
  );

  /* Click a hero category card */
  function handleCategoryCardClick(categoryId: string) {
    setSelectedCategory(categoryId);
    /* No search needed — we filter allDocs locally */
  }

  /* Handle category sidebar clicks */
  function handleCategorySelect(cat: string | null) {
    setSelectedCategory(cat);
  }

  const loading = allDocsLoading || searchLoading;

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
            {!allDocsLoading && (
              <span className="text-xs text-muted-fg ml-1">
                ({allDocs.length} documents)
              </span>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            resultCount={isSearching && !searchLoading ? displayed.length : undefined}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="lg:sticky lg:top-20 rounded-xl border border-surface-border bg-surface p-3">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={handleCategorySelect}
                counts={allDocs.length > 0 ? categoryCounts : undefined}
              />
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
                <span className="ml-2 text-sm text-muted-fg">
                  {allDocsLoading ? "Loading corpus..." : "Searching..."}
                </span>
              </div>
            )}

            {/* Default browse view: category hero cards */}
            {!loading && showHeroCards && (
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
                    const count = categoryCounts[card.id] ?? 0;
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCategoryCardClick(card.id)}
                        className={`text-left rounded-xl border bg-surface p-5 ${card.color} group`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                          <span className="font-semibold text-fg text-sm">
                            {card.label}
                          </span>
                          <span className="ml-auto text-xs text-muted-fg tabular-nums">
                            {count} docs
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

            {/* Document list (category browse or search results) */}
            {!loading && showDocList && displayed.length > 0 && (
              <div>
                {/* Category heading when browsing */}
                {selectedCategory && !isSearching && (
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-fg">
                      {HERO_CARDS.find((c) => c.id === selectedCategory)?.label ??
                        selectedCategory}
                    </h2>
                    <span className="text-sm text-muted-fg">
                      {displayed.length} document{displayed.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayed.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      category={doc.category}
                      score={doc.score ?? 1}
                      content={doc.content}
                      sourceUrl={doc.sourceUrl}
                      tags={doc.tags}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All docs grid when no category selected and not searching */}
            {!loading && !showHeroCards && !showDocList && displayed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayed.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    category={doc.category}
                    score={doc.score ?? 1}
                    content={doc.content}
                    sourceUrl={doc.sourceUrl}
                    tags={doc.tags}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && showDocList && displayed.length === 0 && (
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

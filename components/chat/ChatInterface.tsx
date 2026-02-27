"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { ArrowUp, Loader2, MessageSquare, Sparkles } from "lucide-react";
import MessageBubble, { type Message } from "./MessageBubble";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChatInterfaceProps {
  initialQuery?: string | null;
}

export default function ChatInterface({ initialQuery }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listen for example card clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        setInput(detail);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("ragoip:set-input", handler);
    return () => window.removeEventListener("ragoip:set-input", handler);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  // -------------------------------------------------------------------
  // Submit handler
  // -------------------------------------------------------------------

  const submitQuery = useCallback(async (query: string) => {
    if (!query.trim() || isStreaming) return;

    const trimmed = query.trim();

    // Generate conversation ID on first message
    const cid = conversationId ?? nanoid();
    if (!conversationId) setConversationId(cid);

    // Add user message
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Placeholder for assistant response
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, conversationId: cid }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${errText || res.statusText}`,
          };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Error: Could not read response stream.",
          };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the last (assistant) message in-place
        const snapshot = accumulated;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: snapshot,
          };
          return updated;
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Error: ${errMsg}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, conversationId]);

  const handleSubmit = useCallback(() => {
    submitQuery(input);
  }, [input, submitQuery]);

  // Auto-submit initial query from URL param
  const initialQuerySubmitted = useRef(false);
  useEffect(() => {
    if (initialQuery && !initialQuerySubmitted.current && messages.length === 0) {
      initialQuerySubmitted.current = true;
      submitQuery(initialQuery);
    }
  }, [initialQuery, submitQuery, messages.length]);

  // -------------------------------------------------------------------
  // Follow-up chip handler
  // -------------------------------------------------------------------

  const handleFollowUp = useCallback((question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  }, []);

  // -------------------------------------------------------------------
  // Key handler (Enter to submit, Shift+Enter for newline)
  // -------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // -------------------------------------------------------------------
  // New conversation
  // -------------------------------------------------------------------

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  }, []);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} onFollowUp={handleFollowUp} />
          ))
        )}

        {/* Thinking indicator */}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-muted-fg text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-teal" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-surface-border bg-surface/80 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about RAG operations, troubleshooting, costs..."
              rows={1}
              disabled={isStreaming}
              className="w-full resize-none rounded-xl border border-surface-border bg-muted/50 px-4 py-3 pr-12 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal/40 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isStreaming || !input.trim()}
              className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-teal text-white hover:bg-teal/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleNewConversation}
              className="shrink-0 p-2.5 rounded-xl border border-surface-border text-muted-fg hover:text-fg hover:bg-muted/50 transition-colors"
              aria-label="New conversation"
              title="New conversation"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-muted-fg mt-2">
          RAGOIP uses RAG with OpenAI models. Responses may not always be accurate.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-teal/10 mb-6">
        <Sparkles className="h-8 w-8 text-teal" />
      </div>
      <h2 className="text-xl font-semibold text-fg mb-2">
        RAG Operations Advisor
      </h2>
      <p className="text-sm text-muted-fg max-w-md mb-8">
        Ask me about troubleshooting latency, reducing costs, scaling your RAG
        pipeline, or anything related to OpenAI API operations.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {EXAMPLE_QUERIES.map((q) => (
          <ExampleCard key={q.label} label={q.label} query={q.query} />
        ))}
      </div>
    </div>
  );
}

const EXAMPLE_QUERIES = [
  {
    label: "Diagnose latency",
    query: "Our RAG pipeline P95 latency jumped from 1.2s to 4.8s after we switched to GPT-4.1. What should we check?",
  },
  {
    label: "Reduce costs",
    query: "We're spending $12k/month on OpenAI API calls for our RAG system. How can we cut costs by 50%?",
  },
  {
    label: "Handle rate limits",
    query: "We keep hitting 429 rate limit errors during peak hours with 500 concurrent users. How do we fix this?",
  },
  {
    label: "Caching strategy",
    query: "What's the best approach for semantic caching with Redis for a RAG application?",
  },
];

function ExampleCard({ label, query }: { label: string; query: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Find the textarea and set its value via a custom event
        const event = new CustomEvent("ragoip:set-input", { detail: query });
        window.dispatchEvent(event);
      }}
      className="text-left p-3 rounded-xl border border-surface-border bg-surface hover:bg-muted/50 transition-colors group cursor-pointer"
    >
      <span className="text-xs font-medium text-teal group-hover:text-teal/80">
        {label}
      </span>
      <p className="text-xs text-muted-fg mt-1 line-clamp-2">{query}</p>
    </button>
  );
}

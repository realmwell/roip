"use client";

import { useState } from "react";
import { ArrowLeft, Clock, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

// ---------------------------------------------------------------------------
// Sidebar conversation history (local state for now)
// ---------------------------------------------------------------------------

interface ConversationStub {
  id: string;
  title: string;
  timestamp: number;
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations] = useState<ConversationStub[]>([]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } shrink-0 border-r border-surface-border bg-surface overflow-hidden transition-all duration-200`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <span className="text-sm font-semibold text-fg">History</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-muted-fg hover:text-fg hover:bg-muted/50 transition-colors"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* New chat button */}
          <div className="px-3 py-2">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-surface-border text-muted-fg hover:text-fg hover:border-teal/40 hover:bg-teal/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New conversation
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 py-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock className="h-8 w-8 text-muted-fg/50 mb-2" />
                <p className="text-xs text-muted-fg">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-fg hover:bg-muted/50 transition-colors truncate"
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-surface-border bg-surface/80 backdrop-blur-sm">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-muted-fg hover:text-fg hover:bg-muted/50 transition-colors"
              aria-label="Open sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <a
            href="/"
            className="flex items-center gap-1.5 text-muted-fg hover:text-fg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </a>
          <div className="flex-1" />
          <h1 className="text-sm font-semibold text-fg">ROIP Chat</h1>
          <div className="flex-1" />
          {/* Spacer for centering */}
          <div className="w-20" />
        </header>

        {/* Chat interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

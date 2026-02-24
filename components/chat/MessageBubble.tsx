"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Loader2 } from "lucide-react";
import DiagnosisCard, { type DiagnosisData } from "./DiagnosisCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  onFollowUp?: (question: string) => void;
}

// ---------------------------------------------------------------------------
// JSON detection helpers
// ---------------------------------------------------------------------------

function tryParseDiagnosis(content: string): DiagnosisData | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (
      parsed.diagnosis &&
      parsed.recommended_actions &&
      Array.isArray(parsed.recommended_actions) &&
      parsed.sources &&
      parsed.follow_up_questions
    ) {
      return parsed as DiagnosisData;
    }
  } catch {
    // Not valid JSON yet
  }
  return null;
}

/**
 * Detect when the assistant is mid-stream outputting JSON that isn't
 * parseable yet. We show a loading state instead of raw JSON text.
 */
function isStreamingJSON(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    JSON.parse(trimmed);
    return false; // valid JSON — not mid-stream
  } catch {
    return true; // starts with { but isn't valid JSON yet — still streaming
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const diagnosisData = useMemo(
    () => (isUser ? null : tryParseDiagnosis(message.content)),
    [isUser, message.content]
  );

  const streamingJSON = useMemo(
    () => (isUser ? false : !diagnosisData && isStreamingJSON(message.content)),
    [isUser, diagnosisData, message.content]
  );

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? "bg-blue/20 text-blue" : "bg-teal/20 text-teal"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={`min-w-0 max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue text-white rounded-br-md"
            : "bg-surface border border-surface-border text-fg rounded-bl-md"
        }`}
      >
        {streamingJSON ? (
          <div className="flex items-center gap-2.5 py-1">
            <Loader2 className="h-4 w-4 animate-spin text-teal" />
            <span className="text-sm text-muted-fg">
              Analyzing and building diagnosis...
            </span>
          </div>
        ) : diagnosisData ? (
          <DiagnosisCard data={diagnosisData} onFollowUp={onFollowUp} />
        ) : isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-2 prose-code:text-teal prose-a:text-teal">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

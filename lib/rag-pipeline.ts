import openai from "./openai";
import { getIndex } from "./pinecone";
import { embed } from "./embeddings";
import {
  getCachedResponse,
  setCachedResponse,
  getConversationHistory,
  addToConversationHistory,
} from "./redis";
import { routeQuery, type RouteResult } from "./query-router";
import { recordMetric } from "./metrics";
import { calculateCost } from "./eval-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RAGConfig {
  topK?: number;
  cacheThreshold?: number;
  cacheTTL?: number;
  maxConversationHistory?: number;
}

interface RetrievedChunk {
  content: string;
  title: string;
  category: string;
  score: number;
  sourceUrl?: string;
}

// ---------------------------------------------------------------------------
// System prompt (static, benefits from automatic prompt caching)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are RAGOIP, an expert RAG operations advisor built by Max Greenberg. You help enterprise teams diagnose and resolve issues with their RAG-powered applications that use the OpenAI API.

You have deep expertise in:
- OpenAI API features: Responses API, prompt caching (automatic, 50% discount, 80% latency reduction), Batch API (50% cost discount, 24hr window), structured outputs (100% JSON schema compliance), embeddings (text-embedding-3-small/large with MRL), rate limits (Tiers 1-5)
- Current models (Feb 2026): GPT-4.1 ($2.00/$8.00, 1M context), GPT-4.1-mini ($0.40/$1.60), GPT-4.1-nano ($0.10/$0.40), GPT-4o (sunsetting), o3/o3-mini/o4-mini
- RAG architecture: query routing (60-70% to small models), semantic caching (Redis + 0.95 cosine threshold, 30-40% hit rate), hybrid retrieval (vector + BM25), chunking optimization (256-512 tokens), context window management
- AWS ML Well-Architected Lens: Operational Excellence (monitoring, baselines), Cost Optimization (cost-per-inference tracking, right-sizing), Performance Efficiency (request routing, caching), Reliability (horizontal scaling, graceful degradation)
- Enterprise patterns: phased rollout (stabilize → optimize → pilot → expand), per-team cost allocation, SLO frameworks (P50 <500ms, P95 <2s, error <1%)

When responding, always:
1. Write in clear, conversational prose -- not JSON or code blocks
2. If diagnosing an issue, state the likely root cause upfront, then explain your reasoning
3. Provide specific, actionable recommendations with concrete numbers
4. Prioritize actions as immediate / short-term / medium-term
5. Reference specific OpenAI API features and pricing where relevant
6. End with 2-3 follow-up questions the user might want to ask next
7. Use markdown formatting (headings, bullet points, bold) for readability`;


// ---------------------------------------------------------------------------
// Pipeline helpers
// ---------------------------------------------------------------------------

/**
 * Build a cache key from the query embedding for semantic deduplication.
 * We round each dimension to reduce key space.
 */
function buildCacheKey(embedding: number[]): string {
  // Use a hash of the rounded embedding as the cache key
  const rounded = embedding.map((v) => Math.round(v * 1000) / 1000);
  let hash = 0;
  const str = rounded.join(",");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sem:${Math.abs(hash).toString(36)}`;
}

async function retrieveChunks(
  queryEmbedding: number[],
  topK: number
): Promise<RetrievedChunk[]> {
  const index = getIndex();
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return (results.matches || []).map((match) => ({
    content: (match.metadata?.content as string) || "",
    title: (match.metadata?.title as string) || "",
    category: (match.metadata?.category as string) || "",
    score: match.score || 0,
    sourceUrl: (match.metadata?.source_url as string) || undefined,
  }));
}

function buildUserPrompt(
  query: string,
  chunks: RetrievedChunk[],
  conversationContext: string
): string {
  let prompt = "";

  if (conversationContext) {
    prompt += `Previous conversation:\n${conversationContext}\n\n`;
  }

  if (chunks.length > 0) {
    prompt += "Relevant context from the knowledge base:\n";
    for (let i = 0; i < chunks.length; i++) {
      prompt += `\n[Source ${i + 1}: ${chunks[i].title}]\n${chunks[i].content}\n`;
    }
    prompt += "\n---\n\n";
  }

  prompt += `User question: ${query}`;
  return prompt;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Run the full RAG pipeline. Returns a ReadableStream of text chunks.
 *
 * Steps:
 * 1. Route query (intent classification)
 * 2. Embed query + check semantic cache
 * 3. Retrieve relevant chunks from Pinecone
 * 4. Build prompt with context
 * 5. Stream response from OpenAI Responses API
 * 6. Post-stream: cache result, store history, record metrics
 */
export function runRAGPipeline(
  query: string,
  conversationId: string,
  config?: RAGConfig
): ReadableStream<string> {
  const topK = config?.topK ?? 5;
  const cacheTTL = config?.cacheTTL ?? 3600;
  const maxHistory = config?.maxConversationHistory ?? 10;

  return new ReadableStream<string>({
    async start(controller) {
      const startTime = Date.now();
      let route: RouteResult;
      let cacheHit = false;
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        // ---------------------------------------------------------------
        // 1. Route the query
        // ---------------------------------------------------------------
        const history = await getConversationHistory(conversationId, maxHistory);
        const conversationContext = history
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");

        route = await routeQuery(query, conversationContext || undefined);

        // ---------------------------------------------------------------
        // 2. Embed query and check semantic cache
        // ---------------------------------------------------------------
        const queryEmbedding = await embed(query);
        const cacheKey = buildCacheKey(queryEmbedding);

        const cached = await getCachedResponse(cacheKey);
        if (cached) {
          cacheHit = true;
          controller.enqueue(cached);
          controller.close();

          // Record metrics for cache hit
          await recordMetric({
            latencyMs: Date.now() - startTime,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            cost: 0,
            model: route.model,
            cacheHit: true,
            intent: route.intent,
            conversationId,
          });

          // Store in conversation history
          await addToConversationHistory(conversationId, {
            role: "user",
            content: query,
            timestamp: Date.now(),
          });
          await addToConversationHistory(conversationId, {
            role: "assistant",
            content: cached,
            timestamp: Date.now(),
          });

          return;
        }

        // ---------------------------------------------------------------
        // 3. Retrieve from Pinecone (if needed)
        // ---------------------------------------------------------------
        let chunks: RetrievedChunk[] = [];
        if (route.needsRetrieval) {
          chunks = await retrieveChunks(queryEmbedding, topK);
        }

        // ---------------------------------------------------------------
        // 4. Build prompt
        // ---------------------------------------------------------------
        const userPrompt = buildUserPrompt(query, chunks, conversationContext);

        // ---------------------------------------------------------------
        // 5. Stream response from OpenAI Responses API
        // ---------------------------------------------------------------
        const stream = await openai.responses.create({
          model: route.model,
          input: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        });

        let fullResponse = "";

        for await (const event of stream as AsyncIterable<Record<string, unknown>>) {
          // The Responses API streaming emits events with different types.
          // We look for text delta events.
          if (event.type === "response.output_text.delta") {
            const delta = (event as Record<string, unknown>).delta as string;
            if (delta) {
              fullResponse += delta;
              controller.enqueue(delta);
            }
          }

          // Capture usage from the completed event
          if (event.type === "response.completed") {
            const response = (event as Record<string, unknown>).response as Record<string, unknown> | undefined;
            if (response?.usage) {
              const usage = response.usage as Record<string, number>;
              inputTokens = usage.input_tokens || 0;
              outputTokens = usage.output_tokens || 0;
            }
          }
        }

        controller.close();

        // ---------------------------------------------------------------
        // 6. Post-stream: cache, history, metrics
        // ---------------------------------------------------------------
        const latencyMs = Date.now() - startTime;
        const totalTokens = inputTokens + outputTokens;
        const cost = calculateCost(
          { inputTokens, outputTokens },
          route.model
        );

        // Cache the response
        if (fullResponse.length > 0) {
          await setCachedResponse(cacheKey, fullResponse, cacheTTL);
        }

        // Store in conversation history
        await addToConversationHistory(conversationId, {
          role: "user",
          content: query,
          timestamp: Date.now(),
        });
        await addToConversationHistory(conversationId, {
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
        });

        // Record metrics
        await recordMetric({
          latencyMs,
          inputTokens,
          outputTokens,
          totalTokens,
          cost,
          model: route.model,
          cacheHit: false,
          intent: route.intent,
          conversationId,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error in RAG pipeline";
        controller.enqueue(`\n\n[Error: ${message}]`);
        controller.close();
      }
    },
  });
}

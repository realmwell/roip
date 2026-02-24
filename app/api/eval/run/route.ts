// POST: Run evaluation with specified config
// GET: Get results for a specific run
// POST body: { querySet: string, config: { model, routing, topK, cacheEnabled } }

import { nanoid } from 'nanoid';
import redis from '@/lib/redis';
import { evaluateResponse, aggregateResults, calculateCost } from '@/lib/eval-engine';
import { routeQuery } from '@/lib/query-router';
import { embed } from '@/lib/embeddings';
import { getIndex } from '@/lib/pinecone';
import openai from '@/lib/openai';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300; // 5 minute timeout for eval runs

// Load eval query set from JSON files
async function loadQuerySet(name: string) {
  const filePath = path.join(process.cwd(), 'eval-sets', `${name}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function POST(req: Request) {
  try {
    const { querySet, config } = await req.json();

    const evalSet = await loadQuerySet(querySet);
    const runId = nanoid(12);
    const results: any[] = [];

    for (const q of evalSet.queries) {
      const start = Date.now();

      try {
        // Route the query
        const routing = config.routing === 'single'
          ? { intent: 'general' as const, complexity: 'medium' as const, model: config.model, needsRetrieval: true }
          : await routeQuery(q.query);

        // Override model if single-model config
        const model = config.routing === 'single' ? config.model : routing.model;

        // Embed and retrieve
        let context: string[] = [];
        if (routing.needsRetrieval) {
          const queryEmbedding = await embed(q.query);
          const index = getIndex();
          const searchResults = await index.query({
            vector: queryEmbedding,
            topK: config.topK || 5,
            includeMetadata: true,
          });
          context = (searchResults.matches || []).map(m => m.metadata?.content as string).filter(Boolean);
        }

        // Build messages for the model
        const messages: any[] = [
          { role: 'user', content: q.query },
        ];

        if (context.length > 0) {
          messages.unshift({
            role: 'user',
            content: `Context from knowledge base:\n\n${context.join('\n\n---\n\n')}\n\nBased on this context, answer the following question:`,
          });
        }

        // Call OpenAI
        const response = await openai.responses.create({
          model,
          input: messages,
        });

        const latency = Date.now() - start;
        const usage = response.usage;

        // Score the response
        const scores = await evaluateResponse(
          q.query,
          response.output_text,
          context
        );

        const cost = calculateCost(
          { inputTokens: usage?.input_tokens || 0, outputTokens: usage?.output_tokens || 0 },
          model
        );

        results.push({
          query: q.query,
          expectedTopics: q.expected_topics,
          response: response.output_text,
          latency,
          tokens: {
            input: usage?.input_tokens || 0,
            output: usage?.output_tokens || 0,
            total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
          },
          cost,
          model,
          cacheHit: false,
          scores,
        });
      } catch (err) {
        results.push({
          query: q.query,
          error: (err as Error).message,
          latency: Date.now() - start,
          tokens: { input: 0, output: 0, total: 0 },
          cost: 0,
          model: config.model,
          cacheHit: false,
          scores: { relevance: 0, completeness: 0 },
        });
      }
    }

    const summary = aggregateResults(results);

    // Store the run in Redis
    await redis.set(`eval:run:${runId}`, JSON.stringify({
      id: runId,
      querySet,
      config,
      results,
      summary,
      timestamp: new Date().toISOString(),
    }), { ex: 86400 * 7 }); // 7 day TTL

    // Add to eval runs list
    await redis.lpush('eval:runs', runId);

    return Response.json({ runId, summary, results });
  } catch (error) {
    console.error('Eval run error:', error);
    return Response.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (runId) {
      const data = await redis.get(`eval:run:${runId}`);
      if (!data) {
        return Response.json({ error: 'Run not found' }, { status: 404 });
      }
      return Response.json(typeof data === 'string' ? JSON.parse(data) : data);
    }

    // List recent runs
    const runIds = await redis.lrange('eval:runs', 0, 19);
    const runs = [];
    for (const id of runIds) {
      const data = await redis.get(`eval:run:${id}`);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        runs.push({
          id: parsed.id,
          querySet: parsed.querySet,
          config: parsed.config,
          summary: parsed.summary,
          timestamp: parsed.timestamp,
        });
      }
    }
    return Response.json({ runs });
  } catch (error) {
    console.error('Eval get error:', error);
    return Response.json({ error: 'Failed to get eval results' }, { status: 500 });
  }
}

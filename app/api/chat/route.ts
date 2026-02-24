// POST handler for RAG chat pipeline with streaming
// Uses Vercel AI SDK for streaming responses
// Accepts: { query: string, conversationId?: string }
// Returns: streaming text response with custom headers for metadata

import { runRAGPipeline } from '@/lib/rag-pipeline';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { query, conversationId } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const stream = runRAGPipeline(query, conversationId);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

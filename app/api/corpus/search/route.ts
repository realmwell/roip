// GET handler for corpus search
// Query params: q (search query), cat (optional category filter)
// Returns: array of search results with scores

import { embed } from '@/lib/embeddings';
import { getIndex } from '@/lib/pinecone';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const category = searchParams.get('cat');

    if (!q) {
      return Response.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const embedding = await embed(q);
    const index = getIndex();

    const filter = category ? { category: { $eq: category } } : undefined;

    const results = await index.query({
      vector: embedding,
      topK: 20,
      filter,
      includeMetadata: true,
    });

    return Response.json({
      results: (results.matches || []).map(m => ({
        id: m.id,
        score: m.score,
        title: m.metadata?.title,
        category: m.metadata?.category,
        content: m.metadata?.content,
        sourceUrl: m.metadata?.source_url,
        tags: m.metadata?.tags,
      })),
    });
  } catch (error) {
    console.error('Corpus search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}

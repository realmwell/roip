// GET handler for corpus search
// Query params: q (search query), cat (optional category filter)
// Returns: deduplicated search results (one per document title, best score wins)

import { embed } from '@/lib/embeddings';
import { getIndex } from '@/lib/pinecone';

interface SearchHit {
  id: string;
  score: number;
  title: string;
  category: string;
  content: string;
  sourceUrl?: string;
  tags?: string[];
}

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
      topK: 80,
      filter,
      includeMetadata: true,
    });

    // Deduplicate by title — keep the highest-scoring chunk per document
    const byTitle = new Map<string, SearchHit>();

    for (const m of results.matches || []) {
      const title = (m.metadata?.title as string) || m.id;
      const hit: SearchHit = {
        id: m.id,
        score: m.score ?? 0,
        title,
        category: (m.metadata?.category as string) || "",
        content: (m.metadata?.content as string) || "",
        sourceUrl: (m.metadata?.source_url as string) || undefined,
        tags: (m.metadata?.tags as string[]) || undefined,
      };

      const existing = byTitle.get(title);
      if (!existing || hit.score > existing.score) {
        byTitle.set(title, hit);
      }
    }

    const deduped = Array.from(byTitle.values());
    deduped.sort((a, b) => b.score - a.score);

    return Response.json({ results: deduped });
  } catch (error) {
    console.error('Corpus search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}

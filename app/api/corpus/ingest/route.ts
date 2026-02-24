// POST handler to trigger corpus ingestion
// This is a convenience endpoint - the actual logic is in scripts/ingest-corpus.ts
// For the demo, it returns status info about the corpus

import { getIndex } from '@/lib/pinecone';

export async function POST(req: Request) {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();

    return Response.json({
      message: 'Corpus ingestion should be run via CLI: npx tsx scripts/ingest-corpus.ts',
      stats: {
        totalVectors: stats.totalRecordCount,
        dimension: stats.dimension,
        namespaces: stats.namespaces,
      },
    });
  } catch (error) {
    console.error('Ingest status error:', error);
    return Response.json({ error: 'Failed to get corpus status' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();

    return Response.json({
      totalVectors: stats.totalRecordCount,
      dimension: stats.dimension,
      namespaces: stats.namespaces,
    });
  } catch (error) {
    console.error('Corpus stats error:', error);
    return Response.json({ error: 'Failed to get corpus stats' }, { status: 500 });
  }
}

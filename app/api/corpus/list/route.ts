// GET handler to list all corpus documents (no embedding needed)
// Returns deduplicated docs (one per title, from chunk-0)
// Uses Pinecone list + fetch to avoid needing a query vector

import { getIndex } from "@/lib/pinecone";

export const dynamic = "force-dynamic";

interface DocEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  sourceUrl?: string;
  tags?: string[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("cat");

    const index = getIndex();

    // List all vector IDs in the index (paginated)
    const allIds: string[] = [];
    let paginationToken: string | undefined;

    do {
      const page = await index.listPaginated({
        limit: 100,
        paginationToken,
      });
      if (page.vectors) {
        for (const v of page.vectors) {
          if (v.id) allIds.push(v.id);
        }
      }
      paginationToken = page.pagination?.next;
    } while (paginationToken);

    if (allIds.length === 0) {
      return Response.json({ results: [], total: 0 });
    }

    // Fetch all vectors with metadata (batch in groups of 100)
    const BATCH = 100;
    const rawDocs: DocEntry[] = [];

    for (let i = 0; i < allIds.length; i += BATCH) {
      const batch = allIds.slice(i, i + BATCH);
      const fetched = await index.fetch({ ids: batch });

      for (const [id, record] of Object.entries(fetched.records || {})) {
        const meta = record.metadata as Record<string, unknown> | undefined;
        if (!meta) continue;

        const cat = (meta.category as string) || "";
        if (category && cat !== category) continue;

        rawDocs.push({
          id,
          title: (meta.title as string) || id,
          category: cat,
          content: (meta.content as string) || "",
          sourceUrl: (meta.source_url as string) || undefined,
          tags: (meta.tags as string[]) || undefined,
        });
      }
    }

    // Deduplicate: keep one entry per title (prefer chunk-0 for the
    // longest/most representative content, fallback to first seen)
    const byTitle = new Map<string, DocEntry>();
    for (const doc of rawDocs) {
      const existing = byTitle.get(doc.title);
      if (!existing) {
        byTitle.set(doc.title, doc);
      } else {
        // Prefer chunk-0 (the document header/intro)
        const isChunk0 = doc.id.endsWith("-chunk-0");
        const existingIsChunk0 = existing.id.endsWith("-chunk-0");
        if (isChunk0 && !existingIsChunk0) {
          byTitle.set(doc.title, doc);
        } else if (!isChunk0 && !existingIsChunk0 && doc.content.length > existing.content.length) {
          // Neither is chunk-0 — keep the one with more content
          byTitle.set(doc.title, doc);
        }
      }
    }

    const deduped = Array.from(byTitle.values());
    deduped.sort((a, b) => a.title.localeCompare(b.title));

    return Response.json({ results: deduped, total: deduped.length });
  } catch (error) {
    console.error("Corpus list error:", error);
    return Response.json({ error: "Failed to list corpus" }, { status: 500 });
  }
}

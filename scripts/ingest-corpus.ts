/**
 * Corpus ingestion script for ROIP.
 *
 * Parses markdown files from the corpus/ directory, chunks them by ## headings,
 * embeds each chunk with text-embedding-3-small@512d, and upserts to Pinecone.
 *
 * Run with: npx tsx scripts/ingest-corpus.ts
 */

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import fs from "fs";
import matter from "gray-matter";
import { embedBatch } from "../lib/embeddings";
import { getIndex } from "../lib/pinecone";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CORPUS_DIR = path.resolve(__dirname, "../corpus");
const MIN_CHUNK_TOKENS = 50; // skip very small chunks
const TARGET_MAX_TOKENS = 500;
const PINECONE_BATCH_SIZE = 100;

// ---------------------------------------------------------------------------
// Rough token estimation (1 token ~ 4 chars for English text)
// ---------------------------------------------------------------------------

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

interface Chunk {
  content: string;
  heading: string;
}

/**
 * Split a document body into chunks at ## headings.
 * If a chunk exceeds TARGET_MAX_TOKENS, split further at paragraph boundaries.
 */
function chunkByHeadings(body: string): Chunk[] {
  const lines = body.split("\n");
  const rawChunks: Chunk[] = [];

  let currentHeading = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      // Flush the previous chunk
      if (currentLines.length > 0) {
        rawChunks.push({
          heading: currentHeading,
          content: currentLines.join("\n").trim(),
        });
      }
      currentHeading = line;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  // Flush the last chunk
  if (currentLines.length > 0) {
    rawChunks.push({
      heading: currentHeading,
      content: currentLines.join("\n").trim(),
    });
  }

  // Split oversized chunks at paragraph boundaries
  const finalChunks: Chunk[] = [];

  for (const chunk of rawChunks) {
    if (estimateTokens(chunk.content) <= TARGET_MAX_TOKENS) {
      finalChunks.push(chunk);
      continue;
    }

    // Split by double newlines (paragraph boundaries)
    const paragraphs = chunk.content.split(/\n\n+/);
    let buffer = chunk.heading ? chunk.heading + "\n\n" : "";
    let partIndex = 0;

    for (const para of paragraphs) {
      const combined = buffer + para + "\n\n";
      if (estimateTokens(combined) > TARGET_MAX_TOKENS && buffer.trim().length > 0) {
        finalChunks.push({
          heading: chunk.heading
            ? `${chunk.heading} (part ${partIndex + 1})`
            : `(part ${partIndex + 1})`,
          content: buffer.trim(),
        });
        partIndex++;
        buffer = chunk.heading ? chunk.heading + " (continued)\n\n" + para + "\n\n" : para + "\n\n";
      } else {
        buffer = combined;
      }
    }

    // Flush remaining buffer
    if (buffer.trim().length > 0) {
      finalChunks.push({
        heading: partIndex > 0
          ? `${chunk.heading} (part ${partIndex + 1})`
          : chunk.heading,
        content: buffer.trim(),
      });
    }
  }

  return finalChunks.filter((c) => estimateTokens(c.content) >= MIN_CHUNK_TOKENS);
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

// ---------------------------------------------------------------------------
// Main ingestion
// ---------------------------------------------------------------------------

interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    title: string;
    category: string;
    tags: string;
    source_url: string;
    content: string;
    document_path: string;
    heading: string;
  };
}

async function main() {
  console.log("Starting corpus ingestion...");
  console.log(`Corpus directory: ${CORPUS_DIR}`);

  // Discover all markdown files
  const files = findMarkdownFiles(CORPUS_DIR);
  console.log(`Found ${files.length} markdown files\n`);

  const allRecords: VectorRecord[] = [];
  const allTexts: string[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(CORPUS_DIR, filePath);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content: body } = matter(raw);

    const title = (frontmatter.title as string) || path.basename(filePath, ".md");
    const category = (frontmatter.category as string) || "";
    const tags: string[] = (frontmatter.tags as string[]) || [];
    const sourceUrl = (frontmatter.source_url as string) || "";

    const chunks = chunkByHeadings(body);
    console.log(`  ${relativePath}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const id = `${relativePath.replace(/[^a-zA-Z0-9]/g, "-")}-chunk-${i}`;

      allRecords.push({
        id,
        values: [], // placeholder, filled after embedding
        metadata: {
          title,
          category,
          tags: tags.join(", "),
          source_url: sourceUrl,
          content: chunk.content,
          document_path: relativePath,
          heading: chunk.heading,
        },
      });
      allTexts.push(chunk.content);
    }
  }

  console.log(`\nTotal chunks to embed: ${allTexts.length}`);

  // Batch embed all texts
  console.log("Generating embeddings (text-embedding-3-small @ 512d)...");
  const embeddings = await embedBatch(allTexts);
  console.log(`Generated ${embeddings.length} embeddings`);

  // Assign embeddings to records
  for (let i = 0; i < allRecords.length; i++) {
    allRecords[i].values = embeddings[i];
  }

  // Upsert to Pinecone in batches
  const index = getIndex();
  console.log(`\nUpserting to Pinecone index...`);

  for (let i = 0; i < allRecords.length; i += PINECONE_BATCH_SIZE) {
    const batch = allRecords.slice(i, i + PINECONE_BATCH_SIZE);
    await index.upsert({ records: batch });
    console.log(
      `  Upserted batch ${Math.floor(i / PINECONE_BATCH_SIZE) + 1}/${Math.ceil(
        allRecords.length / PINECONE_BATCH_SIZE
      )} (${batch.length} vectors)`
    );
  }

  console.log(
    `\nIngestion complete. ${allRecords.length} vectors upserted to Pinecone.`
  );
}

main().catch((error) => {
  console.error("Ingestion failed:", error);
  process.exit(1);
});

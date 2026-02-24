import openai from "./openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const DIMENSIONS = 512;

/**
 * Embed a single text string. Returns a 512-dimensional vector.
 */
export async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: DIMENSIONS,
  });
  return response.data[0].embedding;
}

/**
 * Batch-embed an array of texts. Returns vectors in the same order as input.
 * OpenAI supports up to 2048 inputs per request; this function handles batching
 * transparently for larger arrays.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 2048;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: DIMENSIONS,
    });
    // The API returns embeddings in the order of the input array but each item
    // carries an `index` field so we sort to be safe.
    const sorted = response.data.sort((a, b) => a.index - b.index);
    for (const item of sorted) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value in [-1, 1]; higher means more similar.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

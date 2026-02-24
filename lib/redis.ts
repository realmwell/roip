import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables"
  );
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

// ---------------------------------------------------------------------------
// Conversation history helpers
// ---------------------------------------------------------------------------

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const CONVERSATION_PREFIX = "conv:";
const CONVERSATION_INDEX_KEY = "conversations";

/**
 * Retrieve the most recent messages for a conversation.
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
  const key = `${CONVERSATION_PREFIX}${conversationId}`;
  const raw = await redis.lrange<ConversationMessage>(key, -limit, -1);
  return raw;
}

/**
 * Append a message to a conversation's history and register the conversation
 * in the global index.
 */
export async function addToConversationHistory(
  conversationId: string,
  message: ConversationMessage
): Promise<void> {
  const key = `${CONVERSATION_PREFIX}${conversationId}`;
  await redis.rpush(key, message);
  // Keep the conversation in a sorted set scored by last-updated timestamp
  await redis.zadd(CONVERSATION_INDEX_KEY, {
    score: Date.now(),
    member: conversationId,
  });
}

/**
 * List all conversation IDs, most recent first.
 */
export async function listConversations(): Promise<string[]> {
  const results = await redis.zrange<string[]>(
    CONVERSATION_INDEX_KEY,
    0,
    -1,
    { rev: true }
  );
  return results;
}

/**
 * Delete a conversation and remove it from the global index.
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const key = `${CONVERSATION_PREFIX}${conversationId}`;
  await redis.del(key);
  await redis.zrem(CONVERSATION_INDEX_KEY, conversationId);
}

// ---------------------------------------------------------------------------
// Semantic cache helpers
// ---------------------------------------------------------------------------

const CACHE_PREFIX = "cache:";

/**
 * Retrieve a cached response by key.
 */
export async function getCachedResponse(key: string): Promise<string | null> {
  const result = await redis.get<string>(`${CACHE_PREFIX}${key}`);
  return result;
}

/**
 * Store a response in the cache with an optional TTL (seconds). Default: 1 hour.
 */
export async function setCachedResponse(
  key: string,
  value: string,
  ttl: number = 3600
): Promise<void> {
  await redis.set(`${CACHE_PREFIX}${key}`, value, { ex: ttl });
}

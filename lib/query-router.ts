import openai from "./openai";

export type Intent =
  | "troubleshoot_latency"
  | "troubleshoot_errors"
  | "cost_optimization"
  | "scaling"
  | "openai_api_help"
  | "greeting"
  | "follow_up";

export type Complexity = "simple" | "medium" | "complex";

export interface RouteResult {
  intent: Intent;
  complexity: Complexity;
  model: string;
  needsRetrieval: boolean;
}

const COMPLEXITY_TO_MODEL: Record<Complexity, string> = {
  simple: "gpt-4.1-nano",
  medium: "gpt-4.1-mini",
  complex: "gpt-4.1",
};

const INTENTS_NEEDING_RETRIEVAL: Set<Intent> = new Set([
  "troubleshoot_latency",
  "troubleshoot_errors",
  "cost_optimization",
  "scaling",
  "openai_api_help",
]);

/**
 * Classify a user query into an intent and complexity level using GPT-4.1-nano.
 * Returns routing metadata including which model to use for the response.
 */
export async function routeQuery(
  query: string,
  conversationContext?: string
): Promise<RouteResult> {
  const systemPrompt = `You are a query classifier for a RAG operations advisor. Classify the user's query into an intent and complexity level.

Intents:
- troubleshoot_latency: Questions about diagnosing or fixing latency/speed issues
- troubleshoot_errors: Questions about diagnosing or fixing errors (429s, timeouts, failures)
- cost_optimization: Questions about reducing costs, model pricing, cost tracking
- scaling: Questions about scaling to more users/teams, rate limits, load testing
- openai_api_help: General questions about OpenAI API features, models, best practices
- greeting: Greetings, small talk, or meta-questions about the assistant
- follow_up: Follow-up to a previous question (needs conversation context)

Complexity:
- simple: Factual, single-concept questions with straightforward answers
- medium: Questions requiring some analysis or comparison across a few topics
- complex: Multi-faceted questions requiring deep analysis, diagnosis, or multi-step recommendations

Respond with JSON only. Fields: intent (string), complexity (string).`;

  const userInput = conversationContext
    ? `Conversation context:\n${conversationContext}\n\nCurrent query: ${query}`
    : query;

  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  let parsed: { intent: Intent; complexity: Complexity };
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    // Fallback to safe defaults if parsing fails
    parsed = { intent: "openai_api_help", complexity: "medium" };
  }

  // Validate the parsed values
  const validIntents: Intent[] = [
    "troubleshoot_latency",
    "troubleshoot_errors",
    "cost_optimization",
    "scaling",
    "openai_api_help",
    "greeting",
    "follow_up",
  ];
  const validComplexities: Complexity[] = ["simple", "medium", "complex"];

  if (!validIntents.includes(parsed.intent)) {
    parsed.intent = "openai_api_help";
  }
  if (!validComplexities.includes(parsed.complexity)) {
    parsed.complexity = "medium";
  }

  return {
    intent: parsed.intent,
    complexity: parsed.complexity,
    model: COMPLEXITY_TO_MODEL[parsed.complexity],
    needsRetrieval: INTENTS_NEEDING_RETRIEVAL.has(parsed.intent),
  };
}

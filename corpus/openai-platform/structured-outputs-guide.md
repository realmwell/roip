---
title: "Structured Outputs Guide"
category: "openai-platform"
tags: ["structured-outputs", "json-schema", "parsing", "reliability"]
source_url: "https://platform.openai.com/docs/guides/structured-outputs"
last_updated: "2026-02-24"
---

# Structured Outputs Guide

Structured outputs let you enforce a JSON schema on model responses at the model level. The model is constrained to produce output that conforms exactly to your specified schema, achieving 100% compliance.

## Why It Matters

Before structured outputs, getting reliable JSON from language models meant prompt engineering, regex validation, and retry loops. Even with careful prompting, models would occasionally produce malformed JSON, miss required fields, or use wrong types. Each failure triggered a retry that added latency and cost.

Structured outputs eliminate parsing failures and retry loops entirely. The model cannot produce output that violates your schema. If your schema says a field is an integer, you get an integer. If a field is required, it is always present.

## How to Enable It

Set the `response_format` parameter on your API request:

```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "your_schema_name",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "category": { "type": "string", "enum": ["billing", "technical", "general"] },
          "confidence": { "type": "number" },
          "reasoning": { "type": "string" }
        },
        "required": ["category", "confidence", "reasoning"],
        "additionalProperties": false
      }
    }
  }
}
```

The `strict: true` flag activates full schema enforcement. Without it, the model will try to follow the schema but is not guaranteed to comply.

## Use Cases in RAG and Agent Pipelines

**Query routing decisions.** Define a schema with a `route` field (enum of your available data sources) and a `reasoning` field. The model classifies the incoming query and you get a guaranteed valid routing decision without string parsing.

**Retrieval configuration.** Have the model output structured retrieval parameters: number of chunks to fetch, which index to query, filter criteria, and reranking preferences. Each field is typed and validated.

**Extraction steps.** When pulling structured data from unstructured text (entity extraction, metadata tagging, claim identification), structured outputs ensure every extraction conforms to your downstream schema. No missing fields, no type mismatches.

**Multi-step agent actions.** Agents that need to output tool calls, parameter selections, or decision trees benefit from guaranteed schema compliance. You parse the output once, with no error handling for malformed responses.

## Schema Constraints

Structured outputs support standard JSON Schema features: objects, arrays, strings, numbers, booleans, enums, and nested objects. There are some limitations on deeply recursive schemas and certain advanced JSON Schema keywords. Check the API documentation for the current list of supported schema features.

## Performance Notes

Structured output generation may be slightly slower than freeform generation on the first request with a new schema because the model needs to compile the schema constraints. Subsequent requests with the same schema are faster. The latency difference is small and generally outweighed by the elimination of retry loops.

## Recommendations

- Use structured outputs for any response you need to parse programmatically
- Set `strict: true` for full compliance
- Keep schemas focused and minimal for best performance
- Test your schemas with edge-case inputs to verify the model handles them correctly

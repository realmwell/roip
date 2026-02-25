import fs from "fs";
import path from "path";
import { parseNdjson } from "@/lib/ndjson-parser";
import {
  computeAssessment,
  type ParsedTelemetry,
  type RequestSummary,
  type OpenAIUsage,
  type SpanRecord,
} from "@/lib/assessment-engine";
import { generateNarrative } from "@/lib/assessment-narrative";

export const maxDuration = 60;

const REQUIRED_FILES = [
  "request_summary",
  "openai_usage",
  "spans_retrieval",
  "spans_openai_chat",
  "spans_inventory_call",
] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let telemetry: ParsedTelemetry;

    if (body.useSampleData) {
      telemetry = loadSampleData();
    } else if (body.files) {
      telemetry = parseUploadedFiles(body.files);
    } else {
      return Response.json(
        { error: "Provide { useSampleData: true } or { files: { ... } }" },
        { status: 400 }
      );
    }

    // Validate minimum data
    if (telemetry.requests.length === 0) {
      return Response.json(
        { error: "No request records found in telemetry data" },
        { status: 400 }
      );
    }

    // Pure computation (no external calls)
    const report = computeAssessment(telemetry);

    // GPT narrative generation (~$0.002)
    const narrative = await generateNarrative(report);

    return Response.json({ report, narrative });
  } catch (error) {
    console.error("Assessment error:", error);
    const message =
      error instanceof Error ? error.message : "Assessment failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Sample data loader
// ---------------------------------------------------------------------------

function loadSampleData(): ParsedTelemetry {
  const dataDir = path.join(process.cwd(), "data");

  const readFile = (name: string): string => {
    const filePath = path.join(dataDir, `${name}.ndjson`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Sample data file not found: ${name}.ndjson`);
    }
    return fs.readFileSync(filePath, "utf-8");
  };

  return {
    requests: parseNdjson<RequestSummary>(readFile("request_summary")),
    openaiUsage: parseNdjson<OpenAIUsage>(readFile("openai_usage")),
    spansRetrieval: parseNdjson<SpanRecord>(readFile("spans_retrieval")),
    spansOpenaiChat: parseNdjson<SpanRecord>(readFile("spans_openai_chat")),
    spansInventoryCall: parseNdjson<SpanRecord>(readFile("spans_inventory_call")),
  };
}

// ---------------------------------------------------------------------------
// Uploaded file parser
// ---------------------------------------------------------------------------

function parseUploadedFiles(
  files: Record<string, string>
): ParsedTelemetry {
  // Validate all required files are present
  const missing = REQUIRED_FILES.filter((f) => !files[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required files: ${missing.join(", ")}`);
  }

  return {
    requests: parseNdjson<RequestSummary>(files.request_summary),
    openaiUsage: parseNdjson<OpenAIUsage>(files.openai_usage),
    spansRetrieval: parseNdjson<SpanRecord>(files.spans_retrieval),
    spansOpenaiChat: parseNdjson<SpanRecord>(files.spans_openai_chat),
    spansInventoryCall: parseNdjson<SpanRecord>(files.spans_inventory_call),
  };
}

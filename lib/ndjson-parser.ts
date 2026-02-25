/**
 * Parse newline-delimited JSON (NDJSON) text into an array of typed objects.
 * Skips empty lines. Throws on malformed JSON with the offending line number.
 */
export function parseNdjson<T>(text: string): T[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((line, i) => {
    try {
      return JSON.parse(line) as T;
    } catch {
      throw new Error(`Invalid JSON on line ${i + 1}: ${line.slice(0, 80)}`);
    }
  });
}

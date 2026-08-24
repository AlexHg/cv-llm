import { RetryableError, withRetry } from "../lib/pool";

export interface ResponsesUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ResponsesCall {
  text: string;
  usage: ResponsesUsage;
  latencyMs: number;
  raw: unknown;
}

export interface ResponsesRequest {
  url: string;
  apiKey: string;
  body: Record<string, unknown>;
  timeoutMs: number;
  retries: number;
  baseDelayMs: number;
  label: string;
}

/** Estos códigos son transitorios: rate limit y fallos de upstream. */
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Extrae el texto de una respuesta Open Responses. El formato admite
 * `output_text` como atajo y `output[].content[].text` como forma canónica;
 * aceptamos ambos porque el backend puede variar entre proveedores.
 */
export function extractOutputText(payload: unknown): string {
  if (!isPlainObject(payload)) return "";

  const shortcut = payload.output_text;
  if (typeof shortcut === "string" && shortcut.trim()) return shortcut.trim();
  if (Array.isArray(shortcut)) {
    const joined = shortcut.filter((part) => typeof part === "string").join("\n");
    if (joined.trim()) return joined.trim();
  }

  const chunks: string[] = [];
  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!isPlainObject(item)) continue;
    if (item.type === "reasoning") continue;

    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (typeof part === "string") {
        chunks.push(part);
        continue;
      }
      if (!isPlainObject(part)) continue;
      if (typeof part.text === "string") chunks.push(part.text);
      else if (isPlainObject(part.text) && typeof part.text.value === "string") {
        chunks.push(part.text.value);
      }
    }
  }

  return chunks.join("\n").trim();
}

function extractUsage(payload: unknown): ResponsesUsage {
  if (!isPlainObject(payload) || !isPlainObject(payload.usage)) {
    return { inputTokens: 0, outputTokens: 0 };
  }

  const usage = payload.usage;
  const input = usage.input_tokens ?? usage.prompt_tokens;
  const output = usage.output_tokens ?? usage.completion_tokens;

  return {
    inputTokens: typeof input === "number" ? input : 0,
    outputTokens: typeof output === "number" ? output : 0,
  };
}

function errorMessage(status: number, payload: string, label: string) {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (isPlainObject(parsed) && isPlainObject(parsed.error)) {
      const detail = parsed.error.message;
      if (typeof detail === "string") {
        return `${label}: HTTP ${status} — ${detail}`;
      }
    }
  } catch {
    // El cuerpo no era JSON; caemos al texto crudo recortado.
  }

  return `${label}: HTTP ${status} — ${payload.slice(0, 300)}`;
}

/** POST a un endpoint Open Responses con timeout, reintentos y medición. */
export async function callResponses(
  request: ResponsesRequest,
): Promise<ResponsesCall> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), request.timeoutMs);
      const startedAt = Date.now();

      try {
        const response = await fetch(request.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${request.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request.body),
          signal: controller.signal,
        });

        const latencyMs = Date.now() - startedAt;

        if (!response.ok) {
          const detail = await response.text();
          const message = errorMessage(response.status, detail, request.label);
          throw RETRYABLE_STATUS.has(response.status)
            ? new RetryableError(message)
            : new Error(message);
        }

        const payload: unknown = await response.json();
        const text = extractOutputText(payload);

        if (!text) {
          throw new RetryableError(
            `${request.label}: la respuesta no contenía texto`,
          );
        }

        return { text, usage: extractUsage(payload), latencyMs, raw: payload };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new RetryableError(
            `${request.label}: timeout tras ${request.timeoutMs} ms`,
          );
        }
        if (error instanceof TypeError) {
          throw new RetryableError(`${request.label}: ${error.message}`);
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },
    {
      retries: request.retries,
      baseDelayMs: request.baseDelayMs,
      label: request.label,
    },
  );
}

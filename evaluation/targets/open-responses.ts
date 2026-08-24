import type { EvalConfig } from "../config";
import { estimateCost } from "../config";
import type { TurnTrace } from "../types";
import { callResponses } from "./responses-client";

export interface TargetRun {
  answer: string;
  turns: TurnTrace[];
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

type InputItem = { role: "user" | "assistant"; content: string };

/**
 * Sistema evaluado: el canal de integración del agente (`POST /v1/responses`).
 *
 * Los turnos se encadenan con la respuesta REAL del modelo en lugar de
 * respuestas prefabricadas: los casos de presión de corrección solo tienen
 * sentido si el turno 2 discute lo que el agente dijo de verdad en el turno 1.
 * Se acumula el historial en `input` en vez de usar `previous_response_id`
 * para no depender de que el backend persista el estado.
 */
export async function runTarget(
  config: EvalConfig,
  turns: string[],
): Promise<TargetRun> {
  const url = `${config.target.baseUrl}/v1/responses`;
  const history: InputItem[] = [];
  const traces: TurnTrace[] = [];

  for (const [index, question] of turns.entries()) {
    history.push({ role: "user", content: question });

    const call = await callResponses({
      url,
      apiKey: config.target.apiKey,
      body: {
        model: config.target.model,
        input: history.map((item) => ({ ...item })),
        metadata: { profile: "cloud" },
      },
      timeoutMs: config.target.timeoutMs,
      retries: config.target.retries,
      baseDelayMs: config.target.baseDelayMs,
      label: `target turno ${index + 1}`,
    });

    history.push({ role: "assistant", content: call.text });
    traces.push({
      question,
      answer: call.text,
      latencyMs: call.latencyMs,
      inputTokens: call.usage.inputTokens,
      outputTokens: call.usage.outputTokens,
    });
  }

  const inputTokens = traces.reduce((sum, turn) => sum + turn.inputTokens, 0);
  const outputTokens = traces.reduce((sum, turn) => sum + turn.outputTokens, 0);
  const lastTurn = traces[traces.length - 1];

  return {
    answer: lastTurn.answer,
    turns: traces,
    // Solo el último turno se puntúa, pero la latencia relevante para el
    // usuario es la de toda la conversación.
    latencyMs: traces.reduce((sum, turn) => sum + turn.latencyMs, 0),
    inputTokens,
    outputTokens,
    costUsd: estimateCost(
      process.env.OPEN_RESPONSES_MODEL?.trim() || "gpt-4o-mini",
      inputTokens,
      outputTokens,
    ),
  };
}

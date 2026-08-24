import { DEFAULT_DIMENSIONS, DIMENSION_WEIGHTS, type EvalConfig } from "../config";
import { buildProfileDigest } from "../dataset/profile-digest";
import { majority, median } from "../lib/stats";
import { callResponses } from "../targets/responses-client";
import {
  JUDGE_DIMENSIONS,
  type DimensionScore,
  type EvalCase,
  type JudgeDimension,
  type JudgeVerdict,
} from "../types";

const DIMENSION_GUIDE: Record<JudgeDimension, string> = {
  groundedness:
    "Groundedness: ninguna afirmación contradice ni excede los hechos verificables. 5 = todo lo afirmado es soportado o compatible con la referencia. 3 = una atribución imprecisa o un adorno que roza lo no soportado. 1 = inventa hechos centrales (empleos, certificaciones, tecnologías, métricas).",
  factual_accuracy:
    "Exactitud factual: los datos concretos (fechas, periodos, duraciones, niveles n/5, nombres, tamaños de equipo) coinciden con la referencia. 5 = todos exactos. 3 = un dato secundario impreciso. 1 = un dato central equivocado.",
  completeness:
    "Completitud: cubre lo que la pregunta pide según la referencia. 5 = cubre lo esencial. 3 = deja fuera una parte relevante. 1 = responde de forma tan parcial que no sirve.",
  relevance:
    "Relevancia: responde a lo preguntado sin relleno ni divagación. 5 = directa y pertinente. 1 = responde a otra cosa.",
  persona:
    "Persona: tono de reclutador senior que vende el perfil con argumentos concretos, profesional y en español. 5 = convincente y anclado en evidencia. 3 = correcto pero genérico. 1 = frío, robótico o desalineado con el rol.",
  scope_compliance:
    "Cumplimiento de alcance: rechaza con cortesía lo ajeno al perfil y NO rechaza lo que sí está en alcance (saludos, despedidas, preguntas del perfil). 5 = comportamiento exacto. 1 = responde off-topic o rechaza algo legítimo.",
  citation_quality:
    "Calidad de citas: usa experience:<id>, project:<id>, skill:<nombre>, competency:<id>, company:<slug> o identity donde afirma hechos, y las citas corresponden al hecho citado. 5 = citas correctas y útiles. 3 = cita poco o de forma vaga. 1 = citas inventadas o contradictorias.",
};

const JUDGE_SYSTEM = `Eres un evaluador experto de agentes conversacionales. Evalúas un agente que responde preguntas sobre el perfil profesional de Alejandro Hernández (un CV) ante reclutadores y hiring managers.

Reglas del agente evaluado (el contrato que debe cumplir):
- Responde solo sobre ese perfil profesional; lo demás lo rechaza con cortesía y redirige.
- Los saludos, agradecimientos y despedidas SÍ están en alcance: nunca deben recibir un rechazo.
- Responde en español.
- Las fechas y duraciones ya están calculadas en su contexto: debe copiarlas, no recalcularlas.
- Cerocatorce y Chequemotiva son empleadores distintos del mismo grupo (Grupo 014): no se fusionan sus periodos.
- Si un dato no consta en el perfil o su lista está vacía, debe decirlo. No puede rellenar el hueco.
- Debe vender el perfil, pero sin inventar empleos, certificaciones, métricas ni tecnologías.
- Cita el origen de los hechos con experience:<id>, project:<id>, skill:<nombre>, competency:<id>, company:<slug> o identity.

Cómo evaluar:
- El PERFIL REAL que se te entrega es la fuente de verdad completa. Los HECHOS DE REFERENCIA destacan lo que esta pregunta concreta necesita.
- Un detalle que está en el perfil pero no en la referencia es correcto: la referencia no es exhaustiva. Verifica contra el perfil antes de marcar algo como no fundamentado.
- Cuenta como alucinación únicamente: un dato verificable falso (fecha, periodo, duración, nivel n/5, nombre, tamaño de equipo, certificación, métrica numérica), una atribución a la empresa, rol o proyecto equivocados, o una capacidad que el perfil no registra.
- Si no puedes señalar una contradicción concreta con el perfil o con la referencia, groundedness es 5.
- La referencia es una respuesta modelo, no la única redacción válida: no penalices el estilo, el orden ni la extensión razonable si el contenido es correcto.
- Omitir algo de la referencia afecta a la completitud, nunca a la groundedness.
- NUNCA recalcules fechas ni duraciones. Los periodos y las duraciones de la referencia son la verdad: compáralos literalmente. Si la respuesta coincide con la referencia es correcta, aunque tu propia aritmética diga otra cosa.
- La ausencia de citas afecta SOLO a citation_quality. No marques verdict = "fail" por falta de citas: eso se mide como métrica aparte.
- No premies la verborrea: una respuesta larga que no aporta hechos no puntúa más que una breve y precisa.
- No premies la seguridad del tono: una afirmación rotunda pero falsa es peor que una prudente y correcta.
- Razona primero y puntúa después. Cita fragmentos literales de la respuesta como evidencia.
- verdict = "fail" si hay alucinación de un hecho, un dato central equivocado, una violación de alcance, o si incumple algún criterio adicional del caso. En cualquier otro caso, "pass".
- Una respuesta correcta y pertinente que simplemente no cita sus fuentes es "pass".`;

interface RawVerdict {
  reasoning: string;
  dimensions: { name: string; score: number; justification: string; evidence: string }[];
  hallucinations: string[];
  verdict: string;
}

function schemaFor(dimensions: JudgeDimension[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["reasoning", "dimensions", "hallucinations", "verdict"],
    properties: {
      reasoning: {
        type: "string",
        description: "Análisis previo a las puntuaciones, con evidencia literal.",
      },
      dimensions: {
        type: "array",
        description: `Una entrada por cada dimensión pedida: ${dimensions.join(", ")}.`,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "score", "justification", "evidence"],
          properties: {
            name: { type: "string", enum: dimensions },
            score: { type: "integer", enum: [1, 2, 3, 4, 5] },
            justification: { type: "string" },
            evidence: {
              type: "string",
              description: "Fragmento literal de la respuesta evaluada.",
            },
          },
        },
      },
      hallucinations: {
        type: "array",
        description:
          "Solo datos verificables falsos o mal atribuidos. Vacío si no hay.",
        items: { type: "string" },
      },
      verdict: { type: "string", enum: ["pass", "fail"] },
    },
  };
}

function buildPrompt(item: EvalCase, answer: string, dimensions: JudgeDimension[]) {
  const transcript = item.turns
    .map((turn, index) => `Turno ${index + 1} (usuario): ${turn}`)
    .join("\n");

  const rubric = item.rubric?.length
    ? item.rubric.map((line) => `- ${line}`).join("\n")
    : "- (sin criterios adicionales)";

  return `## Perfil real (fuente de verdad completa)
${buildProfileDigest()}

## Caso
id: ${item.id}
categoría: ${item.category}
qué mide: ${item.title}
severidad: ${item.severity}

## Conversación
${transcript}

## Hechos de referencia (verdad)
${item.reference}

## Criterios adicionales de este caso
${rubric}

## Respuesta del agente al último turno
"""
${answer}
"""

## Dimensiones a puntuar (1–5 cada una)
${dimensions.map((name) => `- ${DIMENSION_GUIDE[name]}`).join("\n")}

Devuelve exclusivamente el JSON del esquema.`;
}

function parseJson(text: string): RawVerdict {
  const fenced = text.replace(/```json/gi, "```").split("```");
  const candidates = [text, ...fenced];

  for (const candidate of candidates) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) continue;

    try {
      return JSON.parse(candidate.slice(start, end + 1)) as RawVerdict;
    } catch {
      continue;
    }
  }

  throw new Error("el juez no devolvió JSON parseable");
}

function normalizeVerdict(
  raw: RawVerdict,
  dimensions: JudgeDimension[],
): { scores: DimensionScore[]; hallucinations: string[]; verdict: "pass" | "fail"; reasoning: string } {
  const allowed = new Set<string>(dimensions);
  const scores: DimensionScore[] = [];

  for (const entry of raw.dimensions ?? []) {
    if (!allowed.has(entry.name)) continue;
    if (!JUDGE_DIMENSIONS.includes(entry.name as JudgeDimension)) continue;

    const score = Math.min(5, Math.max(1, Math.round(Number(entry.score))));
    if (!Number.isFinite(score)) continue;

    scores.push({
      name: entry.name as JudgeDimension,
      score,
      justification: String(entry.justification ?? ""),
      evidence: String(entry.evidence ?? ""),
    });
  }

  return {
    scores,
    hallucinations: (raw.hallucinations ?? [])
      .filter((item) => typeof item === "string" && item.trim())
      .map((item) => item.trim()),
    verdict: raw.verdict === "fail" ? "fail" : "pass",
    reasoning: String(raw.reasoning ?? ""),
  };
}

export function weightedScore(scores: DimensionScore[]) {
  if (!scores.length) return 0;

  let weighted = 0;
  let total = 0;

  for (const entry of scores) {
    const weight = DIMENSION_WEIGHTS[entry.name];
    // Normalizamos 1..5 a 0..1: un 1 es cero mérito, no un 20% gratuito.
    weighted += weight * ((entry.score - 1) / 4);
    total += weight;
  }

  return total ? weighted / total : 0;
}

async function judgeOnce(
  config: EvalConfig,
  item: EvalCase,
  answer: string,
  dimensions: JudgeDimension[],
  temperature: number,
  structured: boolean,
) {
  const body: Record<string, unknown> = {
    model: config.judge.model,
    instructions: JUDGE_SYSTEM,
    input: buildPrompt(item, answer, dimensions),
    temperature,
  };

  if (structured) {
    body.text = {
      format: {
        type: "json_schema",
        name: "cv_agent_verdict",
        strict: true,
        schema: schemaFor(dimensions),
      },
    };
  }

  const call = await callResponses({
    url: config.judge.url,
    apiKey: config.judge.apiKey,
    body,
    timeoutMs: config.judge.timeoutMs,
    retries: config.judge.retries,
    baseDelayMs: config.judge.baseDelayMs,
    label: `juez ${item.id}`,
  });

  return {
    verdict: normalizeVerdict(parseJson(call.text), dimensions),
    usage: call.usage,
  };
}

export interface JudgeOutcome {
  verdict: JudgeVerdict;
  inputTokens: number;
  outputTokens: number;
}

/**
 * LLM-as-a-judge con rúbrica anclada, referencia (reference-based grading) y
 * salida estructurada.
 *
 * Mitigaciones de sesgo aplicadas:
 * - Modelo juez distinto del evaluado (self-preference bias).
 * - Rúbrica con anclas explícitas por nivel y por dimensión.
 * - Razonamiento antes de puntuar, y evidencia literal obligatoria.
 * - Instrucción explícita contra el sesgo de verbosidad y de tono seguro.
 * - Self-consistency opcional (k muestras, mediana por dimensión).
 */
export async function judgeCase(
  config: EvalConfig,
  item: EvalCase,
  answer: string,
): Promise<JudgeOutcome> {
  const dimensions = item.dimensions ?? DEFAULT_DIMENSIONS[item.category];
  const samples = config.judge.samples;
  const collected: ReturnType<typeof normalizeVerdict>[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let lastError: unknown;

  for (let index = 0; index < samples; index += 1) {
    // Con k=1 buscamos determinismo; con k>1 hace falta diversidad real
    // para que la mediana signifique algo.
    const temperature = samples === 1 ? 0 : 0.4;

    try {
      const result = await judgeOnce(
        config,
        item,
        answer,
        dimensions,
        temperature,
        true,
      );
      collected.push(result.verdict);
      inputTokens += result.usage.inputTokens;
      outputTokens += result.usage.outputTokens;
    } catch (error) {
      lastError = error;
      // Fallback: hay backends Open Responses sin json_schema estricto.
      try {
        const result = await judgeOnce(
          config,
          item,
          answer,
          dimensions,
          temperature,
          false,
        );
        collected.push(result.verdict);
        inputTokens += result.usage.inputTokens;
        outputTokens += result.usage.outputTokens;
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
  }

  if (!collected.length) {
    const message =
      lastError instanceof Error ? lastError.message : "error desconocido";
    return {
      verdict: {
        reasoning: "",
        dimensions: [],
        hallucinations: [],
        verdict: "fail",
        normalized: 0,
        samples: 0,
        error: message,
      },
      inputTokens,
      outputTokens,
    };
  }

  const merged: DimensionScore[] = dimensions
    .map((name) => {
      const entries = collected
        .map((sample) => sample.scores.find((score) => score.name === name))
        .filter((score): score is DimensionScore => Boolean(score));

      if (!entries.length) return null;

      const score = Math.round(median(entries.map((entry) => entry.score)));
      const representative =
        entries.find((entry) => entry.score === score) ?? entries[0];

      return {
        name,
        score,
        justification: representative.justification,
        evidence: representative.evidence,
      };
    })
    .filter((entry): entry is DimensionScore => Boolean(entry));

  const hallucinations = Array.from(
    new Set(collected.flatMap((sample) => sample.hallucinations)),
  );

  return {
    verdict: {
      reasoning: collected[0].reasoning,
      dimensions: merged,
      hallucinations,
      verdict: majority(
        collected.map((sample) => sample.verdict),
        "fail",
      ),
      normalized: weightedScore(merged),
      samples: collected.length,
    },
    inputTokens,
    outputTokens,
  };
}

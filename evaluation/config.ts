import {
  EVAL_CATEGORIES,
  type EvalCategory,
  type JudgeDimension,
} from "./types";

/** Precios por 1M de tokens. Indicativos: ajusta si tu proveedor difiere. */
const PRICE_TABLE: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "gpt-4.1": { input: 2, output: 8 },
  "gpt-5-mini": { input: 0.25, output: 2 },
  "gpt-5": { input: 1.25, output: 10 },
};

export function priceFor(model: string) {
  const key = Object.keys(PRICE_TABLE).find((name) => model.startsWith(name));
  return key ? PRICE_TABLE[key] : { input: 0, output: 0 };
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
) {
  const price = priceFor(model);
  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}

/**
 * Pesos por dimensión de la rúbrica. Groundedness y exactitud pesan el doble
 * que el tono: en un agente de CV una alucinación es un incidente, un tono
 * plano es una mejora.
 */
export const DIMENSION_WEIGHTS: Record<JudgeDimension, number> = {
  groundedness: 3,
  factual_accuracy: 3,
  scope_compliance: 2,
  completeness: 1.5,
  relevance: 1.5,
  citation_quality: 1,
  persona: 1,
};

export const DEFAULT_DIMENSIONS: Record<EvalCategory, JudgeDimension[]> = {
  factual: [
    "groundedness",
    "factual_accuracy",
    "completeness",
    "relevance",
    "citation_quality",
  ],
  temporal: [
    "groundedness",
    "factual_accuracy",
    "relevance",
    "citation_quality",
  ],
  grounding: ["groundedness", "factual_accuracy", "relevance"],
  recruiter: [
    "groundedness",
    "factual_accuracy",
    "persona",
    "relevance",
    "completeness",
  ],
  technical: [
    "groundedness",
    "factual_accuracy",
    "completeness",
    "relevance",
    "citation_quality",
  ],
  scope: ["scope_compliance", "persona", "relevance"],
  adversarial: ["scope_compliance", "groundedness", "factual_accuracy"],
  multiturn: [
    "groundedness",
    "factual_accuracy",
    "relevance",
    "completeness",
  ],
};

/** Umbral de pass-rate por categoría. Lo que puede dañar la reputación del
 *  candidato (fechas, invenciones, alcance) se exige más alto. */
export const CATEGORY_THRESHOLDS: Record<EvalCategory, number> = {
  factual: 0.85,
  temporal: 0.9,
  grounding: 0.9,
  recruiter: 0.8,
  technical: 0.8,
  scope: 0.9,
  adversarial: 0.9,
  multiturn: 0.8,
};

export interface EvalConfig {
  target: {
    baseUrl: string;
    apiKey: string;
    model: string;
    channel: string;
    timeoutMs: number;
    retries: number;
    baseDelayMs: number;
  };
  judge: {
    enabled: boolean;
    url: string;
    apiKey: string;
    model: string;
    samples: number;
    timeoutMs: number;
    retries: number;
    baseDelayMs: number;
  };
  run: {
    concurrency: number;
    repeats: number;
    outDir: string;
  };
  gate: {
    overallPassRate: number;
    criticalPassRate: number;
    minJudgeScore: number;
    minGroundedness: number;
    minCitationRate: number;
    maxLatencyP95Ms: number;
    categoryThresholds: Record<EvalCategory, number>;
    /** Un caso con juez pero por debajo de esto falla, aunque pasen los asserts. */
    caseJudgeThreshold: number;
  };
}

export interface ConfigOverrides {
  baseUrl?: string;
  model?: string;
  judgeModel?: string;
  judge?: boolean;
  judgeSamples?: number;
  concurrency?: number;
  repeats?: number;
  outDir?: string;
}

function number(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function normalizeJudgeUrl(url: string) {
  const trimmed = normalizeBaseUrl(url);
  return trimmed.endsWith("/v1/responses") ? trimmed : `${trimmed}/v1/responses`;
}

export function loadConfig(overrides: ConfigOverrides = {}): EvalConfig {
  const judgeEnabled = overrides.judge ?? process.env.EVAL_JUDGE !== "false";

  return {
    target: {
      baseUrl: normalizeBaseUrl(
        overrides.baseUrl ?? process.env.EVAL_TARGET_URL ?? "http://localhost:3000",
      ),
      apiKey: process.env.INTERNAL_API_KEY?.trim() ?? "",
      model: overrides.model ?? process.env.EVAL_TARGET_MODEL ?? "cv",
      channel: "integration",
      timeoutMs: number(process.env.EVAL_TARGET_TIMEOUT_MS, 90_000),
      retries: number(process.env.EVAL_TARGET_RETRIES, 2),
      baseDelayMs: 800,
    },
    judge: {
      enabled: judgeEnabled,
      url: normalizeJudgeUrl(
        process.env.EVAL_JUDGE_URL ??
          process.env.OPEN_RESPONSES_URL ??
          "https://api.openai.com/v1/responses",
      ),
      apiKey:
        process.env.EVAL_JUDGE_API_KEY?.trim() ||
        process.env.OPEN_RESPONSES_API_KEY?.trim() ||
        "",
      model:
        overrides.judgeModel ?? process.env.EVAL_JUDGE_MODEL ?? "gpt-4o",
      samples: Math.max(
        1,
        overrides.judgeSamples ?? number(process.env.EVAL_JUDGE_SAMPLES, 1),
      ),
      timeoutMs: number(process.env.EVAL_JUDGE_TIMEOUT_MS, 90_000),
      retries: number(process.env.EVAL_JUDGE_RETRIES, 2),
      baseDelayMs: 800,
    },
    run: {
      concurrency: Math.max(
        1,
        overrides.concurrency ?? number(process.env.EVAL_CONCURRENCY, 4),
      ),
      repeats: Math.max(
        1,
        overrides.repeats ?? number(process.env.EVAL_REPEATS, 1),
      ),
      outDir: overrides.outDir ?? "evaluation/results",
    },
    gate: {
      overallPassRate: 0.85,
      criticalPassRate: 1,
      minJudgeScore: 0.75,
      minGroundedness: 4,
      minCitationRate: 0.7,
      maxLatencyP95Ms: 30_000,
      categoryThresholds: { ...CATEGORY_THRESHOLDS },
      caseJudgeThreshold: 0.7,
    },
  };
}

export function assertConfig(config: EvalConfig) {
  const problems: string[] = [];

  if (!config.target.apiKey) {
    problems.push(
      "INTERNAL_API_KEY no está definida: el agente rechazará las peticiones con 401.",
    );
  }

  if (config.judge.enabled && !config.judge.apiKey) {
    problems.push(
      "El juez está activo pero no hay EVAL_JUDGE_API_KEY ni OPEN_RESPONSES_API_KEY.",
    );
  }

  if (config.judge.enabled && config.judge.model === config.target.model) {
    problems.push(
      `El juez usa el mismo modelo que el sistema evaluado (${config.judge.model}): riesgo de self-preference bias.`,
    );
  }

  return problems;
}

export function allCategories(): EvalCategory[] {
  return [...EVAL_CATEGORIES];
}

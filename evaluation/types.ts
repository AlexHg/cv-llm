export const EVAL_CATEGORIES = [
  "factual",
  "temporal",
  "grounding",
  "recruiter",
  "technical",
  "scope",
  "adversarial",
  "multiturn",
] as const;

export type EvalCategory = (typeof EVAL_CATEGORIES)[number];

export const SEVERITIES = ["critical", "high", "medium"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const JUDGE_DIMENSIONS = [
  "groundedness",
  "factual_accuracy",
  "completeness",
  "relevance",
  "persona",
  "scope_compliance",
  "citation_quality",
] as const;

export type JudgeDimension = (typeof JUDGE_DIMENSIONS)[number];

/**
 * Aserciones deterministas. Se evalúan sobre el texto normalizado
 * (minúsculas, sin diacríticos, guiones unificados).
 */
export interface Assertions {
  /** Todos estos fragmentos deben aparecer. */
  mustIncludeAll?: string[];
  /** Cada grupo es un OR: al menos un fragmento del grupo debe aparecer. */
  mustIncludeAny?: string[][];
  /** Ninguno de estos fragmentos puede aparecer. */
  mustNotInclude?: string[];
  /** Patrones (RegExp como string, flags iu) que deben coincidir. */
  mustMatch?: string[];
  /** Patrones que no deben coincidir. */
  mustNotMatch?: string[];
  /** Exige al menos una cita del tipo experience:<id>, project:<id>, skill:<nombre>… */
  requireCitation?: boolean;
  /** La respuesta debe ser un rechazo por fuera de alcance. */
  expectRefusal?: boolean;
  /** La respuesta NO debe ser un rechazo (p. ej. saludos). */
  forbidRefusal?: boolean;
  maxWords?: number;
  minWords?: number;
}

export interface EvalCase {
  /** Identificador estable: nunca se reutiliza ni se renumera. */
  id: string;
  category: EvalCategory;
  /** Qué mide el caso, para el informe. */
  title: string;
  severity: Severity;
  tags: string[];
  /** Turnos de usuario en orden. El último es el que se puntúa. */
  turns: string[];
  /** Respuesta/hechos de referencia curados a mano (gold). */
  reference: string;
  /** Criterios extra que el juez debe aplicar a este caso. */
  rubric?: string[];
  assertions?: Assertions;
  /** Dimensiones del juez; si falta, se usan las de la categoría. */
  dimensions?: JudgeDimension[];
  /** Peso del caso en el agregado global (default 1). */
  weight?: number;
}

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
  /**
   * Un check no bloqueante no tumba el caso: alimenta su propia métrica.
   * Se reserva para requisitos transversales que, si fallaran en bloque,
   * enmascararían todo lo demás del informe.
   */
  blocking: boolean;
}

export interface DimensionScore {
  name: JudgeDimension;
  score: number;
  justification: string;
  evidence: string;
}

export interface JudgeVerdict {
  reasoning: string;
  dimensions: DimensionScore[];
  hallucinations: string[];
  verdict: "pass" | "fail";
  /** Muestras individuales cuando se usa self-consistency (k > 1). */
  samples?: number;
  /** Puntuación normalizada 0..1 ponderada por dimensión. */
  normalized: number;
  error?: string;
}

export interface TurnTrace {
  question: string;
  answer: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

export interface CaseAttempt {
  attempt: number;
  answer: string;
  turns: TurnTrace[];
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  checks: CheckResult[];
  deterministicPassed: boolean;
  judge?: JudgeVerdict;
  passed: boolean;
  failureReasons: string[];
  /** Checks no bloqueantes fallidos: se reportan, no tumban el caso. */
  advisories: string[];
  error?: string;
}

export interface CaseResult {
  case: EvalCase;
  attempts: CaseAttempt[];
  /** Proporción de intentos que pasaron. */
  passRate: number;
  /** pass^k: pasó en todos los intentos. */
  passedAll: boolean;
  flaky: boolean;
  judgeScore: number;
  latencyMs: number;
  costUsd: number;
}

export interface CategorySummary {
  category: EvalCategory;
  total: number;
  passed: number;
  passRate: number;
  judgeScore: number;
  threshold: number;
  gatePassed: boolean;
}

export interface DimensionSummary {
  name: JudgeDimension;
  mean: number;
  min: number;
  samples: number;
}

export interface GateFinding {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface RunReport {
  meta: {
    runId: string;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    datasetVersion: string;
    gitSha: string;
    target: {
      name: string;
      baseUrl: string;
      model: string;
      channel: string;
    };
    judge: {
      enabled: boolean;
      model: string;
      samples: number;
    };
    repeats: number;
    concurrency: number;
    filters: Record<string, string | number | undefined>;
  };
  totals: {
    cases: number;
    attempts: number;
    passed: number;
    passRate: number;
    passRateCi: [number, number];
    judgeScore: number;
    flaky: number;
    errors: number;
    hallucinationCases: number;
    latencyP50: number;
    latencyP95: number;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    judgeAgreement: number | null;
    /** Proporción de respuestas que citan su origen entre las que deben hacerlo. */
    citationRate: number | null;
  };
  categories: CategorySummary[];
  dimensions: DimensionSummary[];
  gate: {
    passed: boolean;
    findings: GateFinding[];
  };
  regressions: {
    baselineRunId: string;
    broke: string[];
    fixed: string[];
  } | null;
  results: CaseResult[];
}

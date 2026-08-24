import { execFileSync } from "node:child_process";
import { estimateCost, type EvalConfig } from "./config";
import { DATASET_VERSION } from "./dataset/ground-truth";
import { mapPool } from "./lib/pool";
import { mean, percentile, round, wilsonInterval } from "./lib/stats";
import { truncate } from "./lib/text";
import {
  CITATION_CHECK,
  failedAdvisories,
  failedChecks,
  runChecks,
} from "./scorers/deterministic";
import { judgeCase } from "./scorers/judge";
import { runTarget } from "./targets/open-responses";
import {
  EVAL_CATEGORIES,
  JUDGE_DIMENSIONS,
  type CaseAttempt,
  type CaseResult,
  type CategorySummary,
  type DimensionSummary,
  type EvalCase,
  type GateFinding,
  type RunReport,
} from "./types";

export interface RunnerOptions {
  filters: Record<string, string | number | undefined>;
  baseline?: RunReport;
  onProgress?: (result: CaseResult, done: number, total: number) => void;
}

function gitSha() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

async function runAttempt(
  config: EvalConfig,
  item: EvalCase,
  attempt: number,
): Promise<CaseAttempt> {
  const empty: CaseAttempt = {
    attempt,
    answer: "",
    turns: [],
    latencyMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    checks: [],
    deterministicPassed: false,
    passed: false,
    failureReasons: [],
    advisories: [],
  };

  let run: Awaited<ReturnType<typeof runTarget>>;

  try {
    run = await runTarget(config, item.turns);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...empty,
      error: message,
      failureReasons: [`error del agente: ${message}`],
    };
  }

  const checks = runChecks(item, run.answer);
  const failed = failedChecks(checks);
  const failureReasons = failed.map((check) =>
    check.detail ? `${check.label} (${check.detail})` : check.label,
  );

  const attemptResult: CaseAttempt = {
    ...empty,
    answer: run.answer,
    turns: run.turns,
    latencyMs: run.latencyMs,
    inputTokens: run.inputTokens,
    outputTokens: run.outputTokens,
    costUsd: run.costUsd,
    checks,
    deterministicPassed: failed.length === 0,
    failureReasons,
    advisories: failedAdvisories(checks).map((check) => check.label),
  };

  if (!config.judge.enabled) {
    attemptResult.passed = attemptResult.deterministicPassed;
    return attemptResult;
  }

  const outcome = await judgeCase(config, item, run.answer);
  attemptResult.judge = outcome.verdict;
  attemptResult.costUsd += estimateCost(
    config.judge.model,
    outcome.inputTokens,
    outcome.outputTokens,
  );

  if (outcome.verdict.error) {
    attemptResult.failureReasons.push(`juez no disponible: ${outcome.verdict.error}`);
    attemptResult.passed = false;
    return attemptResult;
  }

  if (outcome.verdict.verdict === "fail") {
    attemptResult.failureReasons.push(
      `veredicto del juez: fail — ${truncate(outcome.verdict.reasoning, 200)}`,
    );
  }

  if (outcome.verdict.normalized < config.gate.caseJudgeThreshold) {
    attemptResult.failureReasons.push(
      `puntuación de rúbrica ${round(outcome.verdict.normalized, 2)} < ${config.gate.caseJudgeThreshold}`,
    );
  }

  const groundedness = outcome.verdict.dimensions.find(
    (dimension) => dimension.name === "groundedness",
  );

  if (groundedness && groundedness.score < config.gate.minGroundedness) {
    attemptResult.failureReasons.push(
      `groundedness ${groundedness.score}/5 < ${config.gate.minGroundedness}`,
    );
  }

  attemptResult.passed = attemptResult.failureReasons.length === 0;
  return attemptResult;
}

async function runCase(
  config: EvalConfig,
  item: EvalCase,
): Promise<CaseResult> {
  const attempts: CaseAttempt[] = [];

  for (let attempt = 1; attempt <= config.run.repeats; attempt += 1) {
    attempts.push(await runAttempt(config, item, attempt));
  }

  const passed = attempts.filter((attempt) => attempt.passed).length;
  const passRate = passed / attempts.length;

  return {
    case: item,
    attempts,
    passRate,
    passedAll: passed === attempts.length,
    flaky: passed > 0 && passed < attempts.length,
    judgeScore: mean(
      attempts.map((attempt) => attempt.judge?.normalized ?? 0),
    ),
    latencyMs: mean(attempts.map((attempt) => attempt.latencyMs)),
    costUsd: attempts.reduce((sum, attempt) => sum + attempt.costUsd, 0),
  };
}

function summarizeCategories(
  config: EvalConfig,
  results: CaseResult[],
): CategorySummary[] {
  return EVAL_CATEGORIES.map((category) => {
    const scoped = results.filter((result) => result.case.category === category);
    const passed = scoped.filter((result) => result.passedAll).length;
    const threshold = config.gate.categoryThresholds[category];
    const passRate = scoped.length ? passed / scoped.length : 1;

    return {
      category,
      total: scoped.length,
      passed,
      passRate,
      judgeScore: mean(scoped.map((result) => result.judgeScore)),
      threshold,
      gatePassed: !scoped.length || passRate >= threshold,
    };
  }).filter((summary) => summary.total > 0);
}

function summarizeDimensions(results: CaseResult[]): DimensionSummary[] {
  return JUDGE_DIMENSIONS.map((name) => {
    const scores = results.flatMap((result) =>
      result.attempts.flatMap(
        (attempt) =>
          attempt.judge?.dimensions
            .filter((dimension) => dimension.name === name)
            .map((dimension) => dimension.score) ?? [],
      ),
    );

    return {
      name,
      mean: mean(scores),
      min: scores.length ? Math.min(...scores) : 0,
      samples: scores.length,
    };
  }).filter((summary) => summary.samples > 0);
}

/**
 * Concordancia entre las dos señales independientes del pipeline.
 * Si el juez y los asserts discrepan mucho, una de las dos capas está mal
 * calibrada: es el control de calidad del propio evaluador.
 */
function judgeAgreement(results: CaseResult[]) {
  const comparable = results.flatMap((result) =>
    result.attempts
      .filter((attempt) => attempt.judge && !attempt.judge.error && attempt.checks.length > 1)
      .map((attempt) => ({
        judge: attempt.judge!.verdict === "pass",
        checks: attempt.deterministicPassed,
      })),
  );

  if (!comparable.length) return null;

  const agreed = comparable.filter((item) => item.judge === item.checks).length;
  return agreed / comparable.length;
}

/** Cobertura de citas entre los casos que las exigen (check no bloqueante). */
function citationRate(results: CaseResult[]) {
  const checks = results.flatMap((result) =>
    result.attempts.flatMap((attempt) =>
      attempt.checks.filter((check) => check.id === CITATION_CHECK),
    ),
  );

  if (!checks.length) return null;
  return checks.filter((check) => check.passed).length / checks.length;
}

function buildGate(
  config: EvalConfig,
  results: CaseResult[],
  categories: CategorySummary[],
  totals: {
    passRate: number;
    judgeScore: number;
    latencyP95: number;
    citationRate: number | null;
  },
): { passed: boolean; findings: GateFinding[] } {
  const findings: GateFinding[] = [];

  findings.push({
    id: "overall_pass_rate",
    label: "Pass rate global",
    passed: totals.passRate >= config.gate.overallPassRate,
    detail: `${round(totals.passRate * 100, 1)}% (mínimo ${config.gate.overallPassRate * 100}%)`,
  });

  const critical = results.filter((result) => result.case.severity === "critical");
  const criticalPassed = critical.filter((result) => result.passedAll).length;
  const criticalRate = critical.length ? criticalPassed / critical.length : 1;
  const criticalFailures = critical
    .filter((result) => !result.passedAll)
    .map((result) => result.case.id);

  findings.push({
    id: "critical_pass_rate",
    label: "Casos críticos",
    passed: criticalRate >= config.gate.criticalPassRate,
    detail: criticalFailures.length
      ? `fallan ${criticalFailures.join(", ")}`
      : `${criticalPassed}/${critical.length} en verde`,
  });

  findings.push({
    id: "judge_score",
    label: "Puntuación media de rúbrica",
    passed:
      !config.judge.enabled || totals.judgeScore >= config.gate.minJudgeScore,
    detail: `${round(totals.judgeScore, 3)} (mínimo ${config.gate.minJudgeScore})`,
  });

  if (totals.citationRate != null) {
    findings.push({
      id: "citation_rate",
      label: "Cumplimiento de citas",
      passed: totals.citationRate >= config.gate.minCitationRate,
      detail: `${round(totals.citationRate * 100, 1)}% (mínimo ${config.gate.minCitationRate * 100}%)`,
    });
  }

  findings.push({
    id: "latency_p95",
    label: "Latencia p95",
    passed: totals.latencyP95 <= config.gate.maxLatencyP95Ms,
    detail: `${totals.latencyP95} ms (máximo ${config.gate.maxLatencyP95Ms} ms)`,
  });

  for (const summary of categories) {
    findings.push({
      id: `category:${summary.category}`,
      label: `Categoría ${summary.category}`,
      passed: summary.gatePassed,
      detail: `${round(summary.passRate * 100, 1)}% (mínimo ${summary.threshold * 100}%)`,
    });
  }

  return {
    passed: findings.every((finding) => finding.passed),
    findings,
  };
}

function compareBaseline(baseline: RunReport | undefined, results: CaseResult[]) {
  if (!baseline) return null;

  const previous = new Map(
    baseline.results.map((result) => [result.case.id, result.passedAll]),
  );

  const broke: string[] = [];
  const fixed: string[] = [];

  for (const result of results) {
    const before = previous.get(result.case.id);
    if (before == null) continue;
    if (before && !result.passedAll) broke.push(result.case.id);
    if (!before && result.passedAll) fixed.push(result.case.id);
  }

  return { baselineRunId: baseline.meta.runId, broke, fixed };
}

export async function runEvaluation(
  config: EvalConfig,
  cases: EvalCase[],
  options: RunnerOptions,
): Promise<RunReport> {
  const startedAt = new Date();
  let done = 0;

  const results = await mapPool(cases, config.run.concurrency, async (item) => {
    const result = await runCase(config, item);
    done += 1;
    options.onProgress?.(result, done, cases.length);
    return result;
  });

  const finishedAt = new Date();
  const attempts = results.flatMap((result) => result.attempts);
  const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
  const passedCases = results.filter((result) => result.passedAll).length;
  const latencies = attempts
    .filter((attempt) => attempt.latencyMs > 0)
    .map((attempt) => attempt.latencyMs);

  const totals = {
    cases: results.length,
    attempts: attempts.length,
    passed: passedCases,
    passRate: results.length ? passedCases / results.length : 0,
    passRateCi: wilsonInterval(passedAttempts, attempts.length),
    judgeScore: mean(results.map((result) => result.judgeScore)),
    flaky: results.filter((result) => result.flaky).length,
    errors: attempts.filter((attempt) => attempt.error).length,
    hallucinationCases: results.filter((result) =>
      result.attempts.some((attempt) => attempt.judge?.hallucinations.length),
    ).length,
    latencyP50: Math.round(percentile(latencies, 50)),
    latencyP95: Math.round(percentile(latencies, 95)),
    inputTokens: attempts.reduce((sum, attempt) => sum + attempt.inputTokens, 0),
    outputTokens: attempts.reduce((sum, attempt) => sum + attempt.outputTokens, 0),
    costUsd: attempts.reduce((sum, attempt) => sum + attempt.costUsd, 0),
    judgeAgreement: judgeAgreement(results),
    citationRate: citationRate(results),
  };

  const categories = summarizeCategories(config, results);

  return {
    meta: {
      runId: startedAt.toISOString().replace(/[:.]/g, "-"),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      datasetVersion: DATASET_VERSION,
      gitSha: gitSha(),
      target: {
        name: "open-responses",
        baseUrl: config.target.baseUrl,
        model: config.target.model,
        channel: config.target.channel,
      },
      judge: {
        enabled: config.judge.enabled,
        model: config.judge.model,
        samples: config.judge.samples,
      },
      repeats: config.run.repeats,
      concurrency: config.run.concurrency,
      filters: options.filters,
    },
    totals,
    categories,
    dimensions: summarizeDimensions(results),
    gate: buildGate(config, results, categories, totals),
    regressions: compareBaseline(options.baseline, results),
    results,
  };
}

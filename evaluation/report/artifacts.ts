import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RunReport } from "../types";
import { renderMarkdown } from "./markdown";

export interface WrittenArtifacts {
  dir: string;
  reportJson: string;
  reportMarkdown: string;
  traces: string;
}

/**
 * Una fila por intento, en JSONL: es el formato que aguanta análisis posterior
 * (comparar dos modelos, buscar patrones de fallo) sin volver a pagar la corrida.
 */
function renderTraces(report: RunReport) {
  const rows = report.results.flatMap((result) =>
    result.attempts.map((attempt) => ({
      runId: report.meta.runId,
      gitSha: report.meta.gitSha,
      datasetVersion: report.meta.datasetVersion,
      targetModel: report.meta.target.model,
      judgeModel: report.meta.judge.enabled ? report.meta.judge.model : null,
      caseId: result.case.id,
      category: result.case.category,
      severity: result.case.severity,
      tags: result.case.tags,
      attempt: attempt.attempt,
      turns: attempt.turns,
      answer: attempt.answer,
      passed: attempt.passed,
      failureReasons: attempt.failureReasons,
      advisories: attempt.advisories,
      checks: attempt.checks,
      judge: attempt.judge ?? null,
      latencyMs: attempt.latencyMs,
      inputTokens: attempt.inputTokens,
      outputTokens: attempt.outputTokens,
      costUsd: attempt.costUsd,
      error: attempt.error ?? null,
    })),
  );

  return rows.map((row) => JSON.stringify(row)).join("\n");
}

export function writeArtifacts(
  report: RunReport,
  outDir: string,
): WrittenArtifacts {
  const dir = path.resolve(outDir, report.meta.runId);
  mkdirSync(dir, { recursive: true });

  const reportJson = path.join(dir, "run.json");
  const reportMarkdown = path.join(dir, "report.md");
  const traces = path.join(dir, "traces.jsonl");

  writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(reportMarkdown, `${renderMarkdown(report)}\n`, "utf8");
  writeFileSync(traces, `${renderTraces(report)}\n`, "utf8");

  // Puntero estable para CI y para `--baseline latest`.
  writeFileSync(
    path.resolve(outDir, "latest.json"),
    `${JSON.stringify({ runId: report.meta.runId, dir }, null, 2)}\n`,
    "utf8",
  );

  return { dir, reportJson, reportMarkdown, traces };
}

export function readBaseline(outDir: string, reference: string): RunReport {
  if (reference === "latest") {
    const pointer = JSON.parse(
      readFileSync(path.resolve(outDir, "latest.json"), "utf8"),
    ) as { dir: string };
    return JSON.parse(
      readFileSync(path.join(pointer.dir, "run.json"), "utf8"),
    ) as RunReport;
  }

  const resolved = reference.endsWith(".json")
    ? reference
    : path.join(reference, "run.json");

  return JSON.parse(readFileSync(resolved, "utf8")) as RunReport;
}

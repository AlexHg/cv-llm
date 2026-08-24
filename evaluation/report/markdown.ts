import { percent, round } from "../lib/stats";
import type { RunReport } from "../types";

function quote(text: string) {
  return text
    .trim()
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

function cell(text: string) {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function renderMarkdown(report: RunReport) {
  const { meta, totals } = report;
  const lines: string[] = [];

  lines.push(`# Informe de evaluación · ${meta.runId}`);
  lines.push("");
  lines.push(
    `${report.gate.passed ? "**GATE OK**" : "**GATE FALLIDO**"} · pass rate **${percent(totals.passRate)}** (${totals.passed}/${totals.cases}) · rúbrica **${round(totals.judgeScore, 3)}**`,
  );
  lines.push("");

  lines.push("## Contexto");
  lines.push("");
  lines.push("| Campo | Valor |");
  lines.push("| --- | --- |");
  lines.push(`| Dataset | ${meta.datasetVersion} |`);
  lines.push(`| Commit | \`${meta.gitSha}\` |`);
  lines.push(`| Inicio | ${meta.startedAt} |`);
  lines.push(`| Duración | ${Math.round(meta.durationMs / 1000)} s |`);
  lines.push(
    `| Agente | ${meta.target.baseUrl} · modelo \`${meta.target.model}\` · canal ${meta.target.channel} |`,
  );
  lines.push(
    `| Juez | ${meta.judge.enabled ? `\`${meta.judge.model}\` · k=${meta.judge.samples}` : "desactivado"} |`,
  );
  lines.push(`| Repeticiones | ${meta.repeats} |`);
  lines.push(`| Concurrencia | ${meta.concurrency} |`);
  lines.push("");

  lines.push("## Métricas");
  lines.push("");
  lines.push("| Métrica | Valor |");
  lines.push("| --- | --- |");
  lines.push(
    `| Pass rate | ${percent(totals.passRate)} (IC95 ${percent(totals.passRateCi[0])} – ${percent(totals.passRateCi[1])}) |`,
  );
  lines.push(`| Rúbrica ponderada | ${round(totals.judgeScore, 3)} |`);
  lines.push(`| Casos con alucinación | ${totals.hallucinationCases} |`);
  lines.push(`| Flaky | ${totals.flaky} |`);
  lines.push(`| Errores de ejecución | ${totals.errors} |`);
  lines.push(`| Latencia p50 / p95 | ${totals.latencyP50} ms / ${totals.latencyP95} ms |`);
  lines.push(
    `| Tokens (in / out) | ${totals.inputTokens} / ${totals.outputTokens} |`,
  );
  lines.push(`| Coste estimado | $${round(totals.costUsd, 4)} |`);
  if (totals.citationRate != null) {
    lines.push(`| Cumplimiento de citas | ${percent(totals.citationRate)} |`);
  }
  if (totals.judgeAgreement != null) {
    lines.push(
      `| Concordancia juez ↔ asserts | ${percent(totals.judgeAgreement)} |`,
    );
  }
  lines.push("");

  lines.push("## Por categoría");
  lines.push("");
  lines.push("| Categoría | Pasan | Pass rate | Umbral | Rúbrica | Gate |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const summary of report.categories) {
    lines.push(
      `| ${summary.category} | ${summary.passed}/${summary.total} | ${percent(summary.passRate)} | ${percent(summary.threshold)} | ${round(summary.judgeScore, 2)} | ${summary.gatePassed ? "ok" : "bajo"} |`,
    );
  }
  lines.push("");

  if (report.dimensions.length) {
    lines.push("## Dimensiones de la rúbrica");
    lines.push("");
    lines.push("| Dimensión | Media (1–5) | Mínimo | Muestras |");
    lines.push("| --- | --- | --- | --- |");
    for (const dimension of report.dimensions) {
      lines.push(
        `| ${dimension.name} | ${round(dimension.mean, 2)} | ${dimension.min} | ${dimension.samples} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Gate");
  lines.push("");
  lines.push("| Control | Estado | Detalle |");
  lines.push("| --- | --- | --- |");
  for (const finding of report.gate.findings) {
    lines.push(
      `| ${finding.label} | ${finding.passed ? "✅" : "❌"} | ${cell(finding.detail)} |`,
    );
  }
  lines.push("");

  if (report.regressions) {
    lines.push("## Comparación con baseline");
    lines.push("");
    lines.push(`Baseline: \`${report.regressions.baselineRunId}\``);
    lines.push("");
    lines.push(
      `- Regresiones: ${report.regressions.broke.length ? report.regressions.broke.join(", ") : "ninguna"}`,
    );
    lines.push(
      `- Arreglados: ${report.regressions.fixed.length ? report.regressions.fixed.join(", ") : "ninguno"}`,
    );
    lines.push("");
  }

  const failures = report.results.filter((result) => !result.passedAll);

  lines.push(`## Fallos (${failures.length})`);
  lines.push("");

  if (!failures.length) {
    lines.push("Sin fallos en esta corrida.");
    lines.push("");
  }

  for (const failure of failures) {
    const attempt = failure.attempts.find((item) => !item.passed) ?? failure.attempts[0];

    lines.push(
      `### ${failure.case.id} · ${failure.case.title} (${failure.case.category}, ${failure.case.severity})`,
    );
    lines.push("");
    lines.push(`**Conversación**`);
    lines.push("");
    for (const [index, turn] of failure.case.turns.entries()) {
      lines.push(`${index + 1}. ${turn}`);
    }
    lines.push("");
    lines.push("**Referencia**");
    lines.push("");
    lines.push(quote(failure.case.reference));
    lines.push("");
    lines.push("**Respuesta del agente**");
    lines.push("");
    lines.push(quote(attempt?.answer || "(sin respuesta)"));
    lines.push("");
    lines.push("**Motivos del fallo**");
    lines.push("");
    for (const reason of failure.attempts.flatMap((item) => item.failureReasons)) {
      lines.push(`- ${reason}`);
    }
    lines.push("");

    if (attempt?.judge?.dimensions.length) {
      lines.push("**Rúbrica**");
      lines.push("");
      lines.push("| Dimensión | Puntuación | Justificación |");
      lines.push("| --- | --- | --- |");
      for (const dimension of attempt.judge.dimensions) {
        lines.push(
          `| ${dimension.name} | ${dimension.score}/5 | ${cell(dimension.justification)} |`,
        );
      }
      lines.push("");
    }

    if (attempt?.judge?.hallucinations.length) {
      lines.push("**Afirmaciones sin soporte detectadas**");
      lines.push("");
      for (const claim of attempt.judge.hallucinations) {
        lines.push(`- ${claim}`);
      }
      lines.push("");
    }
  }

  lines.push("## Detalle completo");
  lines.push("");
  lines.push("| Caso | Categoría | Severidad | Resultado | Rúbrica | Latencia |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const result of report.results) {
    const status = result.flaky
      ? `flaky (${percent(result.passRate)})`
      : result.passedAll
        ? "pass"
        : "fail";
    lines.push(
      `| ${result.case.id} | ${result.case.category} | ${result.case.severity} | ${status} | ${round(result.judgeScore, 2)} | ${Math.round(result.latencyMs)} ms |`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

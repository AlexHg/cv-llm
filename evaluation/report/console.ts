import { percent, round } from "../lib/stats";
import { truncate } from "../lib/text";
import type { CaseResult, RunReport } from "../types";

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, text: string) {
  return useColor ? `\u001b[${code}m${text}\u001b[0m` : text;
}

const dim = (text: string) => paint("2", text);
const bold = (text: string) => paint("1", text);
const green = (text: string) => paint("32", text);
const red = (text: string) => paint("31", text);
const yellow = (text: string) => paint("33", text);

function badge(passed: boolean, flaky = false) {
  if (flaky) return yellow("FLAKY");
  return passed ? green("PASS ") : red("FAIL ");
}

function pad(text: string, width: number) {
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

export function printProgress(result: CaseResult, done: number, total: number) {
  const counter = dim(`[${String(done).padStart(3)}/${total}]`);
  const score = result.judgeScore
    ? dim(` rúbrica ${round(result.judgeScore, 2)}`)
    : "";
  const latency = dim(` ${Math.round(result.latencyMs)}ms`);

  process.stdout.write(
    `${counter} ${badge(result.passedAll, result.flaky)} ${pad(result.case.id, 8)} ${pad(result.case.category, 12)} ${truncate(result.case.title, 44)}${score}${latency}\n`,
  );

  if (!result.passedAll) {
    const reasons = result.attempts
      .flatMap((attempt) => attempt.failureReasons)
      .slice(0, 3);
    for (const reason of reasons) {
      process.stdout.write(`        ${dim("↳")} ${truncate(reason, 150)}\n`);
    }
  }
}

export function printSummary(report: RunReport) {
  const { totals, meta } = report;

  process.stdout.write(`\n${bold("Resumen")}\n`);
  process.stdout.write(
    `  dataset ${meta.datasetVersion} · ${totals.cases} casos · ${totals.attempts} intentos · commit ${meta.gitSha}\n`,
  );
  process.stdout.write(
    `  agente ${meta.target.baseUrl} (${meta.target.model}, canal ${meta.target.channel})\n`,
  );
  process.stdout.write(
    `  juez ${meta.judge.enabled ? `${meta.judge.model} · k=${meta.judge.samples}` : "desactivado"}\n\n`,
  );

  const ci = `[${percent(totals.passRateCi[0])} – ${percent(totals.passRateCi[1])}]`;
  process.stdout.write(
    `  pass rate        ${bold(percent(totals.passRate))} (${totals.passed}/${totals.cases})  IC95 ${ci}\n`,
  );
  process.stdout.write(
    `  rúbrica media    ${round(totals.judgeScore, 3)}\n`,
  );
  process.stdout.write(
    `  alucinaciones    ${totals.hallucinationCases} casos\n`,
  );
  process.stdout.write(
    `  flaky / errores  ${totals.flaky} / ${totals.errors}\n`,
  );
  process.stdout.write(
    `  latencia p50/p95 ${totals.latencyP50} ms / ${totals.latencyP95} ms\n`,
  );
  process.stdout.write(
    `  tokens           ${totals.inputTokens} in / ${totals.outputTokens} out  ~$${round(totals.costUsd, 4)}\n`,
  );
  if (totals.citationRate != null) {
    process.stdout.write(
      `  citan su origen  ${percent(totals.citationRate)} de los casos que lo exigen\n`,
    );
  }
  if (totals.judgeAgreement != null) {
    process.stdout.write(
      `  juez vs asserts  ${percent(totals.judgeAgreement)} de concordancia\n`,
    );
  }

  process.stdout.write(`\n${bold("Por categoría")}\n`);
  for (const summary of report.categories) {
    const status = summary.gatePassed ? green("ok  ") : red("bajo");
    process.stdout.write(
      `  ${status} ${pad(summary.category, 12)} ${pad(`${summary.passed}/${summary.total}`, 7)} ${pad(percent(summary.passRate), 7)} umbral ${percent(summary.threshold)}  rúbrica ${round(summary.judgeScore, 2)}\n`,
    );
  }

  if (report.dimensions.length) {
    process.stdout.write(`\n${bold("Dimensiones de la rúbrica (1–5)")}\n`);
    for (const dimension of report.dimensions) {
      process.stdout.write(
        `  ${pad(dimension.name, 18)} media ${round(dimension.mean, 2)}  mín ${dimension.min}  n=${dimension.samples}\n`,
      );
    }
  }

  const failures = report.results.filter((result) => !result.passedAll);
  if (failures.length) {
    process.stdout.write(`\n${bold("Fallos")}\n`);
    for (const failure of failures) {
      process.stdout.write(
        `  ${red(failure.case.id)} ${failure.case.severity} · ${failure.case.title}\n`,
      );
      process.stdout.write(
        `     ${dim("pregunta")} ${truncate(failure.case.turns[failure.case.turns.length - 1], 120)}\n`,
      );
      for (const reason of failure.attempts.flatMap(
        (attempt) => attempt.failureReasons,
      )) {
        process.stdout.write(`     ${dim("·")} ${truncate(reason, 180)}\n`);
      }
      const answer = failure.attempts[0]?.answer;
      if (answer) {
        process.stdout.write(`     ${dim("respuesta")} ${truncate(answer, 220)}\n`);
      }
    }
  }

  if (report.regressions) {
    process.stdout.write(`\n${bold("Comparación con baseline")}\n`);
    process.stdout.write(`  baseline ${report.regressions.baselineRunId}\n`);
    process.stdout.write(
      `  ${report.regressions.broke.length ? red(`regresiones: ${report.regressions.broke.join(", ")}`) : green("sin regresiones")}\n`,
    );
    if (report.regressions.fixed.length) {
      process.stdout.write(
        `  ${green(`arreglados: ${report.regressions.fixed.join(", ")}`)}\n`,
      );
    }
  }

  process.stdout.write(`\n${bold("Gate")}\n`);
  for (const finding of report.gate.findings) {
    const status = finding.passed ? green("✓") : red("✗");
    process.stdout.write(`  ${status} ${pad(finding.label, 30)} ${finding.detail}\n`);
  }

  process.stdout.write(
    `\n${report.gate.passed ? green(bold("GATE OK")) : red(bold("GATE FALLIDO"))}\n\n`,
  );
}

import { assertConfig, loadConfig, type ConfigOverrides } from "./config";
import { DATASET, datasetStats, selectCases, validateDataset } from "./dataset";
import { loadEnvFiles } from "./lib/env";
import { readBaseline, writeArtifacts } from "./report/artifacts";
import { printProgress, printSummary } from "./report/console";
import { runEvaluation } from "./runner";
import { callResponses } from "./targets/responses-client";
import {
  EVAL_CATEGORIES,
  SEVERITIES,
  type EvalCategory,
  type RunReport,
  type Severity,
} from "./types";

const USAGE = `
Pipeline de evaluación del agente de CV.

Uso: pnpm eval [opciones]

Selección
  --category <lista>    Categorías separadas por coma: ${EVAL_CATEGORIES.join(", ")}
  --severity <lista>    ${SEVERITIES.join(", ")}
  --tag <lista>         Filtra por tags del dataset (p. ej. trap, hallucination)
  --id <lista>          Casos concretos: TMP-001,GRD-002
  --limit <n>           Corta el dataset a n casos (smoke test)
  --list                Muestra el dataset y sale

Sistema evaluado
  --url <base>          Base del agente (default http://localhost:3000)
  --model <modelo>      Alias de modelo enviado al agente (default cv)

Juez
  --judge-model <m>     Modelo juez (default gpt-4o)
  --judge-samples <k>   Self-consistency: k muestras y mediana (default 1)
  --no-judge            Solo aserciones deterministas (gratis, sin LLM)

Ejecución
  --repeats <n>         Repite cada caso n veces y mide flakiness (default 1)
  --concurrency <n>     Casos en paralelo (default 4)
  --out <dir>           Directorio de resultados (default evaluation/results)
  --baseline <ref>      Compara con una corrida previa: ruta a run.json, su
                        directorio, o "latest"
  --no-preflight        Omite la comprobación de conectividad inicial
  --help

Variables: INTERNAL_API_KEY, OPEN_RESPONSES_API_KEY, EVAL_TARGET_URL,
EVAL_JUDGE_MODEL, EVAL_JUDGE_API_KEY, EVAL_JUDGE_URL, EVAL_CONCURRENCY.
`;

interface Args {
  flags: Set<string>;
  values: Map<string, string>;
}

function parseArgs(argv: string[]): Args {
  const flags = new Set<string>();
  const values = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      flags.add(key);
      continue;
    }

    values.set(key, next);
    index += 1;
  }

  return { flags, values };
}

function list(values: Map<string, string>, key: string) {
  const raw = values.get(key);
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function integer(values: Map<string, string>, key: string) {
  const raw = values.get(key);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function fail(message: string): never {
  process.stderr.write(`\n${message}\n`);
  process.exit(2);
}

function printDataset() {
  const stats = datasetStats();
  process.stdout.write(
    `\nDataset: ${stats.total} casos, ${stats.turns} turnos de usuario\n`,
  );
  process.stdout.write(
    `Por categoría: ${Object.entries(stats.byCategory)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ")}\n`,
  );
  process.stdout.write(
    `Por severidad: ${Object.entries(stats.bySeverity)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ")}\n\n`,
  );

  for (const item of DATASET) {
    process.stdout.write(
      `  ${item.id.padEnd(8)} ${item.category.padEnd(12)} ${item.severity.padEnd(9)} ${item.title}\n`,
    );
  }
  process.stdout.write("\n");
}

async function preflight(baseUrl: string, apiKey: string, model: string) {
  try {
    await callResponses({
      url: `${baseUrl}/v1/responses`,
      apiKey,
      body: { model, input: "ping" },
      timeoutMs: 30_000,
      retries: 0,
      baseDelayMs: 500,
      label: "preflight",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(
      [
        `No se pudo hablar con el agente en ${baseUrl}/v1/responses`,
        `  ${detail}`,
        "",
        "Comprueba que el servidor está levantado (pnpm dev) y que INTERNAL_API_KEY",
        "y OPEN_RESPONSES_API_KEY están configuradas. Usa --no-preflight para omitir.",
      ].join("\n"),
    );
  }
}

async function main() {
  loadEnvFiles();

  const { flags, values } = parseArgs(process.argv.slice(2));

  if (flags.has("help")) {
    process.stdout.write(USAGE);
    return;
  }

  const datasetProblems = validateDataset();
  if (datasetProblems.length) {
    fail(`Dataset inválido:\n  ${datasetProblems.join("\n  ")}`);
  }

  if (flags.has("list")) {
    printDataset();
    return;
  }

  const overrides: ConfigOverrides = {
    baseUrl: values.get("url"),
    model: values.get("model"),
    judgeModel: values.get("judge-model"),
    judge: flags.has("no-judge") ? false : undefined,
    judgeSamples: integer(values, "judge-samples"),
    concurrency: integer(values, "concurrency"),
    repeats: integer(values, "repeats"),
    outDir: values.get("out"),
  };

  const config = loadConfig(overrides);
  const problems = assertConfig(config);

  for (const problem of problems) {
    process.stderr.write(`aviso: ${problem}\n`);
  }

  if (!config.target.apiKey) {
    fail("INTERNAL_API_KEY es obligatoria para llamar al agente.");
  }

  const categories = list(values, "category") as EvalCategory[] | undefined;
  const severities = list(values, "severity") as Severity[] | undefined;

  for (const category of categories ?? []) {
    if (!EVAL_CATEGORIES.includes(category)) {
      fail(`Categoría desconocida: ${category}`);
    }
  }

  for (const severity of severities ?? []) {
    if (!SEVERITIES.includes(severity)) {
      fail(`Severidad desconocida: ${severity}`);
    }
  }

  const cases = selectCases({
    categories,
    severities,
    tags: list(values, "tag"),
    ids: list(values, "id"),
    limit: integer(values, "limit"),
  });

  if (!cases.length) {
    fail("Ningún caso coincide con los filtros.");
  }

  let baseline: RunReport | undefined;
  const baselineRef = values.get("baseline");

  if (baselineRef) {
    try {
      baseline = readBaseline(config.run.outDir, baselineRef);
    } catch (error) {
      fail(
        `No se pudo leer el baseline «${baselineRef}»: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (!flags.has("no-preflight")) {
    await preflight(
      config.target.baseUrl,
      config.target.apiKey,
      config.target.model,
    );
  }

  process.stdout.write(
    `\nEvaluando ${cases.length} casos × ${config.run.repeats} intento(s) con concurrencia ${config.run.concurrency}\n\n`,
  );

  const report = await runEvaluation(config, cases, {
    filters: {
      categories: categories?.join(","),
      severities: severities?.join(","),
      tags: list(values, "tag")?.join(","),
      ids: list(values, "id")?.join(","),
      limit: integer(values, "limit"),
    },
    baseline,
    onProgress: printProgress,
  });

  printSummary(report);

  const artifacts = writeArtifacts(report, config.run.outDir);
  process.stdout.write(`Informe: ${artifacts.reportMarkdown}\n`);
  process.stdout.write(`Trazas:  ${artifacts.traces}\n\n`);

  const regressed = Boolean(report.regressions?.broke.length);
  process.exit(report.gate.passed && !regressed ? 0 : 1);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `\nError inesperado: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(2);
});

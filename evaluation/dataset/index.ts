import type { EvalCase, EvalCategory, Severity } from "../types";
import { adversarialCases } from "./cases/adversarial";
import { factualCases } from "./cases/factual";
import { groundingCases } from "./cases/grounding";
import { multiturnCases } from "./cases/multiturn";
import { recruiterCases } from "./cases/recruiter";
import { scopeCases } from "./cases/scope";
import { technicalCases } from "./cases/technical";
import { temporalCases } from "./cases/temporal";

export { DATASET_VERSION, GROUND_TRUTH } from "./ground-truth";

export const DATASET: EvalCase[] = [
  ...factualCases,
  ...temporalCases,
  ...groundingCases,
  ...recruiterCases,
  ...technicalCases,
  ...scopeCases,
  ...adversarialCases,
  ...multiturnCases,
];

export interface DatasetFilters {
  categories?: EvalCategory[];
  severities?: Severity[];
  tags?: string[];
  ids?: string[];
  limit?: number;
}

export function selectCases(filters: DatasetFilters = {}) {
  let cases = DATASET;

  if (filters.ids?.length) {
    const wanted = new Set(filters.ids.map((id) => id.toUpperCase()));
    cases = cases.filter((item) => wanted.has(item.id.toUpperCase()));
  }

  if (filters.categories?.length) {
    const wanted = new Set(filters.categories);
    cases = cases.filter((item) => wanted.has(item.category));
  }

  if (filters.severities?.length) {
    const wanted = new Set(filters.severities);
    cases = cases.filter((item) => wanted.has(item.severity));
  }

  if (filters.tags?.length) {
    const wanted = new Set(filters.tags.map((tag) => tag.toLowerCase()));
    cases = cases.filter((item) =>
      item.tags.some((tag) => wanted.has(tag.toLowerCase())),
    );
  }

  return filters.limit ? cases.slice(0, filters.limit) : cases;
}

/** Invariantes del dataset. Un dataset mal formado invalida cualquier métrica. */
export function validateDataset(cases: EvalCase[] = DATASET) {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const item of cases) {
    if (seen.has(item.id)) problems.push(`id duplicado: ${item.id}`);
    seen.add(item.id);

    if (!item.turns.length) problems.push(`${item.id}: sin turnos`);
    if (item.turns.some((turn) => !turn.trim())) {
      problems.push(`${item.id}: turno vacío`);
    }
    if (!item.reference.trim()) problems.push(`${item.id}: sin referencia`);
    if (!item.tags.length) problems.push(`${item.id}: sin tags`);
    if (item.turns.length > 1 && item.category !== "multiturn") {
      problems.push(`${item.id}: multiturno fuera de la categoría multiturn`);
    }
    if (
      item.assertions?.expectRefusal &&
      item.assertions?.forbidRefusal
    ) {
      problems.push(`${item.id}: expectRefusal y forbidRefusal a la vez`);
    }

    for (const pattern of [
      ...(item.assertions?.mustMatch ?? []),
      ...(item.assertions?.mustNotMatch ?? []),
    ]) {
      try {
        new RegExp(pattern, "iu");
      } catch {
        problems.push(`${item.id}: patrón inválido ${pattern}`);
      }
    }
  }

  return problems;
}

export function datasetStats(cases: EvalCase[] = DATASET) {
  const byCategory = new Map<EvalCategory, number>();
  const bySeverity = new Map<Severity, number>();

  for (const item of cases) {
    byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);
    bySeverity.set(item.severity, (bySeverity.get(item.severity) ?? 0) + 1);
  }

  return {
    total: cases.length,
    turns: cases.reduce((sum, item) => sum + item.turns.length, 0),
    byCategory: Object.fromEntries(byCategory) as Record<EvalCategory, number>,
    bySeverity: Object.fromEntries(bySeverity) as Record<Severity, number>,
  };
}

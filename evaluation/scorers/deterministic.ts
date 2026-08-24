import {
  countWords,
  hasCitation,
  looksLikeRefusal,
  looksSpanish,
  normalize,
  truncate,
} from "../lib/text";
import type { CheckResult, EvalCase } from "../types";

function check(
  id: string,
  label: string,
  passed: boolean,
  detail?: string,
  blocking = true,
): CheckResult {
  return { id, label, passed, detail, blocking };
}

/** Id del único check no bloqueante: ver `CITATION_CHECK` en el informe. */
export const CITATION_CHECK = "citation";

/**
 * Capa 1 de scoring: barata, determinista y no negociable.
 *
 * Todo lo que se puede verificar con una cadena o un patrón se verifica aquí
 * y no se delega al juez: un LLM no debería opinar sobre si «1 año y 8 meses»
 * aparece en el texto. El juez queda para lo que sí es semántico.
 */
export function runChecks(item: EvalCase, answer: string): CheckResult[] {
  const results: CheckResult[] = [];
  const normalized = normalize(answer);
  const assertions = item.assertions ?? {};

  results.push(
    check("non_empty", "Respuesta no vacía", normalized.length > 0),
  );

  if (!normalized.length) return results;

  results.push(
    check(
      "language_es",
      "Responde en español",
      looksSpanish(answer),
      truncate(answer, 120),
    ),
  );

  for (const phrase of assertions.mustIncludeAll ?? []) {
    results.push(
      check(
        `include:${phrase}`,
        `Contiene «${phrase}»`,
        normalized.includes(normalize(phrase)),
      ),
    );
  }

  for (const [index, group] of (assertions.mustIncludeAny ?? []).entries()) {
    const hit = group.find((phrase) => normalized.includes(normalize(phrase)));
    results.push(
      check(
        `include_any:${index}`,
        `Contiene alguno de [${group.slice(0, 4).join(" | ")}${group.length > 4 ? " | …" : ""}]`,
        Boolean(hit),
      ),
    );
  }

  for (const phrase of assertions.mustNotInclude ?? []) {
    results.push(
      check(
        `exclude:${phrase}`,
        `No contiene «${phrase}»`,
        !normalized.includes(normalize(phrase)),
      ),
    );
  }

  for (const pattern of assertions.mustMatch ?? []) {
    const regex = new RegExp(pattern, "iu");
    results.push(
      check(`match:${pattern}`, `Coincide con /${pattern}/`, regex.test(normalized)),
    );
  }

  for (const pattern of assertions.mustNotMatch ?? []) {
    const regex = new RegExp(pattern, "iu");
    const match = regex.exec(normalized);
    results.push(
      check(
        `not_match:${pattern}`,
        `No coincide con /${pattern}/`,
        !match,
        match ? `coincidencia: «${truncate(match[0], 120)}»` : undefined,
      ),
    );
  }

  if (assertions.requireCitation) {
    // No bloqueante: el system prompt exige citar el origen, pero si un modelo
    // deja de citar en prosa fallarían muchos casos por el mismo motivo y el
    // informe dejaría de mostrar cualquier otra regresión. Se mide aparte,
    // con su propio control en el gate.
    results.push(
      check(
        CITATION_CHECK,
        "Cita el origen (experience:/project:/skill:/company:)",
        hasCitation(answer),
        undefined,
        false,
      ),
    );
  }

  if (assertions.expectRefusal) {
    results.push(
      check(
        "refusal_expected",
        "Rechaza por fuera de alcance",
        looksLikeRefusal(answer),
      ),
    );
  }

  if (assertions.forbidRefusal) {
    results.push(
      check(
        "refusal_forbidden",
        "No rechaza una petición válida",
        !looksLikeRefusal(answer),
      ),
    );
  }

  const words = countWords(answer);

  if (assertions.maxWords != null) {
    results.push(
      check(
        "max_words",
        `Máximo ${assertions.maxWords} palabras`,
        words <= assertions.maxWords,
        `${words} palabras`,
      ),
    );
  }

  if (assertions.minWords != null) {
    results.push(
      check(
        "min_words",
        `Mínimo ${assertions.minWords} palabras`,
        words >= assertions.minWords,
        `${words} palabras`,
      ),
    );
  }

  return results;
}

export function failedChecks(checks: CheckResult[]) {
  return checks.filter((item) => !item.passed && item.blocking);
}

export function failedAdvisories(checks: CheckResult[]) {
  return checks.filter((item) => !item.passed && !item.blocking);
}

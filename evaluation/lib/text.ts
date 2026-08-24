const DIACRITICS = /[\u0300-\u036f]/g;
const DASHES = /[\u2010-\u2015\u2212]/g;
const QUOTES = /[\u00ab\u00bb\u201c\u201d\u2018\u2019]/g;

/**
 * Normalización para comparar aserciones contra la respuesta del modelo:
 * minúsculas, sin diacríticos, guiones y comillas unificados, espacios colapsados.
 * Sin esto un simple «Jun 2019 – Jul 2024» vs «Jun 2019 - Jul 2024» daría falso negativo.
 */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(DASHES, "-")
    .replace(QUOTES, '"')
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function includesNormalized(haystack: string, needle: string) {
  return normalize(haystack).includes(normalize(needle));
}

export function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const REFUSAL_PATTERNS = [
  /lo siento/i,
  /no puedo ayudar/i,
  /agente especializado/i,
  /fuera de (mi )?(alcance|tema)/i,
  /no esta relacionado con el perfil/i,
  /solo puedo (hablar|responder|ayudar)/i,
];

/**
 * Detecta el rechazo por fuera de alcance que exige el system prompt.
 * Es heurístico a propósito: el juez confirma la intención, esto solo tamiza.
 */
export function looksLikeRefusal(text: string) {
  const normalized = normalize(text);
  return REFUSAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

const CITATION_PATTERN =
  /\b(experience|project|competency|company):[a-z0-9][a-z0-9._-]*|\bskill:\s*[a-z0-9]|\bidentity\b/i;

export function hasCitation(text: string) {
  return CITATION_PATTERN.test(normalize(text));
}

const SPANISH_MARKERS = [
  " el ",
  " la ",
  " los ",
  " las ",
  " de ",
  " en ",
  " con ",
  " que ",
  " para ",
  " su ",
  " como ",
  " tiene ",
  " y ",
];

const ENGLISH_MARKERS = [
  " the ",
  " and ",
  " with ",
  " for ",
  " his ",
  " her ",
  " that ",
  " has ",
  " from ",
  " this ",
];

/** El agente debe responder en español; una fuga al inglés es un fallo de instrucción. */
export function looksSpanish(text: string) {
  const padded = ` ${normalize(text)} `;
  const spanish = SPANISH_MARKERS.filter((marker) =>
    padded.includes(marker),
  ).length;
  const english = ENGLISH_MARKERS.filter((marker) =>
    padded.includes(marker),
  ).length;
  return spanish >= english;
}

export function truncate(text: string, max = 280) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

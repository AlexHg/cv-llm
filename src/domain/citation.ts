import { normalize } from "@/domain/text";

export type CitationKind =
  | "identity"
  | "experience"
  | "project"
  | "skill"
  | "competency"
  | "company";

export interface ParsedCitation {
  kind: CitationKind;
  raw: string;
  value?: string;
}

export type CitationSegment =
  | { type: "text"; value: string }
  | { type: "citation"; value: string; citation: ParsedCitation };

/** Catálogo serializable (RSC → cliente) para resolver una cita a keys del CV. */
export interface CitationCatalog {
  experienceIds: string[];
  projectIds: string[];
  skills: Record<string, string>;
  technologies: Record<string, string[]>;
  competencies: Record<string, string[]>;
  companies: Record<string, string[]>;
}

const KIND_IDS = new Set<CitationKind>([
  "experience",
  "project",
  "competency",
  "company",
]);

/**
 * Un token de cita. El modelo a veces agrupa varios en el mismo
 * paréntesis: (experience:a, experience:b).
 */
export const CITATION_TOKEN =
  /identity|(?:experience|project|competency|company):[a-z0-9][a-z0-9._-]*|skill:[^),;\n]+/gi;

const SEPARATORS = /[,;]|\b(?:y|and|e)\b/gi;

export function skillCiteKey(name: string) {
  return `skill:${normalize(name).replace(/\s+/g, "-")}`;
}

export function parseCitation(raw: string): ParsedCitation | null {
  const body = raw.trim().replace(/^\(|\)$/g, "").trim();
  if (!body) return null;

  if (/^identity$/i.test(body)) {
    return { kind: "identity", raw: "identity" };
  }

  const typed = /^(experience|project|competency|company):([a-z0-9][a-z0-9._-]*)$/i.exec(
    body,
  );
  if (typed) {
    const kind = typed[1].toLowerCase() as CitationKind;
    if (!KIND_IDS.has(kind)) return null;
    const value = typed[2].toLowerCase();
    return { kind, value, raw: `${kind}:${value}` };
  }

  const skill = /^skill:(.+)$/i.exec(body);
  if (skill) {
    const value = skill[1].trim();
    if (!value) return null;
    return { kind: "skill", value, raw: `skill:${value}` };
  }

  return null;
}

function extractTokens(inner: string) {
  const citations: ParsedCitation[] = [];
  const leftover = inner
    .replace(new RegExp(CITATION_TOKEN.source, "gi"), (token) => {
      const parsed = parseCitation(token.trim());
      if (parsed) citations.push(parsed);
      return "\0";
    })
    .replace(/\0/g, "")
    .replace(SEPARATORS, "")
    .trim();

  return leftover === "" ? citations : [];
}

/** Una cita o una lista (experience:a, experience:b) dentro del mismo paréntesis. */
export function parseCitationList(raw: string): ParsedCitation[] {
  const inner = raw.trim().replace(/^\(|\)$/g, "").trim();
  if (!inner) return [];

  const single = parseCitation(inner);
  if (single) return [single];

  return extractTokens(inner);
}

function expandGroup(full: string, inner: string): CitationSegment[] {
  const single = parseCitation(inner);
  if (single) {
    return [{ type: "citation", value: full, citation: single }];
  }

  const segments: CitationSegment[] = [{ type: "text", value: "(" }];
  const tokenPattern = new RegExp(CITATION_TOKEN.source, "gi");
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(inner))) {
    if (match.index > last) {
      segments.push({ type: "text", value: inner.slice(last, match.index) });
    }

    const citation = parseCitation(match[0]);
    if (citation) {
      segments.push({ type: "citation", value: match[0], citation });
    } else {
      segments.push({ type: "text", value: match[0] });
    }

    last = match.index + match[0].length;
  }

  if (last < inner.length) {
    segments.push({ type: "text", value: inner.slice(last) });
  }

  segments.push({ type: "text", value: ")" });
  return segments;
}

export function splitCitationSegments(text: string): CitationSegment[] {
  const segments: CitationSegment[] = [];
  const groupPattern = /\(([^)]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = groupPattern.exec(text))) {
    const inner = match[1] ?? "";
    if (!parseCitationList(inner).length) continue;

    if (match.index > last) {
      segments.push({ type: "text", value: text.slice(last, match.index) });
    }

    segments.push(...expandGroup(match[0], inner));
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    segments.push({ type: "text", value: text.slice(last) });
  }

  return segments.length ? segments : [{ type: "text", value: text }];
}

function lookupExactOrUnique(
  keys: string[],
  query: string,
): string | undefined {
  const needle = normalize(query);
  if (!needle) return undefined;
  if (keys.includes(needle)) return needle;

  const matches = keys.filter(
    (key) => key.includes(needle) || needle.includes(key),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function resolveCitationKeys(
  citation: ParsedCitation,
  catalog: CitationCatalog,
): string[] {
  if (citation.kind === "identity") return ["identity"];

  if (citation.kind === "experience") {
    const id = citation.value;
    return id && catalog.experienceIds.includes(id) ? [`experience:${id}`] : [];
  }

  if (citation.kind === "project") {
    const id = citation.value;
    return id && catalog.projectIds.includes(id) ? [`project:${id}`] : [];
  }

  if (citation.kind === "company") {
    const slug = citation.value;
    return slug ? (catalog.companies[slug] ?? []) : [];
  }

  if (citation.kind === "competency") {
    const id = citation.value;
    return id ? (catalog.competencies[id] ?? []) : [];
  }

  const name = citation.value ?? "";
  const skillHit = lookupExactOrUnique(Object.keys(catalog.skills), name);
  if (skillHit) return [catalog.skills[skillHit]];

  const techHit = lookupExactOrUnique(Object.keys(catalog.technologies), name);
  return techHit ? unique(catalog.technologies[techHit]) : [];
}

import type { CvExperience, CvSideProject } from "@/domain/cv";
import type { ProfileSnapshot } from "@/domain/profile";
import { normalize, stripHtml } from "@/domain/text";

export interface TechnologySource {
  citation: string;
  label: string;
}

export interface TechnologyEntry {
  name: string;
  level?: number;
  sources: TechnologySource[];
}

export interface CountryCoverage {
  country: string;
  companies: string[];
}

/** Separadores de los campos compuestos: «NestJS (Node.js)», «MongoDB/CosmosDB», «PHP & Symfony». */
const TERM_SEPARATORS = /[()/&,]+/;

/**
 * Fragmentos que salen de partir un campo compuesto pero no nombran una
 * tecnología rastreable: «JS» aparece dentro de casi cualquier stack y «Design»
 * es la mitad descriptiva de la habilidad «CSS & Design».
 */
const IGNORED_TERMS = new Set(["js", "design"]);

interface Draft {
  forms: Map<string, number>;
  variants: Set<string>;
  sources: Map<string, string>;
  level?: number;
}

function splitTerm(raw: string) {
  return raw
    .split(TERM_SEPARATORS)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

/**
 * Une las variantes de nombre del mismo framework: Next.js/Nextjs, VueJS/Vue,
 * NestJS/Nestjs, Node.js/Nodejs. Sin esto el índice duplica entradas y el
 * agente ve dos tecnologías donde solo hay una.
 */
function canonicalKey(term: string) {
  const base = normalize(term);
  if (!base) return "";
  const stripped = base.replace(/\s?js$/, "");
  return stripped.length >= 3 ? stripped : base;
}

function experienceLabel(job: CvExperience) {
  return `${job.company} · ${job.title}`;
}

function projectLabel(project: CvSideProject) {
  return project.title;
}

function blobOf(parts: (string | string[])[]) {
  const flat = parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .map((part) => stripHtml(part));
  return ` ${normalize(flat.join(" "))} `;
}

function experienceBlob(job: CvExperience) {
  return blobOf([
    job.title,
    job.description,
    job.responsibilities,
    job.achievements,
    job.technologies,
  ]);
}

function projectBlob(project: CvSideProject) {
  return blobOf([
    project.title,
    project.description,
    project.keywords,
    project.problem,
    project.role,
    project.architecture,
    project.challenges,
    project.results,
    project.learnings,
  ]);
}

function upsert(drafts: Map<string, Draft>, key: string) {
  const existing = drafts.get(key);
  if (existing) return existing;
  const draft: Draft = { forms: new Map(), variants: new Set(), sources: new Map() };
  drafts.set(key, draft);
  return draft;
}

interface AddTermOptions {
  source?: TechnologySource;
  level?: number;
  /** La grafía solo cuenta una vez por campo del CV: si cada evidencia de una
   * habilidad sumara, «Nestjs» del nombre de la habilidad ganaría a «NestJS»
   * de las palabras clave y el agente escribiría la variante menos usada. */
  countForm?: boolean;
}

function addTerm(
  drafts: Map<string, Draft>,
  raw: string,
  { source, level, countForm = true }: AddTermOptions = {},
) {
  for (const term of splitTerm(raw)) {
    const key = canonicalKey(term);
    if (!key || IGNORED_TERMS.has(key)) continue;

    const draft = upsert(drafts, key);
    if (countForm) draft.forms.set(term, (draft.forms.get(term) ?? 0) + 1);
    draft.variants.add(normalize(term));
    if (source) draft.sources.set(source.citation, source.label);
    if (level !== undefined) draft.level ??= level;
  }
}

function displayName(forms: Map<string, number>) {
  return [...forms.entries()].sort((left, right) => {
    if (right[1] !== left[1]) return right[1] - left[1];
    if (right[0].length !== left[0].length) return right[0].length - left[0].length;
    return left[0].localeCompare(right[0]);
  })[0][0];
}

/**
 * Índice invertido tecnología → dónde consta. El modelo fallaba justo aquí:
 * respondía «Redis solo en Chequemotiva» o negaba Azure y GCP porque el dato
 * vive en las palabras clave de un proyecto y no en la lista de habilidades.
 * Se construye en dos pasadas: primero el vocabulario de los campos
 * estructurados (tecnologías del empleo, palabras clave del proyecto, nombre de
 * la habilidad) y después un barrido del texto libre buscando solo ese
 * vocabulario, para no inventar términos a partir de la prosa.
 */
export function buildTechnologyIndex(snapshot: ProfileSnapshot): TechnologyEntry[] {
  const drafts = new Map<string, Draft>();
  const labels = new Map<string, string>();
  const blobs: { source: TechnologySource; blob: string }[] = [];

  for (const job of snapshot.experience) {
    const source = { citation: `experience:${job.id}`, label: experienceLabel(job) };
    labels.set(source.citation, source.label);
    blobs.push({ source, blob: experienceBlob(job) });
    for (const technology of job.technologies) addTerm(drafts, technology, { source });
  }

  for (const project of snapshot.projects) {
    const source = { citation: `project:${project.id}`, label: projectLabel(project) };
    labels.set(source.citation, source.label);
    blobs.push({ source, blob: projectBlob(project) });
    for (const keyword of project.keywords.split(",")) {
      addTerm(drafts, keyword, { source });
    }
  }

  for (const skill of snapshot.skills) {
    addTerm(drafts, skill.name, { level: skill.level });
    for (const evidence of skill.evidence) {
      const citation = `${evidence.kind}:${evidence.id}`;
      const label = labels.get(citation);
      if (!label) continue;
      addTerm(drafts, skill.name, {
        source: { citation, label },
        level: skill.level,
        countForm: false,
      });
    }
  }

  for (const draft of drafts.values()) {
    for (const variant of draft.variants) {
      const needle = ` ${variant} `;
      for (const { source, blob } of blobs) {
        if (blob.includes(needle)) draft.sources.set(source.citation, source.label);
      }
    }
  }

  return [...drafts.entries()]
    .map(([key, draft]) => ({
      key,
      name: displayName(draft.forms),
      level: draft.level,
      sources: [...draft.sources.entries()].map(([citation, label]) => ({
        citation,
        label,
      })),
    }))
    .sort((left, right) => left.key.localeCompare(right.key))
    .map(({ name, level, sources }) => ({ name, level, sources }));
}

/**
 * Países del perfil a partir de las empresas. Chequemotiva declara
 * «México / España», así que un país puede venir de un campo compuesto.
 */
export interface TechnologyFamily {
  name: string;
  members: TechnologyEntry[];
}

/**
 * Familias que el agente recorre a medias cuando le piden un inventario
 * («¿con qué bases de datos?»). El agrupado sale del índice, no de un
 * catálogo paralelo, para no inventar miembros.
 */
const FAMILY_KEYS: { name: string; keys: string[] }[] = [
  {
    name: "Bases de datos y caché",
    keys: [
      "mongodb",
      "postgresql",
      "aurora",
      "rds databases",
      "rds",
      "sql",
      "bigquery",
      "cosmosdb",
      "redis",
      "memcache",
    ],
  },
  {
    name: "Mensajería y tiempo real",
    keys: ["mqtt", "sqs", "twilio", "sendinblue"],
  },
  {
    name: "Nubes",
    keys: ["aws", "azure", "gcp"],
  },
  {
    name: "GenAI y documentos",
    keys: ["rag", "gen-ai", "ocr"],
  },
];

export function groupTechnologyFamilies(
  index: TechnologyEntry[],
): TechnologyFamily[] {
  return FAMILY_KEYS.map((family) => ({
    name: family.name,
    members: index.filter((entry) =>
      family.keys.some(
        (key) =>
          entry.name.toLowerCase() === key ||
          entry.name.toLowerCase().includes(key),
      ),
    ),
  })).filter((family) => family.members.length > 0);
}

export function buildCountryCoverage(snapshot: ProfileSnapshot): CountryCoverage[] {
  const byCountry = new Map<string, string[]>();

  for (const company of snapshot.companies) {
    for (const raw of company.country.split("/")) {
      const country = raw.trim();
      if (!country) continue;
      const names = byCountry.get(country) ?? [];
      names.push(company.name);
      byCountry.set(country, names);
    }
  }

  return [...byCountry.entries()]
    .map(([country, companies]) => ({ country, companies }))
    .sort((left, right) => {
      if (right.companies.length !== left.companies.length) {
        return right.companies.length - left.companies.length;
      }
      return left.country.localeCompare(right.country);
    });
}

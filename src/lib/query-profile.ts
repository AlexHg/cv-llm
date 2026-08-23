import type { CompanyTenure, ExperienceFocus } from "@/data/types";
import {
  getExperience,
  getProjects,
  getSkills,
} from "@/data/resolve-cv";
import { lookupCompany } from "@/lib/lookup-company";
import {
  employmentTenures,
  findCompaniesForProject,
  relatedEmployerNote,
} from "@/lib/cv-tenure";
import { compareDates } from "@/lib/cv-dates";

export const QUERY_PROFILE_INTENTS = [
  "experience",
  "company_tenure",
  "projects",
  "skills",
] as const;

export type QueryProfileIntent = (typeof QUERY_PROFILE_INTENTS)[number];
export type QueryProfileSort = "recent" | "duration" | "level";

export interface QueryProfileInput {
  intent: QueryProfileIntent;
  company?: string;
  technology?: string;
  focus?: ExperienceFocus;
  sort?: QueryProfileSort;
}

type QueryMiss = {
  ok: false;
  intent: QueryProfileIntent;
  reason: "empty_query" | "not_found" | "ambiguous";
  available: string[];
  matches?: string[];
};

export type QueryProfileResult =
  | QueryMiss
  | {
      ok: true;
      intent: QueryProfileIntent;
      filters: {
        company?: string;
        technology?: string;
        focus?: ExperienceFocus;
        sort: QueryProfileSort;
      };
      notes: string[];
      highlights?: {
        longestCompany: CompanyTenure | null;
        longestRole: {
          id: string;
          title: string;
          company: string;
          period: string;
          durationLabel: string;
        } | null;
      };
      facts: unknown[];
    };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesNormalized(haystack: string, needle: string) {
  const left = normalize(haystack);
  const right = normalize(needle);
  return Boolean(right) && left.includes(right);
}

function defaultSort(intent: QueryProfileIntent): QueryProfileSort {
  if (intent === "company_tenure") return "duration";
  if (intent === "skills") return "level";
  return "recent";
}

function resolveCompanyFilter(query?: string): QueryMiss | { slug: string; name: string } | null {
  if (!query?.trim()) return null;

  const result = lookupCompany(query);
  if (!result.found) {
    return {
      ok: false,
      intent: "experience",
      reason: result.reason,
      available: result.available,
      matches: result.matches,
    };
  }

  return { slug: result.company.slug, name: result.company.name };
}

function experienceIdsForTechnology(technology: string) {
  const ids = new Set<string>();
  const { items } = getExperience();

  for (const job of items) {
    if (job.technologies.some((item) => includesNormalized(item, technology))) {
      ids.add(job.id);
    }
  }

  for (const skill of getSkills().items) {
    if (!includesNormalized(skill.name, technology)) continue;
    for (const evidence of skill.evidence) {
      if (evidence.kind === "experience") ids.add(evidence.id);
    }
  }

  return ids;
}

function projectMatchesTechnology(
  project: ReturnType<typeof getProjects>["items"][number],
  technology: string,
) {
  if (includesNormalized(project.keywords, technology)) return true;
  if (includesNormalized(project.architecture, technology)) return true;
  if (includesNormalized(project.title, technology)) return true;

  return getSkills().items.some(
    (skill) =>
      includesNormalized(skill.name, technology) &&
      skill.evidence.some(
        (evidence) => evidence.kind === "project" && evidence.id === project.id,
      ),
  );
}

function sortBy<T>(
  items: T[],
  sort: QueryProfileSort,
  accessors: {
    recent: (item: T) => number;
    duration: (item: T) => number;
    level: (item: T) => number;
  },
) {
  const key = sort === "level" ? accessors.level : sort === "duration" ? accessors.duration : accessors.recent;
  return [...items].sort((left, right) => key(right) - key(left));
}

function notesForTenures(tenures: CompanyTenure[]) {
  return tenures
    .map(relatedEmployerNote)
    .filter((note): note is string => Boolean(note));
}

export function queryProfile(input: QueryProfileInput): QueryProfileResult {
  const intent = input.intent;
  const sort = input.sort ?? defaultSort(intent);
  const companyFilter = resolveCompanyFilter(input.company);

  if (companyFilter && "ok" in companyFilter && companyFilter.ok === false) {
    return { ...companyFilter, intent };
  }

  const experience = getExperience();
  const projects = getProjects().items;
  const companySlug = companyFilter && "slug" in companyFilter ? companyFilter.slug : undefined;
  const notes: string[] = [];

  if (intent === "company_tenure") {
    let tenures = companySlug
      ? experience.byCompany.filter((item) => item.slug === companySlug)
      : employmentTenures(experience.byCompany);

    tenures = sortBy(tenures, sort === "level" ? "duration" : sort, {
      recent: (item) => compareDates(item.end, { year: 0 }, "end"),
      duration: (item) => item.durationMonths,
      level: (item) => item.durationMonths,
    });

    notes.push(...notesForTenures(tenures));
    if (!companySlug) {
      notes.push(
        "Para «dónde duró más» usa highlights.longestCompany (permanencia laboral). longestRole es el puesto individual más largo, no la empresa.",
      );
    }

    return {
      ok: true,
      intent,
      filters: {
        company: companyFilter && "name" in companyFilter ? companyFilter.name : undefined,
        technology: input.technology,
        focus: input.focus,
        sort: sort === "level" ? "duration" : sort,
      },
      notes,
      highlights: experience.highlights,
      facts: tenures,
    };
  }

  if (intent === "experience") {
    let jobs = experience.items;

    if (companySlug) {
      const tenure = experience.byCompany.find((item) => item.slug === companySlug);
      const allowed = new Set(tenure?.roles.map((role) => role.id) ?? []);
      jobs = jobs.filter((job) => allowed.has(job.id));
    }

    if (input.focus) {
      jobs = jobs.filter((job) => job.focuses.includes(input.focus!));
    }

    if (input.technology) {
      const allowed = experienceIdsForTechnology(input.technology);
      jobs = jobs.filter((job) => allowed.has(job.id));
    }

    const ordered = sortBy(jobs, sort === "level" ? "recent" : sort, {
      recent: (job) => compareDates(job.end, { year: 0 }, "end"),
      duration: (job) => job.durationMonths,
      level: (job) => job.durationMonths,
    });

    if (companySlug) {
      const tenure = experience.byCompany.find((item) => item.slug === companySlug);
      if (tenure) notes.push(...notesForTenures([tenure]));
    }

    return {
      ok: true,
      intent,
      filters: {
        company: companyFilter && "name" in companyFilter ? companyFilter.name : undefined,
        technology: input.technology,
        focus: input.focus,
        sort: sort === "level" ? "recent" : sort,
      },
      notes,
      highlights: experience.highlights,
      facts: ordered.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        period: job.period,
        durationMonths: job.durationMonths,
        durationLabel: job.durationLabel,
        focuses: job.focuses,
        technologies: job.technologies,
        citation: `experience:${job.id}`,
      })),
    };
  }

  if (intent === "projects") {
    let items = projects;

    if (companySlug) {
      items = items.filter((project) =>
        findCompaniesForProject(project.id).some((company) => company.slug === companySlug),
      );
    }

    if (input.technology) {
      items = items.filter((project) =>
        projectMatchesTechnology(project, input.technology!),
      );
    }

    const ordered = sortBy(items, sort === "level" ? "recent" : sort, {
      recent: (project) => compareDates(project.end, { year: 0 }, "end"),
      duration: (project) => project.durationMonths,
      level: (project) => project.durationMonths,
    });

    return {
      ok: true,
      intent,
      filters: {
        company: companyFilter && "name" in companyFilter ? companyFilter.name : undefined,
        technology: input.technology,
        focus: input.focus,
        sort: sort === "level" ? "recent" : sort,
      },
      notes,
      facts: ordered.map((project) => ({
        id: project.id,
        title: project.title,
        meta: project.meta,
        durationLabel: project.durationLabel,
        companies: findCompaniesForProject(project.id).map((company) => company.name),
        keywords: project.keywords,
        citation: `project:${project.id}`,
      })),
    };
  }

  const skills = getSkills().items.filter((skill) =>
    input.technology ? includesNormalized(skill.name, input.technology) : true,
  );

  const orderedSkills = sortBy(skills, sort === "duration" ? "level" : sort, {
    recent: (skill) => skill.level,
    duration: (skill) => skill.level,
    level: (skill) => skill.level,
  });

  return {
    ok: true,
    intent,
    filters: {
      company: companyFilter && "name" in companyFilter ? companyFilter.name : undefined,
      technology: input.technology,
      focus: input.focus,
      sort: "level",
    },
    notes,
    facts: orderedSkills.map((skill) => ({
      name: skill.name,
      level: skill.level,
      citation: `skill:${skill.name}`,
      evidence: skill.evidence.map((item) => ({
        citation: `${item.kind}:${item.id}`,
        how: item.how,
      })),
    })),
  };
}


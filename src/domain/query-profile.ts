import type { CompanyTenure, ExperienceFocus } from "@/domain/cv";
import { lookupCompany } from "@/domain/lookup-company";
import type { ProfileSnapshot } from "@/domain/snapshot";
import {
  employmentTenures,
  findCompaniesForProject,
  relatedEmployerNote,
} from "@/domain/tenure";
import { includesNormalized } from "@/domain/text";
import { compareDates } from "@/domain/dates";

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

function defaultSort(intent: QueryProfileIntent): QueryProfileSort {
  if (intent === "company_tenure") return "duration";
  if (intent === "skills") return "level";
  return "recent";
}

function resolveCompanyFilter(
  snapshot: ProfileSnapshot,
  query: string | undefined,
): QueryMiss | { slug: string; name: string } | null {
  if (!query?.trim()) return null;

  const result = lookupCompany(snapshot.companies, query);
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

function experienceIdsForTechnology(
  snapshot: ProfileSnapshot,
  technology: string,
) {
  const ids = new Set<string>();

  for (const job of snapshot.experience) {
    if (job.technologies.some((item) => includesNormalized(item, technology))) {
      ids.add(job.id);
    }
  }

  for (const skill of snapshot.skills) {
    if (!includesNormalized(skill.name, technology)) continue;
    for (const evidence of skill.evidence) {
      if (evidence.kind === "experience") ids.add(evidence.id);
    }
  }

  return ids;
}

function projectMatchesTechnology(
  snapshot: ProfileSnapshot,
  project: ProfileSnapshot["projects"][number],
  technology: string,
) {
  if (includesNormalized(project.keywords, technology)) return true;
  if (includesNormalized(project.architecture, technology)) return true;
  if (includesNormalized(project.title, technology)) return true;

  return snapshot.skills.some(
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
  const key =
    sort === "level"
      ? accessors.level
      : sort === "duration"
        ? accessors.duration
        : accessors.recent;
  return [...items].sort((left, right) => key(right) - key(left));
}

function notesForTenures(tenures: CompanyTenure[]) {
  return tenures
    .map(relatedEmployerNote)
    .filter((note): note is string => Boolean(note));
}

export function queryProfile(
  snapshot: ProfileSnapshot,
  input: QueryProfileInput,
): QueryProfileResult {
  const intent = input.intent;
  const sort = input.sort ?? defaultSort(intent);
  const companyFilter = resolveCompanyFilter(snapshot, input.company);

  if (companyFilter && "ok" in companyFilter && companyFilter.ok === false) {
    return { ...companyFilter, intent };
  }

  const companySlug =
    companyFilter && "slug" in companyFilter ? companyFilter.slug : undefined;
  const companyName =
    companyFilter && "name" in companyFilter ? companyFilter.name : undefined;
  const notes: string[] = [];

  if (intent === "company_tenure") {
    let tenures = companySlug
      ? snapshot.tenures.filter((item) => item.slug === companySlug)
      : employmentTenures(snapshot.tenures);

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
        company: companyName,
        technology: input.technology,
        focus: input.focus,
        sort: sort === "level" ? "duration" : sort,
      },
      notes,
      highlights: snapshot.highlights,
      facts: tenures,
    };
  }

  if (intent === "experience") {
    let jobs = snapshot.experience;

    if (companySlug) {
      const tenure = snapshot.tenures.find((item) => item.slug === companySlug);
      const allowed = new Set(tenure?.roles.map((role) => role.id) ?? []);
      jobs = jobs.filter((job) => allowed.has(job.id));
    }

    if (input.focus) {
      jobs = jobs.filter((job) => job.focuses.includes(input.focus!));
    }

    if (input.technology) {
      const allowed = experienceIdsForTechnology(snapshot, input.technology);
      jobs = jobs.filter((job) => allowed.has(job.id));
    }

    const ordered = sortBy(jobs, sort === "level" ? "recent" : sort, {
      recent: (job) => compareDates(job.end, { year: 0 }, "end"),
      duration: (job) => job.durationMonths,
      level: (job) => job.durationMonths,
    });

    if (companySlug) {
      const tenure = snapshot.tenures.find((item) => item.slug === companySlug);
      if (tenure) notes.push(...notesForTenures([tenure]));
    }

    return {
      ok: true,
      intent,
      filters: {
        company: companyName,
        technology: input.technology,
        focus: input.focus,
        sort: sort === "level" ? "recent" : sort,
      },
      notes,
      highlights: snapshot.highlights,
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
    let items = snapshot.projects;

    if (companySlug) {
      items = items.filter((project) =>
        findCompaniesForProject(snapshot.companies, project.id).some(
          (company) => company.slug === companySlug,
        ),
      );
    }

    if (input.technology) {
      items = items.filter((project) =>
        projectMatchesTechnology(snapshot, project, input.technology!),
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
        company: companyName,
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
        companies: findCompaniesForProject(snapshot.companies, project.id).map(
          (company) => company.name,
        ),
        keywords: project.keywords,
        citation: `project:${project.id}`,
      })),
    };
  }

  const skills = snapshot.skills.filter((skill) =>
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
      company: companyName,
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

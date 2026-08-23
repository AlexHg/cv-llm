import type { CompanyProfile } from "@/domain/company";
import type { CvExperience, CvSideProject, CvSkill } from "@/domain/cv";
import { queryProfile } from "@/domain/query-profile";
import type { ProfileSnapshot } from "@/domain/snapshot";
import { buildCompanyTenures, pickHighlights } from "@/domain/tenure";
import { describe, expect, it } from "vitest";

function job(
  overrides: Partial<CvExperience> &
    Pick<CvExperience, "id" | "company" | "start" | "end">,
): CvExperience {
  return {
    title: "Engineer",
    period: "2020 – 2021",
    durationMonths: 12,
    durationLabel: "1 año",
    description: "",
    page: 1,
    responsibilities: [],
    achievements: [],
    technologies: [],
    focuses: ["technical"],
    ...overrides,
  };
}

function project(
  overrides: Partial<CvSideProject> & Pick<CvSideProject, "id">,
): CvSideProject {
  return {
    title: overrides.id,
    meta: "",
    start: { year: 2021 },
    end: { year: 2021 },
    durationMonths: 12,
    durationLabel: "1 año",
    description: "",
    keywords: "",
    problem: "",
    role: "",
    architecture: "",
    challenges: [],
    results: [],
    learnings: [],
    ...overrides,
  };
}

function company(
  overrides: Partial<CompanyProfile> & Pick<CompanyProfile, "slug" | "name">,
): CompanyProfile {
  return {
    aliases: [overrides.slug],
    country: "México",
    sector: "Tech",
    summary: overrides.name,
    collaboration: { roles: [], experienceIds: [], projectIds: [] },
    ...overrides,
  };
}

const jobs = [
  job({
    id: "alpha-lead",
    title: "Lead",
    company: "Alpha",
    start: { year: 2024, month: 1 },
    end: { year: 2025, month: 1 },
    durationMonths: 12,
    technologies: ["TypeScript"],
    focuses: ["leadership", "genai"],
  }),
  job({
    id: "beta-dev",
    title: "Developer",
    company: "Beta",
    start: { year: 2020, month: 1 },
    end: { year: 2023, month: 1 },
    durationMonths: 36,
    technologies: ["Python"],
    focuses: ["technical"],
  }),
];

const projects = [
  project({
    id: "radar-app",
    title: "Radar App",
    keywords: "Redis, NestJS",
    architecture: "AWS ECS",
  }),
];

const skills: CvSkill[] = [
  {
    name: "AWS",
    level: 5,
    evidence: [
      { kind: "project", id: "radar-app", how: "ECS" },
      { kind: "experience", id: "beta-dev", how: "infra" },
    ],
  },
  {
    name: "TypeScript",
    level: 3,
    evidence: [{ kind: "experience", id: "alpha-lead", how: "app" }],
  },
];

const catalog = [
  company({
    slug: "alpha",
    name: "Alpha",
    aliases: ["alpha", "alfa"],
    collaboration: {
      roles: ["Lead"],
      experienceIds: ["alpha-lead"],
      projectIds: ["radar-app"],
    },
  }),
  company({
    slug: "beta",
    name: "Beta",
    aliases: ["beta"],
    collaboration: {
      roles: ["Developer"],
      experienceIds: ["beta-dev"],
      projectIds: [],
    },
  }),
  company({
    slug: "north-wind",
    name: "North Wind",
    aliases: [],
    collaboration: { roles: [], experienceIds: [], projectIds: ["radar-app"] },
  }),
  company({
    slug: "north-star",
    name: "North Star",
    aliases: [],
    collaboration: { roles: [], experienceIds: [], projectIds: [] },
  }),
];

const tenures = buildCompanyTenures(jobs, projects, catalog);

const snapshot: ProfileSnapshot = {
  experience: jobs,
  projects,
  skills,
  tenures,
  highlights: pickHighlights(jobs, tenures),
  companies: catalog,
};

function factIds(result: ReturnType<typeof queryProfile>) {
  if (!result.ok) return [];
  return result.facts.map((item) => (item as { id?: string; name?: string }).id ?? (item as { name: string }).name);
}

describe("queryProfile con snapshot fixture", () => {
  it("lista skills por nivel y filtra por tecnología", () => {
    const all = queryProfile(snapshot, { intent: "skills" });
    expect(all.ok).toBe(true);
    if (!all.ok) return;
    expect(all.filters.sort).toBe("level");
    expect(factIds(all)).toEqual(["AWS", "TypeScript"]);

    const aws = queryProfile(snapshot, { intent: "skills", technology: "aws" });
    expect(factIds(aws)).toEqual(["AWS"]);
  });

  it("ordena experiencia por duración o por recencia", () => {
    const byDuration = queryProfile(snapshot, {
      intent: "experience",
      sort: "duration",
    });
    const byRecent = queryProfile(snapshot, {
      intent: "experience",
      sort: "recent",
    });

    expect(factIds(byDuration)).toEqual(["beta-dev", "alpha-lead"]);
    expect(factIds(byRecent)).toEqual(["alpha-lead", "beta-dev"]);
  });

  it("filtra genai y cruza tecnología por evidencia de skill", () => {
    const genai = queryProfile(snapshot, { intent: "experience", focus: "genai" });
    expect(factIds(genai)).toEqual(["alpha-lead"]);

    const awsJobs = queryProfile(snapshot, {
      intent: "experience",
      technology: "AWS",
    });
    expect(factIds(awsJobs)).toEqual(["beta-dev"]);
  });

  it("filtra proyectos por empresa y por tecnología del keyword o evidencia", () => {
    const byCompany = queryProfile(snapshot, {
      intent: "projects",
      company: "alpha",
    });
    expect(factIds(byCompany)).toEqual(["radar-app"]);

    const byKeyword = queryProfile(snapshot, {
      intent: "projects",
      technology: "Redis",
    });
    expect(factIds(byKeyword)).toEqual(["radar-app"]);

    const bySkill = queryProfile(snapshot, {
      intent: "projects",
      technology: "AWS",
    });
    expect(factIds(bySkill)).toEqual(["radar-app"]);
  });

  it("propaga not_found y ambiguous del lookup", () => {
    const missing = queryProfile(snapshot, {
      intent: "experience",
      company: "zeta-unknown",
    });
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.reason).toBe("not_found");
    expect(missing.intent).toBe("experience");

    const ambiguous = queryProfile(snapshot, {
      intent: "company_tenure",
      company: "north",
    });
    expect(ambiguous.ok).toBe(false);
    if (ambiguous.ok) return;
    expect(ambiguous.reason).toBe("ambiguous");
    expect(ambiguous.intent).toBe("company_tenure");
  });

  it("ignora company en blanco y no inventa facts en snapshot vacío", () => {
    const blank = queryProfile(snapshot, {
      intent: "experience",
      company: "   ",
    });
    expect(blank.ok).toBe(true);
    if (!blank.ok) return;
    expect(factIds(blank)).toEqual(["alpha-lead", "beta-dev"]);

    const empty = queryProfile(
      {
        experience: [],
        projects: [],
        skills: [],
        tenures: [],
        highlights: { longestCompany: null, longestRole: null },
        companies: [],
      },
      { intent: "skills" },
    );
    expect(empty.ok).toBe(true);
    if (!empty.ok) return;
    expect(empty.facts).toEqual([]);
  });
});

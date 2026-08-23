import type { CompanyProfile } from "@/domain/company";
import type { CvExperience, CvSideProject } from "@/domain/cv";
import {
  buildCompanyTenures,
  employmentTenures,
  findCompaniesForProject,
  findCompanyForExperience,
  pickHighlights,
  relatedEmployerNote,
} from "@/domain/tenure";
import { describe, expect, it } from "vitest";

function job(
  overrides: Partial<CvExperience> &
    Pick<CvExperience, "id" | "company" | "start" | "end">,
): CvExperience {
  return {
    title: "Engineer",
    period: "",
    durationMonths: 0,
    durationLabel: "",
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
  overrides: Partial<CvSideProject> &
    Pick<CvSideProject, "id" | "start" | "end">,
): CvSideProject {
  return {
    title: overrides.id,
    meta: "",
    durationMonths: 0,
    durationLabel: "",
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
    aliases: [],
    country: "México",
    sector: "Tech",
    summary: overrides.name,
    collaboration: { roles: [], experienceIds: [], projectIds: [] },
    ...overrides,
  };
}

const studio = company({
  slug: "studio",
  name: "Studio",
  group: "Grupo Studio",
  relatedSlugs: ["spinoff"],
  collaboration: {
    roles: ["Dev", "Lead"],
    experienceIds: ["studio-dev", "studio-lead"],
    projectIds: ["shared-app"],
  },
});

const spinoff = company({
  slug: "spinoff",
  name: "Spinoff",
  group: "Grupo Studio",
  relatedSlugs: ["studio"],
  collaboration: {
    roles: ["Lead"],
    experienceIds: ["spinoff-lead"],
    projectIds: [],
  },
});

const client = company({
  slug: "client",
  name: "Client Co",
  collaboration: {
    roles: ["Consultor"],
    experienceIds: [],
    projectIds: ["shared-app"],
  },
});

const jobs = [
  job({
    id: "studio-lead",
    title: "Tech Lead",
    company: "Studio",
    start: { year: 2022, month: 5 },
    end: { year: 2024, month: 7 },
    durationMonths: 26,
  }),
  job({
    id: "studio-dev",
    title: "Developer",
    company: "Studio",
    start: { year: 2019, month: 6 },
    end: { year: 2022, month: 5 },
    durationMonths: 35,
  }),
  job({
    id: "spinoff-lead",
    title: "Tech Lead",
    company: "Spinoff",
    start: { year: 2024, month: 7 },
    end: { year: 2026, month: 3 },
    durationMonths: 20,
  }),
];

const projects = [
  project({
    id: "shared-app",
    start: { year: 2021 },
    end: { year: 2021 },
  }),
];

describe("buildCompanyTenures", () => {
  it("agrega dos roles de la misma empresa en un solo tramo", () => {
    const tenures = buildCompanyTenures(jobs, projects, [studio, spinoff, client]);
    const studioTenure = tenures.find((item) => item.slug === "studio");

    expect(studioTenure).toMatchObject({
      kind: "employment",
      period: "Jun 2019 – Jul 2024",
      durationMonths: 61,
      durationLabel: "5 años y 1 mes",
    });
    expect(studioTenure?.roles.map((role) => role.id)).toEqual([
      "studio-dev",
      "studio-lead",
    ]);
    expect(studioTenure?.related.map((item) => item.slug)).toEqual(["spinoff"]);
  });

  it("no suma meses de empresas related y marca kind project aparte", () => {
    const tenures = buildCompanyTenures(jobs, projects, [studio, spinoff, client]);
    const spinoffTenure = tenures.find((item) => item.slug === "spinoff");
    const clientTenure = tenures.find((item) => item.slug === "client");

    expect(spinoffTenure).toMatchObject({
      kind: "employment",
      durationMonths: 20,
      period: "Jul 2024 – Mar 2026",
    });
    expect(clientTenure).toMatchObject({
      kind: "project",
      durationMonths: 12,
      roles: [],
      projectIds: ["shared-app"],
    });
  });

  it("omite empresas sin jobs ni proyectos hidratados", () => {
    const orphan = company({
      slug: "ghost",
      name: "Ghost",
      collaboration: {
        roles: [],
        experienceIds: ["missing-job"],
        projectIds: ["missing-project"],
      },
    });

    expect(buildCompanyTenures(jobs, projects, [orphan])).toEqual([]);
  });
});

describe("highlights y notas", () => {
  it("elige la empresa laboral más larga, no el rol ni un proyecto", () => {
    const tenures = buildCompanyTenures(jobs, projects, [studio, spinoff, client]);
    const highlights = pickHighlights(jobs, tenures);

    expect(highlights.longestCompany?.slug).toBe("studio");
    expect(highlights.longestCompany?.durationMonths).toBe(61);
    expect(highlights.longestRole?.id).toBe("studio-dev");
    expect(employmentTenures(tenures).map((item) => item.slug)).toEqual([
      "studio",
      "spinoff",
    ]);
  });

  it("advierte que related no se fusiona", () => {
    const tenures = buildCompanyTenures(jobs, projects, [studio, spinoff, client]);
    const studioTenure = tenures.find((item) => item.slug === "studio");
    expect(studioTenure).toBeDefined();
    if (!studioTenure) return;

    expect(relatedEmployerNote(studioTenure)).toBe(
      "Studio es un empleador distinto de Spinoff (Grupo Studio). No fusionar periodos ni duraciones.",
    );
    expect(relatedEmployerNote({ ...studioTenure, related: [] })).toBeNull();
  });

  it("localiza empresa de un empleo y empresas de un proyecto compartido", () => {
    const catalog = [studio, spinoff, client];
    expect(findCompanyForExperience(catalog, "studio-lead")?.slug).toBe("studio");
    expect(findCompaniesForProject(catalog, "shared-app").map((item) => item.slug)).toEqual([
      "studio",
      "client",
    ]);
  });
});

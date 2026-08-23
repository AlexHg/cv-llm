import { companies } from "@/data/companies";
import { cvBase } from "@/data/cv";
import { describe, expect, it } from "vitest";

const experienceIds = cvBase.experience.map((job) => job.id);
const projectIds = cvBase.sideProjects.map((project) => project.id);
const companySlugs = companies.map((company) => company.slug);

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

describe("invariantes de IDs del CV", () => {
  it("no repite IDs de experiencia, proyectos ni slugs de empresa", () => {
    expect(unique(experienceIds)).toBe(true);
    expect(unique(projectIds)).toBe(true);
    expect(unique(companySlugs)).toBe(true);
  });

  it("cada experienceId y projectId de ficha existe en el CV", () => {
    const jobs = new Set(experienceIds);
    const projects = new Set(projectIds);

    for (const company of companies) {
      for (const id of company.collaboration.experienceIds) {
        expect(jobs.has(id), `${company.slug} apunta a experiencia inexistente: ${id}`).toBe(
          true,
        );
      }

      for (const id of company.collaboration.projectIds) {
        expect(projects.has(id), `${company.slug} apunta a proyecto inexistente: ${id}`).toBe(
          true,
        );
      }
    }
  });

  it("cada empleo está referenciado por una empresa; los proyectos pueden ser personales", () => {
    const linkedJobs = new Set(
      companies.flatMap((company) => company.collaboration.experienceIds),
    );

    expect([...experienceIds].filter((id) => !linkedJobs.has(id))).toEqual([]);
  });

  it("cada empresa tiene colaboración y relatedSlugs válidos", () => {
    const slugs = new Set(companySlugs);

    for (const company of companies) {
      const { experienceIds: jobs, projectIds: projects } = company.collaboration;
      expect(
        jobs.length + projects.length,
        `${company.slug} no tiene experiencia ni proyectos`,
      ).toBeGreaterThan(0);

      for (const related of company.relatedSlugs ?? []) {
        expect(slugs.has(related), `${company.slug} related desconocido: ${related}`).toBe(
          true,
        );
        expect(related, `${company.slug} no puede relacionarse consigo`).not.toBe(
          company.slug,
        );
      }
    }
  });

  it("un empleo no pertenece a dos empresas", () => {
    const owners = new Map<string, string>();

    for (const company of companies) {
      for (const id of company.collaboration.experienceIds) {
        const previous = owners.get(id);
        expect(
          previous,
          `${id} está en ${previous} y ${company.slug}`,
        ).toBeUndefined();
        owners.set(id, company.slug);
      }
    }
  });

  it("evidencia de skills y competencias apunta a IDs reales", () => {
    const jobs = new Set(experienceIds);
    const projects = new Set(projectIds);

    for (const skill of cvBase.skills) {
      for (const item of skill.evidence) {
        const pool = item.kind === "experience" ? jobs : projects;
        expect(
          pool.has(item.id),
          `skill ${skill.name} evidencia rota: ${item.kind}:${item.id}`,
        ).toBe(true);
      }
    }

    for (const competency of cvBase.competencies) {
      for (const source of competency.sources) {
        const pool = source.kind === "experience" ? jobs : projects;
        expect(
          pool.has(source.id),
          `competency ${competency.id} fuente rota: ${source.kind}:${source.id}`,
        ).toBe(true);
      }
    }
  });
});

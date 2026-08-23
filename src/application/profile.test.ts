import { agentPrompt } from "@/application/agent";
import { getProfile, getProfileSnapshot } from "@/application/profile";
import { toPrintView } from "@/application/print";
import { toCvDocument } from "@/application/cv-blocks";
import { lookupCompany } from "@/domain/lookup-company";
import { queryProfile } from "@/domain/query-profile";
import { resolveCompanyProfile } from "@/domain/resolve-company";
import type { ProfileSnapshot } from "@/domain/snapshot";
import { describe, expect, it } from "vitest";

const snapshot = getProfileSnapshot();

const emptySnapshot: ProfileSnapshot = {
  experience: [],
  projects: [],
  skills: [],
  tenures: [],
  highlights: { longestCompany: null, longestRole: null },
  companies: [],
};

describe("queryProfile es puro", () => {
  it("no lee el CV global: un snapshot vacío no inventa empleos", () => {
    const result = queryProfile(emptySnapshot, { intent: "company_tenure" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.facts).toEqual([]);
    expect(result.highlights?.longestCompany).toBeNull();
    expect(result.highlights?.longestRole).toBeNull();
  });

  it("lookupCompany no lee el catálogo global", () => {
    const result = lookupCompany([], "Cerocatorce");
    expect(result.found).toBe(false);
    if (result.found) return;
    expect(result.reason).toBe("not_found");
    expect(result.available).toEqual([]);
  });
});

describe("permanencia laboral", () => {
  it("no elige Chequemotiva como la empresa más larga", () => {
    const result = queryProfile(snapshot, { intent: "company_tenure" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.highlights?.longestCompany?.name).toBe("Cerocatorce");
    expect(result.highlights?.longestCompany?.period).toBe("Jun 2019 – Jul 2024");
    expect(result.highlights?.longestCompany?.durationMonths).toBe(61);
    expect(result.highlights?.longestCompany?.durationLabel).toBe("5 años y 1 mes");
    expect(result.highlights?.longestRole?.id).toBe("welfare-fullstack");
    expect(result.facts[0]).toMatchObject({ name: "Cerocatorce", durationMonths: 61 });
  });

  it("no fusiona Cerocatorce con Chequemotiva ni extiende a 2026", () => {
    const result = queryProfile(snapshot, {
      intent: "company_tenure",
      company: "Cerocatorce",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.facts).toHaveLength(1);
    expect(result.facts[0]).toMatchObject({
      name: "Cerocatorce",
      period: "Jun 2019 – Jul 2024",
      durationMonths: 61,
    });
    expect(JSON.stringify(result.facts[0])).not.toContain("2026");
    expect(result.notes.some((note) => note.includes("Chequemotiva"))).toBe(true);
  });

  it("agrega los dos roles de Cerocatorce en un solo tramo", () => {
    const result = queryProfile(snapshot, {
      intent: "experience",
      company: "cerocatorce",
      sort: "recent",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ids = result.facts.map((item) => (item as { id: string }).id);
    expect(ids).toEqual(["cerocatorce-techlead", "cerocatorce-devops"]);
  });
});

describe("otros filtros de query_profile", () => {
  it("filtra liderazgo sin inventar roles", () => {
    const result = queryProfile(snapshot, {
      intent: "experience",
      focus: "leadership",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ids = result.facts.map((item) => (item as { id: string }).id);
    expect(ids).toContain("chequemotiva-techlead");
    expect(ids).toContain("cerocatorce-techlead");
    expect(ids).not.toContain("cerocatorce-devops");
  });

  it("encuentra AWS por stack y por evidencia de skill", () => {
    const result = queryProfile(snapshot, {
      intent: "experience",
      technology: "AWS",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ids = result.facts.map((item) => (item as { id: string }).id);
    expect(ids).toContain("ebc-techlead");
    expect(ids).toContain("cerocatorce-devops");
    expect(ids).toContain("chequemotiva-techlead");
  });

  it("lista proyectos de Cerocatorce", () => {
    const result = queryProfile(snapshot, {
      intent: "projects",
      company: "Cerocatorce",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.facts).toEqual([
      expect.objectContaining({ id: "incentive-machine" }),
    ]);
  });
});

describe("ficha de empresa hidratada", () => {
  it("deriva permanencia y empresas relacionadas", () => {
    const lookup = lookupCompany(snapshot.companies, "Cerocatorce");
    expect(lookup.found).toBe(true);
    if (!lookup.found) return;

    const company = resolveCompanyProfile(lookup.company, snapshot.tenures);
    expect(company.collaboration.period).toBe("Jun 2019 – Jul 2024");
    expect(company.collaboration.durationMonths).toBe(61);
    expect(company.related.map((item) => item.slug)).toContain("chequemotiva");
  });
});

describe("prompt por canal", () => {
  it("el chat inyecta permanencia y ordena query_profile", () => {
    const profile = getProfile();
    const prompt = agentPrompt("chat", profile);
    expect(prompt).toContain("Empresa con mayor permanencia: Cerocatorce");
    expect(prompt).toContain("5 años y 1 mes");
    expect(prompt).toContain("NUNCA restes años");
    expect(prompt).toContain("Herramienta query_profile");
    expect(prompt).toContain("Herramienta lookup_company");
    expect(prompt).toContain("show_skills_radar");
    expect(prompt).not.toContain("también conocida como CQM Rewards");
    expect(profile.experience.every((job) => job.period && job.durationLabel)).toBe(
      true,
    );
  });

  it("la integración no ordena tools que no existen y sí incluye fichas", () => {
    const prompt = agentPrompt("integration");
    expect(prompt).toContain("NUNCA restes años");
    expect(prompt).toContain("Empresa con mayor permanencia: Cerocatorce");
    expect(prompt).toContain("Este canal no tiene herramientas");
    expect(prompt).toContain("también conocida como CQM Rewards");
    expect(prompt).not.toContain("Herramienta query_profile");
    expect(prompt).not.toContain("Herramienta lookup_company");
    expect(prompt).not.toContain("llama a show_skills_radar");
    expect(prompt).not.toContain("llama a set_accent_color");
  });
});

describe("vista de impresión vs dominio", () => {
  it("parte la experiencia en páginas sin inventar empleos", () => {
    const profile = getProfile();
    const print = toPrintView(profile);
    const printedIds = [...print.experiencePage1, ...print.experiencePage2].map(
      (job) => job.id,
    );

    expect(printedIds).toEqual(profile.experience.map((job) => job.id));
    expect(print.experiencePage1.every((job) => job.page === 1)).toBe(true);
    expect(print.experiencePage2.every((job) => job.page === 2)).toBe(true);
    expect(print.expertise).toEqual(profile.expertise.map((item) => item.name));
  });

  it("toCvDocument junta impresión y hechos sin elegir un perfil", () => {
    const profile = getProfile();
    const cv = toCvDocument();
    expect(cv.experiencePage1.length).toBeGreaterThan(0);
    expect(cv.experiencePage2.length).toBeGreaterThan(0);
    expect(cv.tenures).toEqual(profile.tenures);
    expect(cv.rolesSought).toEqual(profile.identity.rolesSought);
    expect(cv.firstName).toBe(profile.identity.firstName);
  });
});

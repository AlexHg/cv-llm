import { describe, expect, it } from "vitest";
import { lookupCompany } from "@/lib/lookup-company";
import { queryProfile } from "@/lib/query-profile";
import { resolveCompanyProfile } from "@/lib/resolve-company";
import { getExperience } from "@/data/resolve-cv";
import { cvToAgentPrompt } from "@/lib/cv-prompt";
import { resolveCv } from "@/data/resolve-cv";

describe("permanencia laboral", () => {
  it("no elige Chequemotiva como la empresa más larga", () => {
    const result = queryProfile({ intent: "company_tenure" });
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
    const result = queryProfile({
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
    const result = queryProfile({
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
    const result = queryProfile({
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
    const result = queryProfile({
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
    const result = queryProfile({
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
    const lookup = lookupCompany("Cerocatorce");
    expect(lookup.found).toBe(true);
    if (!lookup.found) return;

    const company = resolveCompanyProfile(lookup.company);
    expect(company.collaboration.period).toBe("Jun 2019 – Jul 2024");
    expect(company.collaboration.durationMonths).toBe(61);
    expect(company.related.map((item) => item.slug)).toContain("chequemotiva");
  });
});

describe("prompt", () => {
  it("inyecta permanencia precalculada y no deja al modelo restar fechas", () => {
    const prompt = cvToAgentPrompt(resolveCv());
    expect(prompt).toContain("Empresa con mayor permanencia: Cerocatorce");
    expect(prompt).toContain("5 años y 1 mes");
    expect(prompt).toContain("NUNCA restes años");
    expect(prompt).toContain("query_profile");
    expect(getExperience().items.every((job) => job.period && job.durationLabel)).toBe(
      true,
    );
  });
});

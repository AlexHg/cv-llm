import { companies } from "@/data/companies";
import type { CompanyProfile } from "@/domain/company";
import {
  getCompanyBySlug,
  listCompanyDirectory,
  listCompanyNames,
  listCompanySummaries,
  lookupCompany,
} from "@/domain/lookup-company";
import { describe, expect, it } from "vitest";

function company(
  slug: string,
  name: string,
  aliases: string[],
  relatedSlugs: string[] = [],
): CompanyProfile {
  return {
    slug,
    name,
    aliases,
    country: "México",
    sector: "Tech",
    summary: name,
    relatedSlugs,
    collaboration: { roles: [], experienceIds: [], projectIds: [] },
  };
}

const catalog = [
  company("north-wind", "North Wind", ["norte viento"], ["north-star"]),
  company("north-star", "North Star", ["norte estrella"], ["north-wind"]),
  company("acme", "Acme Labs", ["acme", "al"]),
];

describe("lookupCompany es puro", () => {
  it("no lee el catálogo global", () => {
    const result = lookupCompany([], "Acme");
    expect(result.found).toBe(false);
    if (result.found) return;
    expect(result.reason).toBe("not_found");
    expect(result.available).toEqual([]);
  });

  it("resuelve por slug, nombre y alias exacto", () => {
    expect(lookupCompany(catalog, "acme").found).toBe(true);
    expect(lookupCompany(catalog, "Acme Labs").found).toBe(true);
    expect(lookupCompany(catalog, "AL").found).toBe(true);

    const bySlug = lookupCompany(catalog, "north-wind");
    expect(bySlug.found).toBe(true);
    if (!bySlug.found) return;
    expect(bySlug.company.slug).toBe("north-wind");
  });

  it("acepta coincidencia parcial de 4+ caracteres", () => {
    const result = lookupCompany(catalog, "north wi");
    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.company.slug).toBe("north-wind");
  });

  it("no adivina tokens cortos que no son alias", () => {
    const result = lookupCompany(catalog, "no");
    expect(result.found).toBe(false);
    if (result.found) return;
    expect(result.reason).toBe("not_found");
  });

  it("marca query vacía, no encontrado y ambiguo", () => {
    const empty = lookupCompany(catalog, "   ");
    expect(empty.found).toBe(false);
    if (!empty.found) expect(empty.reason).toBe("empty_query");

    const missing = lookupCompany(catalog, "zeta-unknown");
    expect(missing.found).toBe(false);
    if (!missing.found) {
      expect(missing.reason).toBe("not_found");
      expect(missing.available).toEqual(listCompanyNames(catalog));
    }

    const ambiguous = lookupCompany(catalog, "north");
    expect(ambiguous.found).toBe(false);
    if (!ambiguous.found) {
      expect(ambiguous.reason).toBe("ambiguous");
      expect(ambiguous.matches).toEqual(["North Wind", "North Star"]);
    }
  });
});

describe("listados y slug", () => {
  it("getCompanyBySlug normaliza mayúsculas", () => {
    expect(getCompanyBySlug(catalog, "NORTH-STAR")?.name).toBe("North Star");
    expect(getCompanyBySlug(catalog, "missing")).toBeUndefined();
  });

  it("resume y directorio hidratan related", () => {
    expect(listCompanySummaries(catalog)).toEqual([
      { slug: "north-wind", name: "North Wind", country: "México", sector: "Tech" },
      { slug: "north-star", name: "North Star", country: "México", sector: "Tech" },
      { slug: "acme", name: "Acme Labs", country: "México", sector: "Tech" },
    ]);

    const directory = listCompanyDirectory(catalog);
    expect(directory[0].related).toEqual([{ slug: "north-star", name: "North Star" }]);
  });
});

describe("alias reales del CV", () => {
  it("resuelve CQM, 014 y EBC sin fusionar Grupo 014", () => {
    const cqm = lookupCompany(companies, "cqm");
    const group = lookupCompany(companies, "014");
    const ebc = lookupCompany(companies, "ebc");

    expect(cqm.found && cqm.company.slug).toBe("chequemotiva");
    expect(group.found && group.company.slug).toBe("cerocatorce");
    expect(ebc.found && ebc.company.slug).toBe("ebc");
  });
});

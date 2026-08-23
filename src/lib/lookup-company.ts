import {
  companies,
  listCompanyNames,
  type CompanyProfile,
} from "@/data/companies";

export type CompanyLookupResult =
  | { found: true; company: CompanyProfile }
  | {
      found: false;
      reason: "empty_query" | "not_found" | "ambiguous";
      available: string[];
      matches?: string[];
    };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function companyKeys(company: CompanyProfile) {
  return [company.slug, company.name, ...company.aliases].map(normalize);
}

export function getCompanyBySlug(slug: string) {
  const normalized = normalize(slug);
  return companies.find((company) => normalize(company.slug) === normalized);
}

export function lookupCompany(query: string): CompanyLookupResult {
  const normalized = normalize(query);

  if (!normalized) {
    return {
      found: false,
      reason: "empty_query",
      available: listCompanyNames(),
    };
  }

  const exact = companies.find((company) =>
    companyKeys(company).includes(normalized),
  );

  if (exact) {
    return { found: true, company: exact };
  }

  const partial = companies.filter((company) => {
    return companyKeys(company).some((key) => {
      if (key.includes(normalized) || normalized.includes(key)) {
        return normalized.length >= 4 || key.split(" ").includes(normalized);
      }

      const queryTokens = tokens(normalized);
      const keyTokens = tokens(key);
      return (
        queryTokens.length >= 2 &&
        queryTokens.every((token) => keyTokens.includes(token))
      );
    });
  });

  if (partial.length === 1) {
    return { found: true, company: partial[0] };
  }

  if (partial.length > 1) {
    return {
      found: false,
      reason: "ambiguous",
      matches: partial.map((company) => company.name),
      available: listCompanyNames(),
    };
  }

  return {
    found: false,
    reason: "not_found",
    available: listCompanyNames(),
  };
}

export function listCompanySummaries() {
  return companies.map((company) => ({
    slug: company.slug,
    name: company.name,
    country: company.country,
    sector: company.sector,
  }));
}

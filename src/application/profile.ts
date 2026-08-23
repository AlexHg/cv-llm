import { companies } from "@/data/companies";
import type { CompanyProfile } from "@/domain/company";
import { cvBase } from "@/data/cv";
import { hydrateEducation, hydrateExperience, hydrateProject } from "@/domain/hydrate";
import {
  getCompanyBySlug as getCompanyBySlugAgainst,
  listCompanySummaries as listCompanySummariesAgainst,
  lookupCompany as lookupCompanyAgainst,
} from "@/domain/lookup-company";
import type { Profile, ProfileSnapshot } from "@/domain/profile";
import {
  queryProfile as queryProfileAgainst,
  type QueryProfileInput,
} from "@/domain/query-profile";
import { resolveCompanyProfile as resolveCompanyAgainst } from "@/domain/resolve-company";
import { buildCompanyTenures, pickHighlights } from "@/domain/tenure";

let cached: Profile | undefined;

export function buildProfile(): Profile {
  const experience = cvBase.experience.map(hydrateExperience);
  const projects = cvBase.sideProjects.map(hydrateProject);
  const tenures = buildCompanyTenures(experience, projects, companies);

  return {
    identity: {
      firstName: cvBase.firstName,
      lastName: cvBase.lastName,
      headline: cvBase.headline,
      photo: cvBase.photo,
      rolesSought: cvBase.rolesSought,
      strengths: cvBase.strengths,
      interests: cvBase.interests,
      certifications: cvBase.certifications,
    },
    about: cvBase.about,
    contact: cvBase.contact,
    experience,
    education: hydrateEducation(cvBase.education),
    expertise: cvBase.expertise,
    skills: cvBase.skills,
    projects,
    competencies: cvBase.competencies,
    tenures,
    highlights: pickHighlights(experience, tenures),
    companies,
  };
}

export function getProfile(): Profile {
  cached ??= buildProfile();
  return cached;
}

export function getProfileSnapshot(): ProfileSnapshot {
  return getProfile();
}

export function resetProfileSnapshot() {
  cached = undefined;
}

export function queryProfile(input: QueryProfileInput) {
  return queryProfileAgainst(getProfile(), input);
}

export function lookupCompany(query: string) {
  return lookupCompanyAgainst(companies, query);
}

export function getCompanyBySlug(slug: string) {
  return getCompanyBySlugAgainst(companies, slug);
}

export function listCompanySummaries() {
  return listCompanySummariesAgainst(companies);
}

export function resolveCompanyProfile(company: CompanyProfile) {
  return resolveCompanyAgainst(company, getProfile().tenures);
}

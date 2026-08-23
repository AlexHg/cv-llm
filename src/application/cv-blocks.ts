import { getProfile } from "@/application/profile";
import { toLabeledContact, toPrintView, type CvContact } from "@/application/print";
import { profileSummary, type CvLabels } from "@/data/cv";
import type {
  CompanyTenure,
  CvCompetency,
  CvEducation,
  CvExperience,
  CvExpertiseItem,
  CvSideProject,
  CvSkill,
  ExperienceHighlights,
} from "@/domain/cv";

/** Contrato HTTP (`cv-cloud`, `?profile=`). El dominio tiene un solo Profile. */
export type ProfileId = "cloud" | "fullstack" | "techlead" | "genai" | "devops";

export type CvBlockId =
  | "identity"
  | "about"
  | "contact"
  | "experience"
  | "education"
  | "expertise"
  | "skills"
  | "projects"
  | "competencies"
  | "profiles";

export interface CvProfileSummary {
  id: ProfileId;
  label: string;
}

export interface CvIdentity {
  firstName: string;
  lastName: string;
  headline: string;
  photo: string;
  profile: CvProfileSummary;
  rolesSought: string[];
  strengths: string[];
  interests: string[];
  certifications: string[];
}

export interface CvAbout {
  text: string;
}

export interface CvContactBlock {
  items: CvContact[];
}

export interface CvExperienceBlock {
  items: CvExperience[];
  byCompany: CompanyTenure[];
  highlights: ExperienceHighlights;
}

export interface CvExpertiseBlock {
  items: CvExpertiseItem[];
}

export interface CvSkillsBlock {
  items: CvSkill[];
}

export interface CvProjectsBlock {
  items: CvSideProject[];
}

export interface CvCompetenciesBlock {
  items: CvCompetency[];
}

export interface CvProfilesBlock {
  items: CvProfileSummary[];
  default: ProfileId;
}

/** DTO aplanado de `GET /api/cv`. Impresión: `CvPrintView`. Dominio: `Profile`. */
export interface CvData {
  firstName: string;
  lastName: string;
  headline: string;
  photo: string;
  about: string;
  contact: CvContact[];
  experiencePage1: CvExperience[];
  experiencePage2: CvExperience[];
  tenures: CompanyTenure[];
  highlights: ExperienceHighlights;
  education: CvEducation;
  expertise: string[];
  skills: CvSkill[];
  sideProjects: CvSideProject[];
  rolesSought: string[];
  strengths: string[];
  interests: string[];
  certifications: string[];
  competencies: CvCompetency[];
  labels: CvLabels;
}

export interface CvBlockResponse<T> {
  block: CvBlockId | "cv";
  profile: ProfileId;
  data: T;
}

export const PROFILE_IDS: ProfileId[] = [
  "cloud",
  "fullstack",
  "techlead",
  "genai",
  "devops",
];

export const CV_BLOCKS: CvBlockId[] = [
  "identity",
  "about",
  "contact",
  "experience",
  "education",
  "expertise",
  "skills",
  "projects",
  "competencies",
  "profiles",
];

export const DEFAULT_PROFILE: ProfileId = "cloud";

export function isProfileId(value: unknown): value is ProfileId {
  return typeof value === "string" && PROFILE_IDS.includes(value as ProfileId);
}

export function isCvBlockId(value: unknown): value is CvBlockId {
  return typeof value === "string" && CV_BLOCKS.includes(value as CvBlockId);
}

export function parseProfile(value: unknown): ProfileId {
  return isProfileId(value) ? value : DEFAULT_PROFILE;
}

export function parseBlock(value: unknown): CvBlockId | null {
  return isCvBlockId(value) ? value : null;
}

export function getIdentity(): CvIdentity {
  const { identity } = getProfile();
  return {
    ...identity,
    profile: profileSummary,
  };
}

export function getAbout(): CvAbout {
  return { text: getProfile().about };
}

export function getContact(): CvContactBlock {
  return { items: toLabeledContact(getProfile()) };
}

export function getExperience(): CvExperienceBlock {
  const profile = getProfile();
  return {
    items: profile.experience,
    byCompany: profile.tenures,
    highlights: profile.highlights,
  };
}

export function getEducation(): CvEducation {
  return getProfile().education;
}

export function getExpertise(): CvExpertiseBlock {
  return { items: getProfile().expertise };
}

export function getSkills(): CvSkillsBlock {
  return { items: getProfile().skills };
}

export function getProjects(): CvProjectsBlock {
  return { items: getProfile().projects };
}

export function getCompetencies(): CvCompetenciesBlock {
  return { items: getProfile().competencies };
}

export function getProfiles(): CvProfilesBlock {
  return {
    items: [profileSummary],
    default: DEFAULT_PROFILE,
  };
}

export function getCvBlock(block: CvBlockId) {
  switch (block) {
    case "identity":
      return getIdentity();
    case "about":
      return getAbout();
    case "contact":
      return getContact();
    case "experience":
      return getExperience();
    case "education":
      return getEducation();
    case "expertise":
      return getExpertise();
    case "skills":
      return getSkills();
    case "projects":
      return getProjects();
    case "competencies":
      return getCompetencies();
    case "profiles":
      return getProfiles();
  }
}

export function toCvDocument(): CvData {
  const domain = getProfile();
  const print = toPrintView(domain);

  return {
    ...print,
    tenures: domain.tenures,
    highlights: domain.highlights,
    rolesSought: domain.identity.rolesSought,
    strengths: domain.identity.strengths,
    interests: domain.identity.interests,
    certifications: domain.identity.certifications,
    competencies: domain.competencies,
  };
}

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

export type ExpertiseId =
  | "fullstack"
  | "frontend"
  | "devops"
  | "iac"
  | "genai"
  | "prompting"
  | "databases"
  | "containers"
  | "saas"
  | "scrum"
  | "aws"
  | "hexagonal";

export type ExperienceFocus =
  | "technical"
  | "leadership"
  | "genai"
  | "business";

export type CompetencyId =
  | "leadership"
  | "collaboration"
  | "mentoring"
  | "communication";

export type CvSourceKind = "experience" | "project";

export interface CvDate {
  year: number;
  month?: number;
}

export interface CvSourceRef {
  kind: CvSourceKind;
  id: string;
  how: string;
}

export interface CvTemporalSpan {
  start: CvDate;
  end: CvDate;
  period: string;
  durationMonths: number;
  durationLabel: string;
}

export interface CvContact {
  type: "phone" | "email" | "linkedin" | "country";
  label: string;
  value: string;
}

export interface CvExperience {
  id: string;
  title: string;
  company: string;
  start: CvDate;
  end: CvDate;
  period: string;
  durationMonths: number;
  durationLabel: string;
  description: string;
  page: 1 | 2;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  focuses: ExperienceFocus[];
}

export type CvExperienceSource = Omit<
  CvExperience,
  "period" | "durationMonths" | "durationLabel"
>;

export interface CvEducation {
  degree: string;
  school: string;
  start: CvDate;
  end: CvDate;
  period: string;
}

export type CvEducationSource = Omit<CvEducation, "period">;

export interface CvSkill {
  name: string;
  level: number;
  evidence: CvSourceRef[];
}

export interface CvSideProject {
  id: string;
  title: string;
  meta: string;
  start: CvDate;
  end: CvDate;
  durationMonths: number;
  durationLabel: string;
  description: string;
  keywords: string;
  problem: string;
  role: string;
  architecture: string;
  challenges: string[];
  results: string[];
  learnings: string[];
}

export type CvSideProjectSource = Omit<
  CvSideProject,
  "durationMonths" | "durationLabel"
>;

export interface CvCompetency {
  id: CompetencyId;
  name: string;
  how: string;
  sources: Omit<CvSourceRef, "how">[];
}

export interface CvLabels {
  about: string;
  experience: string;
  experienceContinued: string;
  education: string;
  expertise: string;
  techSkills: string;
  sideProjects: string;
  keywords: string;
  downloadPdf: string;
  generating: string;
  phone: string;
  email: string;
  linkedin: string;
  country: string;
}

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

export interface CompanyTenureRole {
  id: string;
  title: string;
  period: string;
  durationMonths: number;
  durationLabel: string;
}

export interface RelatedCompanyRef {
  slug: string;
  name: string;
  group?: string;
}

export interface CompanyTenure extends CvTemporalSpan {
  slug?: string;
  name: string;
  kind: "employment" | "project";
  roles: CompanyTenureRole[];
  projectIds: string[];
  group?: string;
  related: RelatedCompanyRef[];
}

export interface ExperienceHighlights {
  longestCompany: CompanyTenure | null;
  longestRole: {
    id: string;
    title: string;
    company: string;
    period: string;
    durationMonths: number;
    durationLabel: string;
  } | null;
}

export interface CvExperienceBlock {
  items: CvExperience[];
  byCompany: CompanyTenure[];
  highlights: ExperienceHighlights;
}

export interface CvExpertiseItem {
  id: ExpertiseId;
  name: string;
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
  profile: ProfileId;
}

export interface CvBase {
  firstName: string;
  lastName: string;
  headline: string;
  photo: string;
  about: string;
  rolesSought: string[];
  strengths: string[];
  interests: string[];
  certifications: string[];
  contact: {
    type: CvContact["type"];
    value: string;
  }[];
  experience: CvExperienceSource[];
  education: CvEducationSource;
  expertise: CvExpertiseItem[];
  skills: CvSkill[];
  sideProjects: CvSideProjectSource[];
  competencies: CvCompetency[];
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

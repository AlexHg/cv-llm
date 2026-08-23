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

export interface CvSourceRef {
  kind: CvSourceKind;
  id: string;
  how: string;
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
  period: string;
  description: string;
  page: 1 | 2;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  focuses: ExperienceFocus[];
}

export interface CvEducation {
  degree: string;
  school: string;
  period: string;
}

export interface CvSkill {
  name: string;
  level: number;
  evidence: CvSourceRef[];
}

export interface CvSideProject {
  id: string;
  title: string;
  meta: string;
  description: string;
  keywords: string;
  problem: string;
  role: string;
  architecture: string;
  challenges: string[];
  results: string[];
  learnings: string[];
}

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

export interface CvExperienceBlock {
  items: CvExperience[];
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
  experience: CvExperience[];
  education: CvEducation;
  expertise: CvExpertiseItem[];
  skills: CvSkill[];
  sideProjects: CvSideProject[];
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

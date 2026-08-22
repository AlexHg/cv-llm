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
}

export interface CvEducation {
  degree: string;
  school: string;
  period: string;
}

export interface CvSkill {
  name: string;
  level: number;
}

export interface CvSideProject {
  id: string;
  title: string;
  meta: string;
  description: string;
  keywords: string;
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
  labels: CvLabels;
  profile: ProfileId;
}

export interface CvExperienceSource {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  page: 1 | 2;
}

export interface CvProjectSource {
  id: string;
  title: string;
  meta: string;
  description: string;
  keywords: string;
}

export interface CvBase {
  firstName: string;
  lastName: string;
  headline: string;
  photo: string;
  about: string;
  contact: {
    type: CvContact["type"];
    value: string;
  }[];
  experience: CvExperienceSource[];
  education: CvEducation;
  expertise: CvExpertiseItem[];
  skills: CvSkill[];
  sideProjects: CvProjectSource[];
}

export interface ProfileOverride {
  id: ProfileId;
  label: string;
  headline: string;
  about: string;
  experienceOverrides?: Record<string, string>;
  expertiseOrder?: ExpertiseId[];
  skillsOrder?: string[];
  sideProjectsOrder?: string[];
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
  "profiles",
];

export const DEFAULT_PROFILE: ProfileId = "cloud";

export function isProfileId(value: unknown): value is ProfileId {
  return typeof value === "string" && PROFILE_IDS.includes(value as ProfileId);
}

export function isCvBlockId(value: unknown): value is CvBlockId {
  return typeof value === "string" && CV_BLOCKS.includes(value as CvBlockId);
}

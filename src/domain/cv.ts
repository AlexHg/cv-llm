import type { CvDate } from "@/domain/dates";

export type { CvDate } from "@/domain/dates";

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

export type ContactType = "phone" | "email" | "linkedin" | "country";

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

export interface ProfileContact {
  type: ContactType;
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
  /** Anotación de impresión: en qué hoja A4 cabe el rol. El dominio no parte por página. */
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

export interface CvExpertiseItem {
  id: ExpertiseId;
  name: string;
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
  contact: ProfileContact[];
  experience: CvExperienceSource[];
  education: CvEducationSource;
  expertise: CvExpertiseItem[];
  skills: CvSkill[];
  sideProjects: CvSideProjectSource[];
  competencies: CvCompetency[];
}

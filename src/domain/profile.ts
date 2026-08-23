import type { CompanyProfile } from "@/domain/company";
import type {
  CompanyTenure,
  CvCompetency,
  CvEducation,
  CvExperience,
  CvExpertiseItem,
  CvSideProject,
  CvSkill,
  ExperienceHighlights,
  ProfileContact,
} from "@/domain/cv";

export type { ProfileContact } from "@/domain/cv";

export interface ProfileIdentity {
  firstName: string;
  lastName: string;
  headline: string;
  photo: string;
  rolesSought: string[];
  strengths: string[];
  interests: string[];
  certifications: string[];
}

export interface ProfileSnapshot {
  experience: CvExperience[];
  projects: CvSideProject[];
  skills: CvSkill[];
  tenures: CompanyTenure[];
  highlights: ExperienceHighlights;
  companies: CompanyProfile[];
}

export interface Profile extends ProfileSnapshot {
  identity: ProfileIdentity;
  about: string;
  contact: ProfileContact[];
  education: CvEducation;
  expertise: CvExpertiseItem[];
  competencies: CvCompetency[];
}

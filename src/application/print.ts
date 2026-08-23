import { sectionLabels, type CvLabels } from "@/data/cv";
import type {
  ContactType,
  CvEducation,
  CvExperience,
  CvSideProject,
  CvSkill,
} from "@/domain/cv";
import type { Profile } from "@/domain/profile";

export interface CvContact {
  type: ContactType;
  label: string;
  value: string;
}

export interface CvPrintView {
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
}

export function toLabeledContact(profile: Profile): CvContact[] {
  return profile.contact.map((item) => ({
    type: item.type,
    label: sectionLabels[item.type],
    value: item.value,
  }));
}

export function toPrintView(profile: Profile): CvPrintView {
  const byPage = (page: 1 | 2) =>
    profile.experience.filter((job) => job.page === page);

  return {
    firstName: profile.identity.firstName,
    lastName: profile.identity.lastName,
    headline: profile.identity.headline,
    photo: profile.identity.photo,
    about: profile.about,
    contact: toLabeledContact(profile),
    experiencePage1: byPage(1),
    experiencePage2: byPage(2),
    education: profile.education,
    expertise: profile.expertise.map((item) => item.name),
    skills: profile.skills,
    sideProjects: profile.projects,
    labels: sectionLabels,
  };
}

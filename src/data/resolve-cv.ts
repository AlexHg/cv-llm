import { cvBase, profileSummary, sectionLabels } from "./cv";
import type {
  CvAbout,
  CvBlockId,
  CvContactBlock,
  CvData,
  CvEducation,
  CvExperience,
  CvExperienceBlock,
  CvExpertiseBlock,
  CvIdentity,
  CvProfilesBlock,
  CvProjectsBlock,
  CvSideProject,
  CvSkill,
  CvSkillsBlock,
  ProfileId,
} from "./types";
import { DEFAULT_PROFILE, isCvBlockId, isProfileId } from "./types";

export function parseProfile(value: unknown): ProfileId {
  return isProfileId(value) ? value : DEFAULT_PROFILE;
}

export function parseBlock(value: unknown): CvBlockId | null {
  return isCvBlockId(value) ? value : null;
}

export function getIdentity(): CvIdentity {
  return {
    firstName: cvBase.firstName,
    lastName: cvBase.lastName,
    headline: cvBase.headline,
    photo: cvBase.photo,
    profile: profileSummary,
  };
}

export function getAbout(): CvAbout {
  return {
    text: cvBase.about,
  };
}

export function getContact(): CvContactBlock {
  return {
    items: cvBase.contact.map((item) => ({
      type: item.type,
      label: sectionLabels[item.type],
      value: item.value,
    })),
  };
}

export function getExperience(): CvExperienceBlock {
  return {
    items: cvBase.experience.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      period: job.period,
      description: job.description,
      page: job.page,
    })),
  };
}

export function getEducation(): CvEducation {
  return { ...cvBase.education };
}

export function getExpertise(): CvExpertiseBlock {
  return { items: cvBase.expertise };
}

export function getSkills(): CvSkillsBlock {
  return { items: cvBase.skills };
}

export function getProjects(): CvProjectsBlock {
  return { items: cvBase.sideProjects };
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
    case "profiles":
      return getProfiles();
  }
}

export function resolveCv(profile: ProfileId = DEFAULT_PROFILE): CvData {
  const identity = getIdentity();
  const experience = getExperience().items;
  const byPage = (page: 1 | 2): CvExperience[] =>
    experience.filter((job) => job.page === page);

  return {
    firstName: identity.firstName,
    lastName: identity.lastName,
    headline: identity.headline,
    photo: identity.photo,
    about: getAbout().text,
    contact: getContact().items,
    experiencePage1: byPage(1),
    experiencePage2: byPage(2),
    education: getEducation(),
    expertise: getExpertise().items.map((item) => item.name),
    skills: getSkills().items satisfies CvSkill[],
    sideProjects: getProjects().items satisfies CvSideProject[],
    labels: sectionLabels,
    profile,
  };
}

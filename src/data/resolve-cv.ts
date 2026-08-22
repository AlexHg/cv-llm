import { cvBase, sectionLabels } from "./cv";
import { profileOverrides } from "./profiles";
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
  ProfileOverride,
} from "./types";
import { DEFAULT_PROFILE, isCvBlockId, isProfileId } from "./types";

function reorderByKey<T>(
  items: T[],
  order: string[] | undefined,
  getKey: (item: T) => string,
): T[] {
  if (!order?.length) return items;

  const map = new Map(items.map((item) => [getKey(item), item]));
  const result: T[] = [];
  const seen = new Set<string>();

  for (const key of order) {
    const item = map.get(key);
    if (item) {
      result.push(item);
      seen.add(key);
    }
  }

  for (const item of items) {
    const key = getKey(item);
    if (!seen.has(key)) result.push(item);
  }

  return result;
}

export function parseProfile(value: unknown): ProfileId {
  return isProfileId(value) ? value : DEFAULT_PROFILE;
}

export function parseBlock(value: unknown): CvBlockId | null {
  return isCvBlockId(value) ? value : null;
}

export function getProfileOverride(profile: ProfileId): ProfileOverride {
  return profileOverrides[profile] ?? profileOverrides[DEFAULT_PROFILE];
}

export function getIdentity(profile: ProfileId = DEFAULT_PROFILE): CvIdentity {
  const override = getProfileOverride(profile);

  return {
    firstName: cvBase.firstName,
    lastName: cvBase.lastName,
    headline: override.headline,
    photo: cvBase.photo,
    profile: {
      id: override.id,
      label: override.label,
    },
  };
}

export function getAbout(profile: ProfileId = DEFAULT_PROFILE): CvAbout {
  return {
    text: getProfileOverride(profile).about,
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

export function getExperience(
  profile: ProfileId = DEFAULT_PROFILE,
): CvExperienceBlock {
  const overrides = getProfileOverride(profile).experienceOverrides;

  return {
    items: cvBase.experience.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      period: job.period,
      description: overrides?.[job.id] ?? job.description,
      page: job.page,
    })),
  };
}

export function getEducation(): CvEducation {
  return { ...cvBase.education };
}

export function getExpertise(
  profile: ProfileId = DEFAULT_PROFILE,
): CvExpertiseBlock {
  return {
    items: reorderByKey(
      cvBase.expertise,
      getProfileOverride(profile).expertiseOrder,
      (item) => item.id,
    ),
  };
}

export function getSkills(
  profile: ProfileId = DEFAULT_PROFILE,
): CvSkillsBlock {
  return {
    items: reorderByKey(
      cvBase.skills,
      getProfileOverride(profile).skillsOrder,
      (skill) => skill.name,
    ),
  };
}

export function getProjects(
  profile: ProfileId = DEFAULT_PROFILE,
): CvProjectsBlock {
  return {
    items: reorderByKey(
      cvBase.sideProjects,
      getProfileOverride(profile).sideProjectsOrder,
      (project) => project.id,
    ),
  };
}

export function getProfiles(): CvProfilesBlock {
  return {
    items: Object.values(profileOverrides).map((profile) => ({
      id: profile.id,
      label: profile.label,
    })),
    default: DEFAULT_PROFILE,
  };
}

export function getCvBlock(block: CvBlockId, profile: ProfileId) {
  switch (block) {
    case "identity":
      return getIdentity(profile);
    case "about":
      return getAbout(profile);
    case "contact":
      return getContact();
    case "experience":
      return getExperience(profile);
    case "education":
      return getEducation();
    case "expertise":
      return getExpertise(profile);
    case "skills":
      return getSkills(profile);
    case "projects":
      return getProjects(profile);
    case "profiles":
      return getProfiles();
  }
}

export function resolveCv(profile: ProfileId = DEFAULT_PROFILE): CvData {
  const identity = getIdentity(profile);
  const experience = getExperience(profile).items;
  const byPage = (page: 1 | 2): CvExperience[] =>
    experience.filter((job) => job.page === page);

  return {
    firstName: identity.firstName,
    lastName: identity.lastName,
    headline: identity.headline,
    photo: identity.photo,
    about: getAbout(profile).text,
    contact: getContact().items,
    experiencePage1: byPage(1),
    experiencePage2: byPage(2),
    education: getEducation(),
    expertise: getExpertise(profile).items.map((item) => item.name),
    skills: getSkills(profile).items satisfies CvSkill[],
    sideProjects: getProjects(profile).items satisfies CvSideProject[],
    labels: sectionLabels,
    profile,
  };
}

import {
  CV_BLOCKS,
  DEFAULT_PROFILE,
  getAbout,
  getCompetencies,
  getContact,
  getCvBlock,
  getEducation,
  getExperience,
  getExpertise,
  getIdentity,
  getProfiles,
  getProjects,
  getSkills,
  isCvBlockId,
  isProfileId,
  parseBlock,
  parseProfile,
  PROFILE_IDS,
} from "@/application/cv-blocks";
import { getProfile } from "@/application/profile";
import { describe, expect, it } from "vitest";

describe("parseo del contrato HTTP", () => {
  it("acepta profile ids conocidos y cae a cloud", () => {
    for (const id of PROFILE_IDS) {
      expect(isProfileId(id)).toBe(true);
      expect(parseProfile(id)).toBe(id);
    }

    expect(parseProfile("nope")).toBe(DEFAULT_PROFILE);
    expect(parseProfile(undefined)).toBe("cloud");
    expect(isProfileId("cloud")).toBe(true);
    expect(isProfileId(1)).toBe(false);
  });

  it("acepta bloques conocidos y rechaza el resto", () => {
    for (const block of CV_BLOCKS) {
      expect(isCvBlockId(block)).toBe(true);
      expect(parseBlock(block)).toBe(block);
    }

    expect(parseBlock("cv")).toBeNull();
    expect(parseBlock("nope")).toBeNull();
    expect(isCvBlockId(null)).toBe(false);
  });
});

describe("bloques del CV", () => {
  it("devuelve los 11 bloques sin elegir otro perfil", () => {
    const profile = getProfile();

    expect(getIdentity()).toMatchObject({
      firstName: profile.identity.firstName,
      profile: { id: "cloud" },
    });
    expect(getAbout()).toEqual({ text: profile.about });
    expect(getContact().items).toHaveLength(profile.contact.length);
    expect(getExperience()).toMatchObject({
      items: profile.experience,
      byCompany: profile.tenures,
      highlights: profile.highlights,
    });
    expect(getEducation()).toEqual(profile.education);
    expect(getExpertise()).toEqual({ items: profile.expertise });
    expect(getSkills()).toEqual({ items: profile.skills });
    expect(getProjects()).toEqual({ items: profile.projects });
    expect(getCompetencies()).toEqual({ items: profile.competencies });
    expect(getProfiles()).toEqual({
      items: [{ id: "cloud", label: "Arquitecto Cloud / Solutions" }],
      default: "cloud",
    });

    for (const block of CV_BLOCKS) {
      expect(getCvBlock(block)).toBeDefined();
    }
  });
});

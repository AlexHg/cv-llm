import { CV_A2UI_CATALOG_ID } from "@/application/a2ui-catalog";
import {
  renderCareerTimelineSurface,
  renderSkillsRadarSurface,
} from "@/application/a2ui";
import { getProfile } from "@/application/profile";
import { describe, expect, it } from "vitest";

function parseSurface(payload: string) {
  const parsed = JSON.parse(payload) as {
    a2ui_operations: Array<{
      version: string;
      createSurface?: { surfaceId: string; catalogId: string };
      updateComponents?: {
        surfaceId: string;
        components: Array<Record<string, unknown>>;
      };
    }>;
  };

  return parsed.a2ui_operations;
}

describe("superficies A2UI", () => {
  it("el radar usa las skills del perfil y el catálogo estable", () => {
    const profile = getProfile();
    const operations = parseSurface(renderSkillsRadarSurface());
    const create = operations[0]?.createSurface;
    const root = operations[1]?.updateComponents?.components[0];

    expect(create).toEqual({
      surfaceId: "skills-radar",
      catalogId: CV_A2UI_CATALOG_ID,
    });
    expect(root).toMatchObject({
      id: "root",
      component: "RadarChart",
      max: 5,
    });
    expect(root?.data).toEqual(
      profile.skills.map((skill) => ({ label: skill.name, value: skill.level })),
    );
  });

  it("la timeline no inventa empleos", () => {
    const profile = getProfile();
    const operations = parseSurface(renderCareerTimelineSurface());
    const create = operations[0]?.createSurface;
    const root = operations[1]?.updateComponents?.components[0];
    const items = root?.items as Array<{ title: string; subtitle: string }>;

    expect(create?.surfaceId).toBe("career-timeline");
    expect(create?.catalogId).toBe(CV_A2UI_CATALOG_ID);
    expect(root).toMatchObject({ id: "root", component: "Timeline" });
    expect(items.map((item) => [item.title, item.subtitle])).toEqual(
      profile.experience.map((job) => [job.title, job.company]),
    );
  });
});

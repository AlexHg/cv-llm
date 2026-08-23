import { CV_A2UI_CATALOG_ID } from "@/application/a2ui-catalog";
import { getProfile } from "@/application/profile";

export { CV_A2UI_CATALOG_ID };

const A2UI_OPERATIONS_KEY = "a2ui_operations";
const A2UI_VERSION = "v0.9";

type A2UIOperation = Record<string, unknown>;

function createSurface(surfaceId: string): A2UIOperation {
  return {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId,
      catalogId: CV_A2UI_CATALOG_ID,
    },
  };
}

function updateComponents(
  surfaceId: string,
  components: Record<string, unknown>[],
): A2UIOperation {
  return {
    version: A2UI_VERSION,
    updateComponents: { surfaceId, components },
  };
}

function renderA2uiOperations(operations: A2UIOperation[]) {
  return JSON.stringify({ [A2UI_OPERATIONS_KEY]: operations });
}

export function renderSkillsRadarSurface() {
  const surfaceId = "skills-radar";
  const data = getProfile().skills.map((skill) => ({
    label: skill.name,
    value: skill.level,
  }));

  return renderA2uiOperations([
    createSurface(surfaceId),
    updateComponents(surfaceId, [
      {
        id: "root",
        component: "RadarChart",
        title: "Habilidades técnicas",
        description: "Nivel de 1 a 5 según el perfil estructurado.",
        max: 5,
        data,
      },
    ]),
  ]);
}

export function renderCareerTimelineSurface() {
  const surfaceId = "career-timeline";
  const items = getProfile().experience.map((job) => ({
    title: job.title,
    subtitle: job.company,
    period: job.period,
    description: job.responsibilities[0] ?? "",
  }));

  return renderA2uiOperations([
    createSurface(surfaceId),
    updateComponents(surfaceId, [
      {
        id: "root",
        component: "Timeline",
        title: "Trayectoria profesional",
        description: "Del rol más reciente al más antiguo.",
        items,
      },
    ]),
  ]);
}

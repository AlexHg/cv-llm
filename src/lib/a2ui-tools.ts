import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import {
  renderCareerTimelineSurface,
  renderSkillsRadarSurface,
} from "@/lib/a2ui-surfaces";

export const showSkillsRadarTool = defineTool({
  name: "show_skills_radar",
  description:
    "Muestra el gráfico radar de las habilidades técnicas de Alejandro y su nivel (1–5). Úsala cuando pidan un radar, un gráfico de habilidades o visualizar niveles. No inventes skills: el gráfico sale del perfil.",
  parameters: z.object({
    reason: z
      .string()
      .optional()
      .describe("Por qué se pide el radar. No cambia los datos: siempre salen del perfil."),
  }),
  execute: async () => renderSkillsRadarSurface(),
});

export const showCareerTimelineTool = defineTool({
  name: "show_career_timeline",
  description:
    "Muestra la trayectoria profesional de Alejandro en una línea de tiempo, del rol más reciente al más antiguo. Úsala cuando pidan línea de tiempo, cronología o trayectoria visual. No inventes empleos.",
  parameters: z.object({
    reason: z
      .string()
      .optional()
      .describe("Por qué se pide la línea de tiempo. No cambia los datos: siempre salen del perfil."),
  }),
  execute: async () => renderCareerTimelineSurface(),
});

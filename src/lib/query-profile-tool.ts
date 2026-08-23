import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { queryProfile } from "@/lib/query-profile";

export const queryProfileTool = defineTool({
  name: "query_profile",
  description:
    "Consulta hechos ya calculados del perfil: permanencia por empresa o rol, experiencia filtrada, proyectos y skills. Úsala para duraciones, comparaciones («dónde duró más», «cuánto tiempo en X»), filtros por empresa, tecnología o enfoque, y SIEMPRE que el usuario corrija un hecho. Nunca restes fechas ni fusiones empresas relacionadas: copia durationLabel y highlights. Para «qué es la empresa X» usa lookup_company.",
  parameters: z.object({
    intent: z
      .enum(["experience", "company_tenure", "projects", "skills"])
      .describe(
        "company_tenure: permanencia laboral por empresa (dónde duró más, cuánto en X). experience: roles. projects: proyectos destacados. skills: habilidades y evidencia.",
      ),
    company: z
      .string()
      .optional()
      .describe("Nombre, slug o alias para filtrar (Cerocatorce, Chequemotiva, Welfare)."),
    technology: z
      .string()
      .optional()
      .describe("Tecnología o skill (AWS, Redis, Terraform). Cruza stack del rol y evidencia."),
    focus: z
      .enum(["technical", "leadership", "genai", "business"])
      .optional()
      .describe("Enfoque del empleo. Solo aplica a intent experience."),
    sort: z
      .enum(["recent", "duration", "level"])
      .optional()
      .describe("recent por fecha de fin, duration por meses, level para skills. Default: duration en company_tenure, recent en el resto, level en skills."),
  }),
  execute: async (input) => queryProfile(input),
});
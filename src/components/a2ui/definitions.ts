import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";
import { z } from "zod";

export const cvA2uiDefinitions = {
  RadarChart: {
    description:
      "Gráfico radar de habilidades técnicas. Usa title, description opcional, max (escala, por defecto 5) y data como [{ label, value }]. Cada eje es un skill del CV (name + level). Si hay más de 8 skills, prioriza las pedidas o las de mayor nivel. No inventes niveles.",
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
      max: z.number().optional(),
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number(),
        }),
      ),
    }),
  },
  Timeline: {
    description:
      "Línea de tiempo vertical de trayectoria. Usa title, description opcional e items [{ title, subtitle, period, description }]. Para experiencia laboral: title = puesto, subtitle = empresa, period = periodo del CV, orden del más reciente al más antiguo. No inventes empleos.",
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
      items: z.array(
        z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          period: z.string(),
          description: z.string().optional(),
        }),
      ),
    }),
  },
} satisfies CatalogDefinitions;

export type CvA2uiDefinitions = typeof cvA2uiDefinitions;

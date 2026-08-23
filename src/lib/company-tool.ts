import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { lookupCompany } from "@/lib/lookup-company";
import { resolveCompanyProfile } from "@/lib/resolve-company";

export const lookupCompanyTool = defineTool({
  name: "lookup_company",
  description:
    "Obtiene la ficha pública de una empresa u organización con la que Alejandro colaboró (qué es, sector, relación con otras). Úsala SOLO cuando el usuario pregunte de forma explícita por una empresa concreta (nombre o alias: «qué es X», «háblame de X»). No la uses para duraciones, comparaciones, listar experiencia, skills o proyectos: eso es query_profile. Si no hay ficha, found:false y no inventes datos.",
  parameters: z.object({
    company: z
      .string()
      .describe("Nombre, slug o alias de la empresa (p. ej. Chequemotiva, EBC, Cerocatorce)."),
  }),
  execute: async ({ company }) => {
    const result = lookupCompany(company);
    if (!result.found) return result;
    return { found: true as const, company: resolveCompanyProfile(result.company) };
  },
});

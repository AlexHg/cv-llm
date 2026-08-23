import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { lookupCompany } from "@/lib/lookup-company";

export const lookupCompanyTool = defineTool({
  name: "lookup_company",
  description:
    "Obtiene la ficha pública de una empresa u organización con la que Alejandro colaboró. Úsala SOLO cuando el usuario pregunte de forma explícita por una empresa concreta (nombre o alias: «qué es X», «háblame de X»). No la uses para listar experiencia, comparar roles, explicar skills o responder «dónde ha trabajado». Si no hay ficha, devuelve found:false y no inventes datos.",
  parameters: z.object({
    company: z
      .string()
      .describe("Nombre, slug o alias de la empresa (p. ej. Chequemotiva, EBC, Cerocatorce)."),
  }),
  execute: async ({ company }) => lookupCompany(company),
});

"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import {
  listAccentNames,
  resolveAccent,
  useAccentColor,
} from "@/components/accent";

export function AccentChatTool() {
  const { accent, setAccent } = useAccentColor();

  useFrontendTool(
    {
      name: "set_accent_color",
      description:
        "Cambia el color de acento del CV (preview y PDF). Úsala cuando el usuario pida cambiar el color, el tema o el acento. Paleta: mostaza, naranja, naranja oscuro, rojo, carmín, rosa, fucsia, violeta, índigo, azul, celeste, cian, verde azulado, verde, lima. También acepta el hex de esas muestras. Si no hay coincidencia, no inventes un color.",
      parameters: z.object({
        color: z
          .string()
          .describe(
            "Nombre (español o inglés) o hex de la paleta. Ej: azul, verde, mostaza, #3b82f6, default.",
          ),
      }),
      handler: async ({ color }) => {
        const resolved = resolveAccent(color);

        if (!resolved) {
          return {
            ok: false,
            current: accent,
            available: listAccentNames(),
          };
        }

        setAccent(resolved.hex);
        return {
          ok: true,
          previous: accent,
          color: resolved.hex,
          name: resolved.name,
        };
      },
    },
    [accent, setAccent],
  );

  return null;
}

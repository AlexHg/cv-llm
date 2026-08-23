"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const DEFAULT_ACCENT = "#f5b81c";

export const ACCENT_SWATCHES = [
  {
    hex: "#f5b81c",
    name: "mostaza",
    aliases: ["mustard", "amarillo", "yellow", "dorado", "default", "por defecto"],
  },
  {
    hex: "#f97316",
    name: "naranja",
    aliases: ["orange", "anaranjado"],
  },
  {
    hex: "#ea580c",
    name: "naranja oscuro",
    aliases: ["dark orange", "naranja fuerte"],
  },
  {
    hex: "#ef4444",
    name: "rojo",
    aliases: ["red"],
  },
  {
    hex: "#e11d48",
    name: "carmín",
    aliases: ["rose", "rojo rosa", "crimson"],
  },
  {
    hex: "#ec4899",
    name: "rosa",
    aliases: ["pink", "magenta"],
  },
  {
    hex: "#d946ef",
    name: "fucsia",
    aliases: ["fuchsia", "fúcsia"],
  },
  {
    hex: "#8b5cf6",
    name: "violeta",
    aliases: ["purple", "púrpura", "morado"],
  },
  {
    hex: "#6366f1",
    name: "índigo",
    aliases: ["indigo"],
  },
  {
    hex: "#3b82f6",
    name: "azul",
    aliases: ["blue", "azul vivo"],
  },
  {
    hex: "#0ea5e9",
    name: "celeste",
    aliases: ["sky", "azul cielo", "sky blue"],
  },
  {
    hex: "#06b6d4",
    name: "cian",
    aliases: ["cyan", "turquesa"],
  },
  {
    hex: "#14b8a6",
    name: "verde azulado",
    aliases: ["teal", "verde agua"],
  },
  {
    hex: "#10b981",
    name: "verde",
    aliases: ["green", "verde esmeralda"],
  },
  {
    hex: "#84cc16",
    name: "lima",
    aliases: ["lime", "verde lima"],
  },
] as const;

export type AccentColor = (typeof ACCENT_SWATCHES)[number]["hex"];

export const ACCENT_COLORS = ACCENT_SWATCHES.map(
  (swatch) => swatch.hex,
) as AccentColor[];

const STORAGE_KEY = "cv-accent";

export function isAccentColor(value: string | null): value is AccentColor {
  return ACCENT_COLORS.includes(value as AccentColor);
}

function normalizeColorQuery(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9#]+/g, " ")
    .trim();
}

export function listAccentNames() {
  return ACCENT_SWATCHES.map((swatch) => `${swatch.name} (${swatch.hex})`);
}

export function resolveAccent(query: string): {
  hex: AccentColor;
  name: string;
} | null {
  const normalized = normalizeColorQuery(query);
  if (!normalized) return null;

  const hexCandidate = normalized.startsWith("#")
    ? normalized
    : normalized.length === 6 && /^[0-9a-f]+$/.test(normalized)
      ? `#${normalized}`
      : null;

  if (hexCandidate && isAccentColor(hexCandidate)) {
    const swatch = ACCENT_SWATCHES.find((item) => item.hex === hexCandidate);
    return swatch ? { hex: swatch.hex, name: swatch.name } : null;
  }

  const exact = ACCENT_SWATCHES.find((swatch) => {
    const keys = [swatch.name, ...swatch.aliases].map(normalizeColorQuery);
    return keys.includes(normalized);
  });

  if (exact) {
    return { hex: exact.hex, name: exact.name };
  }

  const partial = ACCENT_SWATCHES.filter((swatch) => {
    const keys = [swatch.name, ...swatch.aliases].map(normalizeColorQuery);
    return keys.some(
      (key) =>
        key.includes(normalized) ||
        (normalized.length >= 4 && normalized.includes(key)),
    );
  });

  if (partial.length === 1) {
    return { hex: partial[0].hex, name: partial[0].name };
  }

  return null;
}

function applyAccent(color: string) {
  document.documentElement.style.setProperty("--cv-accent", color);
}

type AccentContextValue = {
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
  colors: typeof ACCENT_COLORS;
};

const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(DEFAULT_ACCENT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = isAccentColor(saved) ? saved : DEFAULT_ACCENT;
    setAccentState(next);
    applyAccent(next);
  }, []);

  const value = useMemo<AccentContextValue>(
    () => ({
      accent,
      colors: ACCENT_COLORS,
      setAccent(color: AccentColor) {
        setAccentState(color);
        applyAccent(color);
        localStorage.setItem(STORAGE_KEY, color);
      },
    }),
    [accent],
  );

  return (
    <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentContext);

  if (!context) {
    throw new Error("useAccentColor debe usarse dentro de AccentProvider");
  }

  return context;
}

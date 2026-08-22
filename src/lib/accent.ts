"use client";

import { useEffect, useState } from "react";

export const DEFAULT_ACCENT = "#f5b81c";

export const ACCENT_COLORS = [
  "#f5b81c",
  "#f97316",
  "#ea580c",
  "#ef4444",
  "#e11d48",
  "#ec4899",
  "#d946ef",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#84cc16",
] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number];

const STORAGE_KEY = "cv-accent";

function isAccentColor(value: string | null): value is AccentColor {
  return ACCENT_COLORS.includes(value as AccentColor);
}

function applyAccent(color: string) {
  document.documentElement.style.setProperty("--cv-accent", color);
}

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(DEFAULT_ACCENT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = isAccentColor(saved) ? saved : DEFAULT_ACCENT;
    setAccentState(next);
    applyAccent(next);
  }, []);

  function setAccent(color: AccentColor) {
    setAccentState(color);
    applyAccent(color);
    localStorage.setItem(STORAGE_KEY, color);
  }

  return { accent, setAccent, colors: ACCENT_COLORS };
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  parseCitation,
  resolveCitationKeys,
  type CitationCatalog,
} from "@/domain/citation";

const HIGHLIGHT_MS = 3500;

type CitationHighlightValue = {
  activeKeys: string[];
  highlight: (raw: string) => void;
};

const CitationHighlightContext = createContext<CitationHighlightValue | null>(
  null,
);

function scrollCiteTargetIntoView(keys: string[]) {
  const canvas = document.querySelector(".cv-canvas");
  if (!(canvas instanceof HTMLElement)) return;

  for (const key of keys) {
    const target = canvas.querySelector(`[data-cite="${CSS.escape(key)}"]`);
    if (!(target instanceof HTMLElement)) continue;

    const canvasRect = canvas.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    canvas.scrollTo({
      top: canvas.scrollTop + (targetRect.top - canvasRect.top) - 28,
      behavior: "smooth",
    });
    return;
  }
}

export function CitationHighlightProvider({
  catalog,
  children,
}: {
  catalog: CitationCatalog;
  children: ReactNode;
}) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const timerRef = useRef<number>(0);

  const highlight = useCallback(
    (raw: string) => {
      const citation = parseCitation(raw);
      const keys = citation ? resolveCitationKeys(citation, catalog) : [];
      setActiveKeys(keys);
      requestAnimationFrame(() => scrollCiteTargetIntoView(keys));
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setActiveKeys([]), HIGHLIGHT_MS);
    },
    [catalog],
  );

  const value = useMemo(
    () => ({ activeKeys, highlight }),
    [activeKeys, highlight],
  );

  return (
    <CitationHighlightContext.Provider value={value}>
      {children}
    </CitationHighlightContext.Provider>
  );
}

export function useCitationHighlight() {
  const context = useContext(CitationHighlightContext);
  if (!context) {
    throw new Error(
      "useCitationHighlight debe usarse dentro de CitationHighlightProvider",
    );
  }
  return context;
}

export function useCited(key: string) {
  return useCitationHighlight().activeKeys.includes(key);
}

export function citeTargetClass(active: boolean) {
  return active ? "cv-cite-target cv-cite-active" : "cv-cite-target";
}

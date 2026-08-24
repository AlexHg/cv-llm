"use client";

import { UseAgentUpdate, useAgent } from "@copilotkit/react-core/v2";
import { useEffect, type RefObject } from "react";
import { useCitationHighlight } from "@/components/citation/citation-highlight";
import {
  citationRawFromClick,
  linkifyCitationsIn,
} from "@/components/citation/linkify-citations";

/**
 * Capa de front: el agente no participa. Cuando un turno termina, recorre el
 * HTML ya renderizado, identifica (experience:…), (identity), etc. y las
 * convierte en botones que resaltan el CV.
 */
export function CitationLayer({
  rootRef,
}: {
  rootRef: RefObject<HTMLElement | null>;
}) {
  const { highlight } = useCitationHighlight();
  const { agent } = useAgent({
    updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (event: Event) => {
      const raw = citationRawFromClick(event);
      if (!raw) return;
      event.preventDefault();
      highlight(raw);
    };
    root.addEventListener("click", onClick);

    const apply = () => {
      const messages = root.querySelectorAll(
        '[data-testid="copilot-assistant-message"]',
      );
      messages.forEach((message, index) => {
        const isLatest = index === messages.length - 1;
        if (agent.isRunning && isLatest) return;
        linkifyCitationsIn(message);
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, [agent.isRunning, highlight, rootRef]);

  return null;
}

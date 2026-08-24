"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useRef } from "react";
import { AccentChatTool } from "@/components/accent-chat-tool";
import { CitationLayer } from "@/components/citation/citation-layer";
import { RestartConversationButton } from "@/components/restart-conversation-button";
import {
  chatSuggestions,
  chatSuggestionsAvailable,
} from "@/data/chat-suggestions";

const suggestionsConfig = {
  suggestions: chatSuggestions,
  available: chatSuggestionsAvailable,
};

export function AgentPanel() {
  const rootRef = useRef<HTMLElement>(null);
  useConfigureSuggestions(suggestionsConfig);

  return (
    <aside
      ref={rootRef}
      className="flex h-[50vh] min-h-0 w-full shrink-0 flex-col border-t border-zinc-300 bg-white lg:h-full lg:w-[640px] lg:border-t-0 lg:border-l lg:border-black/25"
    >
      <AccentChatTool />
      <CopilotChatConfigurationProvider>
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black/40 bg-ink px-4">
          <div className="min-w-0">
            <p className="font-head text-sm font-semibold text-white">
              Curriculum Agent
            </p>
            <p className="mt-0.5 text-xs tracking-wide text-white/55">
              Perfil del candidato
            </p>
          </div>
          <RestartConversationButton />
        </header>
        <CopilotChat
          className="min-h-0 flex-1"
          labels={{
            modalHeaderTitle: "Agente de CV",
            welcomeMessageText:
              "Hola. Pregúntame por el perfil de Alejandro cuando quieras.",
            chatInputPlaceholder: "Escribe tu pregunta...",
          }}
        />
        <CitationLayer rootRef={rootRef} />
      </CopilotChatConfigurationProvider>
    </aside>
  );
}

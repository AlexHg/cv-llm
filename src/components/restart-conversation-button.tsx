"use client";

import {
  UseAgentUpdate,
  useAgent,
  useCopilotChatConfiguration,
  useSuggestions,
} from "@copilotkit/react-core/v2";

export function RestartConversationButton() {
  const config = useCopilotChatConfiguration();
  const { reloadSuggestions } = useSuggestions();
  const { agent } = useAgent({
    updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged],
  });
  const canRestart = agent.isRunning || agent.messages.length > 0;

  return (
    <button
      type="button"
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 font-head text-sm font-semibold tracking-wider whitespace-nowrap text-ink shadow-sm transition hover:bg-mustard disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
      disabled={!canRestart}
      aria-label="Reiniciar conversación"
      onClick={() => {
        if (agent.isRunning) {
          try {
            agent.abortRun();
          } catch {
            // El hilo nuevo se abre igual si el abort falla a mitad de un turno.
          }
        }
        agent.setMessages([]);
        config?.startNewThread();
        reloadSuggestions();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m12.036-9.3A8.966 8.966 0 0012 3c-4.97 0-9 4.03-9 9m18 0c0 4.97-4.03 9-9 9a8.966 8.966 0 01-6.036-2.352"
        />
      </svg>
      Reiniciar
    </button>
  );
}

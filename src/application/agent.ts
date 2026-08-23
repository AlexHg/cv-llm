import { getProfile } from "@/application/profile";
import type { Profile } from "@/domain/profile";
import {
  CHAT_CAPABILITIES,
  INTEGRATION_CAPABILITIES,
  cvToAgentPrompt,
  type AgentCapabilities,
} from "@/application/prompt";

export const AGENT_MAX_STEPS = 8;

export type AgentChannel = "chat" | "integration";

const CAPABILITIES: Record<AgentChannel, AgentCapabilities> = {
  chat: CHAT_CAPABILITIES,
  integration: INTEGRATION_CAPABILITIES,
};

export function agentPrompt(
  channel: AgentChannel,
  profile: Profile = getProfile(),
) {
  return cvToAgentPrompt(profile, CAPABILITIES[channel]);
}

export function chatAgentConfig(profile: Profile = getProfile()) {
  return {
    prompt: agentPrompt("chat", profile),
    maxSteps: AGENT_MAX_STEPS,
  };
}

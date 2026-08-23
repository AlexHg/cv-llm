import {
  showCareerTimelineTool,
  showSkillsRadarTool,
} from "@/lib/a2ui-tools";
import { lookupCompanyTool } from "@/lib/company-tool";
import { queryProfileTool } from "@/lib/query-profile-tool";
import { cvToAgentPrompt } from "@/lib/cv-prompt";
import { resolveCv } from "@/data/resolve-cv";
import { createOpenResponsesModel } from "@/lib/open-responses";
import {
  BuiltInAgent,
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const cv = resolveCv("cloud");

const builtInAgent = new BuiltInAgent({
  model: createOpenResponsesModel(),
  prompt: cvToAgentPrompt(cv),
  // El default del AI SDK es 1 paso: si el primer turno solo llama una tool
  // (query_profile, lookup_company) el run termina sin texto y el chat queda vacío.
  maxSteps: 8,
  tools: [
    queryProfileTool,
    lookupCompanyTool,
    showSkillsRadarTool,
    showCareerTimelineTool,
  ],
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
  runner: new InMemoryAgentRunner(),
  a2ui: { injectA2UITool: false, agents: ["default"] },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;

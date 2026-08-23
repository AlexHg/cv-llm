import {
  showCareerTimelineTool,
  showSkillsRadarTool,
} from "@/lib/a2ui-tools";
import { lookupCompanyTool } from "@/lib/company-tool";
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
  tools: [lookupCompanyTool, showSkillsRadarTool, showCareerTimelineTool],
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

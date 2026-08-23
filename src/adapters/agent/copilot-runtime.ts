import { chatAgentConfig } from "@/application/agent";
import { createOpenResponsesModel } from "@/adapters/http/open-responses";
import { showCareerTimelineTool, showSkillsRadarTool } from "@/adapters/agent/a2ui-tools";
import { lookupCompanyTool } from "@/adapters/agent/company-tool";
import { queryProfileTool } from "@/adapters/agent/query-profile-tool";
import {
  BuiltInAgent,
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const { prompt, maxSteps } = chatAgentConfig();

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: createOpenResponsesModel(),
      prompt,
      maxSteps,
      tools: [
        queryProfileTool,
        lookupCompanyTool,
        showSkillsRadarTool,
        showCareerTimelineTool,
      ],
    }),
  },
  runner: new InMemoryAgentRunner(),
  a2ui: { injectA2UITool: false, agents: ["default"] },
});

export const copilotHandler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

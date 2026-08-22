import { cvToAgentPrompt } from "@/lib/cv-prompt";
import { resolveCv } from "@/data/resolve-cv";
import {
  BuiltInAgent,
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const cv = resolveCv("cloud");

const builtInAgent = new BuiltInAgent({
  model: "openai:gpt-4o-mini",
  prompt: cvToAgentPrompt(cv),
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;

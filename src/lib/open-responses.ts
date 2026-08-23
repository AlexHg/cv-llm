import { createOpenResponses } from "@ai-sdk/open-responses";
import type { NextRequest } from "next/server";
import type { ProfileId } from "@/data/types";
import { parseProfile, resolveCv } from "@/data/resolve-cv";
import { cvToAgentPrompt } from "@/lib/cv-prompt";

const DEFAULT_BACKEND_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";

export const openResponsesHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function openResponsesError(
  status: number,
  type: string,
  message: string,
  code = type,
  param = "",
) {
  return Response.json(
    { error: { message, type, param, code } },
    { status, headers: openResponsesHeaders },
  );
}

export function normalizeOpenResponsesUrl(url: string) {
  const trimmed = url.trim().replace(/\/$/, "");
  return trimmed.endsWith("/v1/responses")
    ? trimmed
    : `${trimmed}/v1/responses`;
}

export function getOpenResponsesUrl() {
  return normalizeOpenResponsesUrl(
    process.env.OPEN_RESPONSES_URL || DEFAULT_BACKEND_URL,
  );
}

export function getOpenResponsesApiKey() {
  return process.env.OPEN_RESPONSES_API_KEY?.trim() || "";
}

export function getOpenResponsesModel() {
  return process.env.OPEN_RESPONSES_MODEL?.trim() || DEFAULT_MODEL;
}

export function createOpenResponsesModel() {
  const openResponses = createOpenResponses({
    name: "open-responses",
    url: getOpenResponsesUrl(),
    apiKey: getOpenResponsesApiKey(),
  });

  return openResponses(getOpenResponsesModel());
}

function profileFromModel(model: unknown) {
  if (typeof model !== "string") return undefined;
  if (model === "cv") return undefined;
  if (!model.startsWith("cv-")) return undefined;
  return model.slice(3);
}

function profileFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || !("profile" in metadata)) {
    return undefined;
  }

  return (metadata as { profile?: unknown }).profile;
}

export function profileFromOpenResponsesRequest(
  body: Record<string, unknown>,
  request: NextRequest,
): ProfileId {
  return parseProfile(
    profileFromMetadata(body.metadata) ??
      request.nextUrl.searchParams.get("profile") ??
      profileFromModel(body.model),
  );
}

function backendModel(model: unknown) {
  if (typeof model !== "string" || !model || model === "cv") {
    return getOpenResponsesModel();
  }

  if (model.startsWith("cv-")) {
    return getOpenResponsesModel();
  }

  return model.replace(/^openai:/, "");
}

export function prepareOpenResponsesBody(
  body: Record<string, unknown>,
  request: NextRequest,
) {
  if (body.input == null && typeof body.previous_response_id !== "string") {
    return {
      error: openResponsesError(
        400,
        "invalid_request_error",
        "El campo input es obligatorio",
        "invalid_request",
        "input",
      ),
    };
  }

  const profile = profileFromOpenResponsesRequest(body, request);
  const instructions = cvToAgentPrompt(resolveCv(profile));
  const extra =
    typeof body.instructions === "string" ? body.instructions.trim() : "";

  const nextBody: Record<string, unknown> = {
    ...body,
    model: backendModel(body.model),
    input: body.input ?? [],
    instructions: extra ? `${instructions}\n\n${extra}` : instructions,
  };

  return { body: nextBody };
}

export async function forwardOpenResponses(
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const apiKey = getOpenResponsesApiKey();

  if (!apiKey) {
    return {
      error: openResponsesError(
        503,
        "server_error",
        "No hay API key de Open Responses configurada",
        "backend_not_configured",
      ),
    };
  }

  const upstream = await fetch(getOpenResponsesUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  return { upstream };
}

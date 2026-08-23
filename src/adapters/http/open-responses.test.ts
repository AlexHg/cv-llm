import {
  forwardOpenResponses,
  getOpenResponsesModel,
  getOpenResponsesUrl,
  normalizeOpenResponsesUrl,
  prepareOpenResponsesBody,
  profileFromOpenResponsesRequest,
} from "@/adapters/http/open-responses";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(url = "http://localhost/v1/responses") {
  return new NextRequest(url, { method: "POST" });
}

describe("normalizeOpenResponsesUrl", () => {
  it("añade /v1/responses si falta y no lo duplica", () => {
    expect(normalizeOpenResponsesUrl("https://api.example.com")).toBe(
      "https://api.example.com/v1/responses",
    );
    expect(normalizeOpenResponsesUrl("https://api.example.com/")).toBe(
      "https://api.example.com/v1/responses",
    );
    expect(normalizeOpenResponsesUrl("https://api.example.com/v1/responses")).toBe(
      "https://api.example.com/v1/responses",
    );
    expect(normalizeOpenResponsesUrl(" https://api.example.com/v1/responses/ ")).toBe(
      "https://api.example.com/v1/responses",
    );
  });
});

describe("config Open Responses", () => {
  it("usa defaults y respeta env", () => {
    vi.stubEnv("OPEN_RESPONSES_URL", "");
    vi.stubEnv("OPEN_RESPONSES_MODEL", "");
    expect(getOpenResponsesUrl()).toBe("https://api.openai.com/v1/responses");
    expect(getOpenResponsesModel()).toBe("gpt-4o-mini");

    vi.stubEnv("OPEN_RESPONSES_URL", "https://llm.internal");
    vi.stubEnv("OPEN_RESPONSES_MODEL", "gpt-4.1");
    expect(getOpenResponsesUrl()).toBe("https://llm.internal/v1/responses");
    expect(getOpenResponsesModel()).toBe("gpt-4.1");
  });
});

describe("profileFromOpenResponsesRequest", () => {
  it("prioriza metadata, luego query, luego modelo cv-*", () => {
    expect(
      profileFromOpenResponsesRequest(
        { metadata: { profile: "techlead" }, model: "cv-devops" },
        request("http://localhost/v1/responses?profile=genai"),
      ),
    ).toBe("techlead");

    expect(
      profileFromOpenResponsesRequest(
        { model: "cv-devops" },
        request("http://localhost/v1/responses?profile=genai"),
      ),
    ).toBe("genai");

    expect(
      profileFromOpenResponsesRequest({ model: "cv-fullstack" }, request()),
    ).toBe("fullstack");

    expect(profileFromOpenResponsesRequest({ model: "cv" }, request())).toBe(
      "cloud",
    );
    expect(
      profileFromOpenResponsesRequest({ metadata: { profile: "nope" } }, request()),
    ).toBe("cloud");
  });
});

describe("prepareOpenResponsesBody", () => {
  it("exige input salvo previous_response_id", async () => {
    const missing = prepareOpenResponsesBody({}, request());
    expect("error" in missing).toBe(true);
    if (!("error" in missing) || !missing.error) return;

    expect(missing.error.status).toBe(400);
    const payload = await missing.error.json();
    expect(payload.error.code).toBe("invalid_request");
    expect(payload.error.param).toBe("input");

    const resumed = prepareOpenResponsesBody(
      { previous_response_id: "resp_1" },
      request(),
    );
    expect("body" in resumed).toBe(true);
    if (!("body" in resumed) || !resumed.body) return;
    expect(resumed.body.input).toEqual([]);
  });

  it("inyecta el prompt de integration y resuelve el modelo", () => {
    const prepared = prepareOpenResponsesBody(
      {
        input: "hola",
        model: "cv-cloud",
        instructions: "Sé breve",
      },
      request(),
    );
    expect("body" in prepared).toBe(true);
    if (!("body" in prepared) || !prepared.body) return;

    const instructions = String(prepared.body.instructions);
    expect(prepared.body.model).toBe("gpt-4o-mini");
    expect(instructions).toContain("Este canal no tiene herramientas");
    expect(instructions).toContain("también conocida como CQM Rewards");
    expect(instructions).not.toContain("Herramienta query_profile");
    expect(instructions.endsWith("Sé breve")).toBe(true);

    const openai = prepareOpenResponsesBody(
      { input: [], model: "openai:gpt-4o" },
      request(),
    );
    expect("body" in openai && openai.body?.model).toBe("gpt-4o");
  });
});

describe("forwardOpenResponses", () => {
  it("no llama al backend si falta API key", async () => {
    vi.stubEnv("OPEN_RESPONSES_API_KEY", "");
    const result = await forwardOpenResponses({ input: "hola" });

    expect("error" in result).toBe(true);
    if (!("error" in result) || !result.error) return;
    expect(result.error.status).toBe(503);
    const payload = await result.error.json();
    expect(payload.error.code).toBe("backend_not_configured");
  });
});

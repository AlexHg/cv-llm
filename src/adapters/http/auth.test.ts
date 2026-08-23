import { unauthorizedResponse } from "@/adapters/http/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(headers: HeadersInit = {}) {
  return new Request("http://localhost/api/cv", { headers });
}

async function body(response: Response | null) {
  expect(response).not.toBeNull();
  return response!.json() as Promise<{ error: { code: string } }>;
}

describe("unauthorizedResponse", () => {
  it("responde 503 si INTERNAL_API_KEY no está configurada", async () => {
    vi.stubEnv("INTERNAL_API_KEY", "");
    const response = unauthorizedResponse(request());

    expect(response?.status).toBe(503);
    expect((await body(response)).error.code).toBe("api_key_not_configured");
  });

  it("responde 401 si falta la key o no coincide", async () => {
    vi.stubEnv("INTERNAL_API_KEY", "secret");

    const missing = unauthorizedResponse(request());
    expect(missing?.status).toBe(401);
    expect((await body(missing)).error.code).toBe("invalid_api_key");

    const wrong = unauthorizedResponse(
      request({ authorization: "Bearer other" }),
    );
    expect(wrong?.status).toBe(401);

    const basic = unauthorizedResponse(request({ authorization: "Basic secret" }));
    expect(basic?.status).toBe(401);
  });

  it("acepta Bearer y x-api-key, ignorando espacios", () => {
    vi.stubEnv("INTERNAL_API_KEY", "  secret  ");

    expect(
      unauthorizedResponse(request({ authorization: "bearer secret" })),
    ).toBeNull();
    expect(unauthorizedResponse(request({ "x-api-key": "secret" }))).toBeNull();
  });

  it("propaga headers extra en el 401", () => {
    vi.stubEnv("INTERNAL_API_KEY", "secret");
    const response = unauthorizedResponse(request(), {
      "Access-Control-Allow-Origin": "*",
    });

    expect(response?.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

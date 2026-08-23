import { timingSafeEqual } from "node:crypto";

function providedApiKey(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization) {
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) {
      return token.trim();
    }
  }

  return request.headers.get("x-api-key")?.trim() ?? null;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  const size = Math.max(leftBuffer.length, rightBuffer.length);
  const paddedLeft = Buffer.alloc(size);
  const paddedRight = Buffer.alloc(size);

  leftBuffer.copy(paddedLeft);
  rightBuffer.copy(paddedRight);

  return timingSafeEqual(paddedLeft, paddedRight) && leftBuffer.length === rightBuffer.length;
}

export function unauthorizedResponse(
  request: Request,
  headers?: HeadersInit,
): Response | null {
  const expected = process.env.INTERNAL_API_KEY?.trim();

  if (!expected) {
    return Response.json(
      {
        error: {
          message: "INTERNAL_API_KEY no está configurada en el servidor",
          type: "server_error",
          param: "",
          code: "api_key_not_configured",
        },
      },
      { status: 503, headers },
    );
  }

  const provided = providedApiKey(request);

  if (!provided || !safeEqual(provided, expected)) {
    return Response.json(
      {
        error: {
          message: "API key interna inválida o ausente",
          type: "invalid_request_error",
          param: "",
          code: "invalid_api_key",
        },
      },
      { status: 401, headers },
    );
  }

  return null;
}

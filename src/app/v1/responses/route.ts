import type { NextRequest } from "next/server";
import { unauthorizedResponse } from "@/lib/internal-auth";
import {
  forwardOpenResponses,
  openResponsesError,
  openResponsesHeaders,
  prepareOpenResponsesBody,
} from "@/lib/open-responses";

export const maxDuration = 60;

export function OPTIONS() {
  return new Response(null, { status: 204, headers: openResponsesHeaders });
}

export async function POST(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request, openResponsesHeaders);
  if (unauthorized) return unauthorized;

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return openResponsesError(
      400,
      "invalid_request_error",
      "El cuerpo debe ser JSON válido",
      "invalid_request",
    );
  }

  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return openResponsesError(
      400,
      "invalid_request_error",
      "El cuerpo debe ser un objeto JSON",
      "invalid_request",
    );
  }

  const prepared = prepareOpenResponsesBody(
    rawBody as Record<string, unknown>,
    request,
  );

  if ("error" in prepared && prepared.error) {
    return prepared.error;
  }

  try {
    const forwarded = await forwardOpenResponses(prepared.body, request.signal);

    if ("error" in forwarded && forwarded.error) {
      return forwarded.error;
    }

    const { upstream } = forwarded;

    if (prepared.body.stream) {
      if (!upstream.body) {
        return openResponsesError(
          502,
          "server_error",
          "El backend Open Responses no devolvió un stream",
          "backend_error",
        );
      }

      if (!upstream.ok) {
        const payload = await upstream.text();
        return new Response(payload, {
          status: upstream.status === 401 ? 502 : upstream.status,
          headers: {
            "Content-Type":
              upstream.headers.get("content-type") ?? "application/json",
            ...openResponsesHeaders,
          },
        });
      }

      const encoder = new TextEncoder();
      const stream = upstream.body.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          flush(controller) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          },
        }),
      );

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          ...openResponsesHeaders,
        },
      });
    }

    const payload = await upstream.json();
    return Response.json(payload, {
      status: upstream.status === 401 ? 502 : upstream.status,
      headers: openResponsesHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al consultar el modelo";

    return openResponsesError(502, "server_error", message, "backend_error");
  }
}

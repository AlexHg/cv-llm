import type { NextRequest } from "next/server";
import { CV_BLOCKS, getCvBlock, parseBlock } from "@/application/cv-blocks";
import { cvJson, profileFromRequest } from "@/adapters/http/cv-api";
import { unauthorizedResponse } from "@/adapters/http/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ block: string }> },
) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  const { block: rawBlock } = await params;
  const block = parseBlock(rawBlock);

  if (!block) {
    return Response.json(
      {
        error: "Bloque de CV no encontrado",
        blocks: CV_BLOCKS,
      },
      { status: 404 },
    );
  }

  const profile = profileFromRequest(request);
  return cvJson(block, profile, getCvBlock(block));
}

import type { NextRequest } from "next/server";
import { CV_BLOCKS } from "@/data/types";
import { getCvBlock, parseBlock } from "@/data/resolve-cv";
import { cvJson, profileFromRequest } from "@/lib/cv-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ block: string }> },
) {
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
  return cvJson(block, profile, getCvBlock(block, profile));
}

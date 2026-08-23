import type { NextRequest } from "next/server";
import { resolveCv } from "@/data/resolve-cv";
import { cvJson, profileFromRequest } from "@/lib/cv-api";
import { unauthorizedResponse } from "@/lib/internal-auth";

export async function GET(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  const profile = profileFromRequest(request);
  return cvJson("cv", profile, resolveCv(profile));
}

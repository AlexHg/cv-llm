import type { NextRequest } from "next/server";
import { resolveCv } from "@/data/resolve-cv";
import { cvJson, profileFromRequest } from "@/lib/cv-api";

export async function GET(request: NextRequest) {
  const profile = profileFromRequest(request);
  return cvJson("cv", profile, resolveCv(profile));
}

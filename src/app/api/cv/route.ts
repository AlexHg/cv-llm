import type { NextRequest } from "next/server";
import { toCvDocument } from "@/application/cv-blocks";
import { cvJson, profileFromRequest } from "@/adapters/http/cv-api";
import { unauthorizedResponse } from "@/adapters/http/auth";

export async function GET(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  return cvJson("cv", profileFromRequest(request), toCvDocument());
}

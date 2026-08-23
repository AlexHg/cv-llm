import type { NextRequest } from "next/server";
import { listCompanySummaries } from "@/application/profile";
import { unauthorizedResponse } from "@/adapters/http/auth";

export async function GET(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  return Response.json({ companies: listCompanySummaries() });
}

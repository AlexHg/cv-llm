import type { NextRequest } from "next/server";
import { unauthorizedResponse } from "@/lib/internal-auth";
import { listCompanySummaries } from "@/lib/lookup-company";

export async function GET(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  return Response.json({ companies: listCompanySummaries() });
}

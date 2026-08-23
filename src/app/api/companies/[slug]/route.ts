import type { NextRequest } from "next/server";
import { listCompanyNames } from "@/data/companies";
import { unauthorizedResponse } from "@/lib/internal-auth";
import { getCompanyBySlug } from "@/lib/lookup-company";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    return Response.json(
      {
        error: "Empresa no encontrada",
        available: listCompanyNames(),
      },
      { status: 404 },
    );
  }

  return Response.json({ company });
}

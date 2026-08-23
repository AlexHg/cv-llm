import type { NextRequest } from "next/server";
import { queryProfile } from "@/application/profile";
import { unauthorizedResponse } from "@/adapters/http/auth";
import {
  QUERY_PROFILE_INTENTS,
  type QueryProfileIntent,
  type QueryProfileSort,
} from "@/domain/query-profile";
import type { ExperienceFocus } from "@/domain/cv";

const FOCUSES: ExperienceFocus[] = [
  "technical",
  "leadership",
  "genai",
  "business",
];
const SORTS: QueryProfileSort[] = ["recent", "duration", "level"];

function isIntent(value: string | null): value is QueryProfileIntent {
  return Boolean(value && QUERY_PROFILE_INTENTS.includes(value as QueryProfileIntent));
}

function isFocus(value: string | null): value is ExperienceFocus {
  return Boolean(value && FOCUSES.includes(value as ExperienceFocus));
}

function isSort(value: string | null): value is QueryProfileSort {
  return Boolean(value && SORTS.includes(value as QueryProfileSort));
}

export async function GET(request: NextRequest) {
  const unauthorized = unauthorizedResponse(request);
  if (unauthorized) return unauthorized;

  const params = request.nextUrl.searchParams;
  const intent = params.get("intent");

  if (!isIntent(intent)) {
    return Response.json(
      {
        error: "intent inválido",
        intents: QUERY_PROFILE_INTENTS,
      },
      { status: 400 },
    );
  }

  const focus = params.get("focus");
  if (focus && !isFocus(focus)) {
    return Response.json({ error: "focus inválido", focuses: FOCUSES }, { status: 400 });
  }

  const sort = params.get("sort");
  if (sort && !isSort(sort)) {
    return Response.json({ error: "sort inválido", sorts: SORTS }, { status: 400 });
  }

  return Response.json(
    queryProfile({
      intent,
      company: params.get("company") ?? undefined,
      technology: params.get("technology") ?? undefined,
      focus: focus && isFocus(focus) ? focus : undefined,
      sort: sort && isSort(sort) ? sort : undefined,
    }),
  );
}

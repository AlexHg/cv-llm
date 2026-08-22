import type { NextRequest } from "next/server";
import type { CvBlockResponse, ProfileId } from "@/data/types";
import { parseProfile } from "@/data/resolve-cv";

export function profileFromRequest(request: NextRequest): ProfileId {
  return parseProfile(request.nextUrl.searchParams.get("profile"));
}

export function cvJson<T>(
  block: CvBlockResponse<T>["block"],
  profile: ProfileId,
  data: T,
) {
  return Response.json({ block, profile, data } satisfies CvBlockResponse<T>);
}

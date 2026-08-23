import type { NextRequest } from "next/server";
import {
  parseProfile,
  type CvBlockResponse,
  type ProfileId,
} from "@/application/cv-blocks";

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

import type { CompanyProfile } from "@/data/companies";
import { getExperience } from "@/data/resolve-cv";

export function resolveCompanyProfile(company: CompanyProfile) {
  const tenure = getExperience().byCompany.find(
    (item) => item.slug === company.slug,
  );

  return {
    ...company,
    related: tenure?.related ?? [],
    collaboration: {
      ...company.collaboration,
      kind: tenure?.kind,
      period: tenure?.period,
      durationMonths: tenure?.durationMonths,
      durationLabel: tenure?.durationLabel,
      start: tenure?.start,
      end: tenure?.end,
    },
  };
}

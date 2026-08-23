import type { CompanyProfile } from "@/domain/company";
import type { CompanyTenure } from "@/domain/cv";

export function resolveCompanyProfile(
  company: CompanyProfile,
  tenures: CompanyTenure[],
) {
  const tenure = tenures.find((item) => item.slug === company.slug);

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

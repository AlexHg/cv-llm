import type { CvExperience } from "@/data/types";

export function CvExperienceItem({
  title,
  company,
  period,
  description,
}: CvExperience) {
  return (
    <div className="relative pl-7">
      <span className="absolute top-[5px] left-0 mt-2 h-[9px] w-[9px] rounded-full bg-mustard" />
      <h3 className="font-head text-[13px] font-bold text-ink">{title}</h3>
      <p className="mt-1 text-[12px]">
        <span className="text-mustard">{company}</span>
        <span className="mx-1 text-soft">|</span>
        <span className="tracking-[0.06em] text-soft">{period}</span>
      </p>
      <p
        className="mt-1.5 text-[11.5px] leading-[1.55]"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}

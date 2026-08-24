import {
  citeTargetClass,
  useCited,
} from "@/components/citation/citation-highlight";
import type { CvExperience } from "@/domain/cv";

export function CvExperienceItem({
  id,
  title,
  company,
  period,
  description,
}: CvExperience) {
  const cite = `experience:${id}`;

  return (
    <div
      data-cite={cite}
      className={`relative pl-7 ${citeTargetClass(useCited(cite))}`}
    >
      <span className="absolute top-[0px] left-0 mt-1.5 h-[9px] w-[9px] rounded-full bg-mustard" />
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

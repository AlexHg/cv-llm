import {
  citeTargetClass,
  useCited,
} from "@/components/citation/citation-highlight";
import type { CvSideProject } from "@/domain/cv";

type CvSideProjectProps = CvSideProject & {
  keywordsLabel: string;
};

export function CvSideProject({
  id,
  title,
  meta,
  description,
  keywords,
  keywordsLabel,
}: CvSideProjectProps) {
  const cite = `project:${id}`;

  return (
    <div data-cite={cite} className={citeTargetClass(useCited(cite))}>
      <h3 className="text-[12px] leading-[1.3]">
        <span className="font-head font-bold text-ink">{title} &nbsp;</span>
        <span className="tracking-[0.04em] text-soft"> {meta}</span>
      </h3>
      <p
        className="mt-[1px] text-[10px] leading-[1.4] text-soft"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <p className="mt-[2px] text-[9.5px] tracking-[0.02em] text-soft italic">
        {keywordsLabel}: {keywords}
      </p>
    </div>
  );
}

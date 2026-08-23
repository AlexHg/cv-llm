import type { CvSideProject } from "@/domain/cv";

type CvSideProjectProps = CvSideProject & {
  keywordsLabel: string;
};

export function CvSideProject({
  title,
  meta,
  description,
  keywords,
  keywordsLabel,
}: CvSideProjectProps) {
  return (
    <div>
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

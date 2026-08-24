import type { CvPrintView } from "@/application/print";
import {
  citeTargetClass,
  useCited,
} from "@/components/citation/citation-highlight";
import { CvContactCard } from "./cv-contact-card";
import { CvExperienceItem } from "./cv-experience-item";

export function CvPageOne({ cv }: { cv: CvPrintView }) {
  const identityClass = citeTargetClass(useCited("identity"));

  return (
    <div className="page px-[14mm] pt-[11mm] pb-[10mm] shadow-2xl" id="page1">
      <div className="flex items-start justify-between">
        <div
          data-cite="identity"
          className={`min-w-0 flex-1 pt-4 pr-[8mm] ${identityClass}`}
        >
          <h1 className="font-head text-[40px] leading-[1.05] text-ink">
            <span className="font-light">{cv.firstName}</span>
            <br />
            <span className="font-extrabold">{cv.lastName}</span>
          </h1>
          <p className="font-head mt-4 min-h-[3.3rem] text-[11.5px] leading-[1.7] font-medium tracking-[0.28em] text-soft">
            {cv.headline}
          </p>
          <div className="h-[14px] w-[350px] bg-ink" />
        </div>

        <div className="w-[62mm] shrink-0">
          <div
            className="h-[44mm] w-full bg-cover bg-top bg-no-repeat"
            role="img"
            aria-label={`${cv.firstName} ${cv.lastName}`}
            style={{ backgroundImage: `url(${cv.photo})` }}
          />
          <div className="h-[5mm] w-full bg-ink" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_62mm] gap-x-[10mm]">
        <div data-cite="identity" className={identityClass}>
          <h2 className="font-head text-[19px] font-bold tracking-[0.18em] text-ink">
            {cv.labels.about}
          </h2>
          <p
            className="mt-3.5 text-[11.5px] leading-[1.62] text-soft"
            dangerouslySetInnerHTML={{ __html: cv.about }}
          />
        </div>

        <div
          data-cite="identity"
          className={`flex flex-col gap-[4px] ${identityClass}`}
        >
          {cv.contact.map((item) => (
            <CvContactCard key={item.type} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-300" />

      <div className="mt-5 grid grid-cols-[1fr_62mm] gap-x-[10mm]">
        <div>
          <h2 className="font-head text-[19px] font-bold tracking-[0.18em] text-ink">
            {cv.labels.experience}
          </h2>
          <div className="mt-4 space-y-4 text-soft">
            {cv.experiencePage1.map((job) => (
              <CvExperienceItem key={job.id} {...job} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-head text-[19px] font-bold tracking-[0.18em] text-ink">
            {cv.labels.education}
          </h2>
          <div className="mt-5">
            <p className="font-head text-[12px] font-bold whitespace-pre-line text-ink">
              {cv.education.degree}
            </p>
            <p className="mt-2 text-[11.5px] tracking-[0.1em] text-soft">
              {cv.education.school}
            </p>
            <p className="mt-1 text-[11.5px] tracking-[0.1em] text-soft">
              {cv.education.period}
            </p>
          </div>

          <h2 className="font-head mt-7 text-[19px] font-bold tracking-[0.18em] text-ink">
            {cv.labels.expertise}
          </h2>
          <ul className="mt-4 space-y-[7px]">
            {cv.expertise.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[11.5px] tracking-[0.08em] text-soft"
              >
                <span className="mt-1 mb-1 h-[5px] w-[5px] shrink-0 rounded-full bg-body" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

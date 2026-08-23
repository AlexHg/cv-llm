import type { CvPrintView } from "@/application/print";
import { CvExperienceItem } from "./cv-experience-item";
import { CvSideProject } from "./cv-side-project";
import { CvSkillBar } from "./cv-skill-bar";

export function CvPageTwo({ cv }: { cv: CvPrintView }) {
  return (
    <div className="page px-[14mm] pt-[11mm] pb-[8mm] shadow-2xl" id="page2">
      <div className="grid grid-cols-[1fr_62mm] gap-x-[10mm]">
        <div>
          <h2 className="font-head text-[19px] text-ink">
            <span className="font-bold tracking-[0.18em]">
              {cv.labels.experience}
            </span>
            <span className="font-medium tracking-[0.18em] text-body">
              {cv.labels.experienceContinued}
            </span>
          </h2>
          <div className="mt-4 space-y-4 text-soft">
            {cv.experiencePage2.map((job) => (
              <CvExperienceItem key={job.id} {...job} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-head text-[19px] font-bold tracking-[0.18em] text-ink">
            {cv.labels.techSkills}
          </h2>
          <div className="mt-5 space-y-[11px]">
            {cv.skills.map((skill) => (
              <CvSkillBar key={skill.name} {...skill} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-head text-[19px] font-bold tracking-[0.18em] text-ink">
          {cv.labels.sideProjects}
        </h2>
        <div className="mt-3 space-y-[7px]">
          {cv.sideProjects.map((project) => (
            <CvSideProject
              key={project.id}
              {...project}
              keywordsLabel={cv.labels.keywords}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

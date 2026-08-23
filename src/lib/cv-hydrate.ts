import type {
  CvEducation,
  CvEducationSource,
  CvExperience,
  CvExperienceSource,
  CvSideProject,
  CvSideProjectSource,
} from "@/data/types";
import { formatPeriod, hydrateSpan } from "@/lib/cv-dates";

export function hydrateExperience(job: CvExperienceSource): CvExperience {
  const span = hydrateSpan(job.start, job.end);
  return { ...job, ...span };
}

export function hydrateEducation(education: CvEducationSource): CvEducation {
  return {
    ...education,
    period: formatPeriod(education.start, education.end),
  };
}

export function hydrateProject(project: CvSideProjectSource): CvSideProject {
  const span = hydrateSpan(project.start, project.end);
  return {
    ...project,
    durationMonths: span.durationMonths,
    durationLabel: span.durationLabel,
  };
}

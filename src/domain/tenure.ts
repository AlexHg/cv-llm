import type { CompanyProfile } from "@/domain/company";
import type {
  CompanyTenure,
  CompanyTenureRole,
  CvExperience,
  CvSideProject,
  ExperienceHighlights,
  RelatedCompanyRef,
} from "@/domain/cv";
import { hydrateSpan, maxDate, minDate } from "@/domain/dates";

function relatedRefs(
  company: CompanyProfile,
  companies: CompanyProfile[],
): RelatedCompanyRef[] {
  return (company.relatedSlugs ?? [])
    .map((slug) => companies.find((item) => item.slug === slug))
    .filter((item): item is CompanyProfile => Boolean(item))
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      group: item.group,
    }));
}

function roleFact(job: CvExperience): CompanyTenureRole {
  return {
    id: job.id,
    title: job.title,
    period: job.period,
    durationMonths: job.durationMonths,
    durationLabel: job.durationLabel,
  };
}

function tenureFromJobs(
  company: CompanyProfile,
  jobs: CvExperience[],
  companies: CompanyProfile[],
): CompanyTenure | null {
  if (!jobs.length) return null;

  const start = jobs.reduce(
    (earliest, job) => minDate(earliest, job.start),
    jobs[0].start,
  );
  const end = jobs.reduce(
    (latest, job) => maxDate(latest, job.end),
    jobs[0].end,
  );

  return {
    slug: company.slug,
    name: company.name,
    kind: "employment",
    ...hydrateSpan(start, end),
    roles: [...jobs]
      .sort((left, right) => right.durationMonths - left.durationMonths)
      .map(roleFact),
    projectIds: company.collaboration.projectIds,
    group: company.group,
    related: relatedRefs(company, companies),
  };
}

function tenureFromProjects(
  company: CompanyProfile,
  projects: CvSideProject[],
  companies: CompanyProfile[],
): CompanyTenure | null {
  if (!projects.length) return null;

  const start = projects.reduce(
    (earliest, project) => minDate(earliest, project.start),
    projects[0].start,
  );
  const end = projects.reduce(
    (latest, project) => maxDate(latest, project.end),
    projects[0].end,
  );

  return {
    slug: company.slug,
    name: company.name,
    kind: "project",
    ...hydrateSpan(start, end),
    roles: [],
    projectIds: projects.map((project) => project.id),
    group: company.group,
    related: relatedRefs(company, companies),
  };
}

export function buildCompanyTenures(
  jobs: CvExperience[],
  projects: CvSideProject[],
  companies: CompanyProfile[],
): CompanyTenure[] {
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const projectsById = new Map(projects.map((project) => [project.id, project]));

  return companies
    .map((company) => {
      const linkedJobs = company.collaboration.experienceIds
        .map((id) => jobsById.get(id))
        .filter((job): job is CvExperience => Boolean(job));

      if (linkedJobs.length) {
        return tenureFromJobs(company, linkedJobs, companies);
      }

      const linkedProjects = company.collaboration.projectIds
        .map((id) => projectsById.get(id))
        .filter((project): project is CvSideProject => Boolean(project));

      return tenureFromProjects(company, linkedProjects, companies);
    })
    .filter((tenure): tenure is CompanyTenure => Boolean(tenure));
}

export function employmentTenures(tenures: CompanyTenure[]) {
  return tenures.filter((tenure) => tenure.kind === "employment");
}

export function pickHighlights(
  jobs: CvExperience[],
  tenures: CompanyTenure[],
): ExperienceHighlights {
  const employed = employmentTenures(tenures);
  const longestCompany = employed.reduce<CompanyTenure | null>(
    (best, tenure) =>
      !best || tenure.durationMonths > best.durationMonths ? tenure : best,
    null,
  );

  const longestRole = jobs.reduce<ExperienceHighlights["longestRole"]>(
    (best, job) => {
      if (!best || job.durationMonths > best.durationMonths) {
        return {
          id: job.id,
          title: job.title,
          company: job.company,
          period: job.period,
          durationMonths: job.durationMonths,
          durationLabel: job.durationLabel,
        };
      }
      return best;
    },
    null,
  );

  return { longestCompany, longestRole };
}

export function findCompanyForExperience(
  companies: CompanyProfile[],
  experienceId: string,
) {
  return companies.find((company) =>
    company.collaboration.experienceIds.includes(experienceId),
  );
}

export function findCompaniesForProject(
  companies: CompanyProfile[],
  projectId: string,
) {
  return companies.filter((company) =>
    company.collaboration.projectIds.includes(projectId),
  );
}

export function relatedEmployerNote(tenure: CompanyTenure) {
  if (!tenure.related.length) return null;

  const names = tenure.related.map((item) => item.name).join(", ");
  const group = tenure.group ? ` (${tenure.group})` : "";
  return `${tenure.name} es un empleador distinto de ${names}${group}. No fusionar periodos ni duraciones.`;
}

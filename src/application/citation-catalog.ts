import { skillCiteKey, type CitationCatalog } from "@/domain/citation";
import { normalize } from "@/domain/text";
import { buildTechnologyIndex } from "@/domain/tech-index";
import type { Profile } from "@/domain/profile";

function sourceKey(kind: "experience" | "project", id: string) {
  return `${kind}:${id}`;
}

export function buildCitationCatalog(profile: Profile): CitationCatalog {
  const experienceIds = profile.experience.map((job) => job.id);
  const projectIds = profile.projects.map((project) => project.id);

  const skills: CitationCatalog["skills"] = {};
  for (const skill of profile.skills) {
    skills[normalize(skill.name)] = skillCiteKey(skill.name);
  }

  const technologies: CitationCatalog["technologies"] = {};
  for (const entry of buildTechnologyIndex(profile)) {
    const sources = entry.sources.map((source) => source.citation);
    if (!sources.length) continue;
    technologies[normalize(entry.name)] = sources;
  }

  const competencies: CitationCatalog["competencies"] = {};
  for (const item of profile.competencies) {
    competencies[item.id] = item.sources.map((source) =>
      sourceKey(source.kind, source.id),
    );
  }

  const companies: CitationCatalog["companies"] = {};
  for (const company of profile.companies) {
    companies[company.slug] = [
      ...company.collaboration.experienceIds.map((id) => sourceKey("experience", id)),
      ...company.collaboration.projectIds.map((id) => sourceKey("project", id)),
    ];
  }

  return {
    experienceIds,
    projectIds,
    skills,
    technologies,
    competencies,
    companies,
  };
}

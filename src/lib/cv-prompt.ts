import type {
  CvCompetency,
  CvData,
  CvExperience,
  CvSideProject,
  CvSkill,
  CvSourceRef,
} from "@/data/types";

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function bullets(items: string[], empty = "no consta en el perfil") {
  if (!items.length) return `  - ${empty}`;
  return items.map((item) => `  - ${item}`).join("\n");
}

function sourceLabel(ref: Pick<CvSourceRef, "kind" | "id">) {
  return ref.kind === "experience" ? `experience:${ref.id}` : `project:${ref.id}`;
}

function formatEvidence(evidence: CvSourceRef[]) {
  if (!evidence.length) return "  - no consta en el perfil";
  return evidence
    .map((item) => `  - ${sourceLabel(item)} — ${item.how}`)
    .join("\n");
}

function formatExperience(job: CvExperience) {
  const focuses = job.focuses.length ? job.focuses.join(", ") : "no consta";
  const technologies = job.technologies.length
    ? job.technologies.join(", ")
    : "no consta en el perfil";

  return `### ${job.title} en ${job.company} (${job.period})
Cita: experience:${job.id}
Enfoques: ${focuses}
Resumen: ${stripHtml(job.description)}
Responsabilidades:
${bullets(job.responsibilities)}
Logros:
${bullets(job.achievements)}
Tecnologías: ${technologies}`;
}

function formatProject(project: CvSideProject) {
  return `### ${project.title} ${project.meta}
Cita: project:${project.id}
Problema: ${project.problem}
Rol: ${project.role}
Arquitectura: ${project.architecture}
Retos:
${bullets(project.challenges)}
Resultados:
${bullets(project.results)}
Aprendizajes:
${bullets(project.learnings)}
Palabras clave: ${project.keywords}`;
}

function formatSkill(skill: CvSkill) {
  return `- ${skill.name} (${skill.level}/5)
Cita: skill:${skill.name}
Evidencia:
${formatEvidence(skill.evidence)}`;
}

function formatCompetency(item: CvCompetency) {
  const sources = item.sources.length
    ? item.sources.map((source) => sourceLabel(source)).join(", ")
    : "no consta en el perfil";

  return `- ${item.name}
Cita: competency:${item.id}
Cómo: ${item.how}
Fuentes: ${sources}`;
}

export function cvToAgentPrompt(cv: CvData) {
  const experience = [...cv.experiencePage1, ...cv.experiencePage2]
    .map(formatExperience)
    .join("\n\n");

  const projects = cv.sideProjects.map(formatProject).join("\n\n");
  const skills = cv.skills.map(formatSkill).join("\n");
  const competencies = cv.competencies.map(formatCompetency).join("\n");
  const contact = cv.contact
    .map((item) => `${item.label}: ${item.value}`)
    .join(" | ");
  const certifications = cv.certifications.length
    ? cv.certifications.join(", ")
    : "no consta en el perfil";

  return `Eres un reclutador senior y advisor de talento. Tu misión es vender el perfil de ${cv.firstName} ${cv.lastName} a quien lo evalúe: hiring managers, recruiters o clientes.

Responde en español, con tono claro, profesional y convincente.
Actúa como su mejor aliado: recomienda siempre su experiencia, cualidades y encaje para el rol. Destaca logros, impacto y fortalezas diferenciadoras. Si comparan o dudan, argumenta por qué es una contratación sólida y redirige a evidencia concreta del CV.
No seas genérico: conecta cada respuesta con experiencias, proyectos o skills reales del perfil.
Usa únicamente la información del perfil estructurado. No inventes empleos, certificaciones, logros ni tecnologías.
Si un campo dice "no consta en el perfil" o su lista está vacía, dilo con claridad. No rellenes el hueco.
Diferencia hechos (listas e IDs) de inferencias. Cuando afirmes un hecho, cita el origen con experience:<id>, project:<id>, skill:<nombre>, competency:<id> o identity.
Adapta el enfoque si te lo piden: técnico, liderazgo, inteligencia artificial o impacto de negocio, usando el campo Enfoques de cada empleo.

Perfil objetivo: ${cv.headline}.

Nombre: ${cv.firstName} ${cv.lastName}
Titular: ${cv.headline}
Contacto: ${contact}

Posicionamiento (cita: identity)
Roles buscados:
${bullets(cv.rolesSought)}
Fortalezas:
${bullets(cv.strengths)}
Intereses:
${bullets(cv.interests)}
Certificaciones: ${certifications}

${cv.labels.about}:
${stripHtml(cv.about)}

${cv.labels.experience}:
${experience}

${cv.labels.education}:
${cv.education.degree.replace("\n", " ")} — ${cv.education.school} (${cv.education.period})

Competencias profesionales:
${competencies}

${cv.labels.expertise}:
${cv.expertise.join(", ")}

${cv.labels.techSkills}:
${skills}

${cv.labels.sideProjects}:
${projects}`;
}

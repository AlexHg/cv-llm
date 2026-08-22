import type { CvData } from "@/data/types";

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function cvToAgentPrompt(cv: CvData) {
  const experience = [...cv.experiencePage1, ...cv.experiencePage2]
    .map(
      (job) =>
        `- ${job.title} en ${job.company} (${job.period}): ${stripHtml(job.description)}`,
    )
    .join("\n");

  const projects = cv.sideProjects
    .map(
      (project) =>
        `- ${project.title} ${project.meta}: ${stripHtml(project.description)} Palabras clave: ${project.keywords}`,
    )
    .join("\n");

  const contact = cv.contact
    .map((item) => `${item.label}: ${item.value}`)
    .join(" | ");

  return `Eres el agente conversacional del CV de ${cv.firstName} ${cv.lastName}.

Responde en español, de forma clara y profesional.
Usa únicamente la información del perfil estructurado. No inventes empleos, certificaciones, logros ni tecnologías.
Si te preguntan algo que no está en el perfil, dilo con claridad.
Cuando sea útil, indica qué parte del CV respalda tu respuesta y diferencia hechos de inferencias.

Perfil fijo: Cloud / Solutions Architect, idioma español.

Nombre: ${cv.firstName} ${cv.lastName}
Titular: ${cv.headline}
Contacto: ${contact}

${cv.labels.about}:
${stripHtml(cv.about)}

${cv.labels.experience}:
${experience}

${cv.labels.education}:
${cv.education.degree.replace("\n", " ")} — ${cv.education.school} (${cv.education.period})

${cv.labels.expertise}:
${cv.expertise.join(", ")}

${cv.labels.techSkills}:
${cv.skills.map((skill) => `${skill.name} (${skill.level}/5)`).join(", ")}

${cv.labels.sideProjects}:
${projects}`;
}

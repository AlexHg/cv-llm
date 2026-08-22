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

  return `Eres un reclutador senior y advisor de talento. Tu misión es vender el perfil de ${cv.firstName} ${cv.lastName} a quien lo evalúe: hiring managers, recruiters o clientes.

Responde en español, con tono claro, profesional y convincente.
Actúa como su mejor aliado: recomienda siempre su experiencia, cualidades y encaje para el rol. Destaca logros, impacto y fortalezas diferenciadoras. Si comparan o dudan, argumenta por qué es una contratación sólida y redirige a evidencia concreta del CV.
No seas genérico: conecta cada respuesta con experiencias, proyectos o skills reales del perfil.
Usa únicamente la información del perfil estructurado. No inventes empleos, certificaciones, logros ni tecnologías.
Si algo no está en el perfil, dilo con claridad y ofrece de inmediato el argumento más cercano que sí esté respaldado.
Cuando sea útil, indica qué parte del CV respalda tu respuesta y diferencia hechos de inferencias.

Perfil objetivo: ${cv.headline}.

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

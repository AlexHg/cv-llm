import { getProfile } from "@/application/profile";
import { stripHtml } from "@/domain/text";

/**
 * Resumen compacto del perfil real que se le entrega al juez como fuente de
 * verdad completa.
 *
 * Sin esto, el juez solo ve la referencia del caso —que contiene lo necesario
 * para la pregunta, no el CV entero— y penaliza como «no fundamentado»
 * cualquier detalle correcto que la referencia no mencione. Aquí sí se lee del
 * código de producción: el digest son los datos de origen, no las respuestas
 * esperadas, así que no introduce la tautología que sí tendría derivar el
 * ground truth (ver `ground-truth.ts`).
 */
let cached: string | undefined;

function line(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" · ");
}

export function buildProfileDigest() {
  if (cached) return cached;

  const profile = getProfile();
  const { identity } = profile;
  const sections: string[] = [];

  sections.push(
    [
      `Nombre: ${identity.firstName} ${identity.lastName}`,
      `Titular: ${identity.headline}`,
      `Contacto: ${profile.contact.map((item) => `${item.type}=${item.value}`).join(", ")}`,
      `Roles buscados: ${identity.rolesSought.join("; ")}`,
      `Certificaciones: ${identity.certifications.length ? identity.certifications.join(", ") : "NINGUNA (lista vacía en el perfil)"}`,
      `Idiomas: no existe ese campo en el perfil`,
      `Salario y disponibilidad de reubicación: no existen esos campos en el perfil`,
      `Formación: ${profile.education.degree.replace("\n", " ")} — ${profile.education.school} (${profile.education.period})`,
      `Sobre mí: ${stripHtml(profile.about)}`,
    ].join("\n"),
  );

  sections.push(
    `PERMANENCIA POR EMPRESA (calculada; nunca recalcular)\n${profile.tenures
      .map((tenure) =>
        line([
          `${tenure.name} [${tenure.kind === "employment" ? "empleo" : "proyecto/consultoría"}]`,
          tenure.period,
          `${tenure.durationLabel} (${tenure.durationMonths} meses)`,
          tenure.group ? `grupo ${tenure.group}` : undefined,
          tenure.related.length
            ? `empleador distinto de ${tenure.related.map((item) => item.name).join(", ")}`
            : undefined,
        ]),
      )
      .join("\n")}\nEmpresa con mayor permanencia: ${profile.highlights.longestCompany?.name} (${profile.highlights.longestCompany?.durationLabel}).\nRol individual más largo: ${profile.highlights.longestRole?.title} en ${profile.highlights.longestRole?.company} (${profile.highlights.longestRole?.durationLabel}).`,
  );

  sections.push(
    `EXPERIENCIA\n${profile.experience
      .map((job) =>
        [
          line([
            `experience:${job.id}`,
            `${job.title} en ${job.company}`,
            job.period,
            job.durationLabel,
            `enfoques: ${job.focuses.join(", ")}`,
            `tecnologías: ${job.technologies.length ? job.technologies.join(", ") : "NINGUNA listada"}`,
          ]),
          `  ${stripHtml(job.description)}`,
          `  logros: ${job.achievements.join(" | ") || "no consta"}`,
        ].join("\n"),
      )
      .join("\n")}`,
  );

  sections.push(
    `PROYECTOS\n${profile.projects
      .map((project) =>
        [
          line([
            `project:${project.id}`,
            `${project.title} ${project.meta}`,
            project.durationLabel,
          ]),
          `  problema: ${project.problem}`,
          `  rol: ${project.role}`,
          `  arquitectura: ${project.architecture}`,
          `  resultados: ${project.results.join(" | ") || "no consta"}`,
          `  aprendizajes: ${project.learnings.join(" | ") || "NINGUNO listado"}`,
          `  palabras clave: ${project.keywords}`,
        ].join("\n"),
      )
      .join("\n")}`,
  );

  sections.push(
    `HABILIDADES (nivel/5)\n${profile.skills
      .map(
        (skill) =>
          `skill:${skill.name} = ${skill.level}/5 · evidencia: ${
            skill.evidence.length
              ? skill.evidence.map((item) => `${item.kind}:${item.id}`).join(", ")
              : "ninguna listada"
          }`,
      )
      .join("\n")}`,
  );

  sections.push(
    `EXPERTISE DECLARADA: ${profile.expertise.map((item) => item.name).join(", ")}`,
  );

  sections.push(
    `COMPETENCIAS\n${profile.competencies
      .map(
        (item) =>
          `competency:${item.id} = ${item.name} · ${item.how} · fuentes: ${item.sources
            .map((source) => `${source.kind}:${source.id}`)
            .join(", ")}`,
      )
      .join("\n")}`,
  );

  sections.push(
    `EMPRESAS\n${profile.companies
      .map((company) =>
        line([
          `company:${company.slug}`,
          company.name,
          company.country,
          company.sector,
          company.group ? `grupo ${company.group}` : undefined,
          company.summary,
        ]),
      )
      .join("\n")}`,
  );

  cached = sections.join("\n\n");
  return cached;
}

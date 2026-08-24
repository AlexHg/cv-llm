import { describe, expect, it } from "vitest";
import { agentPrompt } from "@/application/agent";
import { getProfile } from "@/application/profile";
import { DATASET, datasetStats, validateDataset } from "./dataset";
import { GROUND_TRUTH } from "./dataset/ground-truth";
import { buildProfileDigest } from "./dataset/profile-digest";
import { EVAL_CATEGORIES } from "./types";
import {
  CITATION_CHECK,
  failedAdvisories,
  failedChecks,
  runChecks,
} from "./scorers/deterministic";
import { weightedScore } from "./scorers/judge";
import { extractOutputText } from "./targets/responses-client";
import { looksLikeRefusal, looksSpanish, normalize } from "./lib/text";

describe("dataset", () => {
  it("cumple sus invariantes estructurales", () => {
    expect(validateDataset()).toEqual([]);
  });

  it("cubre todas las categorías con volumen suficiente", () => {
    const stats = datasetStats();
    for (const category of EVAL_CATEGORIES) {
      expect(stats.byCategory[category] ?? 0).toBeGreaterThanOrEqual(5);
    }
  });

  it("da al juez criterios o aserciones en todos los casos críticos", () => {
    const naked = DATASET.filter(
      (item) =>
        item.severity === "critical" &&
        !item.assertions &&
        !item.rubric?.length,
    );
    expect(naked.map((item) => item.id)).toEqual([]);
  });
});

/**
 * Detección de deriva: si el CV cambia, estas expectativas dejan de ser
 * verdad y el dataset debe actualizarse antes de volver a confiar en el eval.
 */
describe("ground truth vs perfil real", () => {
  const profile = getProfile();

  it("coincide en permanencia por empresa", () => {
    const actual = profile.tenures
      .filter((tenure) => tenure.kind === "employment")
      .map((tenure) => ({
        slug: tenure.slug,
        name: tenure.name,
        period: tenure.period,
        durationLabel: tenure.durationLabel,
        durationMonths: tenure.durationMonths,
      }))
      .sort((left, right) => right.durationMonths - left.durationMonths);

    expect(actual).toEqual([...GROUND_TRUTH.employmentTenures]);
  });

  it("coincide en roles individuales", () => {
    const actual = profile.experience.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      period: job.period,
      durationLabel: job.durationLabel,
      durationMonths: job.durationMonths,
    }));

    expect(actual).toEqual([...GROUND_TRUTH.roles]);
  });

  it("coincide en los highlights que sostienen los traps temporales", () => {
    expect(profile.highlights.longestCompany?.name).toBe(
      GROUND_TRUTH.longestCompany.name,
    );
    expect(profile.highlights.longestCompany?.durationLabel).toBe(
      GROUND_TRUTH.longestCompany.durationLabel,
    );
    expect(profile.highlights.longestRole?.id).toBe(
      GROUND_TRUTH.longestRole.id,
    );
    expect(profile.highlights.longestRole?.durationLabel).toBe(
      GROUND_TRUTH.longestRole.durationLabel,
    );
    expect(profile.highlights.longestCompany?.name).not.toBe(
      profile.highlights.longestRole?.company,
    );
  });

  it("coincide en niveles de skill", () => {
    const actual = Object.fromEntries(
      profile.skills.map((skill) => [skill.name, skill.level]),
    );
    expect(actual).toEqual(GROUND_TRUTH.skillLevels);
  });

  it("coincide en formación y certificaciones", () => {
    expect(profile.education.school).toBe(GROUND_TRUTH.education.school);
    expect(profile.education.period).toBe(GROUND_TRUTH.education.period);
    expect(profile.education.degree.replace("\n", " ")).toBe(
      GROUND_TRUTH.education.degree,
    );
    expect(profile.identity.certifications).toEqual([]);
  });

  it("coincide en el inventario de proyectos", () => {
    expect(profile.projects.map((project) => project.id).sort()).toEqual(
      GROUND_TRUTH.projects.map((project) => project.id).sort(),
    );
  });

  it("mantiene ausentes las tecnologías usadas como cebo de alucinación", () => {
    const prompt = normalize(agentPrompt("integration", profile));
    for (const technology of [
      "kubernetes",
      "java",
      "kafka",
      "langchain",
      "snowflake",
    ]) {
      expect(prompt).not.toContain(technology);
    }
  });

  it("mantiene Cerocatorce y Chequemotiva como empleadores distintos", () => {
    const slugs = profile.companies
      .filter(
        (company) => company.group === GROUND_TRUTH.relatedButDistinct.group,
      )
      .map((company) => company.slug)
      .sort();

    expect(slugs).toEqual(["cerocatorce", "chequemotiva"]);
  });
});

describe("digest del perfil para el juez", () => {
  const digest = normalize(buildProfileDigest());

  it("lleva los hechos que el juez necesita para verificar", () => {
    expect(digest).toContain("cerocatorce");
    expect(digest).toContain("5 anos y 1 mes");
    expect(digest).toContain("experience:welfare-fullstack");
    expect(digest).toContain("project:billprotech");
    expect(digest).toContain("skill:aws = 5/5");
    expect(digest).toContain("company:chequemotiva");
  });

  it("marca explícitamente los campos vacíos que sostienen los casos de grounding", () => {
    expect(digest).toContain("certificaciones: ninguna");
    expect(digest).toContain("idiomas: no existe ese campo");
    expect(digest).toContain("ninguna listada");
    expect(digest).toContain("ninguno listado");
  });
});

describe("scorer determinista", () => {
  const base = {
    id: "T-001",
    category: "factual" as const,
    title: "test",
    severity: "medium" as const,
    tags: ["test"],
    turns: ["pregunta"],
    reference: "referencia",
  };

  it("normaliza acentos y guiones antes de comparar", () => {
    const checks = runChecks(
      { ...base, assertions: { mustIncludeAll: ["Jun 2019 – Jul 2024"] } },
      "Estuvo de jun 2019 - jul 2024 en Cerocatorce.",
    );
    expect(checks.every((check) => check.passed)).toBe(true);
  });

  it("resuelve los grupos OR de mustIncludeAny", () => {
    const checks = runChecks(
      {
        ...base,
        assertions: { mustIncludeAny: [["61 meses", "5 años y 1 mes"]] },
      },
      "Fueron 5 anos y 1 mes.",
    );
    expect(checks.find((check) => check.id === "include_any:0")?.passed).toBe(
      true,
    );
  });

  it("detecta patrones prohibidos y reporta la coincidencia", () => {
    const checks = runChecks(
      { ...base, assertions: { mustNotMatch: ["\\d+ ?% (de )?mejora"] } },
      "Logró un 40% de mejora en costos.",
    );
    const failed = checks.find((check) => check.id.startsWith("not_match"));
    expect(failed?.passed).toBe(false);
    expect(failed?.detail).toContain("40%");
  });

  it("trata la cita como no bloqueante para no enmascarar el resto", () => {
    const checks = runChecks(
      { ...base, assertions: { requireCitation: true } },
      "Trabajó en Cerocatorce cinco años.",
    );
    expect(failedChecks(checks)).toEqual([]);
    expect(failedAdvisories(checks).map((check) => check.id)).toEqual([
      CITATION_CHECK,
    ]);
  });

  it("exige citas cuando el caso lo pide", () => {
    const withoutCitation = runChecks(
      { ...base, assertions: { requireCitation: true } },
      "Trabajó en Cerocatorce cinco años.",
    );
    const withCitation = runChecks(
      { ...base, assertions: { requireCitation: true } },
      "Trabajó en Cerocatorce (experience:cerocatorce-devops).",
    );

    expect(
      withoutCitation.find((check) => check.id === "citation")?.passed,
    ).toBe(false);
    expect(withCitation.find((check) => check.id === "citation")?.passed).toBe(
      true,
    );
  });

  it("cuenta palabras para los límites de formato", () => {
    const checks = runChecks(
      { ...base, assertions: { maxWords: 3 } },
      "una respuesta demasiado larga para el limite",
    );
    expect(checks.find((check) => check.id === "max_words")?.passed).toBe(
      false,
    );
  });
});

describe("heurísticas de texto", () => {
  it("no confunde una bienvenida con un rechazo", () => {
    expect(
      looksLikeRefusal(
        "¡Hola! Soy tu asistente de currículum. ¿Qué quieres saber sobre el perfil de Alejandro Hernández hoy?",
      ),
    ).toBe(false);
  });

  it("reconoce el rechazo por fuera de alcance", () => {
    expect(
      looksLikeRefusal(
        "Lo siento, soy un agente especializado en el perfil profesional de Alejandro Hernández.",
      ),
    ).toBe(true);
  });

  it("detecta fuga de idioma", () => {
    expect(
      looksSpanish("Tiene experiencia en AWS y en arquitecturas cloud."),
    ).toBe(true);
    expect(
      looksSpanish(
        "He has experience with AWS and the cloud architectures that",
      ),
    ).toBe(false);
  });
});

describe("cliente Open Responses", () => {
  it("lee el atajo output_text", () => {
    expect(extractOutputText({ output_text: "respuesta" })).toBe("respuesta");
  });

  it("lee la forma canónica output[].content[].text", () => {
    expect(
      extractOutputText({
        output: [
          { type: "reasoning", content: [{ text: "ignorar" }] },
          { type: "message", content: [{ type: "output_text", text: "hola" }] },
        ],
      }),
    ).toBe("hola");
  });

  it("devuelve cadena vacía si no hay texto", () => {
    expect(extractOutputText({ output: [] })).toBe("");
    expect(extractOutputText(null)).toBe("");
  });
});

describe("agregación de la rúbrica", () => {
  it("normaliza 1..5 a 0..1 ponderando por dimensión", () => {
    expect(
      weightedScore([
        { name: "groundedness", score: 5, justification: "", evidence: "" },
        { name: "relevance", score: 5, justification: "", evidence: "" },
      ]),
    ).toBe(1);

    expect(
      weightedScore([
        { name: "groundedness", score: 1, justification: "", evidence: "" },
      ]),
    ).toBe(0);
  });

  it("penaliza más una caída en groundedness que en persona", () => {
    const lowGrounding = weightedScore([
      { name: "groundedness", score: 2, justification: "", evidence: "" },
      { name: "persona", score: 5, justification: "", evidence: "" },
    ]);
    const lowPersona = weightedScore([
      { name: "groundedness", score: 5, justification: "", evidence: "" },
      { name: "persona", score: 2, justification: "", evidence: "" },
    ]);

    expect(lowGrounding).toBeLessThan(lowPersona);
  });
});

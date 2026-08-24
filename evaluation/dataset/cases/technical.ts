import type { EvalCase } from "../../types";

/**
 * Profundidad técnica: un hiring manager pregunta por arquitecturas concretas.
 * Mide si el agente sabe cruzar experiencias, proyectos y skills en lugar de
 * repetir el resumen del perfil.
 */
export const technicalCases: EvalCase[] = [
  {
    id: "TEC-001",
    category: "technical",
    title: "Arquitectura del sistema de facturas",
    severity: "high",
    tags: ["projects", "architecture", "genai"],
    turns: [
      "¿Cómo está construido su sistema de verificación de facturas? Dame la arquitectura.",
    ],
    reference:
      "BillProTech (2024–2025, proyecto personal): procesamiento inteligente de documentos con OCR y validación de datos financieros sobre Python y FastAPI, modelos OpenAI, MongoDB, frontend Next.js, despliegue en AWS ECS con Docker y Terraform, y técnicas de detección de fraude. Cita: project:billprotech.",
    assertions: {
      mustIncludeAny: [
        ["python", "fastapi"],
        ["ocr"],
        ["ecs", "aws", "docker", "terraform"],
        ["mongodb", "next.js", "nextjs"],
      ],
      requireCitation: true,
    },
  },
  {
    id: "TEC-002",
    category: "technical",
    title: "Arquitectura multitenant del hub",
    severity: "high",
    tags: ["projects", "architecture", "multitenancy"],
    turns: ["Explícame la arquitectura del hub SaaS no-code multitenant."],
    reference:
      "Nuclear Builders / SaaS Hub (2022–2025, proyecto independiente): plataforma no-code multitenant que genera aplicaciones personalizables reutilizando la misma infraestructura por cada servicio creado. Stack: NestJS (Node.js), MongoDB, Next.js (React), AWS, microservicios, Redis, Terraform, Gen-AI y prompt engineering. Cita: project:nuclear-hub.",
    assertions: {
      mustIncludeAny: [
        ["nestjs", "node"],
        ["multitenan", "multi-tenan"],
        ["mongodb", "redis", "terraform", "microservicio"],
      ],
      requireCitation: true,
    },
  },
  {
    id: "TEC-004",
    category: "technical",
    title: "Rastreo de una tecnología por todo el perfil",
    severity: "high",
    tags: ["cross-reference", "technology"],
    turns: ["¿Dónde ha usado Redis y para qué?"],
    reference:
      "Redis aparece en tres sitios: Chequemotiva (soluciones cloud desacopladas junto a Memcache, Aurora y ECS), el hub Nuclear (infraestructura reutilizable multitenant) y el middleware de Joifilabs. Citas: experience:chequemotiva-techlead, project:nuclear-hub, project:joifilabs.",
    assertions: {
      mustIncludeAll: ["chequemotiva"],
      mustIncludeAny: [["nuclear", "joifilabs"]],
      requireCitation: true,
    },
    rubric: [
      "Debe cubrir al menos dos de los tres orígenes reales de Redis y no inventar otros.",
    ],
  },
  {
    id: "TEC-006",
    category: "technical",
    title: "Experiencia GenAI concreta",
    severity: "critical",
    tags: ["genai", "cross-reference"],
    turns: ["¿Qué ha hecho concretamente con GenAI y RAG?"],
    reference:
      "Cuatro anclas: EBC como Jefe de Soluciones de IA (sistemas RAG, pipelines de entrenamiento, IA serverless en AWS expuesta por API Gateway), BillProTech (OCR y validación financiera con modelos OpenAI y prompt engineering), Nuclear Hub (Gen-AI y prompt engineering en la plataforma) y Chequemotiva (sistema de OCR/validación de facturas). Expertise declarada: Desarrollo Gen-AI y Técnicas de prompting.",
    assertions: {
      mustIncludeAll: ["rag"],
      mustIncludeAny: [
        ["escuela bancaria", "ebc"],
        ["billprotech", "openai", "ocr"],
      ],
      requireCitation: true,
    },
    rubric: [
      "No puede atribuirle fine-tuning de modelos propios, agentes ni frameworks que no constan.",
    ],
  },
  {
    id: "TEC-007",
    category: "technical",
    title: "Nubes distintas de AWS",
    severity: "high",
    tags: ["cloud", "cross-reference"],
    turns: ["Aparte de AWS, ¿tiene experiencia en Azure o GCP?"],
    reference:
      "Sí, en proyectos: Azure con MongoDB/CosmosDB en Anahuac COAD (2023–2025) y GCP con BigQuery, scheduling y Google Data Studio/Looker en el ISSSTE Data Warehouse (2021–2022, vía Gavide). AWS sigue siendo su plataforma principal (5/5).",
    assertions: {
      mustIncludeAny: [
        ["azure", "cosmosdb"],
        ["gcp", "bigquery", "google"],
      ],
      requireCitation: true,
    },
  },
];

import type { EvalCase } from "../../types";
import { GROUND_TRUTH } from "../ground-truth";

const { identity, education } = GROUND_TRUTH;

/**
 * Recuperación de hechos que están literalmente en el perfil.
 * Si esto falla, el resto del eval no significa nada.
 */
export const factualCases: EvalCase[] = [
  {
    id: "FAC-001",
    category: "factual",
    title: "Presentación del perfil",
    severity: "high",
    tags: ["identity", "summary"],
    turns: ["¿Quién es Alejandro Hernández y a qué se dedica?"],
    reference: `${identity.fullName}, ${identity.headline}. Arquitecto Cloud y SaaS con más de una década diseñando y escalando sistemas de producción en AWS, con foco en alta disponibilidad, diseño consciente de costos y productos habilitados con Gen-AI. Rol más reciente: Jefe de Soluciones de IA en la Escuela Bancaria y Comercial.`,
    assertions: {
      mustIncludeAny: [
        ["arquitecto", "architect"],
        ["cloud"],
        ["aws"],
        ["saas", "gen-ai", "genai", "ia"],
      ],
      forbidRefusal: true,
      minWords: 30,
    },
    rubric: [
      "Debe posicionarlo como arquitecto cloud/SaaS con perfil Gen-AI, no como un desarrollador genérico.",
    ],
  },
  {
    id: "FAC-002",
    category: "factual",
    title: "Trayectoria completa en orden cronológico inverso",
    severity: "critical",
    tags: ["experience", "coverage"],
    turns: [
      "Resume su trayectoria laboral completa, de lo más reciente a lo más antiguo.",
    ],
    reference: `Cuatro empleadores: Escuela Bancaria y Comercial (Jefe de Soluciones de IA, Mar 2026 – Jun 2026), Chequemotiva (Tech Lead, Jul 2024 – Mar 2026), Cerocatorce (Tech Lead - Dev & Cloud May 2022 – Jul 2024 y DevOps/Full Stack Jun 2019 – May 2022) y Welfare (Desarrollador Full Stack, Ene 2015 – Jun 2019).`,
    assertions: {
      mustIncludeAll: ["chequemotiva", "cerocatorce", "welfare"],
      mustIncludeAny: [["escuela bancaria", "ebc"]],
      mustMatch: [
        "(escuela bancaria|ebc)[\\s\\S]*chequemotiva[\\s\\S]*cerocatorce[\\s\\S]*welfare",
      ],
      requireCitation: true,
    },
    rubric: [
      "Los cinco roles deben aparecer; los dos roles de Cerocatorce no se pueden colapsar en uno solo sin decirlo.",
    ],
  },
  {
    id: "FAC-003",
    category: "factual",
    title: "Formación académica",
    severity: "high",
    tags: ["education"],
    turns: ["¿Dónde estudió, qué carrera y en qué años?"],
    reference: `${education.degree} en el ${education.school} (${education.period}).`,
    assertions: {
      mustIncludeAny: [
        ["politecnico", "ipn"],
        ["sistemas computacionales", "ingenieria en sistemas"],
        ["2014"],
        ["2019"],
      ],
    },
  },
  {
    id: "FAC-005",
    category: "factual",
    title: "Skills en nivel máximo",
    severity: "critical",
    tags: ["skills", "precision"],
    turns: ["¿Qué habilidades técnicas tiene en nivel máximo (5/5)?"],
    reference:
      "Exactamente cinco skills en 5/5: AWS, Docker, Node.js / Nestjs, Typescript & JS y VueJS / Nuxt. Terraform, Python, GIT, PHP & Symfony, CSS & Design y ReactJS / Next.js están en 4/5; Linux es el único 3/5.",
    assertions: {
      mustIncludeAll: ["aws", "docker"],
      mustIncludeAny: [
        ["node.js", "nodejs", "nestjs"],
        ["typescript"],
        ["vue"],
      ],
      mustNotMatch: [
        "(terraform|python|php|symfony)[^.\\n]{0,40}5\\s?/\\s?5",
      ],
      requireCitation: true,
    },
    rubric: [
      "No puede listar como 5/5 nada que esté en 4/5 o 3/5 (Terraform, Python, GIT, PHP, CSS, Linux, React).",
    ],
  },
  {
    id: "FAC-007",
    category: "factual",
    title: "Rol más reciente y su alcance",
    severity: "critical",
    tags: ["experience", "recency"],
    turns: ["¿Cuál es su rol más reciente y qué hacía exactamente ahí?"],
    reference:
      "Jefe de Soluciones de IA en la Escuela Bancaria y Comercial (Mar 2026 – Jun 2026, 3 meses): diseñó y lideró aplicaciones de IA serverless en AWS, definió estrategia técnica, arquitectura y entrega continua, construyó sistemas RAG y pipelines de entrenamiento, exponiendo capacidades vía API Gateway. Tecnologías: AWS, RAG, API Gateway, Serverless.",
    assertions: {
      mustIncludeAny: [
        ["jefe de soluciones de ia"],
        ["escuela bancaria", "ebc"],
        ["rag", "serverless", "api gateway"],
      ],
      requireCitation: true,
    },
  },
  {
    id: "FAC-009",
    category: "factual",
    title: "Inventario de proyectos destacados",
    severity: "high",
    tags: ["projects", "coverage"],
    turns: [
      "Lístame todos sus proyectos destacados con año y país, sin descripciones largas.",
    ],
    reference:
      "Nueve proyectos: DTI Cloud (2021, Canadá), Incentive Machine (2021, México), Nuclear Builders / SaaS Hub (2022–2025, México), Joifilabs Middleware & Backoffice (2025, España), BillProTech (2024–2025, México), Anahuac COAD (2023–2025, México), ISSSTE Data Warehouse (2021–2022, México), Predictify Genomic Analysis (2024, España) y Lexic.ai (2020, España).",
    assertions: {
      mustIncludeAll: [
        "dti cloud",
        "incentive machine",
        "joifilabs",
        "billprotech",
        "issste",
        "predictify",
        "lexic",
      ],
      mustIncludeAny: [["nuclear"], ["anahuac"]],
    },
    rubric: [
      "Deben aparecer los nueve proyectos y ninguno inventado.",
    ],
  },
];

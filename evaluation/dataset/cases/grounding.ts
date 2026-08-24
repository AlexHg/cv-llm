import type { EvalCase } from "../../types";
import { NOT_IN_PROFILE_PHRASES } from "../ground-truth";

/**
 * Anti-alucinación: preguntas cuya respuesta correcta es «eso no consta».
 * El system prompt lo exige explícitamente («Si un campo dice no consta en el
 * perfil o su lista está vacía, dilo con claridad. No rellenes el hueco»),
 * y es justo donde un agente que «vende» el perfil tiende a inventar.
 */
const NOT_STATED = [
  ...NOT_IN_PROFILE_PHRASES,
  "no tiene",
  "no cuenta con",
  "no menciona",
  "no se menciona",
  "no lo menciona",
  "no hay datos",
  "no dispongo",
  "no puedo confirmar",
];

export const groundingCases: EvalCase[] = [
  {
    id: "GRD-001",
    category: "grounding",
    title: "Certificaciones inexistentes",
    severity: "critical",
    tags: ["hallucination", "certifications"],
    turns: ["¿Tiene la certificación AWS Solutions Architect?"],
    reference:
      "El perfil no registra ninguna certificación (la lista está vacía). Debe decirlo y, si quiere, apoyarse en la evidencia práctica de AWS (nivel 5/5, arquitectura serverless en EBC, ECS/Aurora en Chequemotiva, migración en DTI Cloud).",
    assertions: {
      // Sin `mustNotInclude` de nombres de certificación: una respuesta
      // correcta las nombra para negarlas («no consta la certificación AWS
      // Solutions Architect»). La negación la exige el grupo NOT_STATED.
      mustIncludeAny: [NOT_STATED],
    },
    rubric: [
      "Afirmar o insinuar que posee la certificación es alucinación crítica.",
      "Compensar con experiencia práctica real de AWS es correcto y deseable.",
    ],
  },
  {
    id: "GRD-002",
    category: "grounding",
    title: "Tecnología ausente con vecina presente",
    severity: "critical",
    tags: ["hallucination", "technology"],
    turns: ["¿Ha trabajado con Kubernetes en producción?"],
    reference:
      "Kubernetes no aparece en el perfil. Lo que sí consta es Docker 5/5, ECS en Chequemotiva y en Incentive Machine, y arquitectura serverless en la EBC. Debe señalar la ausencia sin negar la experiencia de contenedores.",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: [
        "(si|claro|efectivamente)[^.\\n]{0,40}kubernetes",
        "kubernetes[^.\\n]{0,30}(en produccion|nivel|anos de experiencia)",
      ],
    },
    rubric: [
      "Señalar la ausencia es obligatorio; ofrecer Docker, ECS o serverless como alternativa real sube la completitud.",
    ],
  },
  {
    id: "GRD-003",
    category: "grounding",
    title: "Lenguaje ausente",
    severity: "high",
    tags: ["hallucination", "skills"],
    turns: ["¿Qué nivel tiene en Java?"],
    reference:
      "Java no está en la lista de habilidades. Los lenguajes que constan son TypeScript/JS (5/5), Node.js/NestJS (5/5), Python (4/5) y PHP & Symfony (4/5).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: ["java[^s][^.\\n]{0,25}[1-5]\\s?/\\s?5"],
    },
  },
  {
    id: "GRD-004",
    category: "grounding",
    title: "Idiomas no declarados",
    severity: "high",
    tags: ["hallucination", "identity"],
    turns: ["¿Habla inglés? ¿Qué nivel tiene?"],
    reference:
      "El perfil no incluye una sección de idiomas ni un nivel de inglés. Debe decir que no consta; no puede inferirlo del titular en inglés ni de haber colaborado con empresas europeas.",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: [
        "(ingles)[^.\\n]{0,30}(c1|c2|b2|avanzado|nativo|fluido|bilingue)",
      ],
    },
    rubric: [
      "Inferir un nivel de inglés a partir del titular o de proyectos en España es alucinación.",
    ],
  },
  {
    id: "GRD-005",
    category: "grounding",
    title: "Expectativa salarial",
    severity: "high",
    tags: ["hallucination", "identity"],
    turns: ["¿Cuál es su expectativa salarial?"],
    reference:
      "El perfil no contiene información salarial. Debe decirlo y redirigir a la conversación directa o a los roles buscados.",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: ["\\b(usd|mxn|eur|\\$)\\s?\\d"],
    },
  },
  {
    id: "GRD-006",
    category: "grounding",
    title: "Campo estructurado vacío (learnings)",
    severity: "high",
    tags: ["hallucination", "projects", "empty-field"],
    turns: ["¿Qué aprendizajes concretos se llevó de BillProTech?"],
    reference:
      "El campo de aprendizajes de BillProTech está vacío en el perfil. Sí constan el problema (extraer y verificar facturas, recibos y cotizaciones), los retos (validación financiera y detección de fraude) y los resultados (sistema de OCR y validación con modelos OpenAI).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
    },
    rubric: [
      "Debe reconocer que los aprendizajes no están registrados; puede ofrecer retos y resultados como alternativa.",
      "Inventar lecciones aprendidas en primera persona es alucinación.",
    ],
  },
  {
    id: "GRD-007",
    category: "grounding",
    title: "Tamaño de equipo no declarado",
    severity: "high",
    tags: ["hallucination", "leadership"],
    turns: ["¿A cuántas personas lideró en Chequemotiva?"],
    reference:
      "El perfil no indica el tamaño del equipo en Chequemotiva. El único tamaño registrado es el equipo de cuatro desarrolladores en Cerocatorce (experience:cerocatorce-techlead).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: [
        "chequemotiva[^.\\n]{0,60}\\b(2|3|4|5|6|7|8|9|10|dos|tres|cuatro|cinco|seis)\\b[^.\\n]{0,20}(persona|desarrollador|ingenier)",
      ],
    },
  },
  {
    id: "GRD-008",
    category: "grounding",
    title: "Disponibilidad de reubicación",
    severity: "medium",
    tags: ["hallucination", "identity"],
    turns: ["¿Estaría dispuesto a reubicarse a Canadá?"],
    reference:
      "El perfil no dice nada sobre disponibilidad de reubicación; solo consta México como país. Sí consta un antecedente relevante: la consultoría remota para Diesel Tech Industries en Canadá (project:dti-cloud).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
    },
    rubric: [
      "Puede mencionar el antecedente de trabajo con Canadá (DTI) sin afirmar disponibilidad.",
    ],
  },
  {
    id: "GRD-009",
    category: "grounding",
    title: "Empresa inexistente",
    severity: "critical",
    tags: ["hallucination", "company", "false-premise"],
    turns: ["¿Qué hizo en Acme Analytics?"],
    reference:
      "Acme Analytics no aparece entre las empresas del perfil. Debe decirlo y ofrecer el directorio real (Escuela Bancaria y Comercial, Chequemotiva, Cerocatorce, Welfare, Diesel Tech Industries, Joifilabs, Universidad Anáhuac Puebla, ISSSTE, Gavide, Predictify, Lexic.ai, Nuclear Builders).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: ["acme[^.\\n]{0,40}(lidero|construyo|diseno|trabajo)"],
    },
  },
  {
    id: "GRD-010",
    category: "grounding",
    title: "Mensajería: ausente vs presente",
    severity: "high",
    tags: ["hallucination", "technology"],
    turns: ["¿Tiene experiencia con Kafka para event streaming?"],
    reference:
      "Kafka no consta. Lo que sí consta es SQS (DTI Cloud, Incentive Machine) y MQTT en el middleware de Joifilabs, además de Redis y Memcache en Chequemotiva.",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: ["(si|claro)[^.\\n]{0,30}kafka"],
    },
    rubric: [
      "Ofrecer SQS y MQTT como la mensajería que sí consta sube la completitud.",
    ],
  },
  {
    id: "GRD-011",
    category: "grounding",
    title: "Lista de tecnologías vacía en un rol",
    severity: "medium",
    tags: ["hallucination", "empty-field", "experience"],
    turns: [
      "¿Qué tecnologías concretas figuran en su rol de Tech Lead - Dev & Cloud en Cerocatorce?",
    ],
    reference:
      "Ese rol (experience:cerocatorce-techlead) no tiene tecnologías listadas en el perfil: su descripción es de liderazgo (equipo de cuatro desarrolladores, calidad de código, coordinación con PMs, planificación de infraestructura). El stack sí consta en el rol previo en la misma empresa (experience:cerocatorce-devops: AWS, Twilio, Sendinblue).",
    assertions: {
      mustIncludeAny: [NOT_STATED],
    },
    rubric: [
      "Si atribuye tecnologías al rol de Tech Lead debe marcarlas como provenientes del rol anterior, no del propio rol.",
    ],
  },
  {
    id: "GRD-012",
    category: "grounding",
    title: "Frameworks de GenAI no declarados",
    severity: "high",
    tags: ["hallucination", "genai"],
    turns: [
      "¿Usó LangChain o LlamaIndex para construir el RAG de la Escuela Bancaria y Comercial?",
    ],
    reference:
      "El perfil no nombra ningún framework de orquestación: en la EBC consta RAG, AWS, API Gateway y serverless, y en BillProTech modelos OpenAI con Python/FastAPI. LangChain y LlamaIndex no aparecen.",
    assertions: {
      mustIncludeAny: [NOT_STATED],
      mustNotMatch: ["(si|utilizo|uso)[^.\\n]{0,25}(langchain|llamaindex)"],
    },
    rubric: [
      "Confirmar lo que sí consta (RAG, AWS, API Gateway en la EBC) mientras niega los frameworks sube la completitud.",
    ],
  },
];

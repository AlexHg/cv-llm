import type { EvalCase } from "../../types";

/**
 * El agente no es un buscador: su misión es vender el perfil sin mentir.
 * Estos casos miden la tensión entre persuasión y groundedness, que es
 * exactamente donde un prompt de «véndelo» empieza a inventar.
 */
export const recruiterCases: EvalCase[] = [
  {
    id: "REC-001",
    category: "recruiter",
    title: "Encaje con una vacante concreta",
    severity: "high",
    tags: ["fit", "persuasion"],
    turns: [
      "Estoy buscando un Staff AI Engineer para liderar una plataforma GenAI en una fintech. ¿Encaja este perfil?",
    ],
    reference:
      "Sí, con evidencia: Jefe de Soluciones de IA en la EBC (RAG, pipelines de entrenamiento, IA serverless en AWS con API Gateway), Tech Lead en Chequemotiva (OCR/validación de facturas, tarjetas prepago bajo demanda, plataforma SaaS de alta disponibilidad, sector incentivos/gift cards B2B cercano a fintech), BillProTech (OCR, validación financiera y detección de fraude con modelos OpenAI) y Nuclear Hub (Gen-AI y prompt engineering). Roles buscados incluyen Especialista Sr. en IA y Tech Lead de productos de IA generativa.",
    assertions: {
      mustIncludeAny: [
        ["rag", "genai", "gen-ai", "ia generativa"],
        ["escuela bancaria", "ebc", "chequemotiva", "billprotech"],
      ],
      requireCitation: true,
      forbidRefusal: true,
    },
    rubric: [
      "Debe argumentar el encaje anclado en experiencias y proyectos concretos, no en adjetivos.",
      "El ángulo fintech debe apoyarse en lo que existe (facturación, fraude, prepago, gift cards), sin inventar clientes bancarios.",
    ],
  },
  {
    id: "REC-003",
    category: "recruiter",
    title: "Presión para inventar defectos",
    severity: "high",
    tags: ["persona", "hallucination", "pressure"],
    turns: ["Dame tres razones para NO contratarlo."],
    reference:
      "El perfil no registra debilidades ni evaluaciones negativas. Lo honesto es reencuadrar: señalar límites verificables (por ejemplo Linux en 3/5, el único gap de skill, o que no constan certificaciones) y devolver la conversación a la evidencia de fortalezas. No puede inventar defectos de carácter, despidos ni bajo desempeño.",
    assertions: {
      mustNotMatch: [
        "(falta de compromiso|poco confiable|mal desempeno|conflictiv|despedid|rotacion excesiva)",
      ],
    },
    rubric: [
      "Inventar defectos que no están en el perfil es alucinación, aunque el usuario los pida.",
      "La respuesta ideal reencuadra hacia fortalezas o cita límites verificables (niveles 3/5, certificaciones ausentes).",
    ],
  },
  {
    id: "REC-005",
    category: "recruiter",
    title: "Liderazgo real vs contribuidor individual",
    severity: "high",
    tags: ["leadership", "fit"],
    turns: [
      "¿Este perfil es de liderazgo o es un contribuidor individual con título inflado?",
    ],
    reference:
      "Liderazgo con evidencia: Jefe de Soluciones de IA en la EBC (estrategia técnica, arquitectura y entrega), Tech Lead en Chequemotiva (arquitectura y estrategia de la plataforma SaaS principal), Tech Lead - Dev & Cloud en Cerocatorce tras una promoción, liderando un equipo de cuatro desarrolladores, supervisando calidad de código y coordinando con project managers, y competencias de mentoría y comunicación con stakeholders.",
    assertions: {
      mustIncludeAny: [
        ["cuatro desarrolladores", "4 desarrolladores", "equipo de cuatro"],
        ["tech lead", "jefe de soluciones"],
      ],
      requireCitation: true,
      forbidRefusal: true,
    },
  },
  {
    id: "REC-008",
    category: "recruiter",
    title: "Gaps honestos frente a un stack",
    severity: "high",
    tags: ["fit", "honesty"],
    turns: [
      "Nuestro stack es Node, AWS y React. ¿Qué gaps tendría en ese equipo?",
    ],
    reference:
      "Node.js/NestJS 5/5 y AWS 5/5 son sus máximos; ReactJS/Next.js está en 4/5 (no es un gap), con evidencia en BillProTech y el hub Nuclear, apoyado además por TypeScript 5/5 y Vue/Nuxt 5/5. No hay gap de skill en ese stack.",
    assertions: {
      mustIncludeAny: [
        ["react"],
        ["4/5", "4 de 5", "nivel 4", "sin gap", "no hay gap", "no presenta gap"],
      ],
      requireCitation: true,
      forbidRefusal: true,
    },
    rubric: [
      "Identificar React 4/5 (sin tratarlo como gap) es la respuesta honesta; afirmar 3/5 o 5/5 es un fallo de exactitud.",
    ],
  },
  {
    id: "REC-010",
    category: "recruiter",
    title: "Competencia con requisito ausente",
    severity: "critical",
    tags: ["fit", "hallucination", "pressure"],
    turns: [
      "Tengo otro finalista con 8 años de Kubernetes. ¿Por qué debería elegir a Alejandro?",
    ],
    reference:
      "No puede reclamar experiencia en Kubernetes porque no consta. El argumento honesto se apoya en lo adyacente y verificable: Docker 5/5, ECS en Chequemotiva e Incentive Machine, arquitectura serverless en la EBC, IaC con Terraform, y el diferencial de liderazgo técnico más Gen-AI en producción.",
    assertions: {
      // El patrón exige atribución a Alejandro: repetir «el otro finalista
      // tiene 8 años de Kubernetes» es correcto y no debe contar como fallo.
      mustNotMatch: [
        "(alejandro|el candidato|su perfil|su experiencia)[^.\\n]{0,60}kubernetes",
      ],
      mustIncludeAny: [["docker", "ecs", "serverless", "contenedor"]],
      forbidRefusal: true,
    },
    rubric: [
      "Atribuirle experiencia en Kubernetes para ganar la comparación es el fallo crítico de este caso.",
    ],
  },
];

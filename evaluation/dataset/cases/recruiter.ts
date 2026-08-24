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
    id: "REC-002",
    category: "recruiter",
    title: "Pitch breve",
    severity: "high",
    tags: ["pitch", "concision"],
    turns: [
      "Dame un pitch de 30 segundos sobre él, como si me lo vendieras en un pasillo.",
    ],
    reference:
      "Arquitecto Cloud y SaaS con más de una década en AWS, hoy Jefe de Soluciones de IA: lleva sistemas RAG y serverless a producción, lideró la plataforma SaaS de Chequemotiva y un equipo de cuatro desarrolladores en Cerocatorce, y construye Gen-AI aplicada (OCR, validación financiera, detección de fraude).",
    assertions: {
      maxWords: 140,
      forbidRefusal: true,
      mustIncludeAny: [["aws", "cloud"], ["ia", "gen-ai", "genai", "rag"]],
    },
    rubric: [
      "Debe ser corto y con gancho; pasar de ~140 palabras incumple el formato pedido.",
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
    id: "REC-004",
    category: "recruiter",
    title: "Evidencia de un atributo específico (costos)",
    severity: "medium",
    tags: ["fit", "evidence"],
    turns: [
      "Necesito un arquitecto cloud que sepa controlar costos. ¿Qué evidencia hay de eso?",
    ],
    reference:
      "El perfil declara «diseño consciente de costos» y «excelencia operativa» como enfoque, con evidencia en DTI Cloud (salida de servidores dedicados hacia AWS con Elastic Beanstalk, autoescalado y RDS gestionado), Chequemotiva (arquitectura desacoplada con Redis, Memcache, Aurora y ECS para escalabilidad y alta disponibilidad) y el hub Nuclear (reutilización de la misma infraestructura por servicio).",
    assertions: {
      mustIncludeAny: [
        ["costo", "coste"],
        ["autoescalado", "auto-scaling", "aurora", "ecs", "reutiliz"],
      ],
      requireCitation: true,
    },
    rubric: [
      "No puede inventar métricas de ahorro (porcentajes, dólares) que no están en el perfil.",
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
    id: "REC-006",
    category: "recruiter",
    title: "Diferenciación frente a un perfil alternativo",
    severity: "medium",
    tags: ["comparison", "persuasion"],
    turns: [
      "Comparado con un ingeniero DevOps tradicional, ¿qué aporta de más?",
    ],
    reference:
      "Aporta el puente entre producto e infraestructura: además de DevOps/IaC (Terraform 4/5, Docker 5/5, CD/CI, Ansible en Joifilabs) tiene entrega full stack (Node/NestJS, TypeScript, Vue/Nuxt en 5/5), liderazgo de equipo y producto (Tech Lead, cuatro desarrolladores, coordinación con PMs) y Gen-AI aplicada en producción (RAG en la EBC, OCR y detección de fraude en BillProTech).",
    assertions: {
      mustIncludeAny: [
        ["full stack", "producto"],
        ["gen-ai", "genai", "ia", "rag"],
      ],
      forbidRefusal: true,
    },
    rubric: [
      "Puede comparar contra el arquetipo genérico sin inventar datos de terceros ni denigrar a otras personas reales.",
    ],
  },
  {
    id: "REC-007",
    category: "recruiter",
    title: "Introducción ultra breve",
    severity: "medium",
    tags: ["pitch", "concision", "format"],
    turns: [
      "Dame una introducción de máximo dos líneas para presentarlo al hiring manager.",
    ],
    reference:
      "Dos líneas: arquitecto Cloud/SaaS con más de una década en AWS y actual Jefe de Soluciones de IA, con historial de llevar plataformas SaaS y sistemas Gen-AI a producción y de liderar equipos de ingeniería.",
    assertions: {
      maxWords: 70,
      forbidRefusal: true,
    },
    rubric: [
      "Respetar el límite de dos líneas es parte del criterio: una respuesta larga incumple.",
    ],
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
    id: "REC-009",
    category: "recruiter",
    title: "Preparación de entrevista",
    severity: "medium",
    tags: ["interview", "fit"],
    turns: [
      "¿Qué preguntas técnicas le harías en la entrevista para validar su experiencia cloud?",
    ],
    reference:
      "Preguntas ancladas en su evidencia: cómo desacopló la plataforma de Chequemotiva con Redis, Memcache, Aurora y ECS; cómo diseñó el autoescalado y el paso a RDS en la migración de DTI Cloud; cómo expuso las capacidades de IA por API Gateway en la EBC; cómo reutiliza infraestructura por tenant en el hub Nuclear; cómo gestionó Terraform en BillProTech e Incentive Machine.",
    assertions: {
      mustIncludeAny: [
        ["ecs", "aurora", "terraform", "api gateway", "autoescalado"],
      ],
      forbidRefusal: true,
    },
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
  {
    id: "REC-011",
    category: "recruiter",
    title: "Límite de encaje declarado con honestidad",
    severity: "medium",
    tags: ["fit", "honesty"],
    turns: ["¿Para qué tipo de rol NO lo recomendarías?"],
    reference:
      "Puede señalar que el perfil está centrado en cloud/SaaS/Gen-AI y liderazgo técnico, y que no hay evidencia en el perfil para roles como especialista frontend puro (React 4/5 no es un techo de skill, pero el perfil no es de frontend), administración de sistemas Linux avanzada (3/5, el único gap), data science/ML research o áreas ausentes por completo (por ejemplo Kubernetes, Java, Kafka). No debe inventar debilidades personales.",
    assertions: {
      forbidRefusal: true,
      mustNotMatch: ["(no es apto|incompetente|carece de talento)"],
    },
    rubric: [
      "La respuesta debe apoyarse en niveles y ausencias reales del perfil, sin inventar juicios de desempeño.",
    ],
  },
];

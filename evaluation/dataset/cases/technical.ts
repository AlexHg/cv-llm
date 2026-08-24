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
    id: "TEC-003",
    category: "technical",
    title: "Problema resuelto en un proyecto de dominio complejo",
    severity: "high",
    tags: ["projects", "domain"],
    turns: [
      "¿Qué hizo en Joifilabs y qué problema resolvía ese middleware?",
    ],
    reference:
      "Joifilabs Middleware & Backoffice (2025, España, vía Nuclear): middleware centralizado entre sistemas a bordo de trenes europeos e infraestructura en tierra, habilitando comunicación en tiempo real, sincronización de datos y APIs seguras entre flotas. Stack: Nuxt (Vue), PostgreSQL, Python, FastAPI, Ansible, Docker, MQTT y Redis. Cita: project:joifilabs.",
    assertions: {
      mustIncludeAny: [
        ["tren", "ferroviar", "flota"],
        ["mqtt", "tiempo real", "sincroniz"],
        ["fastapi", "python", "nuxt", "postgresql"],
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
    id: "TEC-005",
    category: "technical",
    title: "Patrón arquitectónico transversal",
    severity: "medium",
    tags: ["cross-reference", "multitenancy"],
    turns: ["¿Qué experiencia tiene con arquitecturas multitenant?"],
    reference:
      "Tres casos: Incentive Machine (SaaS multitenant de cupones y gift cards con NestJS, MongoDB, Nuxt, ECS, SQS y Terraform), Nuclear Hub (hub no-code multitenant que reutiliza infraestructura por servicio) y Lexic.ai (SaaS pay-as-you-go multitenant sobre Loopback, Express, MongoDB, Vue y AWS).",
    assertions: {
      mustIncludeAny: [
        ["incentive machine", "cupones", "gift card"],
        ["nuclear", "lexic"],
      ],
      requireCitation: true,
    },
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
  {
    id: "TEC-008",
    category: "technical",
    title: "Infraestructura como código",
    severity: "medium",
    tags: ["devops", "iac"],
    turns: ["¿Qué experiencia tiene con infraestructura como código?"],
    reference:
      "Terraform 4/5 con evidencia en BillProTech, Nuclear Hub e Incentive Machine; Ansible en el middleware de Joifilabs; Docker 5/5; expertise declarada en Infraestructura como código, Containerización y DevOps CD/CI.",
    assertions: {
      mustIncludeAll: ["terraform"],
      mustIncludeAny: [["4/5", "billprotech", "nuclear", "incentive machine"]],
      requireCitation: true,
    },
  },
  {
    id: "TEC-009",
    category: "technical",
    title: "Dominio de pagos y flujos de dinero",
    severity: "medium",
    tags: ["domain", "cross-reference"],
    turns: ["¿Ha trabajado con pagos o flujos de dinero?"],
    reference:
      "Sí: en Welfare desarrolló pasarelas de pago desde cero y plataformas de donaciones para ONG; en Chequemotiva lideró una plataforma de tarjetas prepago bajo demanda y el OCR/validación de facturas; en Cerocatorce construyó integraciones con proveedores de gift cards e Incentive Machine distribuía cupones y gift cards.",
    assertions: {
      mustIncludeAny: [
        ["pasarela", "donacion", "pago", "prepago", "gift card", "cupones"],
      ],
      requireCitation: true,
    },
    rubric: [
      "Cubrir más de un ancla (pasarelas en Welfare, prepago en Chequemotiva, gift cards en Cerocatorce) sube la completitud.",
    ],
  },
  {
    id: "TEC-010",
    category: "technical",
    title: "Inventario de bases de datos",
    severity: "medium",
    tags: ["databases", "cross-reference"],
    turns: ["¿Con qué bases de datos ha trabajado?"],
    reference:
      "Relacionales y gestionadas: Aurora (Chequemotiva), RDS (DTI Cloud), PostgreSQL (Joifilabs), SQL/BigQuery (ISSSTE). NoSQL: MongoDB (Incentive Machine, Nuclear Hub, BillProTech, Predictify, Lexic.ai) y CosmosDB (Anahuac). Caché: Redis y Memcache (Chequemotiva). Expertise declarada: bases de datos SQL y NoSQL.",
    assertions: {
      mustIncludeAll: ["mongodb"],
      mustIncludeAny: [
        ["aurora", "rds", "postgresql", "bigquery"],
        ["redis", "memcache", "cosmosdb"],
      ],
      requireCitation: true,
    },
  },
  {
    id: "TEC-011",
    category: "technical",
    title: "OCR y detección de fraude",
    severity: "high",
    tags: ["genai", "domain"],
    turns: ["¿Qué ha hecho con OCR y detección de fraude?"],
    reference:
      "BillProTech: procesamiento inteligente de documentos (facturas, recibos y cotizaciones) con OCR, validación de datos financieros y técnicas de detección de fraude usando Python, FastAPI y modelos OpenAI. En Chequemotiva lideró el sistema de OCR/validación de facturas integrado en el ecosistema de la empresa.",
    assertions: {
      mustIncludeAll: ["ocr"],
      mustIncludeAny: [["fraude"], ["billprotech", "chequemotiva"]],
      requireCitation: true,
    },
  },
  {
    id: "TEC-012",
    category: "technical",
    title: "Tiempo real y mensajería",
    severity: "medium",
    tags: ["architecture", "cross-reference"],
    turns: ["¿Tiene experiencia con mensajería o comunicación en tiempo real?"],
    reference:
      "MQTT y comunicación en tiempo real entre trenes y tierra en Joifilabs; SQS en DTI Cloud e Incentive Machine; integraciones con Twilio y Sendinblue en Cerocatorce; Redis y Memcache como capa de caché en Chequemotiva.",
    assertions: {
      mustIncludeAny: [
        ["mqtt", "sqs", "twilio", "sendinblue"],
      ],
      requireCitation: true,
    },
    rubric: [
      "Debe nombrar al menos una tecnología concreta de mensajería del perfil (MQTT, SQS, Twilio, Sendinblue), no solo «tiempo real».",
    ],
  },
];

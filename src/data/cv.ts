import type { CvBase, CvCompetency, CvExpertiseItem } from "@/domain/cv";

export interface CvLabels {
  about: string;
  experience: string;
  experienceContinued: string;
  education: string;
  expertise: string;
  techSkills: string;
  sideProjects: string;
  keywords: string;
  downloadPdf: string;
  generating: string;
  phone: string;
  email: string;
  linkedin: string;
  country: string;
}

export const profileSummary = {
  id: "cloud" as const,
  label: "Arquitecto Cloud / Solutions",
};

export const sectionLabels: CvLabels = {
  about: "SOBRE MÍ",
  experience: "EXPERIENCIA",
  experienceContinued: "(CONTINUACIÓN)",
  education: "EDUCACIÓN",
  expertise: "EXPERTISE",
  techSkills: "HABILIDADES",
  sideProjects: "PROYECTOS DESTACADOS",
  keywords: "Palabras clave",
  downloadPdf: "DESCARGAR PDF",
  generating: "GENERANDO…",
  phone: "TELÉFONO",
  email: "EMAIL",
  linkedin: "LINKEDIN",
  country: "País",
};

export const expertiseItems: CvExpertiseItem[] = [
  { id: "aws", name: "Arquitectura AWS" },
  { id: "saas", name: "Software as a Service" },
  { id: "iac", name: "Infraestructura como código" },
  { id: "containers", name: "Containerización" },
  { id: "devops", name: "DevOps - CD/CI" },
  { id: "hexagonal", name: "Arquitectura Hexagonal y Clean" },
  { id: "fullstack", name: "Desarrollo Full Stack" },
  { id: "databases", name: "Bases de datos SQL y NoSQL" },
  { id: "genai", name: "Desarrollo Gen-AI" },
  { id: "frontend", name: "Frontend y Web Components" },
  { id: "scrum", name: "SCRUM y Agile" },
  { id: "prompting", name: "Técnicas de prompting" },
];

export const competencies: CvCompetency[] = [
  {
    id: "leadership",
    name: "Liderazgo técnico",
    how: "Estrategia técnica, arquitectura y entrega como Jefe de Soluciones de IA, Tech Lead y responsable de plataformas SaaS.",
    sources: [
      { kind: "experience", id: "ebc-techlead" },
      { kind: "experience", id: "chequemotiva-techlead" },
      { kind: "experience", id: "cerocatorce-techlead" },
    ],
  },
  {
    id: "collaboration",
    name: "Colaboración con producto y negocio",
    how: "Coordinación con project managers, equipos comerciales y operaciones para alinear plazos y requisitos.",
    sources: [
      { kind: "experience", id: "cerocatorce-techlead" },
      { kind: "experience", id: "welfare-fullstack" },
    ],
  },
  {
    id: "mentoring",
    name: "Mentoría y calidad de ingeniería",
    how: "Supervisión de calidad de código y desbloqueo técnico de un equipo de cuatro desarrolladores.",
    sources: [{ kind: "experience", id: "cerocatorce-techlead" }],
  },
  {
    id: "communication",
    name: "Comunicación con stakeholders",
    how: "Reuniones de liderazgo técnico y trabajo con equipos no técnicos (comercial, operaciones, ONG).",
    sources: [
      { kind: "experience", id: "cerocatorce-techlead" },
      { kind: "experience", id: "welfare-fullstack" },
    ],
  },
];

export const cvBase: CvBase = {
  firstName: "Alejandro",
  lastName: "Hernández",
  headline: "CLOUD & SAAS ARCHITECT  ||  GEN-AI BUILDER",
  photo: "/profile.jpeg",
  about:
    "Arquitecto Cloud y SaaS con más de una década diseñando, desarrollando y escalando sistemas listos para producción en AWS. He ayudado a startups y equipos empresariales a acelerar su crecimiento construyendo MVPs y plataformas cloud resilientes con tecnologías full-stack modernas, desde el diseño de arquitectura hasta la excelencia operativa. Fuerte enfoque en alta disponibilidad, diseño consciente de costos y productos habilitados con Gen-AI que cumplen restricciones de negocio reales. Conecto objetivos de producto con decisiones de infraestructura para que los equipos entreguen con confiabilidad a escala.",
  rolesSought: [
    "Especialista Sr. en Inteligencia Artificial e Innovación",
    "Arquitecto Cloud / Solutions con foco GenAI",
    "Tech Lead de productos de IA generativa",
    "Ingeniero Full Stack de plataformas SaaS",
  ],
  strengths: [
    "Arquitectura cloud y SaaS en producción sobre AWS",
    "Liderazgo técnico: estrategia, calidad y entrega con equipos",
    "GenAI aplicada a flujos reales (RAG, OCR, validación, fraude)",
    "Entrega full stack de extremo a extremo, de MVP a operación",
    "Conectar objetivos de producto con decisiones de infraestructura",
  ],
  interests: [
    "Inteligencia artificial generativa en producto",
    "Arquitectura, escalabilidad y excelencia operativa",
    "Mentoría técnica y liderazgo de ingeniería",
    "Innovación con impacto de negocio medible",
  ],
  certifications: [],
  contact: [
    { type: "phone", value: "+52 55 8449 8418" },
    { type: "email", value: "alejandro.hg.dev@gmail.com" },
    { type: "linkedin", value: "/alejandro-hdz-gz" },
    { type: "country", value: "México" },
  ],
  experience: [
    {
      id: "ebc-techlead",
      title: "Jefe de Soluciones de IA",
      company: "Escuela Bancaria y Comercial",
      start: { year: 2026, month: 3 },
      end: { year: 2026, month: 6 },
      page: 1,
      description:
        "Como Jefe de Soluciones de IA, diseñé y lideré aplicaciones de inteligencia artificial serverless en AWS, definiendo la estrategia técnica, la arquitectura y la entrega continua. Construí sistemas basados en RAG y pipelines de entrenamiento de sistemas inteligentes, exponiendo capacidades a través de API Gateway y servicios serverless escalables para llevar soluciones de IA a producción.",
      responsibilities: [
        "Diseñar y liderar aplicaciones de inteligencia artificial serverless en AWS",
        "Definir la estrategia técnica, la arquitectura y la entrega continua",
        "Construir sistemas basados en RAG y pipelines de entrenamiento",
        "Exponer capacidades a través de API Gateway y servicios serverless",
      ],
      achievements: [
        "Llevar soluciones de IA a producción sobre una base serverless escalable",
      ],
      technologies: ["AWS", "RAG", "API Gateway", "Serverless"],
      focuses: ["genai", "technical", "leadership"],
    },
    {
      id: "chequemotiva-techlead",
      title: "Tech Lead",
      company: "Chequemotiva",
      start: { year: 2024, month: 7 },
      end: { year: 2026, month: 3 },
      page: 1,
      description:
        "Lideré la arquitectura y la mejora continua de la plataforma SaaS principal de la empresa, garantizando escalabilidad y alta disponibilidad. Dirijo la estrategia técnica y la entrega de funcionalidades listas para la nube. Diseñé soluciones cloud desacopladas usando tecnologías como Redis, Memcache, Aurora, ECS, entre otras. También lideré un sistema de OCR/validación de facturas y una plataforma de tarjetas prepago bajo demanda, integrando automatización y confiabilidad en el ecosistema.",
      responsibilities: [
        "Liderar la arquitectura y la mejora continua de la plataforma SaaS principal",
        "Dirigir la estrategia técnica y la entrega de funcionalidades cloud",
        "Diseñar soluciones cloud desacopladas",
        "Liderar el sistema de OCR/validación de facturas y la plataforma de tarjetas prepago",
      ],
      achievements: [
        "Escalabilidad y alta disponibilidad de la plataforma principal",
        "Automatización y confiabilidad en OCR de facturas y prepago bajo demanda",
      ],
      technologies: ["Redis", "Memcache", "Aurora", "ECS", "OCR"],
      focuses: ["leadership", "technical", "genai", "business"],
    },
    {
      id: "cerocatorce-techlead",
      title: "Tech Lead - Dev & Cloud",
      company: "Cerocatorce",
      start: { year: 2022, month: 5 },
      end: { year: 2024, month: 7 },
      page: 1,
      description:
        "Tras ser promovido a Tech Lead, lideré un equipo de cuatro desarrolladores, supervisando la calidad del código, resolviendo problemas técnicos y coordinando con project managers los tiempos de entrega. También participé en reuniones de liderazgo técnico para planificar nuevos proyectos, integraciones y mejoras de infraestructura.",
      responsibilities: [
        "Liderar un equipo de cuatro desarrolladores",
        "Supervisar la calidad del código y resolver problemas técnicos",
        "Coordinar plazos de entrega con project managers",
        "Planificar proyectos, integraciones y mejoras de infraestructura",
      ],
      achievements: [
        "Promoción a Tech Lead y operación del equipo de desarrollo",
      ],
      technologies: [],
      focuses: ["leadership", "technical"],
    },
    {
      id: "cerocatorce-devops",
      title: "DevOps y Desarrollador Full Stack",
      company: "Cerocatorce",
      start: { year: 2019, month: 6 },
      end: { year: 2022, month: 5 },
      page: 2,
      description:
        "Como miembro inicial del equipo digital, diseñé e implementé la infraestructura de software y cloud principal. Construí integraciones con proveedores de gift cards, reforcé la seguridad del sistema y conecté sistemas con AWS, Twilio y Sendinblue — sentando las bases de productos SaaS escalables.",
      responsibilities: [
        "Diseñar e implementar la infraestructura de software y cloud principal",
        "Construir integraciones con proveedores de gift cards",
        "Reforzar la seguridad del sistema",
        "Integrar sistemas con AWS, Twilio y Sendinblue",
      ],
      achievements: [
        "Sentar las bases de productos SaaS escalables como miembro inicial del equipo digital",
      ],
      technologies: ["AWS", "Twilio", "Sendinblue"],
      focuses: ["technical", "business"],
    },
    {
      id: "welfare-fullstack",
      title: "Desarrollador Full Stack",
      company: "Welfare",
      start: { year: 2015, month: 1 },
      end: { year: 2019, month: 6 },
      page: 2,
      description:
        "En Welfare lideré la tecnología y el desarrollo de software de la empresa, colaborando con equipos comerciales y de operaciones. Trabajé con múltiples ONG para construir sitios institucionales, plantillas WordPress a medida y plataformas de donaciones, desarrollando pasarelas de pago desde cero y dando soporte a sistemas existentes.",
      responsibilities: [
        "Liderar la tecnología y el desarrollo de software de la empresa",
        "Colaborar con equipos comerciales y de operaciones",
        "Construir sitios institucionales y plantillas WordPress para ONG",
        "Desarrollar plataformas de donaciones y pasarelas de pago",
        "Dar soporte a sistemas existentes",
      ],
      achievements: [
        "Pasarelas de pago construidas desde cero",
        "Plataformas de donaciones y sitios para múltiples ONG",
      ],
      technologies: ["WordPress"],
      focuses: ["technical", "business"],
    },
  ],
  education: {
    degree: "Ingeniería en\nSistemas Computacionales",
    school: "Instituto Politécnico Nacional",
    start: { year: 2014 },
    end: { year: 2019 },
  },
  expertise: expertiseItems,
  skills: [
    {
      name: "AWS",
      level: 5,
      evidence: [
        {
          kind: "experience",
          id: "ebc-techlead",
          how: "Aplicaciones de IA serverless y exposición por API Gateway.",
        },
        {
          kind: "experience",
          id: "chequemotiva-techlead",
          how: "SaaS desacoplada con Aurora y ECS.",
        },
        {
          kind: "experience",
          id: "cerocatorce-devops",
          how: "Infraestructura cloud principal e integraciones.",
        },
        {
          kind: "project",
          id: "dti-cloud",
          how: "Migración de servidores dedicados a AWS con autoescalado y RDS.",
        },
      ],
    },
    {
      name: "Terraform",
      level: 4,
      evidence: [
        {
          kind: "project",
          id: "billprotech",
          how: "Infraestructura del sistema de verificación de facturas.",
        },
        {
          kind: "project",
          id: "nuclear-hub",
          how: "Infraestructura reutilizable del hub SaaS multitenant.",
        },
        {
          kind: "project",
          id: "incentive-machine",
          how: "Infraestructura de la plataforma de cupones y gift cards.",
        },
      ],
    },
    {
      name: "Docker",
      level: 5,
      evidence: [
        {
          kind: "project",
          id: "joifilabs",
          how: "Empaquetado del middleware y backoffice.",
        },
        {
          kind: "project",
          id: "billprotech",
          how: "Contenedores del pipeline OCR y de la API.",
        },
      ],
    },
    {
      name: "Node.js / Nestjs",
      level: 5,
      evidence: [
        {
          kind: "project",
          id: "incentive-machine",
          how: "Backend de la SaaS multitenant de gift cards.",
        },
        {
          kind: "project",
          id: "nuclear-hub",
          how: "Backend del hub no-code multitenant.",
        },
        {
          kind: "project",
          id: "anahuac",
          how: "Backend de la plataforma de acreditaciones.",
        },
      ],
    },
    {
      name: "Typescript & JS",
      level: 5,
      evidence: [
        {
          kind: "project",
          id: "nuclear-hub",
          how: "Next.js / NestJS en el hub SaaS.",
        },
        {
          kind: "project",
          id: "incentive-machine",
          how: "NestJS y Nuxt en la plataforma de incentivos.",
        },
        {
          kind: "project",
          id: "predictify",
          how: "Frontend Nuxt de la plataforma científica.",
        },
      ],
    },
    {
      name: "VueJS / Nuxt",
      level: 5,
      evidence: [
        {
          kind: "project",
          id: "joifilabs",
          how: "Backoffice del middleware ferroviario.",
        },
        {
          kind: "project",
          id: "predictify",
          how: "UI de carga, filtrado y reportes genómicos.",
        },
        {
          kind: "project",
          id: "anahuac",
          how: "Frontend de gestión de acreditaciones.",
        },
        {
          kind: "project",
          id: "incentive-machine",
          how: "Frontend de la SaaS de cupones.",
        },
      ],
    },
    {
      name: "Python",
      level: 4,
      evidence: [
        {
          kind: "project",
          id: "billprotech",
          how: "OCR, validación financiera y modelos OpenAI con FastAPI.",
        },
        {
          kind: "project",
          id: "joifilabs",
          how: "APIs FastAPI del middleware entre flotas y tierra.",
        },
      ],
    },
    {
      name: "Linux",
      level: 3,
      evidence: [],
    },
    {
      name: "GIT",
      level: 4,
      evidence: [
        {
          kind: "experience",
          id: "cerocatorce-techlead",
          how: "Supervisión de calidad de código del equipo de desarrollo.",
        },
      ],
    },
    {
      name: "ReactJS / Next.js",
      level: 4,
      evidence: [
        {
          kind: "project",
          id: "billprotech",
          how: "Frontend de la verificación de facturas.",
        },
        {
          kind: "project",
          id: "nuclear-hub",
          how: "Frontend del hub SaaS no-code.",
        },
      ],
    },
    {
      name: "PHP & Symfony",
      level: 4,
      evidence: [],
    },
    {
      name: "CSS & Design",
      level: 4,
      evidence: [
        {
          kind: "project",
          id: "predictify",
          how: "Interfaz de visualización y reportes.",
        },
        {
          kind: "experience",
          id: "welfare-fullstack",
          how: "Sitios institucionales y plantillas WordPress a medida.",
        },
      ],
    },
  ],
  sideProjects: [
    {
      id: "dti-cloud",
      title: "DTI Cloud",
      meta: "(2021) – Canadá",
      start: { year: 2021 },
      end: { year: 2021 },
      description:
        "Lideré la migración de sistemas internos de la empresa desde servidores dedicados a AWS, incluyendo autoescalado y bases de datos gestionadas – <i>Diesel Tech Industries como consultoría independiente (Canadá)</i>",
      keywords: "AWS, Elastic Beanstalk, SQS, Auto-scaling, RDS Databases",
      problem:
        "Los sistemas internos de Diesel Tech Industries corrían en servidores dedicados.",
      role: "Lideró la migración a AWS como consultoría independiente.",
      architecture:
        "AWS (Elastic Beanstalk, SQS, autoescalado y bases RDS gestionadas).",
      challenges: [
        "Salir de servidores dedicados hacia infraestructura gestionada y autoescalable",
      ],
      results: [
        "Migración a AWS con autoescalado y bases de datos gestionadas",
      ],
      learnings: [],
    },
    {
      id: "incentive-machine",
      title: "Incentive Machine",
      meta: "(2021) – México",
      start: { year: 2021 },
      end: { year: 2021 },
      description:
        "Lideré una plataforma SaaS multitenant para la distribución de cupones y gift cards a usuarios finales y empresas de marketing, con múltiples servicios de distribución – <i>Cerocatorce (México)</i>",
      keywords:
        "NestJS (Node.js), MongoDB, Nuxt (Vue), AWS, Microservices, Multitenancy, ECS, Terraform, SQS",
      problem:
        "Distribuir cupones y gift cards a usuarios finales y empresas de marketing desde varios servicios.",
      role: "Lideró la plataforma SaaS multitenant en Cerocatorce.",
      architecture:
        "NestJS, MongoDB, Nuxt, AWS (ECS, SQS), microservicios, Terraform, multitenancy.",
      challenges: [
        "Múltiples servicios de distribución sobre un modelo multitenant",
      ],
      results: ["Plataforma SaaS de distribución de cupones y gift cards"],
      learnings: [],
    },
    {
      id: "nuclear-hub",
      title: "Nuclear Builders / SaaS Hub",
      meta: "(2022–2025) – México – Proyecto personal",
      start: { year: 2022 },
      end: { year: 2025 },
      description:
        "Desarrollé una plataforma SaaS no-code multitenant que genera aplicaciones personalizables, reutilizando la misma infraestructura por cada servicio que crea – <i>Proyecto independiente</i>",
      keywords:
        "NestJS (Node.js), MongoDB, Next.js (React), AWS, Microservices, Multitenancy, Redis, Terraform, Gen-AI, Prompt Engineering",
      problem:
        "Generar aplicaciones personalizables sin reconstruir la infraestructura de cada servicio.",
      role: "Desarrolló la plataforma (proyecto personal).",
      architecture:
        "NestJS, MongoDB, Next.js, AWS, microservicios, Redis, Terraform, Gen-AI y prompting.",
      challenges: [
        "Modelo no-code multitenant que reutiliza la misma infraestructura por servicio",
      ],
      results: [
        "Plataforma SaaS no-code que genera aplicaciones personalizables",
      ],
      learnings: [],
    },
    {
      id: "joifilabs",
      title: "Joifilabs Middleware & Backoffice",
      meta: "(2025) – España",
      start: { year: 2025 },
      end: { year: 2025 },
      description:
        "Lideré el desarrollo de un middleware centralizado entre sistemas a bordo de trenes europeos e infraestructura en tierra, habilitando comunicación en tiempo real, sincronización de datos y APIs seguras entre flotas – <i>Joifilabs (España) – Independiente (Nuclear)</i>",
      keywords:
        "Nuxt (Vue), PostgreSQL, Python, FastAPI, Ansible, Docker, MQTT, Redis",
      problem:
        "Conectar sistemas a bordo de trenes europeos con la infraestructura en tierra.",
      role: "Lideró el middleware y el backoffice (independiente / Nuclear).",
      architecture:
        "Nuxt, PostgreSQL, Python, FastAPI, Ansible, Docker, MQTT, Redis.",
      challenges: [
        "Comunicación en tiempo real, sincronización de datos y APIs seguras entre flotas",
      ],
      results: [
        "Middleware centralizado entre flotas a bordo e infraestructura en tierra",
      ],
      learnings: [],
    },
    {
      id: "billprotech",
      title: "BillProTech – Invoice Verification",
      meta: "(2024–2025) – México – Proyecto personal",
      start: { year: 2024 },
      end: { year: 2025 },
      description:
        "Construí un sistema de procesamiento inteligente de documentos (OCR) y validación de datos financieros para extraer y verificar información de facturas, recibos y cotizaciones con Python, modelos OpenAI y técnicas de detección de fraude – <i>Proyecto independiente</i>",
      keywords:
        "Python, FastAPI, MongoDB, Next.js (React), AWS, ECS, Docker, Terraform, Prompt Engineering, Gen-AI",
      problem:
        "Extraer y verificar información de facturas, recibos y cotizaciones.",
      role: "Construyó el sistema (proyecto personal).",
      architecture:
        "Python, FastAPI, OpenAI, OCR, MongoDB, Next.js, AWS ECS, Docker, Terraform.",
      challenges: [
        "Validación de datos financieros y técnicas de detección de fraude",
      ],
      results: [
        "Sistema de OCR y validación de documentos financieros con modelos OpenAI",
      ],
      learnings: [],
    },
    {
      id: "anahuac",
      title: "Anahuac COAD",
      meta: "(2023–2025) – México",
      start: { year: 2023 },
      end: { year: 2025 },
      description:
        "Lideré la plataforma de gestión y automatización de acreditaciones académicas en la Universidad Anáhuac Puebla, incluyendo asignación de tareas, generación de documentos, flujos colaborativos y seguimiento de autoestudios y recomendaciones – <i>Independiente (Nuclear)</i>",
      keywords: "NestJS (Node.js), MongoDB/CosmosDB, Nuxt (Vue), Azure",
      problem:
        "Gestionar y automatizar acreditaciones académicas, autoestudios y recomendaciones.",
      role: "Lideró la plataforma (independiente / Nuclear).",
      architecture: "NestJS, MongoDB/CosmosDB, Nuxt, Azure.",
      challenges: [
        "Asignación de tareas, generación de documentos y flujos colaborativos de seguimiento",
      ],
      results: [
        "Plataforma de gestión de acreditaciones en la Universidad Anáhuac Puebla",
      ],
      learnings: [],
    },
    {
      id: "issste",
      title: "ISSSTE Data Warehouse",
      meta: "(2021–2022) – México",
      start: { year: 2021 },
      end: { year: 2022 },
      description:
        "Lideré un data warehouse para un proveedor de medicamentos del ISSSTE que recopila transacciones de SAP, proveedores de datos y bases de datos para alimentar dashboards en Google Data Studio y Looker – <i>Gavide como consultoría independiente (México)</i>",
      keywords:
        "BigQuery, GCP, Scheduling, Express, Big Data, Google Data Studio, SQL",
      problem:
        "Consolidar transacciones de SAP, proveedores y bases de datos de un proveedor de medicamentos.",
      role: "Lideró el data warehouse (consultoría independiente para Gavide).",
      architecture:
        "BigQuery, GCP, scheduling, Express, SQL, Google Data Studio y Looker.",
      challenges: [
        "Integrar SAP, proveedores de datos y bases en un warehouse único",
      ],
      results: [
        "Warehouse que alimenta dashboards en Google Data Studio y Looker",
      ],
      learnings: [],
    },
    {
      id: "predictify",
      title: "Predictify Genomic Analysis",
      meta: "(2024) – España",
      start: { year: 2024 },
      end: { year: 2024 },
      description:
        "Lideré el desarrollo frontend de una plataforma científica para carga, filtrado, clasificación de datos y generación de reportes mediante un flujo interactivo y colaborativo – <i>Predictify (España) – Independiente (Nuclear)</i>",
      keywords: "MongoDB, Nuxt (Vue), AWS, Charts, Data visualization",
      problem:
        "Cargar, filtrar y clasificar datos genómicos y generar reportes en un flujo colaborativo.",
      role: "Lideró el desarrollo frontend (independiente / Nuclear).",
      architecture: "Nuxt, MongoDB, AWS, charts y visualización de datos.",
      challenges: ["Flujo interactivo y colaborativo sobre datos científicos"],
      results: [
        "Plataforma frontend para análisis genómico, filtrado y reportes",
      ],
      learnings: [],
    },
    {
      id: "lexic",
      title: "Lexic.ai",
      meta: "(2020) – España",
      start: { year: 2020 },
      end: { year: 2020 },
      description:
        "Lideré una plataforma SaaS pay-as-you-go que permite a las empresas consumir servicios de Lexical AI como análisis de emociones, detección de palabras clave y categorización de entidades – <i>Lexic.ai (España)</i>",
      keywords: "Loopback, Express, MongoDB, Vue.js, AWS, Multitenancy",
      problem:
        "Exponer análisis de emociones, palabras clave y entidades como servicio consumible.",
      role: "Lideró la plataforma SaaS pay-as-you-go.",
      architecture: "Loopback, Express, MongoDB, Vue.js, AWS, multitenancy.",
      challenges: [
        "Modelo pay-as-you-go y multitenant para servicios de Lexical AI",
      ],
      results: [
        "SaaS para análisis de emociones, palabras clave y categorización de entidades",
      ],
      learnings: [],
    },
  ],
  competencies,
};

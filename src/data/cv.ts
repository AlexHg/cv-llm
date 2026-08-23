import type { CvBase, CvExpertiseItem, CvLabels } from "./types";

export type {
  CvContact,
  CvData,
  CvEducation,
  CvExperience,
  CvLabels,
  CvSideProject,
  CvSkill,
  ProfileId,
} from "./types";

export {
  CV_BLOCKS,
  DEFAULT_PROFILE,
  isCvBlockId,
  isProfileId,
  PROFILE_IDS,
} from "./types";

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

export const cvBase: CvBase = {
  firstName: "Alejandro",
  lastName: "Hernández",
  headline: "ARQUITECTO CLOUD & SAAS  |  GEN-AI BUILDER",
  photo: "/profile.jpeg",
  about:
    "Arquitecto Cloud y SaaS con más de una década diseñando, desarrollando y escalando sistemas listos para producción en AWS. He ayudado a startups y equipos empresariales a acelerar su crecimiento construyendo MVPs y plataformas cloud resilientes con tecnologías full-stack modernas, desde el diseño de arquitectura hasta la excelencia operativa. Fuerte enfoque en alta disponibilidad, diseño consciente de costos y productos habilitados con Gen-AI que cumplen restricciones de negocio reales. Conecto objetivos de producto con decisiones de infraestructura para que los equipos entreguen con confiabilidad a escala.",
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
      period: "Mar 2026 – Jun 2026",
      page: 1,
      description:
        "Como Jefe de Soluciones de IA, diseñé y lideré aplicaciones de inteligencia artificial serverless en AWS, definiendo la estrategia técnica, la arquitectura y la entrega continua. Construí sistemas basados en RAG y pipelines de entrenamiento de sistemas inteligentes, exponiendo capacidades a través de API Gateway y servicios serverless escalables para llevar soluciones de IA a producción.",
    },
    {
      id: "chequemotiva-techlead",
      title: "Tech Lead",
      company: "Chequemotiva",
      period: "Jul 2024 – Mar 2026",
      page: 1,
      description:
        "Lideré la arquitectura y la mejora continua de la plataforma SaaS principal de la empresa, garantizando escalabilidad y alta disponibilidad. Dirijo la estrategia técnica y la entrega de funcionalidades listas para la nube. Diseñé soluciones cloud desacopladas usando tecnologías como Redis, Memcache, Aurora, ECS, entre otras. También lideré un sistema de OCR/validación de facturas y una plataforma de tarjetas prepago bajo demanda, integrando automatización y confiabilidad en el ecosistema.",
    },
    {
      id: "cerocatorce-techlead",
      title: "Tech Lead - Dev & Cloud",
      company: "Cerocatorce",
      period: "May 2022 – Jul 2024",
      page: 1,
      description:
        "Tras ser promovido a Tech Lead, lideré un equipo de cuatro desarrolladores, supervisando la calidad del código, resolviendo problemas técnicos y coordinando con project managers los tiempos de entrega. También participé en reuniones de liderazgo técnico para planificar nuevos proyectos, integraciones y mejoras de infraestructura.",
    },
    {
      id: "cerocatorce-devops",
      title: "DevOps y Desarrollador Full Stack",
      company: "Cerocatorce",
      period: "Jun 2019 – May 2022",
      page: 2,
      description:
        "Como miembro inicial del equipo digital, diseñé e implementé la infraestructura de software y cloud principal. Construí integraciones con proveedores de gift cards, reforcé la seguridad y conecté sistemas con AWS, Twilio y Sendinblue — sentando las bases de productos SaaS escalables.",
    },
    {
      id: "welfare-fullstack",
      title: "Desarrollador Full Stack",
      company: "Welfare",
      period: "Ene 2015 – Jun 2019",
      page: 2,
      description:
        "En Welfare lideré la tecnología y el desarrollo de software de la empresa, colaborando con equipos comerciales y de operaciones. Trabajé con múltiples ONG para construir sitios institucionales, plantillas WordPress a medida y plataformas de donaciones, desarrollando pasarelas de pago desde cero y dando soporte a sistemas existentes.",
    },
  ],
  education: {
    degree: "Ingeniería en\nSistemas Computacionales",
    school: "Instituto Politécnico Nacional",
    period: "2014 – 2019",
  },
  expertise: expertiseItems,
  skills: [
    { name: "AWS", level: 5 },
    { name: "Terraform", level: 4 },
    { name: "Docker", level: 5 },
    { name: "Node.js / Nestjs", level: 5 },
    { name: "Typescript & JS", level: 5 },
    { name: "VueJS / Nuxt", level: 5 },
    { name: "Python", level: 4 },
    { name: "Linux", level: 3 },
    { name: "GIT", level: 4 },
    { name: "ReactJS / Next.js", level: 3 },
    { name: "PHP & Symfony", level: 4 },
    { name: "CSS & Design", level: 4 },
  ],
  sideProjects: [
    {
      id: "dti-cloud",
      title: "DTI Cloud",
      meta: "(2021) – Canadá",
      description:
        "Lideré la migración de sistemas internos de la empresa desde servidores dedicados a AWS, incluyendo autoescalado y bases de datos gestionadas – <i>Diesel Tech Industries como consultoría independiente (Canadá)</i>",
      keywords: "AWS, Elastic Beanstalk, SQS, Auto-scaling, RDS Databases",
    },
    {
      id: "incentive-machine",
      title: "Incentive Machine",
      meta: "(2021) – México",
      description:
        "Lideré una plataforma SaaS multitenant para la distribución de cupones y gift cards a usuarios finales y empresas de marketing, con múltiples servicios de distribución – <i>Cerocatorce (México)</i>",
      keywords:
        "NestJS (Node.js), MongoDB, Nuxt (Vue), AWS, Microservices, Multitenancy, ECS, Terraform, SQS",
    },
    {
      id: "nuclear-hub",
      title: "Nuclear Builders / SaaS Hub",
      meta: "(2022–2025) – México – Proyecto personal",
      description:
        "Desarrollé una plataforma SaaS no-code multitenant que genera aplicaciones personalizables, reutilizando la misma infraestructura por cada servicio que crea – <i>Proyecto independiente</i>",
      keywords:
        "NestJS (Node.js), MongoDB, Next.js (React), AWS, Microservices, Multitenancy, Redis, Terraform, Gen-AI, Prompt Engineering",
    },
    {
      id: "joifilabs",
      title: "Joifilabs Middleware & Backoffice",
      meta: "(2025) – España",
      description:
        "Lideré el desarrollo de un middleware centralizado entre sistemas a bordo de trenes europeos e infraestructura en tierra, habilitando comunicación en tiempo real, sincronización de datos y APIs seguras entre flotas – <i>Joifilabs (España) – Independiente (Nuclear)</i>",
      keywords:
        "Nuxt (Vue), PostgreSQL, Python, FastAPI, Ansible, Docker, MQTT, Redis",
    },
    {
      id: "billprotech",
      title: "BillProTech – Invoice Verification",
      meta: "(2024–2025) – México – Proyecto personal",
      description:
        "Construí un sistema de procesamiento inteligente de documentos (OCR) y validación de datos financieros para extraer y verificar información de facturas, recibos y cotizaciones con Python, modelos OpenAI y técnicas de detección de fraude – <i>Proyecto independiente</i>",
      keywords:
        "Python, FastAPI, MongoDB, Next.js (React), AWS, ECS, Docker, Terraform, Prompt Engineering, Gen-AI",
    },
    {
      id: "anahuac",
      title: "Anahuac COAD",
      meta: "(2023–2025) – México",
      description:
        "Lideré la plataforma de gestión y automatización de acreditaciones académicas en la Universidad Anáhuac Puebla, incluyendo asignación de tareas, generación de documentos, flujos colaborativos y seguimiento de autoestudios y recomendaciones – <i>Independiente (Nuclear)</i>",
      keywords: "NestJS (Node.js), MongoDB/CosmosDB, Nuxt (Vue), Azure",
    },
    {
      id: "issste",
      title: "ISSSTE Data Warehouse",
      meta: "(2021–2022) – México",
      description:
        "Lideré un data warehouse para un proveedor de medicamentos del ISSSTE que recopila transacciones de SAP, proveedores de datos y bases de datos para alimentar dashboards en Google Data Studio y Looker – <i>Gavide como consultoría independiente (México)</i>",
      keywords:
        "BigQuery, GCP, Scheduling, Express, Big Data, Google Data Studio, SQL",
    },
    {
      id: "predictify",
      title: "Predictify Genomic Analysis",
      meta: "(2024) – España",
      description:
        "Lideré el desarrollo frontend de una plataforma científica para carga, filtrado, clasificación de datos y generación de reportes mediante un flujo interactivo y colaborativo – <i>Predictify (España) – Independiente (Nuclear)</i>",
      keywords: "MongoDB, Nuxt (Vue), AWS, Charts, Data visualization",
    },
    {
      id: "lexic",
      title: "Lexic.ai",
      meta: "(2020) – España",
      description:
        "Lideré una plataforma SaaS pay-as-you-go que permite a las empresas consumir servicios de Lexical AI como análisis de emociones, detección de palabras clave y categorización de entidades – <i>Lexic.ai (España)</i>",
      keywords: "Loopback, Express, MongoDB, Vue.js, AWS, Multitenancy",
    },
  ],
};

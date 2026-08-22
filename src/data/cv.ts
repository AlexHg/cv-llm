import type { LocalizedCvBase, LocalizedText } from './types'

export type {
  CvContact,
  CvData,
  CvEducation,
  CvExperience,
  CvLabels,
  CvSideProject,
  CvSkill,
  Locale,
  LocalizedText,
  ProfileId,
} from './types'

export {
  DEFAULT_LOCALE,
  DEFAULT_PROFILE,
  isLocale,
  isProfileId,
  LOCALES,
  PROFILE_IDS,
  t,
} from './types'

export const sectionLabels: Record<"en" | "es", import("./types").CvLabels> = {
  en: {
    about: "ABOUT ME",
    experience: "EXPERIENCE",
    experienceContinued: "(CONTINUED)",
    education: "EDUCATION",
    expertise: "EXPERTISE",
    techSkills: "TECH-SKILLS",
    sideProjects: "FEATURED SIDE-PROJECTS",
    keywords: "Key Words",
    downloadPdf: "DOWNLOAD PDF",
    generating: "GENERATING…",
    phone: "PHONE",
    email: "EMAIL",
    linkedin: "LINKEDIN",
    country: "Country",
  },
  es: {
    about: "SOBRE MÍ",
    experience: "EXPERIENCIA",
    experienceContinued: "(CONTINUACIÓN)",
    education: "EDUCACIÓN",
    expertise: "EXPERTISE",
    techSkills: "HABILIDADES TECH",
    sideProjects: "PROYECTOS DESTACADOS",
    keywords: "Palabras clave",
    downloadPdf: "DESCARGAR PDF",
    generating: "GENERANDO…",
    phone: "TELÉFONO",
    email: "EMAIL",
    linkedin: "LINKEDIN",
    country: "País",
  },
};

/** English expertise keys used for reordering across profiles */
export const expertiseKeys = [
  'Full Stack Development',
  'Frontend & Web Components',
  'DevOps - CD/CI',
  'Infrastructure as code',
  'Gen-AI Development',
  'Prompting techniques',
  'SQL & NoSQL Databases',
  'Containerization',
  'Software as a Service',
  'SCRUM & Agile',
  'AWS Architecture',
  'Hexagonal & Clean Architecture',
] as const

const expertiseLocalized: Record<(typeof expertiseKeys)[number], LocalizedText> = {
  'Full Stack Development': {
    en: 'Full Stack Development',
    es: 'Desarrollo Full Stack',
  },
  'Frontend & Web Components': {
    en: 'Frontend & Web Components',
    es: 'Frontend y Web Components',
  },
  'DevOps - CD/CI': {
    en: 'DevOps - CD/CI',
    es: 'DevOps - CD/CI',
  },
  'Infrastructure as code': {
    en: 'Infrastructure as code',
    es: 'Infraestructura como código',
  },
  'Gen-AI Development': {
    en: 'Gen-AI Development',
    es: 'Desarrollo Gen-AI',
  },
  'Prompting techniques': {
    en: 'Prompting techniques',
    es: 'Técnicas de prompting',
  },
  'SQL & NoSQL Databases': {
    en: 'SQL & NoSQL Databases',
    es: 'Bases de datos SQL y NoSQL',
  },
  Containerization: {
    en: 'Containerization',
    es: 'Containerización',
  },
  'Software as a Service': {
    en: 'Software as a Service',
    es: 'Software as a Service',
  },
  'SCRUM & Agile': {
    en: 'SCRUM & Agile',
    es: 'SCRUM y Agile',
  },
  'AWS Architecture': {
    en: 'AWS Architecture',
    es: 'Arquitectura AWS',
  },
  'Hexagonal & Clean Architecture': {
    en: 'Hexagonal & Clean Architecture',
    es: 'Arquitectura Hexagonal y Clean',
  },
}

export const cvBase: LocalizedCvBase = {
  firstName: "Alejandro",
  lastName: "Hernández",
  headline: {
    en: "CLOUD & SAAS ARCHITECT  |  GEN-AI BUILDER",
    es: "ARQUITECTO CLOUD & SAAS  |  CREADOR DE PRODUCTOS GEN-AI",
  },
  photo: "/profile.jpeg",
  about: {
    en: "Innovative technology leader with over a decade of experience designing, developing, and scaling software and cloud-based solutions. I've helped startups and enterprise teams accelerate their growth by building MVPs and production-ready systems using AWS and modern full-stack technologies. Passionate about generative AI, architecture design, and technical mentorship, I thrive at the intersection of innovation, scalability, and real-world impact.  .",
    es: "Líder tecnológico innovador con más de una década de experiencia diseñando, desarrollando y escalando software y soluciones en la nube. He ayudado a startups y equipos empresariales a acelerar su crecimiento construyendo MVPs y sistemas listos para producción con AWS y tecnologías full-stack modernas. Apasionado por la IA generativa, el diseño de arquitectura y la mentoría técnica, me desenvuelvo en la intersección entre innovación, escalabilidad e impacto real.",
  },
  contact: [
    { type: "phone", value: "+52 55 8449 8418" },
    { type: "email", value: "alejandro.hg.dev@gmail.com" },
    { type: "linkedin", value: "/alejandro-hdz-gz" },
    { type: "country", value: "Mexico" },
  ],
  experiencePage1: [
    {
      id: "ebc-techlead",
      title: { en: "Head of AI Solutions", es: "Jefe de Soluciones de IA" },
      company: "Escuela Bancaria y Comercial",
      period: {
        en: "Mar 2026 – Jun 2026",
        es: "Mar 2026 – Jun 2026",
      },
      description: {
        en: "As Head of AI Solutions, I designed and led serverless AI applications on AWS, defining technical strategy, architecture, and delivery. Built RAG-based systems and intelligent training pipelines, exposing capabilities through API Gateway and scalable serverless services to bring AI solutions into production.",
        es: "Como Jefe de Soluciones de IA, diseñé y lideré aplicaciones de inteligencia artificial serverless en AWS, definiendo la estrategia técnica, la arquitectura y la entrega continua. Construí sistemas basados en RAG y pipelines de entrenamiento de sistemas inteligentes, exponiendo capacidades a través de API Gateway y servicios serverless escalables para llevar soluciones de IA a producción.",
      },
    },
    {
      id: "chequemotiva-techlead",
      title: { en: "Tech Lead", es: "Tech Lead" },
      company: "Chequemotiva",
      period: {
        en: "Jul 2024 – Mar 2026",
        es: "Jul 2024 – Mar 2026",
      },
      description: {
        en: "Lead the development and continuous improvement of the company's main SaaS platform. Directed technical strategy, architecture, and feature delivery to ensure scalability and high availability. Also led the creation of an OCR and invoice validation system, and a platform for on-demand prepaid card generation, integrating automation and reliability across the company's ecosystem.",
        es: "Lideré el desarrollo y la mejora continua de la plataforma SaaS principal de la empresa. Dirijo la estrategia técnica, la arquitectura y la entrega de funcionalidades para garantizar escalabilidad y alta disponibilidad. También lideré la creación de un sistema de OCR y validación de facturas, y una plataforma de generación de tarjetas prepago bajo demanda, integrando automatización y confiabilidad en todo el ecosistema.",
      },
    },
    {
      id: "cerocatorce-techlead",
      title: {
        en: "Tech Lead - Dev & Cloud",
        es: "Tech Lead - Dev & Cloud",
      },
      company: "Cerocatorce",
      period: {
        en: "May 2022 – Jul 2024",
        es: "May 2022 – Jul 2024",
      },
      description: {
        en: "After being promoted to Tech Lead, I led a team of four developers, overseeing code quality, resolving technical issues, and coordinating with project managers on delivery timelines. I also participated in technical leadership meetings to plan new projects, integrations, and infrastructure improvements.",
        es: "Tras ser promovido a Tech Lead, lideré un equipo de cuatro desarrolladores, supervisando la calidad del código, resolviendo problemas técnicos y coordinando con project managers los tiempos de entrega. También participé en reuniones de liderazgo técnico para planificar nuevos proyectos, integraciones y mejoras de infraestructura.",
      },
    },
  ],
  experiencePage2: [
    {
      id: "cerocatorce-devops",
      title: {
        en: "DevOps & Full Stack Developer",
        es: "DevOps y Desarrollador Full Stack",
      },
      company: "Cerocatorce",
      period: {
        en: "Jun 2019 – May 2022",
        es: "Jun 2019 – May 2022",
      },
      description: {
        en: "As one of the first members of the digital team, I helped design and implement the company's core software infrastructure, developing and maintaining new features. I built integrations with over five gift card providers, enhanced system security, and contributed to early versions of key products such as chatbots, rewards managers, and internal networks. I also integrated our systems with major platforms like AWS, Twilio, and Sendinblue.",
        es: "Como uno de los primeros miembros del equipo digital, ayudé a diseñar e implementar la infraestructura de software principal de la empresa, desarrollando y manteniendo nuevas funcionalidades. Construí integraciones con más de cinco proveedores de gift cards, mejoré la seguridad del sistema y contribuí a las primeras versiones de productos clave como chatbots, gestores de recompensas y redes internas. También integré nuestros sistemas con plataformas como AWS, Twilio y Sendinblue.",
      },
    },
    {
      id: "welfare-fullstack",
      title: {
        en: "Full Stack Developer",
        es: "Desarrollador Full Stack",
      },
      company: "Welfare",
      period: {
        en: "Jan 2015 – Jun 2019",
        es: "Ene 2015 – Jun 2019",
      },
      description: {
        en: "At Welfare, I led the company's technology and software development, collaborating with commercial and operations teams. I worked with multiple NGOs to build institutional websites, custom WordPress templates, and donation platforms, developing payment gateways from scratch and supporting existing systems.",
        es: "En Welfare lideré la tecnología y el desarrollo de software de la empresa, colaborando con equipos comerciales y de operaciones. Trabajé con múltiples ONG para construir sitios institucionales, plantillas WordPress a medida y plataformas de donaciones, desarrollando pasarelas de pago desde cero y dando soporte a sistemas existentes.",
      },
    },
  ],
  education: {
    degree: {
      en: "Degree in\nComputer Systems Engineering",
      es: "Ingeniería en\nSistemas Computacionales",
    },
    school: "Instituto Politécnico Nacional",
    period: {
      en: "2014 – 2019",
      es: "2014 – 2019",
    },
  },
  expertise: expertiseKeys.map((key) => expertiseLocalized[key]),
  skills: [
    { name: "Typescript & JS", level: 5 },
    { name: "PHP & Symfony", level: 4 },
    { name: "Node.js / Nestjs", level: 5 },
    { name: "VueJS / Nuxt", level: 5 },
    { name: "ReactJS / Next.js", level: 3 },
    { name: "AWS", level: 5 },
    { name: "Terraform", level: 4 },
    { name: "Docker", level: 5 },
    { name: "Linux", level: 3 },
    { name: "CSS & Design", level: 4 },
    { name: "GIT", level: 4 },
  ],
  sideProjects: [
    {
      id: "joifilabs",
      title: "Joifilabs Middleware & Backoffice",
      meta: {
        en: "(2025) – Spain",
        es: "(2025) – España",
      },
      description: {
        en: "Led the development of a centralized middleware between onboard European train systems and ground infrastructure, enabling real-time communication, data sync, and secure APIs across fleets – <i>Joifilabs (Spain) – Independent (Nuclear)</i>",
        es: "Lideré el desarrollo de un middleware centralizado entre sistemas a bordo de trenes europeos e infraestructura en tierra, habilitando comunicación en tiempo real, sincronización de datos y APIs seguras entre flotas – <i>Joifilabs (España) – Independiente (Nuclear)</i>",
      },
      keywords:
        "Nuxt (Vue), PostgreSQL, Python, FastAPI, Ansible, Docker, MQTT, Redis",
    },
    {
      id: "predictify",
      title: "Predictify Genomic Analysis",
      meta: {
        en: "(2024) – Spain",
        es: "(2024) – España",
      },
      description: {
        en: "Led the frontend development of a scientific platform for data upload, filtering, classification, and report generation through an interactive and collaborative workflow – <i>Predictify (Spain) – Independent (Nuclear)</i>",
        es: "Lideré el desarrollo frontend de una plataforma científica para carga, filtrado, clasificación de datos y generación de reportes mediante un flujo interactivo y colaborativo – <i>Predictify (España) – Independiente (Nuclear)</i>",
      },
      keywords: "MongoDB, Nuxt (Vue), AWS, Charts, Data visualization",
    },
    {
      id: "billprotech",
      title: "BillProTech – Invoice Verification",
      meta: {
        en: "(2024–2025) – Mexico – Personal Project",
        es: "(2024–2025) – México – Proyecto personal",
      },
      description: {
        en: "Built an intelligent document processing (OCR) and financial data validation system to extract and verify information from invoices, receipts, and quotations using Python, OpenAI models, and fraud detection techniques – <i>Independent project</i>",
        es: "Construí un sistema de procesamiento inteligente de documentos (OCR) y validación de datos financieros para extraer y verificar información de facturas, recibos y cotizaciones con Python, modelos OpenAI y técnicas de detección de fraude – <i>Proyecto independiente</i>",
      },
      keywords:
        "Python, FastAPI, MongoDB, Next.js (React), AWS, ECS, Docker, Terraform, Prompt Engineering, Gen-AI",
    },
    {
      id: "anahuac",
      title: "Anahuac COAD",
      meta: {
        en: "(2023–2025) – Mexico",
        es: "(2023–2025) – México",
      },
      description: {
        en: "Led a platform for academic accreditation management and automation at Universidad Anáhuac Puebla, including task assignment, document generation, collaborative workflows, and self-study & recommendations tracking – <i>Independent (Nuclear)</i>",
        es: "Lideré la plataforma de gestión y automatización de acreditaciones académicas en la Universidad Anáhuac Puebla, incluyendo asignación de tareas, generación de documentos, flujos colaborativos y seguimiento de autoestudios y recomendaciones – <i>Independiente (Nuclear)</i>",
      },
      keywords: "NestJS (Node.js), MongoDB/CosmosDB, Nuxt (Vue), Azure",
    },
    {
      id: "nuclear-hub",
      title: "Nuclear Builders / SaaS Hub",
      meta: {
        en: "(2022–2025) – Mexico – Personal Project",
        es: "(2022–2025) – México – Proyecto personal",
      },
      description: {
        en: "Developed a multitenant no-code SaaS platform that generates customizable applications, reusing the same infrastructure stack for each service it creates – <i>Independent Project</i>",
        es: "Desarrollé una plataforma SaaS no-code multitenant que genera aplicaciones personalizables, reutilizando la misma infraestructura por cada servicio que crea – <i>Proyecto independiente</i>",
      },
      keywords:
        "NestJS (Node.js), MongoDB, Next.js (React), AWS, Microservices, Multitenancy, Redis, Terraform, Gen-AI, Prompt Engineering",
    },
    {
      id: "incentive-machine",
      title: "Incentive Machine",
      meta: {
        en: "(2021) – Mexico",
        es: "(2021) – México",
      },
      description: {
        en: "Led a multitenant SaaS platform for distributing coupons and gift cards to end users and marketing companies, with multiple distribution services – <i>Cerocatorce (Mexico)</i>",
        es: "Lideré una plataforma SaaS multitenant para la distribución de cupones y gift cards a usuarios finales y empresas de marketing, con múltiples servicios de distribución – <i>Cerocatorce (México)</i>",
      },
      keywords:
        "NestJS (Node.js), MongoDB, Nuxt (Vue), AWS, Microservices, Multitenancy, ECS, Terraform, SQS",
    },
    {
      id: "lexic",
      title: "Lexic.ai",
      meta: {
        en: "(2020) – Spain",
        es: "(2020) – España",
      },
      description: {
        en: "Led a pay-as-you-go SaaS platform that lets companies consume Lexical AI services such as emotion analysis, keyword detection, and entity categorization – <i>Lexic.ai (Spain)</i>",
        es: "Lideré una plataforma SaaS pay-as-you-go que permite a las empresas consumir servicios de Lexical AI como análisis de emociones, detección de palabras clave y categorización de entidades – <i>Lexic.ai (España)</i>",
      },
      keywords: "Loopback, Express, MongoDB, Vue.js, AWS, Multitenancy",
    },
    {
      id: "issste",
      title: "ISSSTE Data Warehouse",
      meta: {
        en: "(2021–2022) – Mexico",
        es: "(2021–2022) – México",
      },
      description: {
        en: "Led a data warehouse for an ISSSTE medicaments provider that collects transactions from SAP, data providers, and databases to power Google Data Studio and Looker dashboards – <i>Gavide as Independent Consultancy (Mexico)</i>",
        es: "Lideré un data warehouse para un proveedor de medicamentos del ISSSTE que recopila transacciones de SAP, proveedores de datos y bases de datos para alimentar dashboards en Google Data Studio y Looker – <i>Gavide como consultoría independiente (México)</i>",
      },
      keywords:
        "BigQuery, GCP, Scheduling, Express, Big Data, Google Data Studio, SQL",
    },
    {
      id: "dti-cloud",
      title: "DTI Cloud",
      meta: {
        en: "(2021) – Canada",
        es: "(2021) – Canadá",
      },
      description: {
        en: "Led the migration of internal company systems from dedicated servers to AWS, including auto-scaling and managed databases – <i>Diesel Tech Industries as Independent Consultancy (Canada)</i>",
        es: "Lideré la migración de sistemas internos de la empresa desde servidores dedicados a AWS, incluyendo autoescalado y bases de datos gestionadas – <i>Diesel Tech Industries como consultoría independiente (Canadá)</i>",
      },
      keywords: "AWS, Elastic Beanstalk, SQS, Auto-scaling, RDS Databases",
    },
  ],
};

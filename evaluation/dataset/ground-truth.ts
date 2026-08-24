/**
 * Hechos de referencia curados a mano.
 *
 * Se escriben aquí *a mano* en lugar de derivarlos de `@/application/profile`
 * a propósito: derivar las expectativas del mismo código que se evalúa es una
 * tautología (si el cálculo de fechas se rompe, el eval se rompe con él y pasa
 * igual). `evaluation/dataset.test.ts` compara esta tabla contra el perfil real
 * y falla si divergen, así que un cambio de CV obliga a revisar el dataset.
 */

export const DATASET_VERSION = "2026.08.1";

export interface TenureFact {
  slug: string;
  name: string;
  period: string;
  durationLabel: string;
  durationMonths: number;
}

export interface RoleFact {
  id: string;
  title: string;
  company: string;
  period: string;
  durationLabel: string;
  durationMonths: number;
}

export const GROUND_TRUTH = {
  identity: {
    fullName: "Alejandro Hernández",
    headline: "CLOUD & SAAS ARCHITECT  ||  GEN-AI BUILDER",
    email: "alejandro.hg.dev@gmail.com",
    phone: "+52 55 8449 8418",
    linkedin: "/alejandro-hdz-gz",
    country: "México",
  },

  education: {
    degree: "Ingeniería en Sistemas Computacionales",
    school: "Instituto Politécnico Nacional",
    period: "2014 – 2019",
  },

  /** Vacío en el CV: cualquier certificación citada es una alucinación. */
  certifications: [] as string[],

  employmentTenures: [
    {
      slug: "cerocatorce",
      name: "Cerocatorce",
      period: "Jun 2019 – Jul 2024",
      durationLabel: "5 años y 1 mes",
      durationMonths: 61,
    },
    {
      slug: "welfare",
      name: "Welfare",
      period: "Ene 2015 – Jun 2019",
      durationLabel: "4 años y 5 meses",
      durationMonths: 53,
    },
    {
      slug: "chequemotiva",
      name: "Chequemotiva",
      period: "Jul 2024 – Mar 2026",
      durationLabel: "1 año y 8 meses",
      durationMonths: 20,
    },
    {
      slug: "ebc",
      name: "Escuela Bancaria y Comercial",
      period: "Mar 2026 – Jun 2026",
      durationLabel: "3 meses",
      durationMonths: 3,
    },
  ] satisfies TenureFact[],

  roles: [
    {
      id: "ebc-techlead",
      title: "Jefe de Soluciones de IA",
      company: "Escuela Bancaria y Comercial",
      period: "Mar 2026 – Jun 2026",
      durationLabel: "3 meses",
      durationMonths: 3,
    },
    {
      id: "chequemotiva-techlead",
      title: "Tech Lead",
      company: "Chequemotiva",
      period: "Jul 2024 – Mar 2026",
      durationLabel: "1 año y 8 meses",
      durationMonths: 20,
    },
    {
      id: "cerocatorce-techlead",
      title: "Tech Lead - Dev & Cloud",
      company: "Cerocatorce",
      period: "May 2022 – Jul 2024",
      durationLabel: "2 años y 2 meses",
      durationMonths: 26,
    },
    {
      id: "cerocatorce-devops",
      title: "DevOps y Desarrollador Full Stack",
      company: "Cerocatorce",
      period: "Jun 2019 – May 2022",
      durationLabel: "2 años y 11 meses",
      durationMonths: 35,
    },
    {
      id: "welfare-fullstack",
      title: "Desarrollador Full Stack",
      company: "Welfare",
      period: "Ene 2015 – Jun 2019",
      durationLabel: "4 años y 5 meses",
      durationMonths: 53,
    },
  ] satisfies RoleFact[],

  /** Empresa con mayor permanencia laboral (suma de roles consecutivos). */
  longestCompany: {
    name: "Cerocatorce",
    period: "Jun 2019 – Jul 2024",
    durationLabel: "5 años y 1 mes",
  },

  /** Rol individual más largo. Distinto de `longestCompany`: el trap principal. */
  longestRole: {
    id: "welfare-fullstack",
    title: "Desarrollador Full Stack",
    company: "Welfare",
    period: "Ene 2015 – Jun 2019",
    durationLabel: "4 años y 5 meses",
  },

  /** Empresas del mismo grupo que NUNCA deben fusionarse en un solo tramo. */
  relatedButDistinct: {
    group: "Grupo 014",
    members: ["Cerocatorce", "Chequemotiva"],
  },

  skillLevels: {
    AWS: 5,
    Terraform: 4,
    Docker: 5,
    "Node.js / Nestjs": 5,
    "Typescript & JS": 5,
    "VueJS / Nuxt": 5,
    Python: 4,
    Linux: 3,
    GIT: 4,
    "ReactJS / Next.js": 4,
    "PHP & Symfony": 4,
    "CSS & Design": 4,
  } as Record<string, number>,

  projects: [
    { id: "dti-cloud", title: "DTI Cloud", years: "2021", country: "Canadá" },
    {
      id: "incentive-machine",
      title: "Incentive Machine",
      years: "2021",
      country: "México",
    },
    {
      id: "nuclear-hub",
      title: "Nuclear Builders / SaaS Hub",
      years: "2022–2025",
      country: "México",
    },
    {
      id: "joifilabs",
      title: "Joifilabs Middleware & Backoffice",
      years: "2025",
      country: "España",
    },
    {
      id: "billprotech",
      title: "BillProTech – Invoice Verification",
      years: "2024–2025",
      country: "México",
    },
    { id: "anahuac", title: "Anahuac COAD", years: "2023–2025", country: "México" },
    {
      id: "issste",
      title: "ISSSTE Data Warehouse",
      years: "2021–2022",
      country: "México",
    },
    {
      id: "predictify",
      title: "Predictify Genomic Analysis",
      years: "2024",
      country: "España",
    },
    { id: "lexic", title: "Lexic.ai", years: "2020", country: "España" },
  ],

  /**
   * Tecnologías y datos que NO están en el perfil. Cualquier afirmación
   * positiva sobre ellos es alucinación, no inferencia razonable.
   */
  absent: [
    "Kubernetes",
    "Java",
    "Go",
    "Rust",
    "Kafka",
    "Snowflake",
    "LangChain",
    "certificaciones",
    "idiomas",
    "expectativa salarial",
    "disponibilidad de reubicación",
    "aprendizajes de proyectos (learnings vacíos)",
    "tecnologías del rol Tech Lead - Dev & Cloud (lista vacía)",
    "tamaño de equipo en Chequemotiva o EBC",
  ],
} as const;

export const NOT_IN_PROFILE_PHRASES = [
  "no consta",
  "no aparece",
  "no figura",
  "no esta en el perfil",
  "no se especifica",
  "no se indica",
  "no hay informacion",
  "no lo especifica",
  "no lo indica",
  "no detalla",
  "el cv no",
  "el perfil no",
  "sin informacion",
];

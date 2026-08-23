export interface CompanyCollaboration {
  roles: string[];
  periods: string[];
  experienceIds: string[];
  projectIds: string[];
}

export interface CompanyProfile {
  slug: string;
  name: string;
  aliases: string[];
  country: string;
  sector: string;
  summary: string;
  website?: string;
  collaboration: CompanyCollaboration;
}

export const companies: CompanyProfile[] = [
  {
    slug: "ebc",
    name: "Escuela Bancaria y Comercial",
    aliases: ["ebc", "escuela bancaria", "escuela bancaria y comercial"],
    country: "México",
    sector: "Educación superior / finanzas",
    summary:
      "Institución privada mexicana de educación superior, fundada en 1929, con programas en negocios, banca y finanzas.",
    website: "https://www.ebc.mx",
    collaboration: {
      roles: ["Jefe de Soluciones de IA"],
      periods: ["Mar 2026 – Jun 2026"],
      experienceIds: ["ebc-techlead"],
      projectIds: [],
    },
  },
  {
    slug: "chequemotiva",
    name: "Chequemotiva",
    aliases: [
      "chequemotiva",
      "cqm",
      "cqm rewards",
      "chequemotiva s.l.",
    ],
    country: "México / España",
    sector: "Incentivos, fidelización y gift cards B2B",
    summary:
      "Empresa de incentivos, fidelización y marketing promocional para compañías (también conocida como CQM Rewards). Opera plataformas de recompensas, catálogos de tarjetas regalo y programas de lealtad; forma parte del ecosistema del Grupo 014.",
    website: "https://www.chequemotiva.com/home/",
    collaboration: {
      roles: ["Tech Lead"],
      periods: ["Jul 2024 – Mar 2026"],
      experienceIds: ["chequemotiva-techlead"],
      projectIds: [],
    },
  },
  {
    slug: "cerocatorce",
    name: "Cerocatorce",
    aliases: [
      "cerocatorce",
      "014",
      "grupo 014",
      "cero catorce",
    ],
    country: "México",
    sector: "Engagement, lealtad e incentivos",
    summary:
      "Compañía de estrategias de engagement, campañas promocionales y programas de lealtad para empresas en Latinoamérica. Pertenece al Grupo 014, el mismo ecosistema que Chequemotiva / CQM Rewards.",
    collaboration: {
      roles: ["Tech Lead - Dev & Cloud", "DevOps y Desarrollador Full Stack"],
      periods: ["Jun 2019 – Jul 2024"],
      experienceIds: ["cerocatorce-techlead", "cerocatorce-devops"],
      projectIds: ["incentive-machine"],
    },
  },
  {
    slug: "welfare",
    name: "Welfare",
    aliases: ["welfare"],
    country: "México",
    sector: "Tecnología para organizaciones sociales",
    summary:
      "Organización con la que Alejandro lideró desarrollo de software orientado a ONG: sitios institucionales, plantillas WordPress y plataformas de donaciones. No hay ficha pública adicional en este directorio.",
    collaboration: {
      roles: ["Desarrollador Full Stack"],
      periods: ["Ene 2015 – Jun 2019"],
      experienceIds: ["welfare-fullstack"],
      projectIds: [],
    },
  },
  {
    slug: "diesel-tech",
    name: "Diesel Tech Industries",
    aliases: ["dti", "dti cloud", "diesel tech", "diesel tech industries"],
    country: "Canadá",
    sector: "Manufactura de componentes diésel",
    summary:
      "Empresa canadiense de componentes y soluciones para motores diésel. La colaboración fue como consultoría independiente para migrar sistemas internos a AWS.",
    collaboration: {
      roles: ["Consultoría independiente — migración cloud"],
      periods: ["2021"],
      experienceIds: [],
      projectIds: ["dti-cloud"],
    },
  },
  {
    slug: "joifilabs",
    name: "Joifilabs",
    aliases: ["joifilabs", "joifi"],
    country: "España",
    sector: "Tecnología ferroviaria",
    summary:
      "Empresa española que trabaja con sistemas a bordo de trenes europeos e infraestructura en tierra. La colaboración cubrió un middleware de comunicación en tiempo real y un backoffice.",
    collaboration: {
      roles: ["Liderazgo de middleware y backoffice (independiente / Nuclear)"],
      periods: ["2025"],
      experienceIds: [],
      projectIds: ["joifilabs"],
    },
  },
  {
    slug: "anahuac-puebla",
    name: "Universidad Anáhuac Puebla",
    aliases: [
      "anahuac",
      "anáhuac",
      "anahuac puebla",
      "anáhuac puebla",
      "universidad anahuac",
      "universidad anáhuac puebla",
      "anahuac coad",
    ],
    country: "México",
    sector: "Educación superior",
    summary:
      "Universidad privada en Puebla, parte de la Red de Universidades Anáhuac. El proyecto COAD cubrió gestión y automatización de acreditaciones académicas.",
    website: "https://www.anahuac.mx/puebla",
    collaboration: {
      roles: ["Liderazgo de la plataforma de acreditaciones (independiente / Nuclear)"],
      periods: ["2023–2025"],
      experienceIds: [],
      projectIds: ["anahuac"],
    },
  },
  {
    slug: "issste",
    name: "ISSSTE",
    aliases: [
      "issste",
      "instituto de seguridad y servicios sociales de los trabajadores del estado",
    ],
    country: "México",
    sector: "Seguridad social pública",
    summary:
      "Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado: organismo público mexicano de salud y prestaciones para trabajadores al servicio del Estado.",
    website: "https://www.gob.mx/issste",
    collaboration: {
      roles: ["Data warehouse para un proveedor de medicamentos del ISSSTE"],
      periods: ["2021–2022"],
      experienceIds: [],
      projectIds: ["issste"],
    },
  },
  {
    slug: "gavide",
    name: "Gavide",
    aliases: ["gavide"],
    country: "México",
    sector: "Consultoría de datos",
    summary:
      "Consultora con la que se entregó el data warehouse de un proveedor de medicamentos del ISSSTE (dashboards en Google Data Studio y Looker). No hay ficha pública adicional en este directorio.",
    collaboration: {
      roles: ["Consultoría independiente — data warehouse"],
      periods: ["2021–2022"],
      experienceIds: [],
      projectIds: ["issste"],
    },
  },
  {
    slug: "predictify",
    name: "Predictify",
    aliases: ["predictify", "predictify genomic"],
    country: "España",
    sector: "Biotecnología / análisis genómico",
    summary:
      "Plataforma científica para carga, filtrado y reporte de datos genómicos. La colaboración fue el frontend (independiente / Nuclear).",
    collaboration: {
      roles: ["Liderazgo de desarrollo frontend"],
      periods: ["2024"],
      experienceIds: [],
      projectIds: ["predictify"],
    },
  },
  {
    slug: "lexic",
    name: "Lexic.ai",
    aliases: ["lexic", "lexic.ai", "lexical ai"],
    country: "España",
    sector: "SaaS de procesamiento de lenguaje",
    summary:
      "Plataforma SaaS pay-as-you-go de Lexical AI: análisis de emociones, detección de palabras clave y categorización de entidades para empresas.",
    collaboration: {
      roles: ["Liderazgo de la plataforma SaaS"],
      periods: ["2020"],
      experienceIds: [],
      projectIds: ["lexic"],
    },
  },
  {
    slug: "nuclear",
    name: "Nuclear Builders",
    aliases: ["nuclear", "nuclear builders", "saas hub", "nuclear hub"],
    country: "México",
    sector: "Estudio independiente / SaaS",
    summary:
      "Estudio independiente de Alejandro para proyectos SaaS y consultoría. Incluye el hub no-code multitenant y entregas para Anáhuac, Joifilabs y Predictify.",
    collaboration: {
      roles: ["Fundador / desarrollador"],
      periods: ["2022–2025"],
      experienceIds: [],
      projectIds: ["nuclear-hub", "anahuac", "joifilabs", "predictify"],
    },
  },
];

export function listCompanyNames() {
  return companies.map((company) => company.name);
}

export function listCompanyDirectory() {
  return companies.map((company) => ({
    slug: company.slug,
    name: company.name,
    aliases: company.aliases,
  }));
}

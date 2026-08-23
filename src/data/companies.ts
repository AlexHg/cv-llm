export interface CompanyCollaboration {
  roles: string[];
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
  group?: string;
  relatedSlugs?: string[];
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
    group: "Grupo 014",
    relatedSlugs: ["cerocatorce"],
    collaboration: {
      roles: ["Tech Lead"],
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
    group: "Grupo 014",
    relatedSlugs: ["chequemotiva"],
    collaboration: {
      roles: ["Tech Lead - Dev & Cloud", "DevOps y Desarrollador Full Stack"],
      experienceIds: ["cerocatorce-techlead", "cerocatorce-devops"],
      projectIds: ["incentive-machine"],
    },
  },
  {
    slug: "welfare",
    name: "Welfare",
    aliases: ["welfare"],
    country: "México",
    sector: "Agencia para organizaciones de la sociedad civil",
    summary:
      "Agencia mexicana enfocada en las organizaciones de la sociedad civil. Alejandro lideró el desarrollo de software: sitios institucionales, plantillas WordPress y plataformas de donaciones.",
    collaboration: {
      roles: ["Desarrollador Full Stack"],
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
    relatedSlugs: ["nuclear"],
    collaboration: {
      roles: ["Liderazgo de middleware y backoffice (independiente / Nuclear)"],
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
    relatedSlugs: ["nuclear"],
    collaboration: {
      roles: ["Liderazgo de la plataforma de acreditaciones (independiente / Nuclear)"],
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
    relatedSlugs: ["gavide"],
    collaboration: {
      roles: ["Data warehouse para un proveedor de medicamentos del ISSSTE"],
      experienceIds: [],
      projectIds: ["issste"],
    },
  },
  {
    slug: "gavide",
    name: "Gavide",
    aliases: ["gavide"],
    country: "México",
    sector: "Implementación de soluciones empresariales SAP",
    summary:
      "Empresa dedicada a la implementación de soluciones empresariales basadas en SAP. La colaboración cubrió el data warehouse de un proveedor de medicamentos del ISSSTE (dashboards en Google Data Studio y Looker).",
    website: "https://gavide.com/",
    relatedSlugs: ["issste"],
    collaboration: {
      roles: ["Consultoría independiente — data warehouse"],
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
    relatedSlugs: ["nuclear"],
    collaboration: {
      roles: ["Liderazgo de desarrollo frontend"],
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
    relatedSlugs: ["anahuac-puebla", "joifilabs", "predictify"],
    collaboration: {
      roles: ["Fundador / desarrollador"],
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
    group: company.group,
    related: (company.relatedSlugs ?? []).map((slug) => {
      const related = companies.find((item) => item.slug === slug);
      return { slug, name: related?.name ?? slug };
    }),
  }));
}

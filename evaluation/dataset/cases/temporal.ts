import type { EvalCase } from "../../types";

/**
 * Hechos temporales: el modo de fallo más caro de este agente.
 * El código ya calculó period y durationLabel; el modelo solo debe copiarlos.
 * Aquí se prueba que no reste fechas, no fusione empleadores del mismo grupo
 * y no confunda «empresa con más permanencia» con «rol más largo».
 */
export const temporalCases: EvalCase[] = [
  {
    id: "TMP-001",
    category: "temporal",
    title: "Empresa con mayor permanencia (trap: rol vs empresa)",
    severity: "critical",
    tags: ["tenure", "highlights", "trap"],
    turns: ["¿En qué empresa duró más tiempo?"],
    reference:
      "Cerocatorce: Jun 2019 – Jul 2024, 5 años y 1 mes (61 meses), sumando los roles de DevOps/Full Stack y Tech Lead - Dev & Cloud. No es Welfare: Welfare es el rol individual más largo (4 años y 5 meses), no la empresa con mayor permanencia.",
    assertions: {
      mustIncludeAll: ["cerocatorce"],
      mustIncludeAny: [
        ["5 anos y 1 mes", "5 anos y un mes", "61 meses", "5 anos"],
        ["jun 2019", "junio de 2019", "2019"],
      ],
      mustMatch: ["^[\\s\\S]{0,240}cerocatorce"],
      requireCitation: true,
    },
    rubric: [
      "La empresa señalada debe ser Cerocatorce. Nombrar Welfare como respuesta es un fallo, aunque se mencione como contraste.",
      "La duración debe copiarse (5 años y 1 mes); cualquier otra cifra es un fallo de exactitud.",
    ],
  },
  {
    id: "TMP-002",
    category: "temporal",
    title: "Rol individual más largo",
    severity: "critical",
    tags: ["tenure", "highlights", "trap"],
    turns: ["¿Cuál ha sido su puesto individual más largo?"],
    reference:
      "Desarrollador Full Stack en Welfare (experience:welfare-fullstack): Ene 2015 – Jun 2019, 4 años y 5 meses (53 meses). Es el rol más largo, distinto de la empresa con mayor permanencia (Cerocatorce, 5 años y 1 mes). En ese rol lideró la tecnología y el desarrollo de software, colaboró con equipos comerciales y de operaciones, y construyó sitios institucionales, plantillas WordPress, plataformas de donaciones y pasarelas de pago desde cero para ONG.",
    assertions: {
      mustIncludeAll: ["welfare"],
      mustIncludeAny: [
        ["4 anos y 5 meses", "53 meses"],
        ["desarrollador full stack", "full stack"],
      ],
      requireCitation: true,
    },
  },
  {
    id: "TMP-003",
    category: "temporal",
    title: "Permanencia y roles en una empresa",
    severity: "critical",
    tags: ["tenure", "roles"],
    turns: ["¿Cuánto tiempo estuvo en Cerocatorce y en qué roles?"],
    reference:
      "Cerocatorce en total: Jun 2019 – Jul 2024, 5 años y 1 mes. Dos roles: DevOps y Desarrollador Full Stack (Jun 2019 – May 2022, 2 años y 11 meses) y Tech Lead - Dev & Cloud (May 2022 – Jul 2024, 2 años y 2 meses), tras una promoción.",
    assertions: {
      mustIncludeAny: [
        ["5 anos y 1 mes", "61 meses"],
        ["2 anos y 11 meses", "may 2022", "mayo de 2022"],
        ["2 anos y 2 meses", "jul 2024", "julio de 2024"],
      ],
      mustIncludeAll: ["tech lead"],
      requireCitation: true,
    },
    rubric: [
      "Debe distinguir los dos roles y el tramo total sin recalcular meses.",
    ],
  },
  {
    id: "TMP-004",
    category: "temporal",
    title: "Duración de un empleo concreto",
    severity: "critical",
    tags: ["tenure"],
    turns: ["¿Cuánto tiempo trabajó en Chequemotiva?"],
    reference:
      "Jul 2024 – Mar 2026, 1 año y 8 meses (20 meses), como Tech Lead.",
    assertions: {
      mustIncludeAny: [
        ["1 ano y 8 meses", "un ano y ocho meses", "20 meses"],
        ["jul 2024", "julio de 2024"],
        ["mar 2026", "marzo de 2026"],
      ],
      mustNotMatch: ["\\b(2|3|4|5) anos\\b"],
      requireCitation: true,
    },
  },
  {
    id: "TMP-005",
    category: "temporal",
    title: "No fusionar empleadores del mismo grupo",
    severity: "critical",
    tags: ["tenure", "grupo-014", "trap"],
    turns: [
      "Cerocatorce y Chequemotiva son del Grupo 014. ¿Cuánto tiempo acumula en el grupo?",
    ],
    reference:
      "Son empleadores distintos y no se fusionan los tramos: Cerocatorce Jun 2019 – Jul 2024 (5 años y 1 mes) y Chequemotiva Jul 2024 – Mar 2026 (1 año y 8 meses). El perfil las mantiene separadas aunque compartan el Grupo 014; no existe un tramo único combinado.",
    assertions: {
      mustIncludeAll: ["cerocatorce", "chequemotiva"],
      mustIncludeAny: [
        ["5 anos y 1 mes", "61 meses"],
        ["1 ano y 8 meses", "20 meses"],
        ["distint", "separad", "no se fusion", "no fusion", "por separado"],
      ],
      mustNotInclude: ["6 anos y 9 meses", "81 meses", "6 anos y nueve meses"],
      requireCitation: true,
    },
    rubric: [
      "Debe negarse explícitamente a sumar los dos tramos en una sola permanencia.",
    ],
  },
  {
    id: "TMP-007",
    category: "temporal",
    title: "Años totales de experiencia",
    severity: "high",
    tags: ["tenure", "aggregate"],
    turns: ["¿Cuántos años de experiencia profesional tiene en total?"],
    reference:
      "El perfil lo describe como «más de una década»: la trayectoria arranca en Ene 2015 (Welfare) y llega a Jun 2026 (EBC), es decir más de 10 años. No hay un total precalculado distinto de esa formulación.",
    assertions: {
      mustIncludeAny: [["decada", "10 anos", "mas de 10", "2015"]],
      // Un total exacto al mes no existe en el perfil: si aparece, el modelo
      // ha restado fechas, que es justo lo que el system prompt prohíbe.
      mustNotMatch: [
        "\\b(1[5-9]|2\\d) anos de experiencia",
        "\\b\\d+ anos y \\d+ meses de experiencia",
      ],
    },
    rubric: [
      "Puede decir «más de una década» o apoyarse en el rango 2015–2026. Dar un total exacto al mes implica haber restado fechas: es un fallo.",
    ],
  },
];

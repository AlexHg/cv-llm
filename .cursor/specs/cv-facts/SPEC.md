# Spec: hechos temporales y consulta determinista del perfil

| Campo | Valor |
| --- | --- |
| ID | `SPEC-CV-003` |
| Estado | Implementado |
| Feature | Fechas estructuradas, permanencia por empresa, tool `query_profile` |
| Dueño | cv-llm |
| Relacionado | `SPEC-CV-002`, `SPEC-A2UI-001`, FR 2, 8, 9, 11 |

Fuente de verdad de duraciones, agregación por empleador y la tool de hechos. Si el contrato diverge, se actualiza primero este spec.

## 1. Problema

El agente recibía periodos como texto (`Jul 2024 – Mar 2026`) y calculaba duraciones en el modelo. Fallaba al:

- Comparar permanencia (elegía el rol reciente, no la empresa más larga).
- Agregar varios roles de la misma empresa.
- Fusionar empleadores del mismo grupo (Cerocatorce + Chequemotiva → 2019–2026).
- Anclarse a una fecha inventada cuando el usuario corregía.

## 2. Objetivos

- El código calcula fechas y duraciones. El modelo las copia.
- Permanencia laboral = tramo calendario (primer inicio → último fin) por empresa, no suma de roles ni fusión de empresas relacionadas.
- Una tool de consulta cubre duraciones, comparaciones y filtros (empresa, tecnología, enfoque) para otros casos además de «dónde duró más».
- Las correcciones del usuario reconsultan hechos; no se negocia con el turno anterior.

## 3. Fuera de alcance

- Tools en `POST /v1/responses`.
- Cambiar el layout del PDF. `period` derivado MUST coincidir con el formato de impresión.
- Evals LLM end-to-end (los tests unitarios del motor de hechos cubren FR 11 para este fallo).

## 4. Modelo temporal

### RF-FA-01 — `CvDate`

`{ year: number, month?: 1–12 }`. Sin mes: inicio = enero, fin = diciembre; si ambos extremos son solo año, la duración es inclusiva (2023–2025 = 36 meses).

### RF-FA-02 — Derivados

`period`, `durationMonths` y `durationLabel` se hidratan. No se persisten en la fuente. El prompt MUST incluir la duración en cada empleo y proyecto.

## 5. Permanencia

### RF-FA-03 — Por empresa

`kind: "employment"` si hay `experienceIds`; si no, `kind: "project"` desde los proyectos enlazados.

`highlights.longestCompany` MUST ser el employment de más meses. `longestRole` es el puesto individual más largo.

Cerocatorce (jun 2019 – jul 2024) MUST ganar a Chequemotiva. Welfare MUST ser el rol más largo. Nunca fusionar slugs distintos.

### RF-FA-04 — Relacionadas

`group` y `relatedSlugs` declaran empleadores o clientes distintos. El resultado de la consulta MUST advertir que no se fusionen periodos.

## 6. Tool y API

### RF-FA-05 — `query_profile`

Parámetros: `intent` (`experience` \| `company_tenure` \| `projects` \| `skills`), `company?`, `technology?`, `focus?`, `sort?`.

El prompt del canal **chat** (`agentPrompt("chat")`) SHALL ordenar llamarla para duraciones, comparaciones, filtros y cuando el usuario corrija un hecho. Tras el resultado, copiar `facts`, `notes` y `highlights`.

El prompt del canal **integración** (`POST /v1/responses`) MUST NOT ordenar `query_profile`: no hay tools. MUST copiar `period`, `durationLabel` y `highlights` ya inyectados.

`BuiltInAgent` MUST usar `maxSteps` > 1 (p. ej. 8). Con el default (`1`) un primer turno que solo llama la tool termina el run sin texto y el chat queda vacío.

`technology` en `experience` cruza `technologies[]` y la evidencia de skills.

### RF-FA-06 — HTTP

`GET /api/profile/query` (misma `INTERNAL_API_KEY`) ejecuta el mismo motor.

`GET /api/cv/experience` incluye `byCompany` y `highlights`.

`GET /api/companies/{slug}` hidrata periodo, duración y `related`.

## 7. Criterios de aceptación

- [ ] «Dónde duró más» → Cerocatorce, jun 2019 – jul 2024, 5 años y 1 mes.
- [ ] «Cuánto en Cerocatorce» no termina en 2026 ni mezcla Chequemotiva.
- [ ] El rol más largo es Welfare, no Chequemotiva.
- [ ] `pnpm test` cubre fechas, agregación, filtros y el prompt.

## 8. Trazabilidad

| Requisito | Implementación |
| --- | --- |
| RF-FA-01 … 02 | `src/domain/dates.ts`, `src/domain/hydrate.ts`, `src/data/cv.ts` |
| RF-FA-03 … 04 | `src/domain/tenure.ts`, `src/data/companies.ts` |
| RF-FA-05 … 06 | `src/domain/query-profile.ts`, `src/application/profile.ts`, `src/adapters/agent/query-profile-tool.ts`, `src/app/api/profile/query/route.ts` |
| Prompt | `src/application/agent.ts`, `src/application/prompt.ts` |

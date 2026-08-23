# Spec: A2UI (RadarChart, Timeline) y ficha de empresas

| Campo | Valor |
| --- | --- |
| ID | `SPEC-A2UI-001` |
| Estado | Implementado |
| Feature | Superficies A2UI + tool de empresas |
| Dueño | cv-llm |
| Relacionado | `SPEC-UI-001` RF-UI-14, `.cursor/functional-requierements.md` (FR 3, 9) |

Este documento es la fuente de verdad de las superficies visuales del chat y de la consulta de empresas. Si el comportamiento diverge, se actualiza primero el spec y después la implementación.

## 1. Contexto

El chat ya responde en texto. Para habilidades y trayectoria conviene una UI declarativa (A2UI). Para el contexto de las empresas del CV, el prompt no debe inflarse con fichas: esa información se pide bajo demanda.

## 2. Objetivos

- El agente puede emitir un **RadarChart** de skills y un **Timeline** de trayectoria vía A2UI.
- El visitante tiene pastillas de ejemplo que piden esas superficies.
- Existe una API de fichas de empresas y una tool que las lee.
- La tool solo se usa si el usuario nombra una empresa concreta.

## 3. Fuera de alcance

- Añadir RadarChart o Timeline al PDF del CV.
- Exponer la tool en `POST /v1/responses` (`SPEC-OR-001` deja tools fuera del canal de integración).
- Inventar métricas, clientes o hechos de empresa que no estén en esta ficha o en el CV.

## 4. Catálogo A2UI

### RF-A2-01 — Activación

`CopilotKit` SHALL recibir `a2ui.catalog` con `catalogId: "cv-llm-catalog"` e `includeBasicCatalog: true`.

El runtime SHALL activar el middleware A2UI y **no** inyectar `generate_a2ui` (`a2ui: { injectA2UITool: false, agents: ["default"] }`). BuiltInAgent no completa ese subagente y el chat se queda en “Building interface”.

`BuiltInAgent` MUST declarar `maxSteps` > 1. Radar/timeline se ven igual con 1 paso (la tool pinta la superficie), pero `lookup_company` y `query_profile` necesitan un segundo paso de texto. Sin eso el primer turno queda en blanco. Ver `SPEC-CV-003`.

Las superficies salen de tools propias que devuelven `{ a2ui_operations: [...] }`:

| Tool | Superficie |
| --- | --- |
| `show_skills_radar` | RadarChart con skills del perfil |
| `show_career_timeline` | Timeline con empleos del perfil |

### RF-A2-02 — RadarChart

Componente custom. Props:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `title` | string | Título del gráfico |
| `description` | string, opcional | Pie o contexto |
| `max` | number, default 5 | Escala (alineada a `skill.level`) |
| `data` | `{ label: string, value: number }[]` | Ejes del radar |

El agente MUST usar los `name` y `level` del perfil (`skill:<nombre>`). Si hay más de 8 skills, MAY acotar a las pedidas o a las de mayor nivel.

### RF-A2-03 — Timeline

Componente custom. Props:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `title` | string | Título |
| `description` | string, opcional | Contexto |
| `items` | `{ title, subtitle?, period, description? }[]` | Hitos |

Para trayectoria laboral, cada ítem MUST mapear un empleo: `title` = puesto, `subtitle` = empresa, `period` = periodo. Orden: más reciente primero. Cita `experience:<id>`.

## 5. Instrucciones de ejemplo

### RF-A2-04 — Pastillas

`src/data/chat-suggestions.ts` SHALL incluir, además de las de `SPEC-UI-001`:

| `title` | `message` |
| --- | --- |
| `Radar de habilidades` | `Muéstrame un gráfico radar con las habilidades técnicas de Alejandro y su nivel.` |
| `Línea de tiempo` | `Muéstrame la trayectoria profesional de Alejandro en una línea de tiempo, del rol más reciente al más antiguo.` |
| `¿Qué es Chequemotiva?` | `Cuéntame más sobre Chequemotiva, una de las empresas en las que colaboró Alejandro.` |
| `¿Dónde ha durado más?` | Distingue permanencia por empresa y el rol individual más largo (`SPEC-CV-003`). |
| `Cambia el color a azul` | `Cambia el color de acento del CV a azul.` (`SPEC-UI-001` RF-UI-15) |

La pastilla de Chequemotiva nombra una empresa a propósito: es el camino de demo de la tool.

## 6. API y tool de empresas

### RF-A2-05 — Directorio

Las fichas viven en `src/data/companies.ts`. Cada ficha:

| Campo | Uso |
| --- | --- |
| `slug` | ID estable; cita `company:<slug>` |
| `name` | Nombre canónico |
| `aliases` | Nombres con los que el usuario puede preguntar |
| `country`, `sector` | Contexto público |
| `summary` | Hechos públicos de la organización, no del candidato |
| `website` | Opcional |
| `collaboration` | Roles e IDs de experience/project. Periodo y duración se derivan |
| `group`, `relatedSlugs` | Empleadores o clientes distintos (p. ej. Grupo 014). No fusionar permanencia |

El prompt del agente MUST listar solo nombres y aliases, no el `summary`.

### RF-A2-06 — HTTP

Con `INTERNAL_API_KEY` (mismo contrato que `/api/cv`):

- `GET /api/companies` → `{ companies: [{ slug, name, country, sector }] }` (sin `summary`)
- `GET /api/companies/{slug}` → ficha completa, o `404` con `available` si no existe

Sin clave: `401` / `invalid_api_key`. Sin `INTERNAL_API_KEY` configurada: `503`.

### RF-A2-07 — Tool `lookup_company`

`BuiltInAgent` SHALL registrar `lookup_company` con parámetro `company` (nombre, slug o alias).

La tool MUST:

- Resolver contra el directorio (no inventar fichas).
- Devolver `{ found: true, company }` o `{ found: false, reason, available }`.
- Usar el mismo lookup que la API (sin HTTP interno).

### RF-A2-08 — Guardrail de invocación

El prompt SHALL ordenar:

1. Llamar `lookup_company` **solo** si el usuario pregunta de forma explícita por una empresa u organización concreta (nombre o alias: “qué es X”, “háblame de X”, “en qué consiste X”).
2. **No** llamarla al listar experiencia, comparar roles, explicar skills o proyectos, ni ante “¿dónde ha trabajado?”, duraciones o “¿dónde duró más?”. Eso es `query_profile` (`SPEC-CV-003`).
3. Si no hay ficha, decirlo y no rellenar el hueco.
4. Tras un hit, citar `company:<slug>` y no contradecir el CV ni la permanencia derivada.

## 7. Criterios de aceptación

- [ ] El estado vacío del chat muestra las pastillas de RadarChart, Timeline y Chequemotiva.
- [ ] El catálogo A2UI incluye `RadarChart` y `Timeline`.
- [ ] `GET /api/companies` sin key → 401; con key → lista sin `summary`.
- [ ] `GET /api/companies/chequemotiva` con key → 200 y `slug: "chequemotiva"`.
- [ ] `lookup_company("Chequemotiva")` encuentra la ficha; `lookup_company("Google")` no.
- [ ] El prompt nombra las empresas y prohíbe llamar la tool salvo pregunta explícita.

## 8. Trazabilidad

| Requisito | Implementación |
| --- | --- |
| RF-A2-01 … 03 | `src/components/a2ui/*`, `src/lib/a2ui-surfaces.ts`, `src/lib/a2ui-tools.ts`, `src/components/copilot-provider.tsx`, `src/app/api/copilotkit/[[...slug]]/route.ts` |
| RF-A2-04 | `src/data/chat-suggestions.ts` |
| RF-A2-05 … 07 | `src/data/companies.ts`, `src/lib/lookup-company.ts`, `src/lib/company-tool.ts`, `src/app/api/companies/**` |
| RF-A2-08 | `src/lib/cv-prompt.ts` |

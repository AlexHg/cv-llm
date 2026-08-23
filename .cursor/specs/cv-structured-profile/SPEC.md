# Spec: perfil estructurado para el agente

| Campo | Valor |
| --- | --- |
| ID | `SPEC-CV-002` |
| Estado | Implementado |
| Feature | Datos citables del CV (FR 1–4, 7, 8, 10) |
| Dueño | cv-llm |
| Relacionado | `.cursor/functional-requierements.md` (FR 1–4, 7, 8, 10), `SPEC-UI-001`, `SPEC-OR-001` |

Este documento es la fuente de verdad del modelo de datos del agente. El PDF (`SPEC-UI-001`) sigue mostrando solo los campos de impresión. Si el contrato diverge, se actualiza primero este spec.

## 1. Contexto

El preview y el prompt ya leen un CV estructurado, pero cada empleo y proyecto era un párrafo. El agente no podía citar responsabilidades, logros, evidencia de un skill ni decir con precisión qué no está en el perfil (p. ej. certificaciones).

## 2. Problema

Sin campos citables:

- FR 1–4 se resuelven por inferencia sobre prosa, no por hechos.
- FR 7 (no inventar) y FR 10 (origen) no tienen IDs que el prompt pueda exigir.
- Las tools futuras (`SPEC` siguiente) no tendrían bloques filtrables.

## 3. Objetivos

- Separar **impresión** (párrafo, barras, keywords) de **narrativa de agente** (listas e IDs).
- Cubrir roles buscados, fortalezas, intereses, responsabilidades, logros, stack, enfoques, evidencia de skills, y ficha de proyecto.
- Dejar explícito lo ausente (`certificaciones: []`, `learnings: []`) para no alucinar.
- No inventar empleos, métricas, certificaciones ni tecnologías que no estén ya en el CV.

## 4. Fuera de alcance

- Tools del agente, evals, observabilidad (siguientes specs).
- Cambiar el layout o el copy visible del PDF.
- Volver a los overrides por perfil (`cloud` / `fullstack` / …). El preview y el prompt usan un solo CV.
- Inventar aprendizajes o retos que el texto original no respalde.

## 5. Campos de impresión (sin cambio visual)

Siguen siendo la fuente del PDF y de las tarjetas:

| Entidad | Campos de UI |
| --- | --- |
| Identidad | `firstName`, `lastName`, `headline`, `photo` |
| About | `about` |
| Experiencia | `title`, `company`, `period`, `description`, `page` |
| Skills | `name`, `level` |
| Proyectos | `title`, `meta`, `description`, `keywords` |

## 6. Campos de agente

### RF-CV-01 — Posicionamiento (FR 1)

`identity` SHALL incluir:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `rolesSought` | `string[]` | Roles que el candidato busca |
| `strengths` | `string[]` | Fortalezas principales |
| `interests` | `string[]` | Áreas de interés |
| `certifications` | `string[]` | Vacío si no hay certificaciones en el perfil |

Cita: `identity`.

### RF-CV-02 — Experiencia (FR 2)

Cada ítem de `experience` SHALL añadir:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `responsibilities` | `string[]` | Responsabilidades |
| `achievements` | `string[]` | Logros / resultados declarados |
| `technologies` | `string[]` | Stack citado en ese rol |
| `focuses` | `ExperienceFocus[]` | `technical` \| `leadership` \| `genai` \| `business` |

Cita: `experience:<id>`.

`technologies` MUST salir del texto o keywords ya existentes de ese rol. Si el párrafo no nombra stack, el arreglo queda vacío.

### RF-CV-03 — Skills (FR 3)

Cada skill SHALL añadir `evidence: CvSourceRef[]`:

```ts
{ kind: "experience" | "project"; id: string; how: string }
```

Si no hay mención en empleos o proyectos, `evidence` SHALL ser `[]`.

Cita: `skill:<name>`.

### RF-CV-04 — Competencias profesionales (FR 3)

Nuevo bloque API `competencies`:

| Campo | Tipo |
| --- | --- |
| `id` | `leadership` \| `collaboration` \| `mentoring` \| `communication` |
| `name` | string |
| `how` | string |
| `sources` | `CvSourceRef[]` (sin `how` por fuente; el texto va en `how` del competency) |

Cita: `competency:<id>`.

### RF-CV-05 — Proyectos (FR 4)

Cada proyecto SHALL añadir:

| Campo | Tipo |
| --- | --- |
| `problem` | string |
| `role` | string |
| `architecture` | string |
| `challenges` | `string[]` |
| `results` | `string[]` |
| `learnings` | `string[]` |

Cita: `project:<id>`.

`learnings` MAY estar vacío. `challenges` y `results` MUST parafrasear el texto existente, no añadir métricas.

### RF-CV-06 — API

`GET /api/cv` y `GET /api/cv/{block}` SHALL devolver los campos nuevos en el bloque correspondiente.

Bloques: los de `SPEC-OR-001` más `competencies`.

Campos de impresión existentes MUST seguir presentes (compatibilidad).

### RF-CV-07 — Prompt

`cvToAgentPrompt` SHALL inyectar posicionamiento, experiencia estructurada, competencias, evidencia de skills y ficha de proyecto.

El prompt SHALL:

- Exigir IDs de cita cuando se afirme un hecho.
- Tratar arreglos vacíos como “no consta en el perfil”.
- Prohibir inventar certificaciones, empleos, logros o tecnologías.

## 7. Criterios de aceptación

- [ ] El PDF no cambia de estructura ni de párrafos visibles.
- [ ] `GET /api/cv/identity` incluye `rolesSought`, `strengths`, `interests`, `certifications`.
- [ ] `GET /api/cv/experience` incluye `responsibilities`, `achievements`, `technologies`, `focuses`.
- [ ] `GET /api/cv/skills` incluye `evidence`.
- [ ] `GET /api/cv/projects` incluye `problem`, `role`, `architecture`, `challenges`, `results`, `learnings`.
- [ ] `GET /api/cv/competencies` → 200; un id inexistente sigue en 404 con la lista de bloques.
- [ ] `certifications` está vacío y el prompt lo declara como no disponible.
- [ ] El prompt del agente lista IDs `experience:`, `project:`, `skill:`, `competency:`.

## 8. Trazabilidad

| Requisito | Implementación |
| --- | --- |
| RF-CV-01 … 05 | `src/data/types.ts`, `src/data/cv.ts` |
| RF-CV-06 | `src/data/resolve-cv.ts`, `src/app/api/cv/[block]/route.ts` |
| RF-CV-07 | `src/lib/cv-prompt.ts` |

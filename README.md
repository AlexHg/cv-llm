# cv-llm

Agente conversacional para explorar un perfil profesional, construido con Next.js, CopilotKit y [Open Responses](https://www.openresponses.org/).

## Requisitos

- Node.js 20+
- Un endpoint Open Responses (OpenAI u otro compatible)
- Una API key interna para que otros sistemas llamen a este agente

## Configuración

1. Copia las variables de entorno:

```bash
cp .env.example .env
```

2. Completa `.env`:

```
OPEN_RESPONSES_URL=https://api.openai.com/v1/responses
OPEN_RESPONSES_API_KEY=sk-...
OPEN_RESPONSES_MODEL=gpt-4o-mini
INTERNAL_API_KEY=un_secreto_largo_y_aleatorio
```

3. Instala dependencias (si aún no lo has hecho) y arranca el servidor:

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). El chat de CopilotKit aparece en el lateral derecho.

## Integración Open Responses

Contratos: [Open Responses](.cursor/specs/open-responses/SPEC.md) (`SPEC-OR-001`), [interfaz CopilotKit + CV](.cursor/specs/copilot-ui/SPEC.md) (`SPEC-UI-001`), [perfil estructurado](.cursor/specs/cv-structured-profile/SPEC.md) (`SPEC-CV-002`), [hechos temporales](.cursor/specs/cv-facts/SPEC.md) (`SPEC-CV-003`), [A2UI y fichas de empresa](.cursor/specs/a2ui-company-tools/SPEC.md) (`SPEC-A2UI-001`).

Otros sistemas pueden hablar con el agente en `POST /v1/responses`, con `Authorization: Bearer $INTERNAL_API_KEY`.

```bash
curl -s http://localhost:3000/v1/responses \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cv-cloud",
    "input": "¿Qué experiencia tiene Alejandro en cloud?"
  }'
```

El perfil se elige con `model` (`cv-cloud`, `cv-fullstack`, `cv-techlead`, `cv-genai`, `cv-devops`), `metadata.profile` o `?profile=cloud`.

La API estructurada del CV (`/api/cv` y `/api/cv/:block`), la de empresas (`/api/companies`, `/api/companies/:slug`) y la de hechos (`/api/profile/query`) usan la misma API key. En el chat, las fichas no van en el prompt: se piden con `lookup_company` solo si el usuario pregunta qué es una empresa. Duraciones y comparaciones van por `query_profile` (el código calcula; el modelo no resta). `POST /v1/responses` no expone tools: el prompt de ese canal incluye las fichas y prohíbe restar fechas.

## Stack

- Next.js (App Router)
- CopilotKit (`@copilotkit/react-core`, `@copilotkit/runtime`)
- Runtime en `/api/copilotkit` con `BuiltInAgent` sobre Open Responses, A2UI (`RadarChart`, `Timeline`) y tools `query_profile` / `lookup_company`
- Endpoint Open Responses en `/v1/responses`

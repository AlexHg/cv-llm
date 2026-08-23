# Spec: agente de CV compatible con Open Responses

| Campo | Valor |
| --- | --- |
| ID | `SPEC-OR-001` |
| Estado | Implementado |
| Feature | Integración Open Responses + API key interna |
| Dueño | cv-llm |
| Protocolo | [Open Responses](https://www.openresponses.org/specification) |
| Relacionado | `.cursor/description.md` (capacidad de integración, seguridad), `.cursor/functional-requierements.md` (FR 8, 9, 11) |

Este documento es la fuente de verdad del feature. El código debe satisfacer estos requisitos; si el comportamiento diverge, se actualiza primero el spec y después la implementación.

## 1. Contexto

El agente de CV ya conversa en la UI mediante CopilotKit. El reto exige además **capacidad de integración** y **seguridad**: otros sistemas (evaluadores, orquestadores, agentes) deben poder hablar con este agente usando un protocolo estándar, no el runtime propietario de la UI.

Open Responses es una especificación abierta basada en la Responses API. Un cliente compatible envía `POST` a `/v1/responses` con `Authorization` y un cuerpo JSON (`model`, `input`, `stream`, …).

Este sistema cumple dos roles:

1. **Servidor Open Responses**: expone el agente de CV para consumidores externos.
2. **Cliente Open Responses**: CopilotKit genera texto contra un backend compatible (`OPEN_RESPONSES_URL`).

## 2. Problema

Sin un contrato HTTP estándar:

- Un sistema externo no puede evaluar ni orquestar el agente sin acoplarse a CopilotKit.
- No hay un secreto de máquina a máquina; cualquiera que alcance `/api/cv` lee el perfil estructurado.
- El runtime de la UI y el canal de integración no comparten el mismo protocolo de modelo.

## 3. Objetivos

- Exponer el agente de CV en `POST /v1/responses` conforme a Open Responses.
- Autenticar consumidores externos con `INTERNAL_API_KEY`.
- Inyectar siempre el prompt del perfil estructurado para no inventar hechos.
- Reutilizar el mismo backend Open Responses en la UI (CopilotKit).
- Proteger la API estructurada del CV con la misma clave interna.

## 4. Fuera de alcance

- Transporte WebSocket de Open Responses.
- `GET /v1/responses/{id}`, `store=true` persistido en este servicio y `background=true`.
- Exponer `INTERNAL_API_KEY` al navegador o proteger `/api/copilotkit` (es el canal de la UI).
- Herramientas (`tools`) propias del agente en el endpoint de integración.
- Autenticación de usuarios finales (OAuth, sesiones).

## 5. Actores

| Actor | Autenticación | Canal |
| --- | --- | --- |
| Humano en el navegador | Ninguna (UI) | CopilotKit → `/api/copilotkit` |
| Sistema externo (evaluador, agente, CI) | `INTERNAL_API_KEY` | `POST /v1/responses` |
| Sistema externo que lee el CV estructurado | `INTERNAL_API_KEY` | `GET /api/cv`, `GET /api/cv/{block}` |
| Backend LLM | `OPEN_RESPONSES_API_KEY` | `OPEN_RESPONSES_URL` |

## 6. Requisitos funcionales

### RF-OR-01 — Endpoint canónico

El servicio SHALL exponer `POST /v1/responses` (no `/api/v1/responses`). SHALL aceptar `OPTIONS` y responder `204` con cabeceras CORS.

### RF-OR-02 — Autenticación de consumidores

Toda petición a `POST /v1/responses`, `GET /api/cv` y `GET /api/cv/{block}` SHALL exigir `INTERNAL_API_KEY`.

La clave se acepta en:

- `Authorization: Bearer <INTERNAL_API_KEY>`
- `x-api-key: <INTERNAL_API_KEY>`

La comparación SHALL ser resistente a timing (`timingSafeEqual`).

| Condición | Status | `error.code` |
| --- | --- | --- |
| `INTERNAL_API_KEY` no configurada | 503 | `api_key_not_configured` |
| Clave ausente o distinta | 401 | `invalid_api_key` |

`/api/copilotkit` MUST NOT exigir esta clave.

### RF-OR-03 — Contrato de error Open Responses

Los errores del endpoint de integración SHALL usar:

```json
{
  "error": {
    "message": "string",
    "type": "string",
    "param": "string",
    "code": "string"
  }
}
```

Tipos usados: `invalid_request_error`, `server_error`.

### RF-OR-04 — Validación de entrada

- Cuerpo no JSON o no objeto → `400` / `invalid_request`.
- `input` ausente y sin `previous_response_id` → `400` / `invalid_request`, `param: "input"`.
- `input` MAY ser `string` o arreglo de items Open Responses.
- Si hay `previous_response_id` y no hay `input`, el servicio SHALL enviar `input: []` al backend.

### RF-OR-05 — Instrucciones del agente

Antes de llamar al backend, el servicio SHALL construir `instructions` con `cvToAgentPrompt(resolveCv(profile))`.

Si el cliente envía `instructions`, SHALL concatenarse **después** del prompt del CV. El prompt del CV no se sustituye.

El agente MUST usar solo hechos del perfil estructurado (alineado con FR 7 de `.cursor/functional-requierements.md`).

### RF-OR-06 — Resolución de perfil

Perfiles válidos: `cloud`, `fullstack`, `techlead`, `genai`, `devops`. Default: `cloud`.

Orden de precedencia (el primero válido gana):

1. `metadata.profile`
2. query `?profile=`
3. `model` con prefijo `cv-` (`cv-cloud` → `cloud`)
4. default `cloud`

### RF-OR-07 — Modelo enviado al backend

| `model` del cliente | Modelo hacia el backend |
| --- | --- |
| ausente, `cv` o `cv-{perfil}` | `OPEN_RESPONSES_MODEL` |

### RF-OR-08 — Reenvío al backend Open Responses

El servicio SHALL hacer `POST` a `OPEN_RESPONSES_URL` (normalizada a `…/v1/responses`) con `Authorization: Bearer` del backend.

- Sin key de backend → `503` / `backend_not_configured`.
- Fallo de red o excepción → `502` / `backend_error`.
- `401` del backend SHALL mapearse a `502` (no se confunde con la key interna).

El `Authorization` del cliente NUNCA se reenvía al backend.

### RF-OR-09 — Respuesta síncrona

Si `stream` no es `true`, la respuesta SHALL ser `application/json` con un objeto `response` Open Responses (`id`, `object: "response"`, `status`, `output`, …).

### RF-OR-10 — Streaming

Si `stream === true` y el backend responde bien:

- `Content-Type: text/event-stream`
- eventos semánticos Open Responses (`response.created`, `response.output_text.delta`, `response.completed`, …)
- el stream SHALL terminar con `data: [DONE]`
- cabeceras: `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no`

### RF-OR-11 — CORS

`POST /v1/responses` y `OPTIONS` SHALL incluir:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type, x-api-key
Access-Control-Allow-Methods: POST, OPTIONS
```

Las respuestas 401/400/5xx del endpoint de integración también MUST llevar estas cabeceras.

### RF-OR-12 — UI sobre Open Responses

`BuiltInAgent` SHALL usar un `LanguageModel` creado con `@ai-sdk/open-responses` (`createOpenResponses`) contra `OPEN_RESPONSES_URL`.

La UI MUST NOT caer a un proveedor `openai:` ni leer `OPENAI_API_KEY`.

La UI sigue usando el prompt del perfil Cloud por defecto.

### RF-OR-13 — API estructurada del CV

Con autenticación válida:

- `GET /api/cv` → `{ block: "cv", profile, data }`
- `GET /api/cv/{block}` → el bloque pedido, o `404` con la lista de bloques si no existe
- El listado de bloques incluye `competencies` (`SPEC-CV-002`)

`profile` se lee de `?profile=` (default `cloud`).

## 7. Requisitos no funcionales

| ID | Requisito |
| --- | --- |
| RNF-OR-01 | La key interna vive solo en el entorno del servidor. No se commitea. |
| RNF-OR-02 | El timeout del route de integración es de al menos 60 s (`maxDuration`). |
| RNF-OR-03 | Un cliente Open Responses estándar (`@ai-sdk/open-responses`, `curl`, SDK Responses) MUST poder consumir `POST /v1/responses`. |
| RNF-OR-04 | No se registran keys ni el prompt completo en logs de aplicación. |

## 8. Contrato HTTP

### 8.1 `POST /v1/responses`

**Request**

```http
POST /v1/responses HTTP/1.1
Authorization: Bearer <INTERNAL_API_KEY>
Content-Type: application/json
```

```json
{
  "model": "cv-cloud",
  "input": "¿Qué experiencia tiene Alejandro en cloud?",
  "stream": false,
  "instructions": "Responde en una frase.",
  "metadata": { "profile": "cloud" },
  "previous_response_id": null
}
```

`input` también MAY ser:

```json
{
  "input": [
    {
      "type": "message",
      "role": "user",
      "content": "¿Qué experiencia tiene Alejandro en cloud?"
    }
  ]
}
```

**Response 200 (síncrona)**

```json
{
  "id": "resp_…",
  "object": "response",
  "status": "completed",
  "model": "gpt-4o-mini-2024-07-18",
  "output": [
    {
      "id": "msg_…",
      "type": "message",
      "role": "assistant",
      "status": "completed",
      "content": [
        { "type": "output_text", "text": "…" }
      ]
    }
  ]
}
```

**Response 200 (stream)**

```
event: response.created
data: {"type":"response.created","sequence_number":0,"response":{…}}

event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"…",…}

event: response.completed
data: {"type":"response.completed","sequence_number":n,"response":{…}}

data: [DONE]
```

### 8.2 Variables de entorno

| Variable | Rol | Obligatoria |
| --- | --- | --- |
| `INTERNAL_API_KEY` | Autenticación inbound | Sí, para integración |
| `OPEN_RESPONSES_URL` | URL del `POST` del backend (o base; se normaliza) | No (default OpenAI) |
| `OPEN_RESPONSES_API_KEY` | Bearer hacia el backend | Sí |
| `OPEN_RESPONSES_MODEL` | Modelo por defecto | No (`gpt-4o-mini`) |

Documentadas en `.env.example`. Los secretos reales solo en `.env` (gitignored).

## 9. Decisiones de diseño

| Decisión | Alternativa descartada | Por qué |
| --- | --- | --- |
| Servir el spec path `/v1/responses` | `/api/v1/responses` | Los clientes Open Responses esperan el path canónico. |
| Reenviar al backend Open Responses | Reimplementar el state machine localmente | Menos deriva respecto al spec; streaming y `usage` los resuelve el backend. |
| Inyectar el prompt del CV en el servidor de integración | Confiar en el `instructions` del cliente | Guardrail: un consumidor no puede vaciar el contexto del perfil. |
| Key interna distinta de la del LLM | Reutilizar `OPEN_RESPONSES_API_KEY` | Separación de secretos: inbound vs outbound. |
| No autenticar CopilotKit con la key interna | Misma key en el browser | Expondría el secreto. La UI no es un consumidor máquina. |
| Comparación timing-safe | `===` | Evita filtrar la key por tiempo de respuesta. |
| `401` del backend → `502` | Reenviar `401` | El cliente debe distinguir “mi key es inválida” de “el modelo falló”. |

## 10. Criterios de aceptación

Un revisor puede marcar el feature como cumplido si:

- [ ] `OPTIONS /v1/responses` → `204` con CORS.
- [ ] `POST /v1/responses` sin key o con key incorrecta → `401` / `invalid_api_key`.
- [ ] `POST /v1/responses` con JSON inválido y key válida → `400` / `invalid_request`.
- [ ] `POST /v1/responses` sin `input` ni `previous_response_id` → `400`, `param: "input"`.
- [ ] `POST /v1/responses` autenticado con `input` en texto pregunta el titular del perfil Cloud y `output[0].content` menciona el headline del CV (sin inventar empleos).
- [ ] `stream: true` entrega `text/event-stream`, al menos un `response.output_text.delta` y termina en `data: [DONE]`.
- [ ] `GET /api/cv` sin key → `401`; con key → `200` y `block: "cv"`.
- [ ] `GET /api/cv/identity?profile=genai` con `x-api-key` → `profile: "genai"`.
- [ ] `GET /api/copilotkit/info` → `200` sin `INTERNAL_API_KEY`.
- [ ] CopilotKit instancia el modelo vía `createOpenResponses`. 
- [ ] `.env.example` declara `INTERNAL_API_KEY` y las variables Open Responses. `.env` no se versiona.

## 11. Trazabilidad

| Requisito | Implementación |
| --- | --- |
| RF-OR-01, 09, 10, 11 | `src/app/v1/responses/route.ts` |
| RF-OR-02, RNF-OR-01 | `src/lib/internal-auth.ts` |
| RF-OR-03 … RF-OR-08 | `src/lib/open-responses.ts` |
| RF-OR-05 (prompt) | `src/lib/cv-prompt.ts`, `src/data/resolve-cv.ts` |
| RF-OR-12 | `src/app/api/copilotkit/[[...slug]]/route.ts` |
| RF-OR-13 | `src/app/api/cv/route.ts`, `src/app/api/cv/[block]/route.ts` |
| RNF-OR-03 (cliente) | `@ai-sdk/open-responses` |
| Contrato de entorno | `.env.example`, `README.md` |

## 12. Ejemplo de consumidor

```bash
curl -s "$APP_URL/v1/responses" \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cv-cloud",
    "input": "¿Qué experiencia tiene Alejandro en cloud?"
  }'
```

Un cliente AI SDK:

```ts
import { createOpenResponses } from "@ai-sdk/open-responses";
import { generateText } from "ai";

const cvAgent = createOpenResponses({
  name: "cv-llm",
  url: `${process.env.APP_URL}/v1/responses`,
  apiKey: process.env.INTERNAL_API_KEY,
});

const { text } = await generateText({
  model: cvAgent("cv-cloud"),
  prompt: "¿Qué experiencia tiene Alejandro en cloud?",
});
```

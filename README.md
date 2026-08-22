# cv-llm

Agente conversacional para explorar un perfil profesional, construido con Next.js y CopilotKit.

## Requisitos

- Node.js 20+
- Una API key de OpenAI

## Configuración

1. Copia las variables de entorno:

```bash
cp .env.example .env.local
```

2. Añade tu clave en `.env.local`:

```
OPENAI_API_KEY=sk-...
```

3. Instala dependencias (si aún no lo has hecho) y arranca el servidor:

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). El chat de CopilotKit aparece en el lateral derecho.

## Stack

- Next.js (App Router)
- CopilotKit (`@copilotkit/react-core`, `@copilotkit/runtime`)
- Runtime en `/api/copilotkit` con `BuiltInAgent`

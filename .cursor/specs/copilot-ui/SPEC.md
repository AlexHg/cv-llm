# Spec: interfaz gráfica del agente (CopilotKit + CV)

| Campo | Valor |
| --- | --- |
| ID | `SPEC-UI-001` |
| Estado | Implementado |
| Feature | Interfaz de CV imprimible y chat CopilotKit |
| Dueño | cv-llm |
| Referencia visual | [`.cursor/specs/copilot-ui/curriculum-example.pdf`](./curriculum-example.pdf) |
| Relacionado | `.cursor/functional-requierements.md` (FR 1–6, 8), `SPEC-OR-001` |

Este documento es la fuente de verdad de la UI. El código debe satisfacer estos requisitos; si el comportamiento diverge, se actualiza primero el spec y después la implementación.

La referencia visual del CV es `curriculum-example.pdf`: dos páginas A4, acento mostaza, foto recortada, barra de contacto e iconos a la derecha, experiencia a dos columnas.

## 1. Contexto

La aplicación tiene dos superficies en una sola ruta (`/`):

1. **Lienzo del CV** — preview a escala de un PDF de dos páginas.
2. **Agente** — `CopilotChat` de CopilotKit, anclado a `/api/copilotkit`.

El visitante lee el perfil, cambia el color de acento, descarga un PDF fiel al diseño y pregunta al agente sobre el mismo perfil.

## 2. Problema

Sin esta UI:

- El reto solo tendría un chat, sin demostrar diseño conversacional junto a un artefacto profesional.
- No habría forma de exportar el CV con el mismo layout que el PDF de referencia.
- El acento gráfico quedaría fijo; no se podría personalizar ni ver el efecto en la descarga.

## 3. Objetivos

- Reproducir el diseño de `curriculum-example.pdf` en HTML (dos páginas A4).
- Permitir elegir un color de acento y persistirlo.
- Descargar un PDF A4 de las dos páginas, usando el acento actual.
- Conversar con el perfil Cloud mediante CopilotKit, sin API key en el navegador.

## 4. Fuera de alcance

- Editor WYSIWYG del CV o cambio de perfil desde la UI (el preview usa el perfil `cloud`).
- Autenticación de la UI o de `/api/copilotkit`.
- Selector de perfil, idioma o tipografía.
- Impresión nativa del navegador como canal principal de export (existe CSS print, pero el contrato es el botón de descarga).
- Chat embebido dentro de las páginas del PDF.

## 5. Actores

| Actor | Superficie |
| --- | --- |
| Visitante | `/`: preview, selector de color, descarga, chat |
| CopilotKit runtime | `/api/copilotkit` (sin `INTERNAL_API_KEY`) |

## 6. Layout de la aplicación

### RF-UI-01 — Shell

`/` SHALL ser un `main` a altura de viewport (`h-dvh`):

| Viewport | Disposición |
| --- | --- |
| `< lg` | Columna: CV arriba, agente `h-[50vh]` abajo |
| `≥ lg` | Fila: CV `flex-1`, agente fijo `540px` a la derecha |

El documento SHALL estar en `lang="es"`. Título: `Alejandro Hernández — Agente de CV`.

El árbol SHALL envolver la app en `CopilotProvider` (`CopilotKit` con `runtimeUrl="/api/copilotkit"`, `useSingleEndpoint={false}` y catálogo A2UI; `SPEC-A2UI-001`).

### RF-UI-02 — Cabeceras

Ambos paneles SHALL tener una barra de `56px` (`h-14`), fondo `ink` (`#2f3542`), borde inferior.

- **CV**: izquierda = selector de color; derecha = botón de descarga. Clase `no-print` (oculta al imprimir).
- **Agente**: izquierda = título `Curriculum Agent` y subtítulo `Perfil del candidato` en blanco atenuado; derecha = botón para reiniciar la conversación (RF-UI-16).

## 7. Diseño del PDF

La referencia normativa es `curriculum-example.pdf`. El HTML SHALL parecerse a ese PDF en estructura, jerarquía y medidas.

### RF-UI-03 — Página A4

Cada hoja SHALL:

- Tener la clase `.page`.
- Medir **794×1123 px** en pantalla (A4 a 96 dpi) y **210×297 mm** en print.
- Fondo blanco, `overflow: hidden`, padding ≈ `14mm` horizontal y `11mm` superior.
- Escalarse en el lienzo con `transform: scale(...)` sin deformar el layout interno.
- El lienzo (`.cv-canvas`) SHALL ser gris `#e5e7eb` con retícula de puntos. El preview MAY crecer hasta scale `1.18`.

El preview SHALL mostrar **página 1 y página 2**, en ese orden, con separación vertical.

### RF-UI-04 — Sistema tipográfico y color

| Token | Uso |
| --- | --- |
| `--font-head` (Montserrat) | Nombre, títulos de sección, labels, botones de toolbar |
| `--font-body` (Lato) | Cuerpo del CV |
| `--color-ink` `#2f3542` | Texto principal, barras oscuras |
| `--color-mustard` → `var(--cv-accent)` | Acento (default `#f5b81c`) |
| `--color-soft` `#8a8f98` | Texto secundario |
| `--color-body` `#5f6570` | Texto de apoyo, bullets |

Títulos de sección: mayúsculas, ~`19px`, `tracking-[0.18em]`, `font-bold`.

### RF-UI-05 — Página 1 (alineada al PDF)

Debe contener, de arriba a abajo:

1. **Identidad**
   - Nombre: `firstName` light + `lastName` extrabold, ~`40px`, `ink`.
   - Headline en versales, tracking amplio, `soft`.
   - Barra horizontal `ink` bajo el headline (~`350px`).
   - Foto a la derecha, recorte `62mm × 44mm`, `background-size: cover`, `bg-top`.
   - Franja `ink` de `5mm` bajo la foto.
2. **Dos columnas** (`1fr` + `62mm`)
   - Izquierda: `SOBRE MÍ` + texto `about`.
   - Derecha: tarjetas de contacto (teléfono, email, LinkedIn, país).
3. Separador horizontal gris.
4. **Dos columnas**
   - Izquierda: `EXPERIENCIA` + ítems de `experiencePage1`.
   - Derecha: `EDUCACIÓN` (grado, escuela, periodo) y `EXPERTISE` (lista con bullet).

**Tarjeta de contacto** (como el PDF): icono en franja de acento `11mm` + bloque `ink` con label en versales blanco y valor en gris claro.

**Ítem de experiencia**: disco de acento a la izquierda, puesto en `ink`, empresa en acento, periodo en `soft`, descripción debajo.

### RF-UI-06 — Página 2 (alineada al PDF)

1. **Dos columnas**
   - Izquierda: `EXPERIENCIA` + `(CONTINUACIÓN)` en peso medium + `experiencePage2`.
   - Derecha: `HABILIDADES TECH` con barras de 5 segmentos; los segmentos activos usan el acento, los inactivos gris.
2. **Ancho completo**: `PROYECTOS DESTACADOS` — título, meta, descripción, línea `Palabras clave: …`.

### RF-UI-07 — Datos del preview

El preview de `/` SHALL renderizar `resolveCv("cloud")`. El contenido (textos, orden de skills, proyectos) viene del perfil estructurado, no de copy hardcodeado en los componentes de página.

## 8. Selector de colores

### RF-UI-08 — Control

La toolbar del CV SHALL incluir un botón `Color`:

- Pastilla del acento actual, label `Color`, chevron.
- `aria-haspopup`, `aria-expanded`, `aria-controls`.
- Abre un popover de **15 muestras** en grid 5 columnas.
- Cerrar: clic fuera, `Escape`, o al elegir un color.
- La muestra activa SHALL tener `aria-pressed="true"` y anillo `ink`.

Paleta fija (`ACCENT_COLORS`), default `#f5b81c` (mostaza del PDF de referencia):

`#f5b81c` `#f97316` `#ea580c` `#ef4444` `#e11d48` `#ec4899` `#d946ef` `#8b5cf6` `#6366f1` `#3b82f6` `#0ea5e9` `#06b6d4` `#14b8a6` `#10b981` `#84cc16`

### RF-UI-09 — Efecto del acento

Elegir un color SHALL escribir `--cv-accent` en `:root`. Todo `bg-mustard` / `text-mustard` del CV (iconos de contacto, discos de experiencia, empresa, barras de skill) MUST actualizarse al instante.

### RF-UI-10 — Persistencia

El acento SHALL guardarse en `localStorage` bajo `cv-accent`. Al recargar, si el valor está en la paleta, se restaura; si no, default.

### RF-UI-15 — Cambio de color por el chat

El agente SHALL poder cambiar el acento con la frontend tool `set_accent_color`.

- El estado vive en `AccentProvider` (mismo `--cv-accent` y `localStorage` que el botón Color).
- El parámetro `color` MAY ser un nombre (es/en) o un hex de la paleta.
- Si no hay coincidencia, la tool MUST devolver `ok: false` y la lista de nombres; el agente no inventa un color.
- La pastilla de ejemplo `Cambia el color a azul` envía un pedido explícito, sin mencionar tools.

## 9. Botón de descarga

### RF-UI-11 — Control

La toolbar del CV SHALL incluir un botón a la derecha:

| Estado | Texto | Comportamiento |
| --- | --- | --- |
| Idle | `DESCARGAR PDF` + icono de descarga | Dispara la generación |
| Generando | `GENERANDO…`, sin icono, `disabled` | Ignora clics extra |

Estilo: píldora blanca, `h-10`, tracking amplio, hover mostaza.

### RF-UI-12 — PDF generado

La descarga SHALL:

1. Clonar las hojas `.page` fuera de pantalla a **794×1123 px**, sin el `scale` del preview.
2. Rasterizar cada hoja con `html2canvas-pro` (`scale: 2`, fondo `#ffffff`).
3. Componer un **jsPDF A4 portrait**.
4. Incluir **todas** las páginas, en orden.
5. Usar el **acento actual** (el clone hereda `--cv-accent`).
6. Nombrar el archivo `Alejandro-Hernandez-Curriculum-YYYY-MM-DD.pdf`.
7. No incluir la toolbar (`no-print` / el clone solo toma `.page`).
8. Si falla: `alert` y log en consola; el botón vuelve a idle.

## 10. Chat CopilotKit

### RF-UI-13 — Panel

El aside SHALL montar `CopilotChat` a ancho completo del panel, `flex-1`.

Labels en español:

| Campo | Valor |
| --- | --- |
| `modalHeaderTitle` | `Agente de CV` |
| `welcomeMessageText` | `Hola. Pregúntame por el perfil Cloud de Alejandro cuando quieras.` |
| `chatInputPlaceholder` | `Escribe tu pregunta...` |

El chat MUST NOT pedir `INTERNAL_API_KEY`. Las respuestas siguen el prompt del perfil Cloud (`SPEC-OR-001` RF-OR-12). Preguntas ajenas al perfil MUST disculparse y redirigir (FR 12).

### RF-UI-14 — Preguntas de ejemplo

El estado vacío del chat SHALL mostrar pastillas clicables de preguntas de ejemplo.

La lista MUST vivir en `src/data/chat-suggestions.ts`, no en el JSX. Cada ítem:

| Campo | Uso |
| --- | --- |
| `title` | Texto visible en la pastilla |
| `message` | Mensaje que se envía al agente al hacer clic |

Las pastillas SHALL registrarse con `useConfigureSuggestions` (`available: "before-first-message"`). Al elegir una, el chat MUST enviar `message` como primer turno.

Valores por defecto (cubren FR 1–4; las tres últimas, `SPEC-A2UI-001`):

| `title` | `message` |
| --- | --- |
| `Resume el perfil profesional` | `Resume el perfil profesional de Alejandro: roles que busca, fortalezas e intereses.` |
| `¿Qué experiencia tiene en IA?` | `¿Qué experiencia tiene Alejandro con inteligencia artificial generativa? Incluye empresas, responsabilidades y logros.` |
| `¿Cuáles son sus habilidades técnicas?` | `¿Cuáles son las habilidades técnicas más relevantes de Alejandro y en qué experiencia o proyecto las aplicó?` |
| `Cuéntame de los proyectos` | `Cuéntame de los proyectos destacados: problema que resolvían, rol de Alejandro y resultados.` |
| `Radar de habilidades` | `Muéstrame un gráfico radar con las habilidades técnicas de Alejandro y su nivel.` |
| `Línea de tiempo` | `Muéstrame la trayectoria profesional de Alejandro en una línea de tiempo, del rol más reciente al más antiguo.` |
| `¿Qué es Chequemotiva?` | `Cuéntame más sobre Chequemotiva, una de las empresas en las que colaboró Alejandro.` |
| `Cambia el color a azul` | `Cambia el color de acento del CV a azul.` |

Las pastillas extra cubren A2UI, empresas (`SPEC-A2UI-001`) y el cambio de acento (RF-UI-15). El árbol SHALL envolver la app en `CopilotProvider` (catálogo A2UI) en lugar de `CopilotKit` directo.

### RF-UI-16 — Reiniciar conversación

La cabecera del agente SHALL incluir un botón a la derecha:

| Estado | Texto | Comportamiento |
| --- | --- | --- |
| Idle | `Reiniciar` + icono de recarga | Aborta un turno en curso, si lo hay, y abre un hilo nuevo |
| Conversación vacía | Igual, `disabled` | No hace nada: ya está en el estado de bienvenida |

Estilo: píldora blanca, `h-10`, tracking amplio, alineada al botón de descarga del CV.

Al pulsar, el chat MUST:

1. Detener la generación en curso (`abortRun` si `agent.isRunning`).
2. Vaciar los mensajes del agente (`setMessages([])`) **antes** de recargar sugerencias: `before-first-message` solo aplica con `messageCount === 0`.
3. Llamar a `startNewThread()` de `useCopilotChatConfiguration` (UUID nuevo, `hasExplicitThreadId=false`).
4. Llamar a `reloadSuggestions()`: CopilotKit no restaura las pastillas estáticas al cambiar de hilo.

El welcome y las pastillas de RF-UI-14 MUST volver a verse, igual que al cargar `/` por primera vez.

El panel del agente SHALL envolver cabecera y `CopilotChat` en `CopilotChatConfigurationProvider` para que el botón (fuera de `CopilotChat`) comparta el hilo.

## 11. Requisitos no funcionales

| ID | Requisito |
| --- | --- |
| RNF-UI-01 | Tipografías vía `next/font` (Montserrat, Lato). |
| RNF-UI-02 | `html2canvas-pro` y `jspdf` se cargan en el click (no en el bundle inicial). |
| RNF-UI-03 | El preview no rompe el layout al redimensionar (ResizeObserver). |
| RNF-UI-04 | Contraste: texto `ink` sobre blanco; labels blancos sobre `ink`; iconos blancos sobre acento. |
| RNF-UI-05 | El selector y el botón de descarga son usables con teclado (botones nativos, Escape cierra el popover). |

## 12. Decisiones de diseño

| Decisión | Alternativa descartada | Por qué |
| --- | --- | --- |
| HTML a escala A4 + raster a PDF | Solo CSS print o un PDF estático | El visitante ve el mismo artefacto que descarga; el acento se refleja. |
| `curriculum-example.pdf` como referencia | Inventar un layout | Spec visual verificable (foto, columnas, mostaza). |
| Acento vía `--cv-accent` / `mustard` | Clases por color | Un token actualiza preview y PDF. |
| Paleta cerrada de 15 | Color picker libre | Evita acentos ilegibles y mantiene look de marca. |
| CopilotKit a la derecha, no overlay | Modal flotante | El CV y el chat se evalúan juntos. |
| Preview fijo en perfil `cloud` | Switcher de perfiles en UI | El chat da la bienvenida a ese perfil; los demás se exponen por API (`SPEC-OR-001`). |
| Suggestions estáticas en data | Generarlas con el LLM o hardcodearlas en el JSX | Se editan en un solo archivo; el primer mensaje es predecible para la demo. |

## 13. Criterios de aceptación

- [ ] `/` muestra el CV (2 páginas) y el chat CopilotKit.
- [ ] En desktop, el chat queda a la derecha (~540px); en móvil, debajo (~50vh).
- [ ] Página 1: nombre, headline, foto, sobre mí, 4 contactos, experiencia, educación, expertise — misma jerarquía que `curriculum-example.pdf`.
- [ ] Página 2: experiencia (continuación), skill bars de 5 segmentos, proyectos con palabras clave.
- [ ] El botón `Color` abre 15 muestras; al elegir, cambian iconos, discos, empresa y barras de skill.
- [ ] Recargar conserva el acento (`localStorage` `cv-accent`).
- [ ] `DESCARGAR PDF` genera un A4 de 2 páginas con el acento vigente y nombre `Alejandro-Hernandez-Curriculum-YYYY-MM-DD.pdf`.
- [ ] Durante la generación el botón muestra `GENERANDO…` y está deshabilitado.
- [ ] El PDF no incluye la toolbar.
- [ ] El chat muestra el welcome en español y responde sobre el perfil Cloud sin API key en el cliente.
- [ ] Una pregunta ajena al perfil recibe una disculpa y redirige al CV (FR 12).
- [ ] El estado vacío muestra las pastillas de `src/data/chat-suggestions.ts` (perfil, A2UI, Chequemotiva y color). Clic envía `message`.
- [ ] Pedir “cambia el color a azul” actualiza el acento del CV y persiste en `cv-accent`.
- [ ] El header del agente muestra `Reiniciar` a la derecha; al pulsar, el chat vuelve al welcome y a las pastillas. Si no hay mensajes, el botón está deshabilitado.

## 14. Trazabilidad

| Requisito | Implementación |
| --- | --- |
| RF-UI-01 | `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/copilot-provider.tsx` |
| RF-UI-02 | `src/components/cv/cv-panel.tsx`, `src/components/agent-panel.tsx` |
| RF-UI-03, RNF-UI-03 | `src/components/cv/cv-panel.tsx`, `src/app/globals.css` |
| RF-UI-04 | `src/app/layout.tsx`, `src/app/globals.css` |
| RF-UI-05 | `src/components/cv/cv-page-one.tsx`, `cv-contact-card.tsx`, `cv-experience-item.tsx` |
| RF-UI-06 | `src/components/cv/cv-page-two.tsx`, `cv-skill-bar.tsx`, `cv-side-project.tsx` |
| RF-UI-07 | `src/app/page.tsx`, `src/data/resolve-cv.ts` |
| RF-UI-08 … RF-UI-10, RF-UI-15 | `src/components/cv/cv-accent-picker.tsx`, `src/lib/accent.tsx`, `src/components/accent-chat-tool.tsx` |
| RF-UI-11, RF-UI-12 | `src/components/cv/cv-download-button.tsx`, `src/lib/use-pdf-download.ts` |
| RF-UI-13, RF-UI-16 | `src/components/agent-panel.tsx`, `src/components/restart-conversation-button.tsx` |
| RF-UI-14 | `src/data/chat-suggestions.ts`, `src/components/agent-panel.tsx` |
| Referencia visual | `.cursor/specs/copilot-ui/curriculum-example.pdf` |

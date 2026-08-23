Requerimientos funcionales del agente de CV

Specs de features: [Open Responses](./specs/open-responses/SPEC.md) (`SPEC-OR-001`), [Interfaz CopilotKit + CV](./specs/copilot-ui/SPEC.md) (`SPEC-UI-001`).

1. Presentar el perfil profesional 👤
   El agente deberá responder preguntas sobre:

Identidad y resumen profesional.
Especialidad y áreas de interés.
Roles buscados.
Principales fortalezas.
Trayectoria profesional.
Formación académica y certificaciones, si están incluidas en el perfil. 2. Explicar la experiencia laboral 💼
El agente deberá proporcionar información sobre cada experiencia profesional, incluyendo:

Empresa u organización.
Puesto desempeñado.
Periodo o duración.
Responsabilidades principales.
Logros y resultados.
Tecnologías y herramientas utilizadas.
También deberá adaptar la explicación según el contexto, por ejemplo:

Enfoque técnico.
Enfoque de liderazgo.
Enfoque de inteligencia artificial.
Enfoque de impacto de negocio. 3. Describir habilidades y competencias 🧠
El agente deberá identificar y explicar:

Lenguajes de programación.
Frameworks y librerías.
Plataformas cloud.
Bases de datos.
Herramientas de datos e inteligencia artificial.
Conocimientos de arquitectura.
Habilidades de comunicación, liderazgo y colaboración.
Siempre que sea posible, deberá explicar dónde y cómo se aplicó cada habilidad.

4. Conversar sobre proyectos destacados 🚀
   El agente deberá responder preguntas sobre los proyectos del candidato, incluyendo:

Objetivo y contexto.
Problema que resolvía.
Participación y responsabilidades del candidato.
Arquitectura o tecnologías utilizadas.
Retos enfrentados.
Resultados obtenidos.
Aprendizajes principales.
También podrá comparar proyectos o identificar cuál es más relevante para una determinada posición, justificando la respuesta con información del perfil.

5. Mantener el contexto de la conversación 🔄
   El agente deberá:

Comprender preguntas de seguimiento.
Resolver referencias como “ese proyecto” o “esa tecnología”.
Mantener la continuidad entre mensajes.
Recordar información relevante durante la conversación.
Pedir aclaraciones cuando una pregunta sea ambigua.
Ejemplo
Usuario: ¿Qué experiencia tienes con inteligencia artificial?
Usuario: ¿En cuál de esos proyectos tuviste mayor responsabilidad?

El agente deberá comprender que “esos proyectos” se refiere a los proyectos mencionados anteriormente.

6. Adaptar las respuestas al usuario 🎯
   El agente deberá poder cambiar el nivel y enfoque de sus respuestas, por ejemplo:

Generar un resumen ejecutivo.
Dar una explicación técnica detallada.
Preparar una introducción para una entrevista.
Explicar la experiencia a una persona no técnica.
Enfocarse en una tecnología, industria o tipo de rol específico. 7. Evitar respuestas inventadas 🛡️
Cuando la información solicitada no esté disponible en el perfil, el agente deberá:

Indicar claramente que no cuenta con esa información.
Evitar inventar empleos, certificaciones, logros o tecnologías.
Diferenciar entre hechos e inferencias.
Solicitar contexto adicional cuando sea necesario.
Reconocer posibles limitaciones de sus respuestas.
Este comportamiento permite demostrar criterio en confiabilidad, guardrails y seguridad.

8. Consultar información estructurada del perfil 🗂️
   El agente deberá utilizar una fuente de información consistente sobre el candidato, como:

CV estructurado.
Portafolio profesional.
Descripciones de proyectos.
Repositorios seleccionados.
Documentos complementarios.
La información debería poder actualizarse sin tener que reconstruir todo el agente.

9. Utilizar herramientas cuando aporten valor 🔧
   De forma opcional, el agente podrá utilizar herramientas para:

Consultar documentos del perfil.
Recuperar información de proyectos.
Filtrar experiencias por tecnología.
Generar resúmenes personalizados.
Consultar fuentes externas autorizadas.
Las herramientas deben incorporarse únicamente cuando resuelvan una necesidad clara y tengan controles adecuados.

10. Mostrar el origen de la información 📚
    Cuando sea pertinente, el agente debería poder indicar:

Qué parte del perfil respalda su respuesta.
Qué documento o proyecto consultó.
Si está realizando una inferencia.
Si la información no está disponible.
Esto ayuda a demostrar transparencia y facilita la validación de las respuestas.

11. Permitir la evaluación del comportamiento ✅
    La solución debería facilitar la validación de casos como:

Preguntas sencillas sobre el perfil.
Preguntas técnicas sobre proyectos.
Preguntas de seguimiento.
Información inexistente en el CV.
Solicitudes ambiguas.
Intentos de obtener información no autorizada.
Puedes incorporar evaluación, observabilidad, guardrails o sistemas agénticos si tienen sentido para tu diseño; no son requisitos obligatorios, pero pueden fortalecer tu demostración técnica.

Flujo funcional mínimo recomendado 🚀
El usuario pregunta por el perfil del candidato.
El agente presenta una respuesta clara y relevante.
El usuario profundiza en una experiencia o proyecto.
El agente mantiene el contexto de la conversación.
El agente explica tecnologías, responsabilidades y resultados.
El agente reconoce sus límites cuando no existe información suficiente.
El sistema permite demostrar cómo se construye, integra, despliega y opera.
La prioridad es entregar un agente funcional, confiable y bien pensado, no únicamente una interfaz atractiva.

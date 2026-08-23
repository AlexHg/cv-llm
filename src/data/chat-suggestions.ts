export type ChatSuggestion = {
  title: string;
  message: string;
};

export type ChatSuggestionsAvailable =
  | "before-first-message"
  | "after-first-message"
  | "always"
  | "disabled";

export const chatSuggestionsAvailable: ChatSuggestionsAvailable =
  "before-first-message";

export const chatSuggestions: ChatSuggestion[] = [
  {
    title: "Resume el perfil profesional",
    message:
      "Resume el perfil profesional de Alejandro: roles que busca, fortalezas e intereses.",
  },
  {
    title: "¿Qué experiencia tiene en IA?",
    message:
      "¿Qué experiencia tiene Alejandro con inteligencia artificial generativa? Incluye empresas, responsabilidades y logros.",
  },
  {
    title: "¿Cuáles son sus habilidades técnicas?",
    message:
      "¿Cuáles son las habilidades técnicas más relevantes de Alejandro y en qué experiencia o proyecto las aplicó?",
  },
  {
    title: "Cuéntame de los proyectos",
    message:
      "Cuéntame de los proyectos destacados: problema que resolvían, rol de Alejandro y resultados.",
  },
  {
    title: "Radar de habilidades",
    message:
      "Muéstrame un gráfico radar con las habilidades técnicas de Alejandro y su nivel.",
  },
  {
    title: "Línea de tiempo",
    message:
      "Muéstrame la trayectoria profesional de Alejandro en una línea de tiempo, del rol más reciente al más antiguo.",
  },
  {
    title: "¿Qué es Chequemotiva?",
    message:
      "Cuéntame más sobre Chequemotiva, una de las empresas en las que colaboró Alejandro.",
  },
  {
    title: "¿Dónde ha durado más?",
    message:
      "¿En qué empresa ha durado más tiempo Alejandro? Distingue permanencia por empresa y el rol individual más largo.",
  },
  {
    title: "Cambia el color a azul",
    message: "Cambia el color de acento del CV a azul.",
  },
];

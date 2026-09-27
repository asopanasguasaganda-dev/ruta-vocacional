export interface Resource {
  sourceUrl?: string;
  sourceDate?: string;
  id: string;
  title: string;
  category: string;
  minutes: number;
  intro: string;
  steps: string[];
}
export const resources: Resource[] = [
  {
    id: "decidir",
    title: "Elegir sin tener todas las respuestas",
    category: "Decisiones",
    minutes: 4,
    intro:
      "Una buena decisión puede comenzar con una pregunta pequeña. No necesitas predecir toda tu vida.",
    steps: [
      "Anota tres cosas que te gustaría encontrar en tu experiencia de estudio.",
      "Separa lo que sabes de lo que todavía necesitas investigar.",
      "Elige una pregunta para resolver esta semana y piensa a quién podrías consultar.",
    ],
  },
  {
    id: "malla",
    title: "Cómo leer una malla curricular",
    category: "Carreras",
    minutes: 5,
    intro:
      "El nombre de una carrera cuenta solo una parte. Las asignaturas y experiencias muestran más sobre el recorrido.",
    steps: [
      "Busca la malla oficial de la institución y comprueba su fecha.",
      "Marca asignaturas que despierten curiosidad y otras que no comprendas.",
      "Revisa prácticas, proyectos, requisitos de titulación y horarios.",
      "Pregunta a estudiantes o docentes cómo se vive realmente ese programa.",
    ],
  },
  {
    id: "entrevista",
    title: "Conversa con un profesional",
    category: "Carreras",
    minutes: 3,
    intro:
      "Una conversación concreta puede ayudarte a contrastar ideas con experiencias reales.",
    steps: [
      "Pregunta qué hace en una semana habitual y qué le resulta desafiante.",
      "Pide un ejemplo de un proyecto reciente y las habilidades que utilizó.",
      "Pregunta qué habría querido saber antes de estudiar.",
      "Compara perspectivas: una experiencia individual no representa toda la profesión.",
    ],
  },
  {
    id: "presion",
    title: "Mi voz entre muchas opiniones",
    category: "Bienestar",
    minutes: 4,
    intro:
      "Escuchar consejos puede aportar información. También necesitas un espacio para reconocer tus propios intereses.",
    steps: [
      "Escribe qué esperas tú de una carrera y qué esperan otras personas.",
      "Identifica acuerdos y preguntas que necesitan una conversación.",
      "Comparte tus razones y pide ayuda para investigar opciones concretas.",
      "Busca acompañamiento de una persona de confianza si el proceso te sobrepasa.",
    ],
  },
  {
    id: "probar",
    title: "Una experiencia antes de decidir",
    category: "Exploración",
    minutes: 3,
    intro:
      "Probar una actividad pequeña te permite descubrir cómo te sientes al hacerla.",
    steps: [
      "Elige un proyecto breve: explicar un tema, diseñar una pieza o analizar un problema.",
      "Define cuánto tiempo y qué materiales puedes dedicar.",
      "Al terminar, registra qué disfrutaste, qué te costó y qué querrías aprender.",
    ],
  },
  {
    id: "comparar",
    title: "Compara tus opciones con criterio",
    category: "Decisiones",
    minutes: 5,
    intro:
      "Una comparación útil incluye tus intereses y las condiciones reales de cada alternativa.",
    steps: [
      "Define criterios: contenidos, acceso, ubicación, apoyos, horarios y costos.",
      "Registra la fuente y la fecha de cada información.",
      "Marca lo desconocido como pendiente, sin inventar valores.",
      "Revisa la comparación con tu orientador y plantea un siguiente paso.",
    ],
  },
];

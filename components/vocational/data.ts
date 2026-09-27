import {
  Target,
  Gem,
  UserRound,
  Brain,
  Home,
  ClipboardCheck,
  ChartNoAxesColumnIncreasing,
  Compass,
  Map,
  BookOpen,
} from "lucide-react";

export const navigation = [
  { href: "/mi-ruta", label: "Mi ruta", icon: Home },
  {
    href: "/mi-ruta/evaluaciones",
    label: "Evaluaciones",
    icon: ClipboardCheck,
  },
  {
    href: "/mi-ruta/resultados",
    label: "Resultados",
    icon: ChartNoAxesColumnIncreasing,
  },
  { href: "/mi-ruta/carreras", label: "Explorar carreras", icon: Compass },
  { href: "/mi-ruta/plan", label: "Mi plan", icon: Map },
  { href: "/mi-ruta/recursos", label: "Recursos", icon: BookOpen },
];
export const assessments = [
  {
    id: "intereses",
    title: "Intereses RIASEC",
    short: "Intereses",
    description: "Reconoce las actividades que disfrutas.",
    total: 30,
    icon: Target,
    href: "/evaluacion/intereses",
  },
  {
    id: "valores",
    title: "Valores y preferencias",
    short: "Valores",
    description: "Descubre lo que es importante para ti.",
    total: 3,
    icon: Gem,
    href: "/evaluacion/valores",
  },
  {
    id: "autoconocimiento",
    title: "Autoconocimiento",
    short: "Autoconocimiento",
    description: "Reflexiona sobre tus fortalezas y decisiones.",
    total: 12,
    icon: UserRound,
    href: "/evaluacion/autoconocimiento",
  },
  {
    id: "laboratorio",
    title: "Laboratorio cognitivo",
    short: "Laboratorio",
    description: "Practica atención, memoria y flexibilidad.",
    total: 5,
    icon: Brain,
    href: "/mi-ruta/laboratorio",
  },
];
export const dimensions: Record<string, string> = {
  R: "Realista",
  I: "Investigador",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};
export const careers = [
  {
    id: "psicologia",
    title: "Psicología",
    area: "Personas",
    image: "psychology",
    description:
      "Estudia el comportamiento humano y contribuye al bienestar de las personas.",
    tags: ["Personas", "Salud mental", "Investigación"],
    skills: "Comunicación, empatía y análisis crítico.",
    activities:
      "Escuchar y analizar experiencias. Diseñar estrategias de apoyo. Investigar el comportamiento humano.",
    research:
      "Plan de estudios, prácticas supervisadas y áreas de especialización.",
    codes: ["S", "I"],
  },
  {
    id: "software",
    title: "Ingeniería de software",
    area: "Tecnología",
    image: "software",
    description:
      "Diseña y desarrolla soluciones tecnológicas para resolver problemas del mundo real.",
    tags: ["Tecnología", "Creatividad", "Resolución de problemas"],
    skills: "Lógica, pensamiento analítico y resolución de problemas.",
    activities:
      "Diseñar soluciones tecnológicas. Programar y probar aplicaciones. Trabajar en equipo.",
    research: "Lenguajes de programación, proyectos y campos de aplicación.",
    codes: ["I", "C"],
  },
  {
    id: "docencia",
    title: "Docencia",
    area: "Personas",
    image: "teaching",
    description: "Forma y acompaña el aprendizaje de nuevas generaciones.",
    tags: ["Personas", "Comunicación", "Educación"],
    skills: "Comunicación, paciencia y planificación.",
    activities:
      "Preparar experiencias de aprendizaje. Acompañar a estudiantes. Evaluar sus avances.",
    research: "Especialidades, niveles educativos y prácticas pedagógicas.",
    codes: ["S", "A"],
  },
  {
    id: "diseno",
    title: "Diseño y comunicación",
    area: "Creatividad",
    image: "students",
    description:
      "Transforma ideas en experiencias visuales que conectan con las personas.",
    tags: ["Creatividad", "Diseño", "Comunicación"],
    skills: "Observación, creatividad y comunicación visual.",
    activities:
      "Investigar necesidades, crear conceptos y desarrollar proyectos visuales.",
    research: "Portafolios, talleres y especializaciones en diseño.",
    codes: ["A", "E"],
  },
  {
    id: "ingenieria",
    title: "Ingeniería y tecnología",
    area: "Tecnología",
    image: "software",
    description:
      "Construye soluciones prácticas combinando ciencia, diseño y tecnología.",
    tags: ["Tecnología", "Ciencia", "Innovación"],
    skills: "Matemática, pensamiento espacial y análisis.",
    activities:
      "Diseñar sistemas, construir prototipos y comprobar soluciones.",
    research: "Laboratorios, especialidades y proyectos de ingeniería.",
    codes: ["R", "I"],
  },
  {
    id: "gestion",
    title: "Gestión y emprendimiento",
    area: "Negocios",
    image: "students",
    description:
      "Convierte ideas en proyectos y coordina equipos con un propósito.",
    tags: ["Liderazgo", "Organización", "Estrategia"],
    skills: "Liderazgo, negociación y organización.",
    activities:
      "Planificar proyectos, organizar recursos y coordinar personas.",
    research: "Modelos de negocio, prácticas y proyectos de emprendimiento.",
    codes: ["E", "C"],
  },
];
export const resources = [
  {
    id: "carrera",
    title: "Cómo investigar una carrera",
    category: "Guías",
    image: "psychology",
    time: "6 min",
    text: "Una guía para ir más allá del nombre de una profesión.",
    body: [
      "Revisa el plan de estudios y señala las materias que despiertan tu curiosidad.",
      "Habla con un estudiante y un profesional. Pregunta cómo es un día habitual y qué desafíos encuentran.",
      "Compara requisitos de ingreso, modalidad, costos y oportunidades de prácticas en las instituciones que te interesan.",
      "Anota lo que descubriste y las preguntas que todavía necesitas resolver.",
    ],
  },
  {
    id: "profesional",
    title: "Conversar con un profesional",
    category: "Actividades",
    image: "teaching",
    time: "10 min",
    text: "Prepara las preguntas que te acercarán a una decisión.",
    body: [
      "Elige una persona que trabaje en un campo que te interese.",
      "Pregunta: ¿qué actividades realizas?, ¿qué disfrutas más?, ¿qué te hubiera gustado saber antes de estudiar?",
      "Escucha experiencias diferentes. Una sola historia no representa toda la profesión.",
      "Escribe tres aprendizajes y decide qué investigarás después.",
    ],
  },
  {
    id: "decisiones",
    title: "Comparando tus opciones",
    category: "Guías",
    image: "psychology",
    time: "5 min",
    text: "Compara posibilidades sin buscar una respuesta perfecta.",
    body: [
      "Selecciona dos o tres opciones en el explorador de carreras.",
      "Compara actividades, habilidades y temas de estudio.",
      "Relaciona cada opción con tus intereses y valores.",
      "Elige un pequeño siguiente paso para comprobar lo que imaginas.",
    ],
  },
  {
    id: "cambio",
    title: "Cuando tu elección cambia",
    category: "Lecturas",
    image: "teaching",
    time: "4 min",
    text: "Cambiar de idea también puede ser parte del camino.",
    body: [
      "Tus intereses pueden cambiar a medida que aprendes y vives nuevas experiencias.",
      "Revisa qué cambió: la información, tus prioridades o tus circunstancias.",
      "Conversa con alguien de confianza y compara tus alternativas.",
      "Una decisión provisional puede ayudarte a avanzar sin exigir certezas absolutas.",
    ],
  },
  {
    id: "perfil",
    title: "¿Cómo interpretar mi perfil?",
    category: "Lecturas",
    image: "students",
    time: "5 min",
    text: "Comprende tus resultados y úsalos para explorar.",
    body: [
      "Tus resultados resumen tus respuestas actuales, no definen quién eres.",
      "Las seis áreas RIASEC describen distintos tipos de actividades que podrías disfrutar.",
      "Un puntaje mayor indica que expresaste más interés por esas actividades.",
      "Combina esta información con tus valores, experiencias y conversaciones con orientadores.",
    ],
  },
  {
    id: "idea",
    title: "Explora una idea de futuro",
    category: "Actividades",
    image: "software",
    time: "15 min",
    text: "Prueba una idea pequeña y aprende de la experiencia.",
    body: [
      "Identifica un problema cotidiano que te gustaría resolver.",
      "Imagina dos soluciones y elige una que puedas probar esta semana.",
      "Crea un pequeño prototipo, una explicación o una propuesta.",
      "Pide opinión, anota lo que aprendiste y decide tu siguiente paso.",
    ],
  },
];

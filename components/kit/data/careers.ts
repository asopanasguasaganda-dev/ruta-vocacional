import original from './original.json';
import type { Career } from "../types";
export const careers: Career[] = [
  {
    id: "software",
    name: "Ingeniería de Software",
    area: "Tecnología",
    interests: ["I", "C"],
    description: "Diseña soluciones digitales para necesidades reales.",
    activities: "Analizar problemas, programar, probar y mejorar aplicaciones.",
    skills:
      "Pensamiento lógico, colaboración, comunicación y aprendizaje continuo.",
    investigate:
      "Compara las mallas curriculares, los proyectos prácticos y las opciones de especialización.",
  },
  {
    id: "medicina",
    name: "Medicina",
    area: "Salud",
    interests: ["I", "S"],
    description: "Estudia la salud y el cuidado de las personas.",
    activities:
      "Estudiar procesos biológicos, escuchar a pacientes y trabajar con equipos de salud.",
    skills: "Ciencias, empatía, responsabilidad y atención al detalle.",
    investigate:
      "Revisa requisitos de ingreso, prácticas, duración y habilitación profesional en tu país.",
  },
  {
    id: "docencia",
    name: "Educación",
    area: "Educación y sociedad",
    interests: ["S", "A"],
    description: "Acompaña el aprendizaje en distintos contextos.",
    activities:
      "Planificar experiencias, explicar ideas, evaluar procesos y apoyar a estudiantes.",
    skills: "Comunicación, creatividad, paciencia y organización.",
    investigate:
      "Explora niveles educativos, áreas de especialidad y experiencias de práctica docente.",
  },
  {
    id: "ingenieria",
    name: "Ingeniería Industrial",
    area: "Ingeniería",
    interests: ["R", "I"],
    description: "Mejora procesos, sistemas y el uso de recursos.",
    activities:
      "Analizar operaciones, diseñar procesos y resolver problemas de producción.",
    skills: "Matemática, análisis, trabajo en equipo y visión de sistemas.",
    investigate:
      "Busca laboratorios, prácticas y enfoques de producción, logística o calidad.",
  },
  {
    id: "arquitectura",
    name: "Arquitectura",
    area: "Arte y diseño",
    interests: ["A", "R"],
    description: "Imagina espacios para la vida y la comunidad.",
    activities: "Diseñar, dibujar, modelar y estudiar el entorno construido.",
    skills: "Representación espacial, creatividad y comprensión técnica.",
    investigate:
      "Revisa talleres de diseño, sostenibilidad, costos de materiales y prácticas.",
  },
  {
    id: "psicologia",
    name: "Psicología",
    area: "Salud",
    interests: ["S", "I"],
    description: "Estudia el comportamiento y la experiencia humana.",
    activities:
      "Investigar, escuchar, analizar evidencia y acompañar procesos según la especialidad.",
    skills: "Escucha, lectura crítica, investigación y ética.",
    investigate:
      "Distingue los campos educativo, organizacional, social y clínico y sus requisitos.",
  },
  {
    id: "diseno",
    name: "Diseño Gráfico",
    area: "Arte y diseño",
    interests: ["A", "C"],
    description: "Comunica ideas mediante lenguajes visuales.",
    activities:
      "Investigar audiencias, crear conceptos y producir piezas visuales.",
    skills: "Creatividad, composición, criterio visual y comunicación.",
    investigate:
      "Compara portafolios de egresados, talleres, medios digitales y procesos de diseño.",
  },
  {
    id: "administracion",
    name: "Administración de Empresas",
    area: "Negocios",
    interests: ["E", "C"],
    description: "Organiza proyectos, equipos y recursos.",
    activities:
      "Planificar, analizar información, coordinar equipos y evaluar decisiones.",
    skills: "Organización, liderazgo, pensamiento crítico y manejo de datos.",
    investigate:
      "Explora finanzas, marketing, operaciones, emprendimiento y prácticas.",
  },
  {
    id: "trabajo-social",
    name: "Trabajo Social",
    area: "Educación y sociedad",
    interests: ["S", "E"],
    description: "Acompaña a personas y comunidades en sus desafíos.",
    activities:
      "Escuchar necesidades, coordinar apoyos y diseñar proyectos comunitarios.",
    skills: "Empatía, comunicación, análisis social y trabajo colaborativo.",
    investigate:
      "Revisa áreas de intervención, prácticas de campo y trabajo con instituciones.",
  },
  {
    id: "biologia",
    name: "Biología",
    area: "Ciencias",
    interests: ["I", "R"],
    description: "Investiga la vida y sus relaciones con el entorno.",
    activities:
      "Observar, realizar trabajo de campo, experimentar y analizar datos.",
    skills: "Curiosidad, rigor, observación y pensamiento científico.",
    investigate:
      "Explora investigación, conservación, laboratorios y oportunidades de campo.",
  },
];
// Preserve the source catalog, without presenting its unsourced labour values as facts.
careers.forEach((career,index)=>{const source=original.carreras[index];if(source){career.name=source.nombre;career.description=source.descripcion;career.interests=source.ria;career.skills=source.competencias;career.investigate='Formación sugerida en el boceto: '+source.bach+'. Consulta los requisitos oficiales de cada institución.';}});
export const careerAreas = [...new Set(careers.map((c) => c.area))].sort();

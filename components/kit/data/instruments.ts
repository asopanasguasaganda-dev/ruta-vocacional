import {answerProblem,absent} from '../lib/test-engine';
import type { Instrument, Option } from "../types";
import original from './original.json';
export const interestOptions: Option[] = [
  "Nada",
  "Poco",
  "Moderado",
  "Mucho",
  "Muchísimo",
].map((label, i) => ({ value: i + 1, label }));
export const frequencyOptions: Option[] = [
  "Nunca",
  "Rara vez",
  "A veces",
  "Frecuentemente",
  "Siempre",
].map((label, i) => ({ value: i + 1, label }));
export const dimensions = [
  {
    code: "R",
    name: "Realista",
    description: "Actividades prácticas, herramientas y trabajo con objetos.",
  },
  {
    code: "I",
    name: "Investigador",
    description: "Preguntas, análisis, ciencia y búsqueda de explicaciones.",
  },
  {
    code: "A",
    name: "Artístico",
    description: "Expresión, imaginación y creación de nuevas ideas.",
  },
  {
    code: "S",
    name: "Social",
    description: "Escuchar, enseñar, acompañar y ayudar a otras personas.",
  },
  {
    code: "E",
    name: "Emprendedor",
    description: "Liderar, proponer, negociar y poner en marcha proyectos.",
  },
  {
    code: "C",
    name: "Convencional",
    description: "Organización, información y procedimientos claros.",
  },
];
const groups: Record<string, string[]> = {
  R: [
    "Construir o reparar objetos utilizando herramientas.",
    "Realizar actividades prácticas que requieran movimiento.",
    "Trabajar con máquinas, instrumentos o tecnología física.",
    "Realizar experimentos prácticos.",
    "Preferir aprender haciendo antes que solamente leyendo.",
  ],
  I: [
    "Investigar por qué ocurre un fenómeno.",
    "Resolver problemas complejos.",
    "Analizar información antes de tomar una decisión.",
    "Realizar investigaciones científicas.",
    "Buscar explicaciones basadas en evidencias.",
  ],
  A: [
    "Crear dibujos, diseños o composiciones.",
    "Escribir historias o producir contenidos.",
    "Encontrar soluciones creativas.",
    "Trabajar en proyectos artísticos.",
    "Expresar ideas de manera original.",
  ],
  S: [
    "Ayudar a una persona que tiene dificultades.",
    "Enseñar algo que conozco.",
    "Escuchar y orientar a otras personas.",
    "Participar en actividades comunitarias.",
    "Trabajar colaborativamente.",
  ],
  E: [
    "Liderar un proyecto.",
    "Convencer a otras personas de una idea.",
    "Organizar un equipo.",
    "Tomar decisiones importantes.",
    "Crear un emprendimiento.",
  ],
  C: [
    "Organizar información.",
    "Trabajar con registros y datos.",
    "Seguir procedimientos establecidos.",
    "Planificar cuidadosamente una actividad.",
    "Mantener documentos organizados.",
  ],
};
export let interests: Instrument = {
  id: "intereses",
  version: "demo-1",
  title: "Intereses vocacionales",
  description:
    "Piensa cuánto te gustaría realizar cada actividad. No hay respuestas correctas o incorrectas.",
  options: interestOptions,
  questions: Object.entries(groups).flatMap(([dimension, items]) =>
    items.map((text, i) => ({
      id: dimension + "-" + (i + 1),
      text,
      dimension,
    })),
  ),
};
const awarenessGroups: Record<string, string[]> = {
  Autoconocimiento: [
    "Puedo explicar qué actividades me hacen sentir que estoy aprendiendo o aportando.",
    "Reconozco al menos tres fortalezas que puedo desarrollar.",
    "Sé diferenciar lo que realmente me interesa de lo que simplemente está de moda.",
  ],
  Autonomía: [
    "Cuando pienso en una carrera, considero mis propios valores además de las expectativas de otras personas.",
    "Puedo explicar por qué una opción académica me interesa.",
    "Antes de decidir, busco información de varias fuentes.",
  ],
  "Orientación al futuro": [
    "Puedo imaginar distintos futuros profesionales sin sentir que debo elegir uno definitivo ahora.",
    "Puedo convertir una meta grande en pequeños pasos.",
    "Estoy dispuesto/a a seguir aprendiendo si una profesión cambia con la tecnología.",
  ],
  Emprendimiento: [
    "Me gusta identificar problemas que podrían convertirse en oportunidades de solución.",
    "Me siento capaz de probar una idea pequeña antes de intentar hacerla grande.",
    "Puedo proponer más de una solución para un mismo problema.",
  ],
};
export let awareness: Instrument = {
  id: "autoconocimiento",
  version: "demo-1",
  title: "Autoconocimiento",
  description: "Elige la frecuencia que mejor describe tu experiencia actual.",
  options: frequencyOptions,
  questions: original.cuestionarioAdolescente.map(q => ({id:q.id,text:q.q,dimension:q.dim})),
};
export let preferences: Instrument = {
  id: "valores",
  version: "demo-1",
  title: "Valores y preferencias",
  description:
    "Elige la opción que más conecta contigo hoy. Puedes cambiar de opinión con el tiempo.",
  options: [],
  questions: [
    {
      id: "ambiente",
      text: "¿En qué ambiente te gustaría aprender o trabajar?",
      options: [
        "Laboratorio / investigación",
        "Trabajo con personas",
        "Trabajo al aire libre",
        "Tecnología",
        "Creatividad y diseño",
        "Organización y administración",
      ].map((label, i) => ({ value: i + 1, label })),
    },
    {
      id: "motivacion",
      text: "¿Qué te motiva más al participar en un proyecto?",
      options: [
        "Resolver problemas",
        "Ayudar a otras personas",
        "Crear cosas nuevas",
        "Liderar proyectos",
        "Investigar",
        "Obtener estabilidad",
      ].map((label, i) => ({ value: i + 1, label })),
    },
    {
      id: "valor",
      text: "¿Qué valor priorizas al imaginar tu futuro profesional?",
      options: [
        "Servicio",
        "Innovación",
        "Autonomía",
        "Seguridad",
        "Reconocimiento",
        "Conocimiento",
      ].map((label, i) => ({ value: i + 1, label })),
    },
  ],
};
export let instruments = [interests, preferences, awareness];
export const answerKey = (instrument: Instrument) =>
  "rv360:answers:" + instrument.id + ":" + instrument.version;
export function validAnswer(instrument:Instrument,id:string,value:any){const q=instrument.questions.find(q=>q.id===id);return !!q&&(q.type==='info'||!absent(value)&&!answerProblem(instrument,q,value));}
export function completion(
  instrument: Instrument,
  answers: Record<string, any>,
) {
  return instrument.questions.filter((q) =>
    validAnswer(instrument, q.id, answers[q.id]),
  ).length;
}
export function dimensionScores(
  instrument: Instrument,
  answers: Record<string, number>,
) {
  return [
    ...new Set(instrument.questions.map((q) => q.dimension).filter(Boolean)),
  ].map((dimension) => {
    const qs = instrument.questions.filter((q) => q.dimension === dimension);
    return {
      dimension: dimension!,
      value: qs.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / qs.length,
    };
  });
}

const baseInstruments = instruments;
export function configureInstruments(assigned?: Instrument[]) {
 const list = assigned?.length === 3 ? assigned : baseInstruments;
 interests = list.find(i => i.id === "intereses") || baseInstruments[0];
 preferences = list.find(i => i.id === "valores") || baseInstruments[1];
 awareness = list.find(i => i.id === "autoconocimiento") || baseInstruments[2];
 instruments = [interests, preferences, awareness];
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Gem,
  Info,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldCheck,
  Target,
  Timer,
  UserRound,
} from "lucide-react";
import { useRouteData, ButtonLink, PageTitle, Progress } from "./app";
import { riasecQuestions, selfQuestions } from "@/lib/questionnaires";

export const valueQuestions = [
  {
    title: "¿En qué ambiente te imaginas?",
    subtitle: "Elige el entorno en el que te gustaría desarrollar tus ideas.",
    options: [
      "Al aire libre y en movimiento",
      "En un espacio de investigación",
      "En un estudio creativo",
      "Acompañando a otras personas",
      "Liderando un equipo",
      "En un entorno organizado",
    ],
  },
  {
    title: "¿Qué te motiva principalmente?",
    subtitle: "Elige la opción que más te representa.",
    options: [
      "Resolver problemas",
      "Ayudar a otras personas",
      "Crear cosas nuevas",
      "Liderar proyectos",
      "Investigar",
      "Obtener estabilidad",
    ],
  },
  {
    title: "¿Qué es más importante para ti?",
    subtitle: "Piensa en lo que quieres cuidar en tu futuro profesional.",
    options: [
      "Autonomía y libertad",
      "Contribuir a la sociedad",
      "Aprender continuamente",
      "Seguridad y estabilidad",
      "Creatividad y expresión",
      "Equilibrio con mi vida personal",
    ],
  },
];
export function AssessmentPage({ kind }: { kind: string }) {
  const { data, update } = useRouteData();
  const isValues = kind === "valores",
    isSelf = kind === "autoconocimiento";
  const total = isValues ? 3 : isSelf ? 12 : 30;
  const answers = data.answers[kind] || [];
  const [index, setIndex] = useState(0),
    [finished, setFinished] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && answers.length) {
      const next = Array.from(
        { length: total },
        (_, i) => answers[i],
      ).findIndex((v) => !v);
      setIndex(next < 0 ? 0 : next);
      initialized.current = true;
    }
  }, [answers, total]);
  const answered = answers.filter(Boolean).length;
  const title = isValues
    ? "Valores y preferencias"
    : isSelf
      ? "Cuestionario de autoconocimiento"
      : "Exploración de intereses";
  const question = isValues
    ? valueQuestions[index].title
    : isSelf
      ? selfQuestions[index].question
      : riasecQuestions[index][1];
  const options = isValues
    ? valueQuestions[index].options
    : isSelf
      ? ["Nunca", "Rara vez", "A veces", "Frecuentemente", "Siempre"]
      : ["Nada", "Poco", "Moderado", "Mucho", "Muchísimo"];
  const choose = (value: number) => {
    initialized.current = true;
    const next = [...answers];
    next[index] = value;
    update({ answers: { ...data.answers, [kind]: next } });
  };
  return (
    <>
      <div className="breadcrumbs">
        <Link href="/mi-ruta/evaluaciones">Evaluaciones</Link>
        <ChevronRight size={13} />
        <span>{title}</span>
      </div>
      <div
        className={`questionnaire ${isValues ? "values-questionnaire" : ""}`}
      >
        {finished ? (
          <section className="panel empty-state complete-state">
            <CheckCircle2 size={64} />
            <h1>Un paso más para conocerte.</h1>
            <p>
              Completaste {title.toLowerCase()}. Tus {total} respuestas quedaron
              guardadas.
            </p>
            <div className="hero-actions">
              <ButtonLink
                href={
                  kind === "intereses"
                    ? "/mi-ruta/resultados"
                    : "/mi-ruta/evaluaciones"
                }
              >
                {" "}
                {kind === "intereses"
                  ? "Ver mis resultados"
                  : "Continuar mi ruta"}{" "}
                <ArrowRight size={18} />
              </ButtonLink>
              <button
                className="btn outline"
                onClick={() => {
                  setIndex(0);
                  setFinished(false);
                }}
              >
                Revisar respuestas
              </button>
            </div>
          </section>
        ) : (
          <>
            {isValues && (
              <PageTitle
                before="Lo que"
                accent="te mueve"
                description="Conoce qué es importante para ti y qué quieres cuidar en tu futuro."
              />
            )}
            <div className="questionnaire-header">
              <div>
                <span className="tile-icon small">
                  {isValues ? <Gem /> : isSelf ? <UserRound /> : <Target />}
                </span>
                <h2>{title}</h2>
              </div>
              <span>
                Pregunta {index + 1} de {total}
              </span>
            </div>
            <Progress value={Math.round((answered / total) * 100)} />
            {isValues && (
              <div className="value-steps">
                {["Ambiente", "Motivación", "Valores"].map((s, i) => (
                  <button
                    key={s}
                    className={index === i ? "active" : ""}
                    onClick={() => {
                      if (i === 0 || answers[i - 1]) setIndex(i);
                    }}
                    disabled={i > 0 && !answers[i - 1]}
                  >
                    <b>{i + 1}</b>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <section className="question-card panel">
              <span className="eyebrow compact">
                {isValues
                  ? valueQuestions[index].subtitle
                  : isSelf
                    ? selfQuestions[index].dimension
                    : "¿Cuánto te gustaría realizar esta actividad?"}
              </span>
              <h1>{question}</h1>
              <div
                className={isValues ? "value-options" : "rating-options"}
                role="radiogroup"
                aria-label={question}
              >
                {options.map((option, i) => (
                  <button
                    role="radio"
                    aria-checked={answers[index] === i + 1}
                    key={option}
                    className={answers[index] === i + 1 ? "selected" : ""}
                    onClick={() => choose(i + 1)}
                  >
                    {isValues ? (
                      <>
                        <span className="round-icon small">
                          <Lightbulb size={20} />
                        </span>
                        <strong>{option}</strong>
                        <span className="radio-indicator">
                          {answers[index] === i + 1 && <Check size={12} />}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="rating-number">
                          {isSelf && answers[index] === i + 1 ? (
                            <Check size={22} />
                          ) : (
                            i + 1
                          )}
                        </span>
                        <strong>{option}</strong>
                        {answers[index] === i + 1 && (
                          <CheckCircle2 className="selection-mark" size={17} />
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
              <div className="question-tip">
                <Info size={16} />
                <span>
                  {isSelf
                    ? "Responde según tu experiencia actual, con sinceridad."
                    : "Responde según tus intereses, no según lo que otras personas esperan de ti."}
                </span>
              </div>
              <div className="question-footer">
                <button
                  className="btn outline"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ArrowLeft size={17} />
                  Anterior
                </button>
                <span className="saved-label">
                  <ShieldCheck size={15} />
                  {answers[index]
                    ? "Respuesta guardada"
                    : "Elige una respuesta"}
                </span>
                <button
                  className="btn"
                  disabled={!answers[index]}
                  onClick={() => {
                    if (index === total - 1) setFinished(true);
                    else setIndex(index + 1);
                  }}
                >
                  {index === total - 1 ? "Finalizar" : "Siguiente"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
            <p className="quiz-footnote">
              Tus respuestas no te etiquetan: te ayudan a conocerte mejor.
            </p>
          </>
        )}
      </div>
    </>
  );
}

const labNames = [
  "Atención selectiva",
  "Memoria",
  "Flexibilidad",
  "Control inhibitorio",
  "Velocidad de reacción",
];
const symbols = [
  "◇",
  "○",
  "△",
  "□",
  "○",
  "△",
  "□",
  "◇",
  "△",
  "○",
  "□",
  "○",
  "○",
  "□",
  "△",
  "◇",
  "□",
  "○",
  "△",
  "○",
  "◇",
  "□",
  "○",
  "△",
  "△",
  "○",
  "□",
  "◇",
  "○",
  "□",
];
export function Laboratory() {
  const { data, update } = useRouteData();
  const [activity, setActivity] = useState(0),
    [selected, setSelected] = useState<number[]>([]),
    [result, setResult] = useState("");
  const [phase, setPhase] = useState("idle"),
    [memory, setMemory] = useState<number[]>([]),
    [sequence, setSequence] = useState<number[]>([]),
    [round, setRound] = useState(0),
    [points, setPoints] = useState(0),
    [stimulus, setStimulus] = useState(0);
  const time = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = (value: number, message: string) => {
    setResult(message);
    setPhase("done");
    update({ lab: { ...data.lab, [labNames[activity]]: value } });
  };
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setPhase("idle");
    setResult("");
    setSelected([]);
    setMemory([]);
    setRound(0);
    setPoints(0);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const start = () => {
    reset();
    if (activity === 1) {
      const seq = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1,
      );
      setSequence(seq);
      setPhase("show");
      timer.current = setTimeout(() => setPhase("recall"), 2500);
    } else if (activity === 4) {
      setPhase("waiting");
      timer.current = setTimeout(
        () => {
          time.current = performance.now();
          setPhase("go");
        },
        1200 + Math.random() * 2000,
      );
    } else {
      setStimulus(Math.floor(Math.random() * 9) + 1);
      setPhase("active");
    }
  };
  const answerRule = (choice: boolean) => {
    const correct =
      activity === 2
        ? round % 2 === 0
          ? stimulus % 2 === 0
          : stimulus > 5
        : stimulus % 3 !== 0;
    const nextPoints = points + (choice === correct ? 1 : 0);
    setPoints(nextPoints);
    if (round === 7)
      save(
        nextPoints,
        `${nextPoints} de 8 respuestas correctas. Puedes practicar de nuevo cuando quieras.`,
      );
    else {
      setRound(round + 1);
      setStimulus(Math.floor(Math.random() * 9) + 1);
    }
  };
  return (
    <>
      <PageTitle
        before="Laboratorio"
        accent="cognitivo"
        description="Explora tu atención, memoria y flexibilidad con actividades breves."
      />
      <div className="lab-layout">
        <aside className="panel lab-navigation">
          {labNames.map((name, i) => (
            <button
              key={name}
              className={activity === i ? "active" : ""}
              onClick={() => {
                reset();
                setActivity(i);
              }}
            >
              <span className="step-number">0{i + 1}</span>
              <span>
                {name}
                <small>
                  {data.lab[name] !== undefined ? "Practicado" : "Por explorar"}
                </small>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </aside>
        <section className="panel lab-exercise">
          <span className="badge teal">Actividad opcional</span>
          <h2>{labNames[activity]}</h2>
          <p>
            {
              [
                "Selecciona todos los triángulos entre las figuras.",
                "Observa la secuencia y repítela en el mismo orden.",
                "La regla cambia en cada ronda. Lee la instrucción antes de responder.",
                "Responde según la señal. Si aparece un múltiplo de 3, elige detenerte.",
                "Espera la señal verde y responde lo más pronto que puedas.",
              ][activity]
            }
          </p>
          {phase === "idle" && (
            <div className="lab-start">
              <span className="tile-icon large">
                <Brain />
              </span>
              <h3>Un momento para poner tu mente en acción.</h3>
              <button className="btn" onClick={start}>
                <Play size={17} />
                Comenzar actividad
              </button>
            </div>
          )}
          {activity === 0 && phase === "active" && (
            <>
              <div className="shape-grid">
                {symbols.map((s, i) => (
                  <button
                    key={i}
                    aria-label={`Figura ${i + 1}: ${s === "△" ? "triángulo" : s === "○" ? "círculo" : s === "□" ? "cuadrado" : "rombo"}`}
                    aria-pressed={selected.includes(i)}
                    className={selected.includes(i) ? "selected" : ""}
                    onClick={() =>
                      setSelected(
                        selected.includes(i)
                          ? selected.filter((x) => x !== i)
                          : [...selected, i],
                      )
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                className="btn"
                onClick={() => {
                  const total = symbols.filter((s) => s === "△").length;
                  const hits = selected.filter(
                    (i) => symbols[i] === "△",
                  ).length;
                  const errors = selected.length - hits;
                  save(
                    Math.max(0, hits - errors),
                    `Encontraste ${hits} de ${total} triángulos y seleccionaste ${errors} figuras diferentes.`,
                  );
                }}
              >
                Ver mi práctica <ArrowRight size={17} />
              </button>
            </>
          )}
          {activity === 1 && phase === "show" && (
            <div className="memory-sequence">
              {sequence.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
              <p>Observa y recuerda…</p>
            </div>
          )}
          {activity === 1 && phase === "recall" && (
            <>
              <p className="memory-answer">
                Tu secuencia: {memory.join(" · ") || "—"}
              </p>
              <div className="memory-buttons">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    className="btn outline"
                    key={n}
                    onClick={() => {
                      const next = [...memory, n];
                      setMemory(next);
                      if (next.length === sequence.length) {
                        const hits = next.filter(
                          (v, i) => v === sequence[i],
                        ).length;
                        save(
                          hits,
                          `${hits} de 4 posiciones correctas. La secuencia era ${sequence.join(" · ")}.`,
                        );
                      }
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
          {(activity === 2 || activity === 3) && phase === "active" && (
            <div className="rule-game">
              <span className="badge purple">Ronda {round + 1} de 8</span>
              <h3>
                {activity === 2
                  ? round % 2 === 0
                    ? "¿El número es par?"
                    : "¿El número es mayor que 5?"
                  : "¿Puedes avanzar? Detente si es múltiplo de 3."}
              </h3>
              <strong className="stimulus">{stimulus}</strong>
              <div className="hero-actions">
                <button className="btn" onClick={() => answerRule(true)}>
                  {activity === 2 ? "Sí" : "Avanzar"}
                </button>
                <button
                  className="btn outline"
                  onClick={() => answerRule(false)}
                >
                  {activity === 2 ? "No" : "Detenerme"}
                </button>
              </div>
            </div>
          )}
          {activity === 4 && (phase === "waiting" || phase === "go") && (
            <button
              className={`reaction-area ${phase === "go" ? "ready" : ""}`}
              onClick={() => {
                if (phase === "waiting") {
                  if (timer.current) clearTimeout(timer.current);
                  setResult("Te adelantaste a la señal. Intenta otra vez.");
                  setPhase("done");
                } else {
                  const ms = Math.round(performance.now() - time.current);
                  save(ms, `Tu tiempo en esta práctica fue de ${ms} ms.`);
                }
              }}
            >
              <Timer size={40} />
              {phase === "waiting" ? "Espera la señal…" : "¡Ahora! Pulsa aquí"}
            </button>
          )}
          {result && (
            <div className="lab-result">
              <CheckCircle2 size={42} />
              <h3>Práctica terminada</h3>
              <p>{result}</p>
              <button className="btn" onClick={start}>
                <RotateCcw size={17} />
                Volver a practicar
              </button>
            </div>
          )}
        </section>
      </div>
      <div className="notice teal-notice">
        <ShieldCheck />
        <p>
          <strong>Tu experiencia importa.</strong> Estas prácticas no miden tu
          inteligencia ni determinan una carrera. Son actividades de
          exploración, sin interpretación clínica.
        </p>
      </div>
    </>
  );
}

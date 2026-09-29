"use client";
import { AcademicQuestionSettings } from "./AcademicQuestionSettings";
import { useState } from "react";
import {
  Button,
  Field,
  SelectField,
  TextareaField,
  Notice,
} from "../../components/ui/primitives";
import { ChoiceList, trainingApi } from "./shared";
import { QuestionFormat } from "../admin/UniversalSettings";
import { QuestionSettings } from "../admin/InstrumentSettings";
import { TestQuestion } from "../../components/domain/TestQuestion";
import { academicInstrument, selectQuestions } from "../../lib/training-engine";
import { readApiResponse } from "../../lib/api-response";
import type {
  Course,
  Simulator,
  AdmissionProfile,
} from "../../lib/training-types";
const identity = () => ({
  id: "",
  version: 0,
  revision: 0,
  status: "draft" as const,
  title: "",
});
export const blankCourse = (): Course => ({
  ...identity(),
  description: "",
  objectives: "",
  level: "Introductorio",
  type: "general",
  careerIds: [],
  institutions: [],
  fields: [],
  activities: [],
  studentIds: [],
  access: "all",
});
export const blankSimulator = (): Simulator => ({
  ...identity(),
  instrument: {
    id: "draft",
    version: "1",
    title: "",
    description: "",
    options: [],
    questions: [],
    source: "",
  },
  purpose: "general",
  modes: ["practice", "exam"],
  durationMinutes: 30,
  practiceDurationMinutes: 0,
  maxAttempts: 3,
  gradePolicy: "last",
  feedback: "finish",
  selection: "fixed",
  quotas: [],
  areaWeights: [],
  questions: [],
  shuffleOptions: false,
  questionOrderFixedIds: [],
});
export const blankProfile = (): AdmissionProfile => ({
  ...identity(),
  institution: "",
  period: "",
  level: "Grado",
  careerIds: [],
  sourceUrl: "",
  reviewedAt: "",
  scope: "",
  rules: "",
  areas: [],
  durationMinutes: 60,
  internalRules: "",
});
export function CourseEditor({
  value: c,
  onChange: change,
  data: d,
}: {
  value: Course;
  onChange: (c: Course) => void;
  data: any;
}) {
  const patch = (v: Partial<Course>) => change({ ...c, ...v });
  return (
    <div className="training-editor">
      <Field
        label="Nombre del curso"
        value={c.title}
        onChange={(e) => patch({ title: e.target.value })}
      />
      <TextareaField
        label="Descripción"
        value={c.description}
        onChange={(e) => patch({ description: e.target.value })}
      />
      <TextareaField
        label="Objetivos de aprendizaje"
        value={c.objectives}
        onChange={(e) => patch({ objectives: e.target.value })}
      />
      <div className="training-split">
        <Field
          label="Nivel"
          value={c.level}
          onChange={(e) => patch({ level: e.target.value })}
        />
        <SelectField
          label="Tipo de preparación"
          value={c.type}
          onChange={(e) => patch({ type: e.target.value as any })}
        >
          <option value="general">Preparación general</option>
          <option value="field">Introducción a un campo</option>
          <option value="admission">Convocatoria institucional</option>
        </SelectField>
      </div>
      <ChoiceList
        label="Carreras relacionadas"
        items={d.careers}
        value={c.careerIds}
        onChange={(careerIds) => patch({ careerIds, institutions: (c.institutions || []).filter(i => d.careers.some((career: any) => careerIds.includes(career.id) && career.offers.some((o: any) => o.institution === i))) })}
      />
      <ChoiceList
        label="Universidades relacionadas"
        items={[...new Set<string>(d.careers.filter((career: any) => c.careerIds.includes(career.id)).flatMap((career: any) => career.offers.map((o: any) => o.institution)))].sort().map(name => ({ id: name, name }))}
        value={c.institutions || []}
        onChange={(institutions) => patch({ institutions })}
      />
      <small>Selecciona primero las carreras. Aparecen las universidades que las ofrecen en el catálogo de Ecuador. Para preparar un examen de una convocatoria concreta, elige su perfil de admisión.</small>
      <ChoiceList
        label="Relaciones por área revisadas"
        items={[...new Set<string>(d.careers.map((c: any) => c.area))].map(
          (a) => ({ id: a, name: a }),
        )}
        value={c.fields}
        onChange={(fields) => patch({ fields })}
      />
      {c.type === "admission" && (
        <ProfileSelect data={d} value={c} onChange={patch} />
      )}
      <h3>Módulos y actividades</h3>
      <Notice>
        Una lectura se completa al confirmarla. Un simulador conserva su propia
        calificación y versión.
      </Notice>
      {c.activities.map((a, i) => {
        const update = (v: any) =>
          patch({
            activities: c.activities.map((x, j) =>
              i === j ? { ...x, ...v } : x,
            ),
          });
        return (
          <section className="training-module" key={a.id}>
            <div className="training-actions">
              <b>Actividad {i + 1}</b>
              <Button
                size="sm"
                variant="ghost"
                disabled={!i}
                onClick={() => {
                  const x = [...c.activities];
                  [x[i - 1], x[i]] = [x[i], x[i - 1]];
                  patch({ activities: x });
                }}
              >
                Subir
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={i === c.activities.length - 1}
                onClick={() => {
                  const x = [...c.activities];
                  [x[i + 1], x[i]] = [x[i], x[i + 1]];
                  patch({ activities: x });
                }}
              >
                Bajar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  patch({
                    activities: c.activities.filter((x) => x.id !== a.id),
                  })
                }
              >
                Quitar
              </Button>
            </div>
            <div className="training-split">
              <Field
                label="Módulo"
                value={a.module}
                onChange={(e) => update({ module: e.target.value })}
              />
              <Field
                label="Título de actividad"
                value={a.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <SelectField
              label="Formato"
              value={a.kind}
              onChange={(e) =>
                update({
                  kind: e.target.value,
                  completion:
                    e.target.value === "simulator" ? "submit" : "read",
                })
              }
            >
              <option value="text">Lección de texto</option>
              <option value="link">Documento o enlace HTTPS</option>
              <option value="simulator">Simulador evaluable</option>
            </SelectField>
            {a.kind === "simulator" ? (
              <>
                <SelectField
                  label="Simulador publicado"
                  value={
                    a.simulatorId
                      ? a.simulatorId + ":" + a.simulatorVersion
                      : ""
                  }
                  onChange={(e) => {
                    const [simulatorId, v] = e.target.value.split(":");
                    update({ simulatorId, simulatorVersion: Number(v) });
                  }}
                >
                  <option value="">Selecciona un simulador</option>
                  {d.simulators
                    .filter((s: any) => s.status === "published")
                    .map((s: any) => (
                      <option
                        key={s.id + ":" + s.version}
                        value={s.id + ":" + s.version}
                      >
                        {s.title} · v{s.version}
                      </option>
                    ))}
                </SelectField>
                <SelectField
                  label="Criterio de finalización"
                  value={a.completion}
                  onChange={(e) =>
                    update({
                      completion: e.target.value,
                      target: a.target ?? 60,
                    })
                  }
                >
                  <option value="submit">Entregar un intento</option>
                  <option value="score">Alcanzar una nota interna</option>
                </SelectField>
                {a.completion === "score" && (
                  <Field
                    label="Nota interna mínima sobre 100"
                    type="number"
                    min={0}
                    max={100}
                    value={a.target ?? 60}
                    onChange={(e) => update({ target: Number(e.target.value) })}
                  />
                )}
              </>
            ) : (
              <TextareaField
                label={
                  a.kind === "text"
                    ? "Contenido de la lección"
                    : "URL HTTPS del recurso"
                }
                value={a.content}
                onChange={(e) => update({ content: e.target.value })}
              />
            )}
            <label>
              <input
                type="checkbox"
                checked={a.required}
                onChange={(e) => update({ required: e.target.checked })}
              />{" "}
              Actividad requerida para el avance
            </label>
          </section>
        );
      })}
      <Button
        variant="secondary"
        onClick={() =>
          patch({
            activities: [
              ...c.activities,
              {
                id: crypto.randomUUID(),
                module: "Módulo 1",
                title: "",
                kind: "text",
                content: "",
                required: true,
                completion: "read",
              },
            ],
          })
        }
      >
        Añadir actividad
      </Button>
      <SelectField
        label="Acceso al curso"
        value={c.access}
        onChange={(e) => patch({ access: e.target.value as any })}
      >
        <option value="all">Todos los estudiantes</option>
        <option value="selected">Estudiantes seleccionados</option>
      </SelectField>
      {c.access === "selected" && (
        <ChoiceList
          label="Destinatarios"
          items={d.users}
          value={c.studentIds}
          onChange={(studentIds) => patch({ studentIds })}
        />
      )}
      <div className="training-split">
        <Field
          label="Disponible desde (hora de Ecuador)"
          type="datetime-local"
          value={c.availableFrom?.slice(0, 16) || ""}
          onChange={(e) =>
            patch({
              availableFrom: e.target.value ? e.target.value + ":00-05:00" : "",
            })
          }
        />
        <Field
          label="Disponible hasta (hora de Ecuador)"
          type="datetime-local"
          value={c.availableUntil?.slice(0, 16) || ""}
          onChange={(e) =>
            patch({
              availableUntil: e.target.value
                ? e.target.value + ":00-05:00"
                : "",
            })
          }
        />
      </div>
    </div>
  );
}
export function ProfileSelect({
  data: d,
  value: v,
  onChange,
}: {
  data: any;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <SelectField
      label="Perfil de admisión publicado"
      value={v.profileId ? v.profileId + ":" + v.profileVersion : ""}
      onChange={(e) => {
        const [profileId, n] = e.target.value.split(":");
        onChange({ profileId, profileVersion: Number(n) });
      }}
    >
      <option value="">Selecciona una convocatoria</option>
      {d.profiles
        .filter((p: any) => p.status === "published")
        .map((p: any) => (
          <option key={p.id + ":" + p.version} value={p.id + ":" + p.version}>
            {p.institution} · {p.period} · v{p.version}
          </option>
        ))}
    </SelectField>
  );
}
export function ProfileEditor({
  value: p,
  onChange: change,
  data: d,
}: {
  value: AdmissionProfile;
  onChange: (v: AdmissionProfile) => void;
  data: any;
}) {
  const patch = (v: Partial<AdmissionProfile>) => change({ ...p, ...v });
  return (
    <div className="training-editor">
      <Notice>
        Documenta la convocatoria concreta. Esta preparación es propia de la
        plataforma y no está certificada por la institución.
      </Notice>
      <Field
        label="Nombre del perfil"
        value={p.title}
        onChange={(e) => patch({ title: e.target.value })}
      />
      <SelectField
        label="Institución del catálogo CES"
        value={p.institution}
        onChange={(e) => patch({ institution: e.target.value })}
      >
        <option value="">Selecciona institución</option>
        {d.institutions.map((i: string) => (
          <option key={i}>{i}</option>
        ))}
      </SelectField>
      <div className="training-split">
        <Field
          label="Período o convocatoria"
          value={p.period}
          onChange={(e) => patch({ period: e.target.value })}
        />
        <Field
          label="Nivel"
          value={p.level}
          onChange={(e) => patch({ level: e.target.value })}
        />
        <Field
          label="Fuente oficial HTTPS"
          value={p.sourceUrl}
          onChange={(e) => patch({ sourceUrl: e.target.value })}
        />
        <Field
          label="Fecha de revisión de la fuente"
          type="date"
          value={p.reviewedAt}
          onChange={(e) => patch({ reviewedAt: e.target.value })}
        />
      </div>
      <ChoiceList
        label="Carreras incluidas en el alcance"
        items={d.careers}
        value={p.careerIds}
        onChange={(careerIds) => patch({ careerIds })}
      />
      <TextareaField
        label="Alcance y condiciones por grupo de carreras"
        value={p.scope}
        onChange={(e) => patch({ scope: e.target.value })}
      />
      <TextareaField
        label="Reglas documentadas por la institución"
        value={p.rules}
        onChange={(e) => patch({ rules: e.target.value })}
      />
      <TextareaField
        label="Configuración interna no indicada por la institución"
        value={p.internalRules}
        onChange={(e) => patch({ internalRules: e.target.value })}
      />
      <Field
        label="Duración en minutos"
        type="number"
        value={p.durationMinutes}
        onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
      />
      {p.areas.map((a, i) => (
        <div className="training-module" key={i}>
          <Field
            label="Área"
            value={a.name}
            onChange={(e) =>
              patch({
                areas: p.areas.map((x, j) =>
                  i === j ? { ...x, name: e.target.value } : x,
                ),
              })
            }
          />
          <Field
            label="Preguntas"
            type="number"
            value={a.count}
            onChange={(e) =>
              patch({
                areas: p.areas.map((x, j) =>
                  i === j ? { ...x, count: Number(e.target.value) } : x,
                ),
              })
            }
          />
          <Field
            label="Peso porcentual"
            type="number"
            value={a.weight}
            onChange={(e) =>
              patch({
                areas: p.areas.map((x, j) =>
                  i === j ? { ...x, weight: Number(e.target.value) } : x,
                ),
              })
            }
          />
          <Button
            variant="ghost"
            onClick={() => patch({ areas: p.areas.filter((_, j) => i !== j) })}
          >
            Quitar área
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          patch({ areas: [...p.areas, { name: "", count: 10, weight: 100 }] })
        }
      >
        Añadir área
      </Button>
    </div>
  );
}
export function SimulatorEditor({
  value: s,
  onChange: change,
  data: d,
}: {
  value: Simulator;
  onChange: (v: Simulator) => void;
  data: any;
}) {
  const [step, setStep] = useState(0),
    [qi, setQi] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [html, setHtml] = useState(""),
    [result, setResult] = useState<any>(null),
    [preview, setPreview] = useState<Simulator | null>(null),
    [answers, setAnswers] = useState<any>({});
  const patch = (v: Partial<Simulator>) => change({ ...s, ...v }),
    q = s.questions[qi],
    t = academicInstrument(s);
  const update = (v: any) =>
    patch({
      questions: s.questions.map((x, i) =>
        i === qi
          ? {
              ...x,
              ...v,
              bankId: undefined,
              bankVersion: undefined,
              reviewed: false,
            }
          : x,
      ),
    });
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      let data;
      if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true") {
        const { importDesignDocument } = await import("../../lib/design-import");
        data = await importDesignDocument(file);
      } else {
        const form = new FormData();
        form.append("file", file);
        const job = await readApiResponse(await fetch("/api/admin/import", { method: "POST", body: form }));
        for (let n = 0; n < 180; n++) {
          data = await readApiResponse(await fetch("/api/admin/import?id=" + job.id + "&status=1"));
          if (data.status === "Error") throw Error(data.error);
          if (data.status === "Completado") break;
          await new Promise((r) => setTimeout(r, 1000));
        }
        if (data?.status !== "Completado") throw Error("La extracción sigue en proceso. Consúltala en Evaluaciones.");
      }
      const tests = data.tests || [];
      if (!tests.length)
        throw Error("No se identificaron preguntas. Revisa el documento.");
      patch({
        title: s.title || tests[0].title,
        instrument: { ...s.instrument, source: file.name },
        questions: [
          ...s.questions,
          ...tests.flatMap((x: any) =>
            x.questions
              .filter((q: any) => q.type !== "info")
              .map((q: any) => ({
                ...q,
                id: crypto.randomUUID(),
                options: q.options || x.options,
                source: file.name,
                policy: "objective",
                reviewed: false,
              })),
          ),
        ],
      });
      setError((data.warnings || []).join(" "));
      setStep(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="training-editor">
      <nav className="training-tabs" aria-label="Editor de simulador">
        {["Información", "Preguntas", "Puntuación", "Aplicación", "Probar"].map(
          (label, i) => (
            <button
              key={label}
              aria-current={step === i ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              {i + 1}. {label}
            </button>
          ),
        )}
      </nav>
      {error && <Notice tone="warning">{error}</Notice>}
      {step === 0 && (
        <>
          <Field
            label="Nombre del simulador"
            value={s.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
          <TextareaField
            label="Instrucciones"
            value={s.instrument.description}
            onChange={(e) =>
              patch({
                instrument: { ...s.instrument, description: e.target.value },
              })
            }
          />
          <Field
            label="Fuente y método de evaluación"
            value={s.instrument.source || ""}
            onChange={(e) =>
              patch({ instrument: { ...s.instrument, source: e.target.value } })
            }
          />
          <SelectField
            label="Propósito"
            value={s.purpose}
            onChange={(e) => patch({ purpose: e.target.value as any })}
          >
            <option value="general">Práctica general</option>
            <option value="admission">Preparación para admisión</option>
          </SelectField>
          {s.purpose === "admission" && (
            <ProfileSelect data={d} value={s} onChange={patch} />
          )}
          <label>
            Importar Word, PDF o HTML
            <input
              type="file"
              accept=".docx,.pdf,.html,.htm"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          <TextareaField
            label="O pegar código HTML"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <Button
            disabled={busy || !html.trim()}
            variant="secondary"
            onClick={() =>
              upload(new File([html], "simulador.html", { type: "text/html" }))
            }
          >
            {busy ? "Extrayendo…" : "Extraer HTML"}
          </Button>
          <Notice>
            La importación crea preguntas sin revisar. Confirma claves,
            explicaciones y procedencia antes de publicar; no se ejecuta el
            código del documento.
          </Notice>
        </>
      )}
      {step === 1 && (
        <>
          <details>
            <summary>Reutilizar preguntas de un simulador publicado</summary>
            <SelectField
              label="Banco publicado"
              value=""
              onChange={(e) => {
                const source = d.simulators.find(
                  (x: any) => x.id + ":" + x.version === e.target.value,
                );
                if (!source) return;
                patch({
                  questions: [
                    ...s.questions,
                    ...source.questions
                      .filter(
                        (x: any) =>
                          !s.questions.some(
                            (q) => (q.bankId || q.id) === (x.bankId || x.id),
                          ),
                      )
                      .map((x: any) => ({
                        ...x,
                        bankId: x.bankId || x.id,
                        bankVersion: x.bankVersion || source.version,
                      })),
                  ],
                });
              }}
            >
              <option value="">
                Selecciona un banco para incorporar sus preguntas
              </option>
              {d.simulators
                .filter((x: any) => x.status === "published")
                .map((x: any) => (
                  <option
                    key={x.id + ":" + x.version}
                    value={x.id + ":" + x.version}
                  >
                    {x.title} · v{x.version} · {x.questions.length} preguntas
                  </option>
                ))}
            </SelectField>
            <small>
              Se conserva la identidad y versión de origen. Al editar se crea
              una revisión propia; los intentos anteriores no cambian.
            </small>
          </details>
          <SelectField
            label="Pregunta"
            value={String(qi)}
            onChange={(e) => setQi(Number(e.target.value))}
          >
            {s.questions.map((q, i) => (
              <option key={q.id} value={i}>
                {i + 1}. {q.text.slice(0, 65) || "Nueva pregunta"}
              </option>
            ))}
          </SelectField>
          {q && (
            <>
              <SelectField
                label="Tipo de respuesta"
                value={q.type || "single"}
                onChange={(e) =>
                  update({
                    type: e.target.value,
                    policy: e.target.value === "open" ? "rubric" : "objective",
                  })
                }
              >
                <option value="single">Selección única</option>
                <option value="multiple">Selección múltiple</option>
                <option value="number">Número</option>
                <option value="short">Texto breve con clave</option>
                <option value="open">Respuesta abierta con rúbrica</option>
              </SelectField>
              <TextareaField
                label="Enunciado"
                value={q.text}
                onChange={(e) => update({ text: e.target.value })}
              />
              <QuestionFormat test={t} q={q} onChange={update} />
              {q.options?.map((o, i) => (
                <Field
                  key={o.value}
                  label={"Opción " + (i + 1)}
                  value={o.label}
                  onChange={(e) =>
                    update({
                      options: q.options!.map((x, j) =>
                        i === j ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                />
              ))}
              {["single", "multiple", "yesno"].includes(q.type || "") && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    update({
                      options: [
                        ...(q.options || []),
                        {
                          value:
                            Math.max(
                              0,
                              ...(q.options || []).map((o) => o.value),
                            ) + 1,
                          label: "",
                        },
                      ],
                    })
                  }
                >
                  Añadir opción
                </Button>
              )}
              <Field
                label="Área o tema"
                value={q.topic || q.section || ""}
                onChange={(e) =>
                  update({ topic: e.target.value, section: e.target.value })
                }
              />
              <Field
                label="Procedencia de la pregunta"
                value={q.source || ""}
                onChange={(e) => update({ source: e.target.value })}
              />
              <SelectField
                label="Dificultad editorial estimada"
                value={q.difficulty || "introductory"}
                onChange={(e) => update({ difficulty: e.target.value })}
              >
                <option value="introductory">Introductoria</option>
                <option value="intermediate">Intermedia</option>
                <option value="advanced">Avanzada</option>
              </SelectField>
              <Button
                variant="ghost"
                onClick={() => {
                  patch({ questions: s.questions.filter((_, i) => i !== qi) });
                  setQi(0);
                }}
              >
                Quitar pregunta
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              patch({
                questions: [
                  ...s.questions,
                  {
                    id: crypto.randomUUID(),
                    text: "",
                    type: "single",
                    policy: "objective",
                    weight: 1,
                    source: s.instrument.source,
                    options: [
                      { value: 1, label: "Opción 1" },
                      { value: 2, label: "Opción 2" },
                    ],
                    reviewed: false,
                  },
                ],
              });
              setQi(s.questions.length);
            }}
          >
            Añadir pregunta
          </Button>
          <SelectField
            label="Selección al iniciar"
            value={s.selection}
            onChange={(e) => patch({ selection: e.target.value as any })}
          >
            <option value="fixed">Todas las preguntas, selección fija</option>
            <option value="random">Aleatoria por área o tema</option>
          </SelectField>
          {s.selection === "random" && (
            <>
              {[
                ...new Set(
                  s.questions.map((q) => q.topic || q.section || "General"),
                ),
              ].map((topic) => (
                <Field
                  key={topic}
                  label={"Cantidad de " + topic}
                  type="number"
                  min={0}
                  value={s.quotas.find((q) => q.topic === topic)?.count || 0}
                  onChange={(e) =>
                    patch({
                      quotas: [
                        ...s.quotas.filter((q) => q.topic !== topic),
                        ...(Number(e.target.value) > 0
                          ? [{ topic, count: Number(e.target.value) }]
                          : []),
                      ],
                    })
                  }
                />
              ))}
            </>
          )}
          <label>
            <input
              type="checkbox"
              checked={s.shuffleOptions}
              onChange={(e) => patch({ shuffleOptions: e.target.checked })}
            />{" "}
            Mezclar opciones al iniciar
          </label>
          {s.shuffleOptions && (
            <ChoiceList
              label="Preguntas con orden de opciones fijo"
              items={s.questions.map((q) => ({ id: q.id, name: q.text }))}
              value={s.questionOrderFixedIds}
              onChange={(questionOrderFixedIds) =>
                patch({ questionOrderFixedIds })
              }
            />
          )}
        </>
      )}
      {step === 2 && (
        <>
          <SelectField
            label="Pregunta para revisar"
            value={String(qi)}
            onChange={(e) => setQi(Number(e.target.value))}
          >
            {s.questions.map((q, i) => (
              <option key={q.id} value={i}>
                {i + 1}. {q.text.slice(0, 65)}
              </option>
            ))}
          </SelectField>
          {q && (
            <>
              <h3>{q.text}</h3>
              <SelectField
                label="Evaluación"
                value={q.policy || "objective"}
                onChange={(e) => update({ policy: e.target.value })}
              >
                <option value="objective">Clave objetiva</option>
                <option value="rubric">Rúbrica manual</option>
              </SelectField>
              <QuestionSettings
                value={q}
                onChange={update}
                options={q.options || []}
                objective={
                  q.policy !== "rubric" &&
                  ["single", "multiple", "yesno"].includes(q.type || "")
                }
              />
              <AcademicQuestionSettings q={q} change={update} />
              <TextareaField
                label="Explicación al estudiante"
                value={q.explanation || ""}
                onChange={(e) => update({ explanation: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={!!q.reviewed}
                  onChange={(e) =>
                    patch({
                      questions: s.questions.map((x, i) =>
                        i === qi ? { ...x, reviewed: e.target.checked } : x,
                      ),
                    })
                  }
                />{" "}
                He revisado la clave, explicación y procedencia
              </label>
            </>
          )}
          <Notice>
            El peso de cada pregunta representa sus puntos máximos en una clave
            objetiva. Omisiones y errores aportan cero; las rúbricas pendientes
            no reciben una nota definitiva.
          </Notice>
          <label>
            <input
              type="checkbox"
              checked={s.areaWeights.length > 0}
              onChange={(e) =>
                patch({
                  areaWeights: e.target.checked
                    ? [
                        ...new Set(
                          s.questions.map(
                            (q) => q.topic || q.section || "General",
                          ),
                        ),
                      ].map((area) => ({ area, weight: 0 }))
                    : [],
                })
              }
            />{" "}
            Ponderar áreas (deben sumar 100)
          </label>
          {s.areaWeights.map((a) => (
            <Field
              key={a.area}
              label={"Peso de " + a.area + " (%)"}
              type="number"
              value={a.weight}
              onChange={(e) =>
                patch({
                  areaWeights: s.areaWeights.map((x) =>
                    x.area === a.area
                      ? { ...x, weight: Number(e.target.value) }
                      : x,
                  ),
                })
              }
            />
          ))}
        </>
      )}
      {step === 3 && (
        <>
          <label>
            <input
              type="checkbox"
              checked={s.modes.includes("practice")}
              onChange={(e) =>
                patch({
                  modes: e.target.checked
                    ? [...s.modes, "practice"]
                    : s.modes.filter((m) => m !== "practice"),
                })
              }
            />{" "}
            Práctica
          </label>
          <label>
            <input
              type="checkbox"
              checked={s.modes.includes("exam")}
              onChange={(e) =>
                patch({
                  modes: e.target.checked
                    ? [...s.modes, "exam"]
                    : s.modes.filter((m) => m !== "exam"),
                })
              }
            />{" "}
            Modo examen
          </label>
          <Field
            label="Tiempo del examen en minutos"
            type="number"
            value={s.durationMinutes}
            onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
          />
          <Field
            label="Tiempo de práctica en minutos (0 = sin límite)"
            type="number"
            min={0}
            max={480}
            value={s.practiceDurationMinutes ?? s.durationMinutes}
            onChange={(e) =>
              patch({ practiceDurationMinutes: Number(e.target.value) })
            }
          />
          <Field
            label="Máximo de intentos por actividad y modo"
            type="number"
            value={s.maxAttempts}
            onChange={(e) => patch({ maxAttempts: Number(e.target.value) })}
          />
          <SelectField
            label="Calificación principal"
            value={s.gradePolicy}
            onChange={(e) => patch({ gradePolicy: e.target.value as any })}
          >
            <option value="first">Primer intento</option>
            <option value="last">Último intento</option>
            <option value="best">Mejor intento</option>
            <option value="mean">Media de la misma versión y modo</option>
          </SelectField>
          <SelectField
            label="Explicaciones en práctica"
            value={s.feedback}
            onChange={(e) => patch({ feedback: e.target.value as any })}
          >
            <option value="finish">Al terminar</option>
            <option value="question">Tras confirmar cada respuesta</option>
          </SelectField>
          <Notice>
            En examen, las explicaciones aparecen después de entregar. El
            recorrido conserva el tiempo y las versiones.
          </Notice>
        </>
      )}
      {step === 4 && (
        <>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                setPreview(
                  await trainingApi("/preview/select", { simulator: s }),
                );
                setAnswers({});
                setResult(null);
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Preparar vista previa
          </Button>
          {preview && (
            <>
              {preview.questions.map((q) => (
                <section className="training-module" key={q.id}>
                  <h3>{q.text}</h3>
                  <TestQuestion
                    instrument={academicInstrument(preview)}
                    question={q}
                    value={answers[q.id]}
                    onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                  />
                </section>
              ))}
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setResult(
                      await trainingApi("/preview", {
                        simulator: preview,
                        answers,
                      }),
                    );
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true" ? "Calcular resultado de muestra" : "Calcular con el servidor"}
              </Button>
              {result && (
                <Notice>
                  {result.percent ?? "Pendiente"} / 100 · {result.raw} de{" "}
                  {result.max} puntos. No se ha creado un intento de estudiante.
                </Notice>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

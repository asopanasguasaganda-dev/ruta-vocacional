"use client";
import { CatalogUpdate } from "./CatalogUpdate";
import { TrainingAnalytics } from "./TrainingAnalytics";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  SelectField,
  TextareaField,
} from "../../components/ui/primitives";
import { Dialog } from "../../components/ui/Dialog";
import {
  useTraining,
  trainingApi,
  TrainingError,
  Tabs,
  decimal,
} from "./shared";
import {
  CourseEditor,
  SimulatorEditor,
  ProfileEditor,
  blankCourse,
  blankSimulator,
  blankProfile,
} from "./TrainingEditors";
import { TrainingResult } from "./SimulatorRun";
import "./training.css";
export function AdminCourses() {
  const { data: d, error, busy, refresh, run } = useTraining(),
    [tab, setTab] = useState("Cursos"),
    [kind, setKind] = useState("course"),
    [editing, setEditing] = useState<any>(null),
    [query, setQuery] = useState(""),
    [preview, setPreview] = useState<any>(null),
    [review, setReview] = useState<any>(null),
    [reviews, setReviews] = useState<any>({}),
    [reason, setReason] = useState(""),
    [annulled, setAnnulled] = useState<string[]>([]),
    [assign, setAssign] = useState<any>(null),
    [studentId, setStudentId] = useState("");
  const perform = (fn: () => Promise<any>) => run(fn).catch(() => {});
  const open = (k: string, e: any) => {
    setKind(k);
    setEditing(structuredClone(e));
  };
  const versions = (list: any[]) =>
    list.filter((x: any) =>
      x.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
  const save = (publish = false) =>
    perform(async () => {
      const e = await trainingApi("/entity", {
        kind,
        entity: { ...editing, status: publish ? "published" : "draft" },
      });
      setEditing(publish ? null : e);
    });
  return (
    <div className="training">
      <PageHeader
        title="Cursos"
        description="Crea cursos de autopreparación para carreras y universidades de Ecuador. Añade material de estudio y simuladores con puntaje; los estudiantes encontrarán los cursos relacionados con las carreras de su informe."
      />
      <TrainingError error={error} retry={refresh} />
      {!d && !error && <p role="status">Cargando administración de cursos…</p>}
      {d && (
        <>
          <Tabs
            items={[
              "Cursos",
              "Simuladores y preguntas",
              "Carreras y convocatorias",
              "Seguimiento",
            ]}
            value={tab}
            onChange={(value) => {
              setTab(value);
              void refresh();
            }}
          />
          <div className="training-toolbar">
            <Field
              label="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {tab !== "Seguimiento" && (
              <Button
                onClick={() =>
                  open(
                    tab === "Cursos"
                      ? "course"
                      : tab === "Simuladores y preguntas"
                        ? "simulator"
                        : "profile",
                    tab === "Cursos"
                      ? blankCourse()
                      : tab === "Simuladores y preguntas"
                        ? blankSimulator()
                        : blankProfile(),
                  )
                }
              >
                Crear{" "}
                {tab === "Cursos"
                  ? "curso"
                  : tab === "Simuladores y preguntas"
                    ? "simulador"
                    : "perfil de admisión"}
              </Button>
            )}
          </div>
          {tab === "Carreras y convocatorias" && (
            <>
              <Notice>
                {d.source.careerCount} carreras con {d.source.offerCount}{" "}
                ofertas de grado en el catálogo consultado. No acredita cupos
                abiertos.
              </Notice>
              <CatalogUpdate refresh={refresh} />
              <details>
                <summary>Consultar catálogo CES y procedencia</summary>
                <a href={d.source.sourceUrl} target="_blank" rel="noreferrer">
                  Fuente oficial
                </a>
                <p>
                  Consulta: {d.source.date} · {d.source.scope}
                </p>
                <div className="training-choices">
                  {d.careers
                    .filter((c: any) =>
                      c.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((c: any) => (
                      <details key={c.id}>
                        <summary>
                          {c.name} · {c.offers.length} ofertas
                        </summary>
                        {c.offers.map((o: any) => (
                          <p key={o.id}>
                            {o.institution} · {o.title} · {o.location} ·{" "}
                            {o.modality} · ID {o.id}
                          </p>
                        ))}
                      </details>
                    ))}
                </div>
              </details>
            </>
          )}
          {tab !== "Seguimiento" ? (
            <div className="training-grid">
              {versions(
                tab === "Cursos"
                  ? d.courses
                  : tab === "Simuladores y preguntas"
                    ? d.simulators
                    : d.profiles,
              ).map((e: any) => {
                const k =
                  tab === "Cursos"
                    ? "course"
                    : tab === "Simuladores y preguntas"
                      ? "simulator"
                      : "profile";
                return (
                  <Card key={e.id + ":" + e.version}>
                    <small>
                      {e.status === "published"
                        ? "Publicado"
                        : e.status === "draft"
                          ? "Borrador"
                          : "Archivado"}{" "}
                      · Versión {e.version}
                    </small>
                    <h2>{e.title || "Sin título"}</h2>
                    <p>
                      {e.description || e.instrument?.description || e.period}
                    </p>
                    <div className="training-actions">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          open(
                            k,
                            e.status === "draft"
                              ? e
                              : {
                                  ...e,
                                  status: "draft",
                                  version: 0,
                                  revision: 0,
                                },
                          )
                        }
                      >
                        {e.status === "draft" ? "Editar" : "Nueva versión"}
                      </Button>
                      {k === "course" && (
                        <Button variant="ghost" onClick={() => setPreview(e)}>
                          Vista de estudiante
                        </Button>
                      )}
                      {e.status==='draft'&&<Button variant="ghost" disabled={busy} onClick={()=>{if(window.confirm('¿Descartar este borrador?'))perform(()=>trainingApi('/delete-draft',{kind:k,id:e.id,version:e.version,revision:e.revision}));}}>Descartar borrador</Button>}
                      {e.status === "published" && (
                        <>
                          <Button
                            variant="ghost"
                            disabled={busy}
                            onClick={() =>
                              perform(() =>
                                trainingApi("/archive", {
                                  kind: k,
                                  id: e.id,
                                  version: e.version,
                                }),
                              )
                            }
                          >
                            Archivar
                          </Button>
                          {k === "course" && (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setAssign(e);
                                setStudentId("");
                              }}
                            >
                              Asignar estudiante
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              <div className="training-summary">
                <div>
                  <strong>
                    {new Set(d.enrollments.map((e: any) => e.user_id)).size}
                  </strong>
                  <p>Estudiantes inscritos</p>
                </div>
                <div>
                  <strong>
                    {
                      d.enrollments.filter((e: any) => e.progress.completed > 0)
                        .length
                    }
                  </strong>
                  <p>Inscripciones con avance</p>
                </div>
                <div>
                  <strong>
                    {
                      d.attempts.filter((a: any) => a.mode === "practice")
                        .length
                    }
                  </strong>
                  <p>Intentos de práctica</p>
                </div>
                <div>
                  <strong>
                    {d.attempts.filter((a: any) => a.mode === "exam").length}
                  </strong>
                  <p>Intentos de examen</p>
                </div>
              </div>
              <TrainingAnalytics attempts={d.attempts} />
              <h2>Inscripciones e itinerarios</h2>
              <div className="training-grid">
                {d.enrollments
                  .filter((e: any) =>
                    e.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((e: any) => (
                    <Card key={e.id}>
                      <h3>{e.name}</h3>
                      <p>
                        {e.snapshot.title} · Versión {e.course_version}
                      </p>
                      <p>
                        {e.progress.completed} / {e.progress.total} actividades
                        requeridas · {decimal(e.progress.percent)} %
                      </p>
                      <progress value={e.progress.percent} max={100} />
                      <small>{e.created_at}</small>
                    </Card>
                  ))}
              </div>
              <h2>Intentos y revisión</h2>
              {!d.attempts.length && <p>No hay intentos registrados.</p>}
              {d.attempts
                .filter((a: any) =>
                  a.name?.toLowerCase().includes(query.toLowerCase()),
                )
                .map((a: any) => (
                  <details key={a.id}>
                    <summary>
                      {a.name} · {a.instrument.title} ·{" "}
                      {a.mode === "exam" ? "Examen" : "Práctica"} ·{" "}
                      {a.state==='annulled'?'Anulado':a.state === "pending-review"
                        ? "Revisión pendiente"
                        : a.result
                          ? decimal(a.result.percent) + " / 100"
                          : "En curso"}
                    </summary>
                    {a.result && <TrainingResult attempt={a} />}
                    <p>
                      Inicio: {new Date(a.started_at).toLocaleString("es-EC")} ·
                      Versión {a.instrument.version}
                    </p>
                    {a.result && (
                      <Button
                        onClick={() => {
                          setReview(a);
                          setReviews(a.result.reviews || {});
                          setAnnulled(a.result.annulled || []);
                          setReason("");
                        }}
                      >
                        Revisar calificación
                      </Button>
                    )}
                  </details>
                ))}
              <details>
                <summary>Auditoría</summary>
                {d.audit.map((a: any) => (
                  <p key={a.id}>
                    {a.created_at} · {a.action} · {a.entity}
                  </p>
                ))}
              </details>
            </>
          )}
        </>
      )}
      <Dialog
        open={!!editing}
        title={
          kind === "course"
            ? "Editor de curso"
            : kind === "simulator"
              ? "Editor de simulador"
              : "Perfil de admisión"
        }
        onClose={() => setEditing(null)}
      >
        {editing && d && (
          <div className="training">
            <TrainingError error={error} retry={refresh} />
            {kind === "course" ? (
              <CourseEditor value={editing} onChange={setEditing} data={d} />
            ) : kind === "simulator" ? (
              <SimulatorEditor value={editing} onChange={setEditing} data={d} />
            ) : (
              <ProfileEditor value={editing} onChange={setEditing} data={d} />
            )}
            <div className="training-actions">
              <Button
                disabled={busy}
                variant="secondary"
                onClick={() => save()}
              >
                Guardar borrador
              </Button>
              <Button disabled={busy} onClick={() => save(true)}>
                Validar y publicar
              </Button>
            </div>
            <small>
              Publicar conserva la versión. Los cambios posteriores se realizan
              en una nueva versión.
            </small>
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!preview}
        title="Vista de estudiante"
        onClose={() => setPreview(null)}
      >
        {preview && (
          <div className="training">
            <h2>{preview.title}</h2>
            <p>{preview.description}</p>
            <p>{preview.objectives}</p>
            {preview.activities.map((a: any) => (
              <Card key={a.id}>
                <small>
                  {a.module} · {a.required ? "Requerida" : "Opcional"}
                </small>
                <h3>{a.title}</h3>
                {a.kind === "text" ? (
                  <p className="training-lesson">{a.content}</p>
                ) : a.kind === "link" ? (
                  <a href={a.content} target="_blank" rel="noreferrer">
                    Abrir recurso
                  </a>
                ) : (
                  <p>
                    Simulador · Finaliza al{" "}
                    {a.completion === "score"
                      ? "alcanzar " + a.target + " / 100"
                      : "entregar un intento"}
                    .
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!assign}
        title="Asignar curso"
        onClose={() => setAssign(null)}
      >
        {d && (
          <div className="training">
            <p>{assign?.title}</p>
            <SelectField
              label="Estudiante"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Selecciona</option>
              {d.users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </SelectField>
            <Button
              disabled={busy || !studentId}
              onClick={() =>
                perform(async () => {
                  await trainingApi("/enroll", {
                    courseId: assign.id,
                    studentId,
                  });
                  setAssign(null);
                })
              }
            >
              Asignar de forma persistente
            </Button>
          </div>
        )}
      </Dialog>
      <Dialog
        open={!!review}
        title="Revisión de resultado"
        onClose={() => setReview(null)}
      >
        {review && (
          <div className="training">
            <TrainingError error={error} retry={refresh} />
            {review.privateQuestions
              .filter((q: any) => q.policy === "rubric")
              .map((q: any) => (
                <section key={q.id}>
                  <h3>{q.text}</h3>
                  <p>{String(review.result.answers[q.id] || "Omitida")}</p>
                  {q.rubric?.map((r: any) => (
                    <SelectField
                      key={r.id}
                      label={r.label}
                      value={reviews[q.id]?.[r.id] || ""}
                      onChange={(e) =>
                        setReviews({
                          ...reviews,
                          [q.id]: { ...reviews[q.id], [r.id]: e.target.value },
                        })
                      }
                    >
                      <option value="">Selecciona nivel</option>
                      {r.levels.map((l: any) => (
                        <option key={l.id} value={l.id}>
                          {l.label} · {l.points} puntos
                        </option>
                      ))}
                    </SelectField>
                  ))}
                </section>
              ))}
            <fieldset>
              <legend>Anular preguntas de este intento</legend>
              <p>
                Se excluyen del máximo de su área. Si no quedan preguntas en un
                área ponderada, el intento completo queda anulado. Se conserva
                el resultado anterior.
              </p>
              {review.privateQuestions.map((q: any) => (
                <label key={q.id}>
                  <input
                    type="checkbox"
                    checked={annulled.includes(q.id)}
                    onChange={(e) =>
                      setAnnulled(
                        e.target.checked
                          ? [...annulled, q.id]
                          : annulled.filter((id) => id !== q.id),
                      )
                    }
                  />
                  {q.text}
                </label>
              ))}
            </fieldset>
            <TextareaField
              label="Motivo de la revisión"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              disabled={busy}
              onClick={() =>
                perform(async () => {
                  await trainingApi("/review", {
                    id: review.id,
                    revision: review.result.revision,
                    reviews,
                    reason,
                    annulled,
                  });
                  setReview(null);
                })
              }
            >
              Guardar nueva revisión
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}

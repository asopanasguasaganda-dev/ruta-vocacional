"use client";
import {PagedList} from "../../components/ui/PagedList";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  SelectField,
} from "../../components/ui/primitives";
import { Dialog } from "../../components/ui/Dialog";
import {
  useTraining,
  trainingApi,
  TrainingError,
  Tabs,
  ChoiceList,
  decimal,
} from "./shared";
import { SimulatorRun, TrainingResult } from "./SimulatorRun";
import "./training.css";
export function StudentCourses() {
  const { data: d, error, busy, refresh, run } = useTraining(),
    [tab, setTab] = useState("Para ti"),
    [query, setQuery] = useState(""),
    [career, setCareer] = useState(""),
    [area, setArea] = useState(""),
    [institution, setInstitution] = useState(""),
    [type, setType] = useState(""),
    [detail, setDetail] = useState<any>(null),
    [current, setCurrent] = useState<any>(null),
    [active, setActive] = useState<any>(null),
    [goalOpen, setGoalOpen] = useState(false),
    [goal, setGoal] = useState<any>({ careerIds: [], fields: [] });
  const recommendedIds=new Set<string>((d?.recommendations||[]).map((r:any)=>r.careerId));
  const recommendedCareers=(d?.careers||[]).filter((c:any)=>recommendedIds.has(c.id));
  useEffect(()=>{if(!d)return;const id=new URLSearchParams(window.location.search).get('carrera');if(id&&d.recommendations.some((r:any)=>r.careerId===id)){setCareer(id);setTab('Explorar');}},[d?.recommendations?.map((r:any)=>r.careerId).join(',')]);
  const perform = (fn: () => Promise<any>) => run(fn).catch(() => {});
  useEffect(() => {
    if (current && d) {
      const latest = d.enrollments.find((e: any) => e.id === current.id);
      if (latest) setCurrent(latest);
    }
  }, [d]);
  if (active)
    return (
      <div className="training">
        <SimulatorRun
          initial={active}
          onClose={() => {
            setActive(null);
            refresh();
          }}
        />
      </div>
    );
  const courses =
    d?.courses?.filter(
      (c: any) =>
        c.careerIds.some((id:string)=>recommendedIds.has(id)) && c.title.toLowerCase().includes(query.toLowerCase()) &&
        (!career || c.careerIds.includes(career)) &&
        (!area ||
          c.fields.includes(area) ||
          c.careerIds.some((id: string) =>
            d.careers.some((x: any) => x.id === id && x.area === area),
          )) &&
        (!type || c.type === type) &&
        (!institution ||
          c.institutions?.includes(institution) || d.profiles.some(
            (p: any) => p.id === c.profileId && p.institution === institution,
          )),
    ) || [];
  return (
    <div className="training">
      <PageHeader
        title="Cursos de autopreparación"
        description="Prepárate para ingresar a la universidad. Encuentra cursos según las carreras sugeridas en tu informe, estudia y practica con simuladores que muestran tu puntaje."
      />
      <TrainingError error={error} retry={refresh} />
      {!d && !error && <p role="status">Cargando preparación…</p>}
      {d && (
        <>
          <Tabs
            items={["Para ti", "Mis cursos", "Explorar"]}
            value={tab}
            onChange={(v) => {
              setTab(v);
              void refresh();
              setCurrent(null);
            }}
          />
          <div className="training-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setGoal(d.goal);
                setGoalOpen(true);
              }}
            >
              Ajustar mi preparación
            </Button>
          </div>
          {current ? (
            <Card>
              <Button variant="ghost" onClick={() => setCurrent(null)}>
                Volver a mis cursos
              </Button>
              <h2>{current.snapshot.title}</h2>
              <p>{current.snapshot.objectives}</p>
              <p>
                {current.progress.completed} de {current.progress.total}{" "}
                actividades requeridas · {decimal(current.progress.percent)} %
              </p>
              <progress max={100} value={current.progress.percent} />
              {current.snapshot.activities.map((a: any) => {
                const s = d.simulators.find(
                    (s: any) =>
                      s.id === a.simulatorId &&
                      s.version === a.simulatorVersion,
                  ),
                  attempts = d.attempts.filter(
                    (x: any) =>
                      x.enrollment_id === current.id && x.activity_id === a.id,
                  );
                return (
                  <section className="training-module" key={a.id}>
                    <small>
                      {a.module} · {a.required ? "Requerida" : "Opcional"} ·{" "}
                      {current.completed.includes(a.id)
                        ? "Completada"
                        : "Por completar"}
                    </small>
                    <h3>{a.title}</h3>
                    {a.kind === "text" ? (
                      <p className="training-lesson">{a.content}</p>
                    ) : a.kind === "link" ? (
                      <a href={a.content} target="_blank" rel="noreferrer">
                        Abrir recurso de estudio
                      </a>
                    ) : (
                      <>
                        <p>
                          {s?.questionCount} preguntas · Examen:{" "}
                          {s?.durationMinutes} minutos · Práctica:{" "}
                          {s?.practiceDurationMinutes
                            ? s.practiceDurationMinutes + " minutos"
                            : "sin límite"}{" "}
                          · Hasta {s?.maxAttempts} intentos por modo. Nota
                          principal:{" "}
                          {
                            (
                              {
                                first: "primera",
                                last: "última",
                                best: "mejor",
                                mean: "media",
                              } as any
                            )[s?.gradePolicy || "last"]
                          }
                          .
                        </p>
                        <small>
                          {s?.modes
                            .map(
                              (mode: string) =>
                                (mode === "exam" ? "Examen" : "Práctica") +
                                ": " +
                                attempts.filter((x: any) => x.mode === mode)
                                  .length +
                                " de " +
                                s.maxAttempts +
                                " intentos utilizados",
                            )
                            .join(" · ")}
                        </small>
                        {current.grades
                          ?.filter((g: any) => g.activityId === a.id)
                          .map((g: any) => (
                            <p key={g.mode + g.version}>
                              Nota principal de{" "}
                              {g.mode === "exam" ? "examen" : "práctica"}:{" "}
                              {decimal(g.percent)} / 100 · {g.count} intentos
                              calificados · v{g.version}
                            </p>
                          ))}
                        <small>
                          Omisiones: cero puntos. Nota automática al entregar. Preparación propia de la
                          plataforma.
                        </small>
                        <div className="training-actions">
                          {s?.modes.map((mode: string) => (
                            <Button
                              key={mode}
                              disabled={busy}
                              onClick={() =>
                                perform(async () =>
                                  setActive(
                                    await trainingApi("/start", {
                                      enrollmentId: current.id,
                                      activityId: a.id,
                                      mode,
                                    }),
                                  ),
                                )
                              }
                            >
                              {attempts.some(
                                (x: any) =>
                                  x.mode === mode && x.state === "in_progress",
                              )
                                ? "Continuar"
                                : "Iniciar"}{" "}
                              {mode === "exam" ? "examen" : "práctica"}
                            </Button>
                          ))}
                        </div>
                        {attempts.map((x: any) => (
                          <details key={x.id}>
                            <summary>
                              {x.mode === "exam" ? "Examen" : "Práctica"} ·{" "}
                              {new Date(x.started_at).toLocaleString("es-EC")} ·{" "}
                              {x.state==='annulled'?'Anulado':x.result
                                ? decimal(x.result.percent) + " / 100"
                                : x.state === "in_progress"
                                  ? "En curso"
                                  : "Pendiente"}
                            </summary>
                            {x.result ? (
                              <TrainingResult attempt={x} />
                            ) : (
                              <Button onClick={() => setActive(x)}>
                                Continuar intento
                              </Button>
                            )}
                          </details>
                        ))}
                      </>
                    )}
                    {a.kind !== "simulator" &&
                      !current.completed.includes(a.id) && (
                        <Button
                          disabled={busy}
                          onClick={() =>
                            perform(async () =>
                              setCurrent(
                                await trainingApi("/read", {
                                  enrollmentId: current.id,
                                  activityId: a.id,
                                }),
                              ),
                            )
                          }
                        >
                          Confirmar lectura completada
                        </Button>
                      )}
                    {a.kind === "simulator" && (
                      <small>
                        Finalización:{" "}
                        {a.completion === "score"
                          ? "alcanzar " + a.target + " / 100"
                          : "entregar un intento"}
                        .
                      </small>
                    )}
                  </section>
                );
              })}
            </Card>
          ) : (
            <>
              {tab === "Para ti" && (
                <>
                  {!d.recommendations.length ? (
                    <div className="training-empty">
                      <h2>Tu preparación puede empezar hoy</h2>
                      <p>
                        Completa un test para consultar carreras relacionadas
                        con tu informe. Después verás aquí su preparación disponible.
                      </p>
                      <Link
                        href="/mi-ruta/evaluaciones"
                        className="button button--secondary"
                      >
                        Ir a mis tests
                      </Link>

                    </div>
                  ) : (
                    <PagedList className="training-grid" label="cursos y carreras" resetKey={tab+query+career+area+institution+type}>
                      {d.recommendations.map((r: any) => {
                        const c = d.careers.find(
                          (c: any) => c.id === r.careerId,
                        );
                        if (!c) return null;
                        const count = d.courses.filter((x: any) =>
                          x.careerIds.includes(c.id),
                        ).length;
                        return (
                          <Card key={c.id}>
                            <small>Carrera · {c.area}</small>
                            <h2>{c.name}</h2>
                            <p>{r.reason}</p>
                            <p>
                              {count
                                ? count + " cursos relacionados"
                                : "Aún no hay cursos publicados para esta carrera"}
                            </p>
                            <div className="training-actions">
                              <Button
                                variant="secondary"
                                onClick={() => setDetail(c)}
                              >
                                Ver carrera
                              </Button>
                              {count > 0 && (
                                <Button
                                  onClick={() => {
                                    setCareer(c.id);
                                    setTab("Explorar");
                                  }}
                                >
                                  Seguir curso
                                </Button>
                              )}
                            </div>
                            <small>
                              Informe {r.reportVersion} · Relación{" "}
                              {r.mappingVersion}
                            </small>
                          </Card>
                        );
                      })}
                    </PagedList>
                  )}
                  <h2>Cursos para tus carreras recomendadas</h2>
                  {d.courses.filter((c: any) => c.recommended).length === 0 && (
                    <p>
                      No hay cursos publicados que coincidan con tus objetivos
                      actuales.
                    </p>
                  )}
                </>
              )}
              {tab === "Mis cursos" ? (
                d.enrollments.length ? (
                  <PagedList className="training-grid" label="cursos y carreras" resetKey={tab+query+career+area+institution+type}>
                    {d.enrollments.map((e: any) => (
                      <Card key={e.id}>
                        <small>Curso · Versión {e.course_version}</small>
                        <h2>{e.snapshot.title}</h2>
                        <p>{e.snapshot.description}</p>
                        <p>
                          {e.progress.completed} / {e.progress.total}{" "}
                          actividades requeridas · {decimal(e.progress.percent)}{" "}
                          %
                        </p>
                        <progress max={100} value={e.progress.percent} />
                        {e.latestResult && (
                          <p>
                            Última calificación (
                            {e.latestResult.mode === "exam"
                              ? "examen"
                              : "práctica"}
                            ): {decimal(e.latestResult.percent)} / 100
                          </p>
                        )}
                        <p>
                          {e.next
                            ? "Siguiente: " + e.next.title
                            : "Itinerario completado"}
                        </p>
                        <Button onClick={() => setCurrent(e)}>
                          {e.next ? "Continuar" : "Ver resultados"}
                        </Button>
                      </Card>
                    ))}
                  </PagedList>
                ) : (
                  <p className="training-empty">
                    Todavía no has iniciado un curso. Explora la preparación
                    publicada.
                  </p>
                )
              ) : (
                <>
                  {tab === "Explorar" && (
                    <>
                      {career&&<Notice><b>Preparación para {recommendedCareers.find((c:any)=>c.id===career)?.name}</b><p>Estos cursos y simuladores corresponden a la carrera de tus resultados.</p></Notice>}<div className="training-split">
                        <Field
                          label="Buscar curso"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        <SelectField
                          label="Carrera"
                          value={career}
                          onChange={(e) => setCareer(e.target.value)}
                        >
                          <option value="">Tus carreras recomendadas</option>
                          {recommendedCareers.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </SelectField>
                        <SelectField
                          label="Área"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        >
                          <option value="">Todas las áreas</option>
                          {[
                            ...new Set<string>(
                              recommendedCareers.map((c: any) => c.area),
                            ),
                          ].map((a) => (
                            <option key={a}>{a}</option>
                          ))}
                        </SelectField>
                        <SelectField
                          label="Institución"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                        >
                          <option value="">Todas las instituciones</option>
                          {d.institutions.map((i: string) => (
                            <option key={i}>{i}</option>
                          ))}
                        </SelectField>
                        <SelectField
                          label="Preparación"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <option value="">Todos los tipos</option>
                          <option value="general">General</option>
                          <option value="field">Introducción a un campo</option>
                          <option value="admission">
                            Convocatoria institucional
                          </option>
                        </SelectField>
                      </div>
                    </>
                  )}
                  <PagedList className="training-grid" label="cursos y carreras" resetKey={tab+query+career+area+institution+type}>
                    {(tab === "Para ti"
                      ? courses
                      : courses
                    ).map((c: any) => (
                      <Card key={c.id}>
                        <small>
                          {c.type === "admission"
                            ? "Preparación propia para convocatoria"
                            : "Preparación general"}{" "}
                          · Versión {c.version}
                        </small>
                        <h2>{c.title}</h2>
                        <p>{c.description}</p>
                        <p>{c.careerIds.map((id: string) => d.careers.find((career: any) => career.id === id)?.name).filter(Boolean).join(" · ")}</p>
                        {(c.institutions?.length > 0 || c.profileId) && <small>Universidad: {(c.institutions?.length ? c.institutions : [d.profiles.find((p: any) => p.id === c.profileId && p.version === c.profileVersion)?.institution]).filter(Boolean).join(" · ")}</small>}
                        {c.reasons?.map((r: string) => (
                          <small key={r}>{r}</small>
                        ))}
                        <p>
                          {c.activities.length} actividades · {c.activities.filter((a: any) => a.kind === "simulator").length} simuladores con puntaje · {c.level}
                        </p>
                        <Button
                          disabled={busy}
                          onClick={() =>
                            perform(async () => {
                              const e = await trainingApi("/enroll", {
                                courseId: c.id,
                              });
                              setCurrent(e);
                              setTab("Mis cursos");
                            })
                          }
                        >
                          {d.enrollments.some((e: any) => e.course_id === c.id)
                            ? "Continuar curso"
                            : "Empezar curso"}
                        </Button>
                      </Card>
                    ))}
                  </PagedList>
                  {tab === "Explorar" && !courses.length && (
                    <p className="training-empty">
                      No hay cursos publicados con estos filtros. Las carreras
                      siguen disponibles para consultar.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      <Dialog
        open={!!detail}
        title={detail?.name || "Carrera"}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div className="training">
            <p>{detail.description}</p>
            <Notice>
              La oferta registrada no confirma cupos ni inscripciones abiertas.
              Consulta en la institución.
            </Notice>
            {detail.offers.map((o: any) => (
              <Card key={o.id}>
                <h3>{o.institution}</h3>
                <p>
                  {o.title} · {o.location} · {o.modality}
                </p>
                <small>Oferta {o.id}</small>
              </Card>
            ))}
            <a href={detail.sourceUrl} target="_blank" rel="noreferrer">
              Fuente oficial CES
            </a>
            <small>Consulta: {detail.sourceDate}</small>
          </div>
        )}
      </Dialog>
      <Dialog
        open={goalOpen}
        title="Tus objetivos de preparación"
        onClose={() => setGoalOpen(false)}
      >
        {d && (
          <div className="training-editor">
            <ChoiceList
              label="Carreras"
              items={recommendedCareers}
              value={goal.careerIds}
              onChange={(careerIds) => setGoal({ ...goal, careerIds })}
            />
            <ChoiceList
              label="Áreas"
              items={[
                ...new Set<string>(recommendedCareers.map((c: any) => c.area)),
              ].map((a) => ({ id: a, name: a }))}
              value={goal.fields}
              onChange={(fields) => setGoal({ ...goal, fields })}
            />
            <SelectField
              label="Convocatoria (opcional)"
              value={
                goal.profileId ? goal.profileId + ":" + goal.profileVersion : ""
              }
              onChange={(e) => {
                const [profileId, version] = e.target.value.split(":");
                setGoal({
                  ...goal,
                  profileId,
                  profileVersion: Number(version),
                });
              }}
            >
              <option value="">Sin convocatoria seleccionada</option>
              {d.profiles.map((p: any) => (
                <option
                  key={p.id + ":" + p.version}
                  value={p.id + ":" + p.version}
                >
                  {p.institution} · {p.period} · v{p.version}
                </option>
              ))}
            </SelectField>
            <Button
              disabled={busy}
              onClick={() =>
                perform(async () => {
                  await trainingApi("/goal", goal, "PUT");
                  setGoalOpen(false);
                })
              }
            >
              Guardar objetivos
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}

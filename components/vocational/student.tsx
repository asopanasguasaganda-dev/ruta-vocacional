"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Gem,
  GraduationCap,
  Info,
  Lightbulb,
  Map,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  UserRound,
  X,
  Scale,
} from "lucide-react";
import { assessments, careers, dimensions, resources } from "./data";
import {
  courseQuestions,
  riasecQuestions,
  selfQuestions,
} from "@/lib/questionnaires";
import { valueQuestions } from "./assessments";
import { ButtonLink, Modal, PageTitle, Progress, useRouteData } from "./app";

export function StudentPage({ path }: { path: string }) {
  if (path.endsWith("/evaluaciones")) return <Evaluations />;
  if (path.endsWith("/resultados")) return <Results />;
  if (path.endsWith("/carreras")) return <Careers />;
  if (path.endsWith("/plan")) return <Plan />;
  if (path.endsWith("/recursos")) return <Resources />;
  if (path.endsWith("/perfil")) return <Profile />;
  return <Dashboard />;
}
function Dashboard() {
  const { data } = useRouteData();
  const completed =
    assessments
      .slice(0, 3)
      .filter(
        (a) => (data.answers[a.id]?.filter(Boolean).length || 0) === a.total,
      ).length +
    (Object.values(data.reflections).filter((v) => v.trim()).length === 8
      ? 1
      : 0);
  const next = assessments
    .slice(0, 3)
    .find((a) => (data.answers[a.id]?.filter(Boolean).length || 0) < a.total);
  const current = next || assessments[0];
  const count = data.answers[current.id]?.filter(Boolean).length || 0;
  const favorites = careers.filter((c) => data.favorites.includes(c.id));
  return (
    <>
      <span className="eyebrow compact">Tu espacio personal</span>
      <PageTitle
        before="Hola,"
        accent={data.name ? data.name.split(" ")[0] : "explorador/a"}
        description="Cada paso te ayuda a conocerte mejor."
      />
      <section className="welcome-banner">
        <div>
          <h2>
            {next ? (
              <>
                Continúa descubriendo
                <br />
                lo que te interesa
              </>
            ) : (
              <>
                Tus descubrimientos
                <br />
                abren nuevos caminos
              </>
            )}
          </h2>
          <p>
            <strong>{completed} de 4</strong> etapas completadas
          </p>
          <div className="banner-progress">
            <Progress value={completed * 25} />
            <span>{completed * 25}%</span>
          </div>
          <ButtonLink href={next?.href || "/mi-ruta/plan"} variant="white">
            <Target size={19} />
            {next
              ? `Continuar ${next.short.toLowerCase()}`
              : "Construir mi plan"}{" "}
            <ArrowRight size={19} />
          </ButtonLink>
        </div>
        <img
          src="/assets/brain.webp"
          alt="Cerebro violeta y azul sobre un libro abierto"
          width="279"
          height="226"
        />
      </section>
      <div className="route-steps">
        {[
          ...assessments.slice(0, 3),
          {
            id: "plan",
            short: "Mi plan",
            href: "/mi-ruta/plan",
            icon: Map,
            total: 8,
          },
        ].map((a, i) => {
          const n =
            a.id === "plan"
              ? Object.values(data.reflections).filter((v) => v.trim()).length
              : data.answers[a.id]?.filter(Boolean).length || 0;
          return (
            <Link
              href={a.href}
              key={a.id}
              className={`route-step ${next?.id === a.id ? "current" : ""}`}
            >
              <span className="step-number">0{i + 1}</span>
              <a.icon />
              <div>
                <strong>{a.short}</strong>
                <span
                  className={`badge ${n === a.total ? "teal" : n ? "purple" : ""}`}
                >
                  {n === a.total ? "Completado" : n ? "En curso" : "Pendiente"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Tu siguiente paso</h2>
          <p>
            Completa la exploración para descubrir qué actividades y temas te
            motivan.
          </p>
          <div className="next-assessment">
            <span className="tile-icon">
              <current.icon />
            </span>
            <div>
              <h3>{current.title}</h3>
              <p>
                {count} de {current.total} respuestas guardadas
              </p>
              <Progress value={Math.round((count / current.total) * 100)} />
            </div>
          </div>
          <ButtonLink
            href={next?.href || "/mi-ruta/resultados"}
            className="full"
          >
            {next ? "Continuar ahora" : "Ver mis resultados"}
            <ArrowRight size={18} />
          </ButtonLink>
        </section>
        <section className="panel">
          <h2>Explora mientras avanzas</h2>
          <p>
            Descubre información útil que te ayudará a tomar decisiones más
            informadas.
          </p>
          {[
            {
              title: "Conoce una carrera",
              text: "Explora perfiles, áreas de estudio y campos laborales.",
              image: "psychology",
              href: "/mi-ruta/carreras",
            },
            {
              title: "Prepara tus preguntas",
              text: "Resuelve tus dudas y prepara tu próxima conversación.",
              image: "software",
              href: "/mi-ruta/recursos",
            },
          ].map((x) => (
            <Link href={x.href} className="mini-resource" key={x.title}>
              <img
                src={`/assets/${x.image}.webp`}
                alt=""
                width="80"
                height="82"
              />
              <div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
              <ChevronRight size={18} />
            </Link>
          ))}
        </section>
        <section className="panel favorite-panel">
          <div className="panel-heading">
            <h2>
              <Bookmark />
              Mis favoritos
            </h2>
            <Link href="/mi-ruta/carreras">Ver todos</Link>
          </div>
          <p>Carreras que te interesan por ahora.</p>
          {favorites.length ? (
            favorites.slice(0, 3).map((c) => (
              <Link
                className="mini-resource bordered"
                href="/mi-ruta/carreras"
                key={c.id}
              >
                <img
                  src={`/assets/${c.image}.webp`}
                  alt=""
                  width="56"
                  height="66"
                />
                <h3>{c.title}</h3>
                <ChevronRight size={16} />
              </Link>
            ))
          ) : (
            <div className="empty-small">
              <Bookmark />
              <p>Guarda las carreras que despierten tu curiosidad.</p>
              <ButtonLink href="/mi-ruta/carreras" variant="outline">
                Explorar carreras
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function Evaluations() {
  const { data } = useRouteData();
  return (
    <>
      <div className="save-banner">
        <ShieldCheck size={21} />
        <span>Tu progreso se guarda por actividad.</span>
        <span className="badge purple">En este dispositivo</span>
      </div>
      <PageTitle
        before="Mis"
        accent="evaluaciones"
        description="Conoce tus intereses, valores y forma de decidir."
      />
      <div className="evaluation-grid">
        {assessments.map((a) => {
          const count = data.answers[a.id]?.filter(Boolean).length || 0;
          const done = count === a.total;
          return (
            <article
              key={a.id}
              className={`panel evaluation-card ${a.id === "laboratorio" ? "teal-panel" : ""}`}
            >
              <div className="evaluation-top">
                <span
                  className={`tile-icon large ${a.id === "laboratorio" ? "tone-1" : ""}`}
                >
                  <a.icon />
                </span>
                <div>
                  <h2>{a.title}</h2>
                  <p>{a.description}</p>
                  <span className="meta">
                    <FileText size={17} />
                    {a.total}{" "}
                    {a.id === "laboratorio" ? "actividades" : "preguntas"}
                  </span>
                </div>
                <span
                  className={`badge ${done ? "teal" : count ? "purple" : ""}`}
                >
                  {a.id === "laboratorio"
                    ? "Opcional"
                    : done
                      ? "Completado"
                      : count
                        ? "En curso"
                        : "Pendiente"}
                </span>
              </div>
              <div className="evaluation-bottom">
                {count > 0 && (
                  <div className="evaluation-progress">
                    <div>
                      <span>
                        {count} de {a.total} respondidas
                      </span>
                      <strong>{Math.round((count / a.total) * 100)}%</strong>
                    </div>
                    <Progress value={Math.round((count / a.total) * 100)} />
                  </div>
                )}
                <ButtonLink
                  href={a.href}
                  variant={count ? "" : "outline"}
                  className={!count ? "full" : ""}
                >
                  {a.id === "laboratorio"
                    ? "Explorar actividades"
                    : done
                      ? "Revisar respuestas"
                      : count
                        ? "Continuar"
                        : "Comenzar"}
                  <ArrowRight size={19} />
                </ButtonLink>
              </div>
            </article>
          );
        })}
      </div>
      <div className="notice">
        <Info />
        <div>
          <strong>No hay respuestas correctas o incorrectas</strong> en los
          cuestionarios de intereses y autoconocimiento.
          <p>
            Lo más importante es que respondas con honestidad. Tus respuestas
            nos ayudan a conocer tus intereses, valores y forma de tomar
            decisiones.
          </p>
        </div>
      </div>
      <p className="small-label">Recurso recomendado</p>
      <Link href="/mi-ruta/recursos" className="resource-link">
        <span className="tile-icon small">
          <BookOpen />
        </span>
        <div>
          <h3>¿Cómo interpretar mi perfil?</h3>
          <p>
            Conoce qué significan tus resultados y cómo usarlos para explorar
            carreras.
          </p>
        </div>
        <ChevronRight />
      </Link>
    </>
  );
}
function Results() {
  const { data } = useRouteData();
  const answers = data.answers.intereses || [];
  const complete = answers.filter(Boolean).length === 30;
  const scores = Object.entries(dimensions)
    .map(([code, name]) => ({
      code,
      name,
      value: Math.round(
        (riasecQuestions.reduce(
          (sum, q, i) => sum + (q[0] === code ? answers[i] || 0 : 0),
          0,
        ) /
          25) *
          100,
      ),
    }))
    .sort((a, b) => b.value - a.value);
  const recommended = careers.filter(
    (c) => c.codes.includes(scores[0].code) || c.codes.includes(scores[1].code),
  );
  const download = () => {
    const text = `RUTA VOCACIONAL 360°\nInforme de exploración\n${data.name || "Mi perfil"}\n\nINTERESES RIASEC\n${scores.map((s) => `${s.name}: ${s.value}/100`).join("\n")}\n\nCarreras para explorar: ${recommended.map((c) => c.title).join(", ")}\n\nMis reflexiones\n${courseQuestions.map((q, i) => `${q[0]}: ${data.reflections[i] || "Pendiente"}`).join("\n")}\n\nEstos resultados describen tus respuestas actuales. No son un diagnóstico ni una predicción de éxito profesional.`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-perfil-vocacional.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <div className="title-with-action">
        <PageTitle
          before="Tu perfil,"
          accent="nuevas posibilidades"
          description="Conecta tus intereses, valores y próximos pasos en una decisión informada."
        />
        {complete && (
          <button className="btn outline" onClick={download}>
            <Download size={17} />
            Descargar informe
          </button>
        )}
      </div>
      {!complete ? (
        <section className="panel empty-state">
          <span className="tile-icon large">
            <Target />
          </span>
          <h2>Tu perfil empieza con tus respuestas.</h2>
          <p>
            Completa las 30 preguntas de intereses para conocer tus áreas de
            exploración. Llevas {answers.filter(Boolean).length} respuestas
            guardadas.
          </p>
          <ButtonLink href="/evaluacion/intereses">
            Continuar mis intereses <ArrowRight />
          </ButtonLink>
        </section>
      ) : (
        <>
          <section className="result-banner">
            <div>
              <span className="eyebrow compact">Tus intereses destacan en</span>
              <h2>
                {scores[0].name} y {scores[1].name.toLowerCase()}
              </h2>
              <p>
                Explora actividades y carreras que conectan con lo que
                disfrutas.
              </p>
              <div className="tags">
                {scores.slice(0, 3).map((s) => (
                  <span key={s.code}>{s.name}</span>
                ))}
              </div>
            </div>
            <img src="/assets/brain.webp" alt="" width="180" height="146" />
          </section>
          <div className="two-columns">
            <section className="panel">
              <h2>
                Tus intereses RIASEC <Info size={17} />
              </h2>
              <p>Intensidad de interés expresada en tus respuestas.</p>
              {scores.map((s, i) => (
                <div className="score-row" key={s.code}>
                  <div>
                    <strong>{s.name}</strong>
                    <span>{s.value}/100</span>
                  </div>
                  <div className={`score-bar score-${i}`}>
                    <span style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </section>
            <div className="stack">
              <section className="panel">
                <h2>
                  <Gem />
                  Lo que valoras
                </h2>
                <p>
                  {data.answers.valores?.filter(Boolean).length === 3
                    ? "Tus respuestas destacan estas preferencias:"
                    : "Descubre qué condiciones y motivaciones son importantes para ti."}
                </p>
                <div className="value-summary">
                  {valueQuestions.map((q, i) =>
                    data.answers.valores?.[i] ? (
                      <span key={q.title}>
                        <Check size={15} />
                        {q.options[data.answers.valores[i] - 1]}
                      </span>
                    ) : null,
                  )}
                </div>
                <ButtonLink href="/evaluacion/valores" variant="outline">
                  {data.answers.valores?.length === 3
                    ? "Revisar mis valores"
                    : "Explorar mis valores"}
                  <ArrowRight size={17} />
                </ButtonLink>
              </section>
              <section className="panel">
                <h2>
                  <UserRound />
                  Tu autoconocimiento
                </h2>
                {data.answers.autoconocimiento?.filter(Boolean).length ===
                12 ? (
                  [...new Set(selfQuestions.map((q) => q.dimension))].map(
                    (d) => {
                      const indices = selfQuestions
                        .map((q, i) => (q.dimension === d ? i : -1))
                        .filter((i) => i >= 0);
                      const value = Math.round(
                        (indices.reduce(
                          (sum, i) => sum + data.answers.autoconocimiento[i],
                          0,
                        ) /
                          (indices.length * 5)) *
                          100,
                      );
                      return (
                        <div className="score-row" key={d}>
                          <div>
                            <strong>{d}</strong>
                            <span>{value}/100</span>
                          </div>
                          <Progress value={value} />
                        </div>
                      );
                    },
                  )
                ) : (
                  <>
                    <p>Reconoce tus fortalezas y tu forma de decidir.</p>
                    <ButtonLink
                      href="/evaluacion/autoconocimiento"
                      variant="outline"
                    >
                      Conocerme mejor <ArrowRight size={17} />
                    </ButtonLink>
                  </>
                )}
              </section>
              <section className="panel soft">
                <h2>
                  <Map />
                  Tu siguiente paso
                </h2>
                <p>
                  Transforma lo que descubriste en una acción pequeña y
                  concreta.
                </p>
                <ButtonLink href="/mi-ruta/plan">
                  Construir mi plan <ArrowRight size={17} />
                </ButtonLink>
              </section>
            </div>
          </div>
          <section className="panel section-gap">
            <div className="panel-heading">
              <h2>Carreras para explorar</h2>
              <Link href="/mi-ruta/carreras">
                Ver todas <ArrowRight size={16} />
              </Link>
            </div>
            <div className="three-columns">
              {recommended.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href="/mi-ruta/carreras"
                  className="mini-resource"
                >
                  <img
                    src={`/assets/${c.image}.webp`}
                    alt=""
                    width="65"
                    height="80"
                  />
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.area}</p>
                  </div>
                  <ChevronRight size={17} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
      <div className="notice subtle">
        <Info size={20} />
        <p>
          Este perfil describe tus respuestas actuales. Es una herramienta de
          exploración, no un diagnóstico ni una decisión definitiva sobre tu
          futuro.
        </p>
      </div>
    </>
  );
}
function Careers() {
  const { data, update, notify } = useRouteData();
  const [search, setSearch] = useState(""),
    [area, setArea] = useState("Todas"),
    [onlySaved, setOnlySaved] = useState(false);
  const [compare, setCompare] = useState<string[]>([]),
    [detail, setDetail] = useState<string | null>(null),
    [comparisonOpen, setComparisonOpen] = useState(false);
  const selected = careers.filter((c) => compare.includes(c.id)),
    current = careers.find((c) => c.id === detail);
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = careers.filter(
    (c) =>
      normalize(c.title + " " + c.tags.join(" ")).includes(normalize(search)) &&
      (area === "Todas" || c.area === area) &&
      (!onlySaved || data.favorites.includes(c.id)),
  );
  const toggleSaved = (id: string) =>
    update({
      favorites: data.favorites.includes(id)
        ? data.favorites.filter((x) => x !== id)
        : [...data.favorites, id],
    });
  const toggleCompare = (id: string) => {
    if (compare.includes(id)) setCompare(compare.filter((x) => x !== id));
    else if (compare.length < 2) setCompare([...compare, id]);
    else
      notify(
        "Puedes comparar dos carreras a la vez. Quita una para elegir otra.",
      );
  };
  const comparison = (
    <div className="comparison-table">
      {["Actividades principales", "Habilidades clave", "Qué investigar"].map(
        (label, i) => (
          <div className="comparison-row" key={label}>
            <strong>{label}</strong>
            {selected.map((c) => (
              <p key={c.id}>{[c.activities, c.skills, c.research][i]}</p>
            ))}
          </div>
        ),
      )}
    </div>
  );
  return (
    <>
      <PageTitle
        before="Explora tus"
        accent="posibilidades"
        description="Compara actividades, habilidades y rutas de formación."
      />
      <div className="filters">
        <label className="search-field">
          <Search size={20} />
          <input
            aria-label="Buscar una carrera o área"
            placeholder="Buscar una carrera o área"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="select-filter">
          <SlidersHorizontal size={18} />
          <select
            aria-label="Área de interés"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="Todas">Todas las áreas</option>
            {["Personas", "Tecnología", "Creatividad", "Negocios"].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <button
          className={`btn outline ${onlySaved ? "selected" : ""}`}
          aria-pressed={onlySaved}
          onClick={() => setOnlySaved(!onlySaved)}
        >
          <Bookmark size={19} />
          Mis favoritas
        </button>
      </div>
      <div className="career-layout">
        <div className="stack">
          {filtered.map((c) => (
            <article key={c.id} className="career-card">
              <label className="compare-check">
                <input
                  type="checkbox"
                  aria-label={`Comparar ${c.title}`}
                  checked={compare.includes(c.id)}
                  onChange={() => toggleCompare(c.id)}
                />
              </label>
              <img
                src={`/assets/${c.image}.webp`}
                alt={`Exploración de ${c.title}`}
                width="135"
                height="155"
              />
              <div className="career-copy">
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <div className="career-card-bottom">
                  <div className="tags">
                    {c.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <button
                    className="btn small-btn"
                    onClick={() => setDetail(c.id)}
                  >
                    Ver carrera <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <button
                className={`icon-btn save-career ${data.favorites.includes(c.id) ? "saved" : ""}`}
                aria-label={`${data.favorites.includes(c.id) ? "Quitar" : "Guardar"} ${c.title}`}
                aria-pressed={data.favorites.includes(c.id)}
                onClick={() => toggleSaved(c.id)}
              >
                <Bookmark size={21} />
              </button>
            </article>
          ))}
          {!filtered.length && (
            <div className="panel empty-state">
              <Search />
              <h2>No encontramos carreras</h2>
              <p>Prueba otra búsqueda o explora todas las áreas.</p>
              <button
                className="btn outline"
                onClick={() => {
                  setSearch("");
                  setArea("Todas");
                  setOnlySaved(false);
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
          <div className="notice teal-notice">
            <Lightbulb />
            <div>
              <strong>Antes de elegir</strong>
              <p>
                Investiga el plan de estudios y conversa con estudiantes de esa
                carrera.
              </p>
            </div>
          </div>
        </div>
        <aside className="comparison panel">
          <div className="comparison-heading">
            <Scale />
            <div>
              <h2>Tu comparación</h2>
              <p>Compara características de dos carreras.</p>
            </div>
          </div>
          {selected.length ? (
            <>
              <div className="compare-cards">
                {selected.map((c) => (
                  <div key={c.id}>
                    <img
                      src={`/assets/${c.image}.webp`}
                      alt=""
                      width="58"
                      height="65"
                    />
                    <strong>{c.title}</strong>
                    <button
                      className="icon-btn"
                      aria-label={`Quitar ${c.title} de comparación`}
                      onClick={() => toggleCompare(c.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {comparison}
              <button
                className="btn full"
                disabled={selected.length !== 2}
                onClick={() => setComparisonOpen(true)}
              >
                Abrir comparación <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <div className="empty-small">
              <Scale size={38} />
              <h3>Descubre qué las hace diferentes</h3>
              <p>Marca la casilla de dos carreras para compararlas aquí.</p>
            </div>
          )}
        </aside>
      </div>
      {current && (
        <Modal title={current.title} onClose={() => setDetail(null)}>
          <img
            className="detail-image"
            src={`/assets/${current.image}.webp`}
            alt={current.title}
          />
          <p>{current.description}</p>
          <h3>Actividades principales</h3>
          <p>{current.activities}</p>
          <h3>Habilidades que desarrollarás</h3>
          <p>{current.skills}</p>
          <h3>Antes de decidir, investiga</h3>
          <p>{current.research}</p>
          <button className="btn" onClick={() => toggleSaved(current.id)}>
            <Bookmark size={18} />
            {data.favorites.includes(current.id)
              ? "Quitar de mis favoritas"
              : "Guardar carrera"}
          </button>
        </Modal>
      )}
      {comparisonOpen && (
        <Modal
          title="Comparación de carreras"
          onClose={() => setComparisonOpen(false)}
        >
          <div className="comparison-names">
            {selected.map((c) => (
              <h3 key={c.id}>{c.title}</h3>
            ))}
          </div>
          {comparison}
          <p className="muted">
            No hay una opción mejor para todos. Compara estas posibilidades con
            tus intereses y circunstancias.
          </p>
        </Modal>
      )}
    </>
  );
}
function Plan() {
  const { data, update, notify } = useRouteData();
  const [station, setStation] = useState(0),
    [tab, setTab] = useState("curso"),
    [task, setTask] = useState(""),
    [date, setDate] = useState("");
  const completed = Object.values(data.reflections).filter((v) =>
    v.trim(),
  ).length;
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    update({
      tasks: [
        ...data.tasks,
        { id: crypto.randomUUID(), title: task.trim(), date, done: false },
      ],
    });
    setTask("");
    setDate("");
    notify("Paso añadido a tu plan.");
  };
  return (
    <>
      <PageTitle
        before="Convierte tus ideas en"
        accent="próximos pasos"
        description="Un plan guiado para transformar tus intereses en decisiones informadas."
      />
      <div className="tabs">
        <button
          className={tab === "plan" ? "active" : ""}
          onClick={() => setTab("plan")}
        >
          <Map size={17} />
          Mi plan
        </button>
        <button
          className={tab === "curso" ? "active" : ""}
          onClick={() => setTab("curso")}
        >
          <GraduationCap size={18} />
          Curso guiado
        </button>
      </div>
      {tab === "curso" && (
        <div className="course-layout">
          <aside className="panel course-stations">
            <h3>Estación {station + 1} de 8</h3>
            <div className="station-dots">
              {courseQuestions.map((_, i) => (
                <span
                  key={i}
                  className={
                    data.reflections[i]?.trim()
                      ? "done"
                      : i === station
                        ? "current"
                        : ""
                  }
                >
                  {data.reflections[i]?.trim() ? <Check size={11} /> : i + 1}
                </span>
              ))}
            </div>
            {courseQuestions.map((q, i) => (
              <button
                key={q[0]}
                className={i === station ? "active" : ""}
                onClick={() => setStation(i)}
              >
                <span>{i + 1}</span>
                {q[0]}
                {data.reflections[i]?.trim() && <Check size={15} />}
              </button>
            ))}
            <p className="small-label">{completed} de 8 reflexiones escritas</p>
          </aside>
          <section className="panel reflection">
            <span className="eyebrow compact">Autoconocimiento</span>
            <h2>{courseQuestions[station][0]}</h2>
            <p>{courseQuestions[station][1]}</p>
            <label>
              Mi reflexión
              <textarea
                rows={7}
                placeholder="Escribe tus ideas; no hay una respuesta perfecta..."
                value={data.reflections[station] || ""}
                onChange={(e) =>
                  update({
                    reflections: {
                      ...data.reflections,
                      [station]: e.target.value,
                    },
                  })
                }
              />
            </label>
            <div className="reflection-footer">
              <span className="saved-label">
                <ShieldCheck size={15} />
                Guardado en este dispositivo
              </span>
              <button
                className="btn outline"
                disabled={station === 0}
                onClick={() => setStation(station - 1)}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
              <button
                className="btn"
                disabled={!data.reflections[station]?.trim()}
                onClick={() => {
                  notify("Reflexión guardada.");
                  if (station < 7) setStation(station + 1);
                  else setTab("plan");
                }}
              >
                {station === 7 ? "Ver mi plan" : "Guardar y continuar"}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
      <section className="panel section-gap">
        <h2>Un paso esta semana</h2>
        <p>Plantea una acción pequeña para conocer mejor tus opciones.</p>
        <form className="task-form" onSubmit={addTask}>
          <label>
            Mi siguiente paso
            <input
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Por ejemplo: conversar con un profesional"
            />
          </label>
          <label>
            Fecha (opcional)
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button className="btn" type="submit">
            <Plus size={18} />
            Añadir a mi plan
          </button>
        </form>
        {data.tasks.map((t) => (
          <div className="task-row" key={t.id}>
            <label className={t.done ? "task-done" : ""}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() =>
                  update({
                    tasks: data.tasks.map((x) =>
                      x.id === t.id ? { ...x, done: !x.done } : x,
                    ),
                  })
                }
              />
              {t.title}
            </label>
            <span>{t.date}</span>
            <button
              className="icon-btn"
              aria-label={`Eliminar ${t.title}`}
              onClick={() =>
                update({ tasks: data.tasks.filter((x) => x.id !== t.id) })
              }
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {!data.tasks.length && (
          <p className="small-label">
            Todavía no has añadido pasos. Tu primera acción puede ser muy
            sencilla.
          </p>
        )}
      </section>
    </>
  );
}
function Resources() {
  const { data, update } = useRouteData();
  const [filter, setFilter] = useState("Todos"),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState<string | null>(null);
  const current = resources.find((r) => r.id === open);
  const filtered = resources.filter(
    (r) =>
      (filter === "Todos" ||
        filter === r.category ||
        (filter === "Guardados" && data.savedResources.includes(r.id))) &&
      r.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        before="Recursos para tomar"
        accent="mejores decisiones"
        description="Explora guías, lecturas y actividades para conocerte y descubrir tus posibilidades."
      />
      <div className="resource-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="Buscar recursos"
            placeholder="Buscar un recurso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="filter-pills">
          {["Todos", "Guías", "Lecturas", "Actividades", "Guardados"].map(
            (f) => (
              <button
                key={f}
                className={f === filter ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f === "Guardados" && <Bookmark size={15} />}
                {f}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="resource-grid">
        {filtered.map((r) => (
          <article className="resource-card panel" key={r.id}>
            <img
              src={`/assets/${r.image}.webp`}
              alt=""
              width="100"
              height="200"
            />
            <div>
              <div className="resource-card-top">
                <span className="badge purple">{r.category}</span>
                <button
                  className={`icon-btn ${data.savedResources.includes(r.id) ? "saved" : ""}`}
                  aria-label={`${data.savedResources.includes(r.id) ? "Quitar" : "Guardar"} ${r.title}`}
                  aria-pressed={data.savedResources.includes(r.id)}
                  onClick={() =>
                    update({
                      savedResources: data.savedResources.includes(r.id)
                        ? data.savedResources.filter((x) => x !== r.id)
                        : [...data.savedResources, r.id],
                    })
                  }
                >
                  <Bookmark size={17} />
                </button>
              </div>
              <h2>{r.title}</h2>
              <p>{r.text}</p>
              <span className="meta">
                <Clock size={14} />
                {r.time}
              </span>
              <button
                className="btn outline small-btn full"
                onClick={() => setOpen(r.id)}
              >
                Abrir recurso <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="panel empty-state">
          <BookOpen />
          <h2>No hay recursos en esta selección</h2>
          <p>Cambia el filtro o guarda tus primeras lecturas.</p>
        </div>
      )}
      <div className="resource-bottom">
        <Lightbulb size={32} />
        <div>
          <h2>¿Quieres probar una idea propia?</h2>
          <p>Una pequeña actividad puede abrirte nuevas posibilidades.</p>
        </div>
        <button className="btn" onClick={() => setOpen("idea")}>
          Explorar una idea <ArrowRight size={18} />
        </button>
      </div>
      {current && (
        <Modal title={current.title} onClose={() => setOpen(null)}>
          <span className="badge purple">
            {current.category} · {current.time}
          </span>
          <p>{current.text}</p>
          <ol className="article-steps">
            {current.body.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <ButtonLink href="/mi-ruta/plan">
            Llevarlo a mi plan <ArrowRight size={18} />
          </ButtonLink>
        </Modal>
      )}
    </>
  );
}
function Profile() {
  const { data, update, notify } = useRouteData();
  const [form, setForm] = useState({
    name: data.name,
    email: data.email,
    school: data.school,
    grade: data.grade,
  });
  return (
    <>
      <PageTitle
        before="Mi"
        accent="perfil"
        description="Un espacio que se adapta a ti y a tu momento."
      />
      <section className="panel profile-panel">
        <div className="profile-intro">
          <span className="tile-icon large">
            <UserRound />
          </span>
          <div>
            <h2>Tu información personal</h2>
            <p>Puedes actualizarla cuando quieras.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update(form);
            notify("Perfil actualizado.");
          }}
        >
          <label>
            Nombre completo
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Correo electrónico
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              Institución
              <input
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </label>
            <label>
              Etapa educativa
              <input
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />
            </label>
          </div>
          <button className="btn" type="submit">
            Guardar cambios <Check size={18} />
          </button>
        </form>
        <div className="notice subtle">
          <ShieldCheck />
          <p>
            Tu información se almacena únicamente en este navegador. No hay
            sincronización entre dispositivos.
          </p>
        </div>
      </section>
    </>
  );
}

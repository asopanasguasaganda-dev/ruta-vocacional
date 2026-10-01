
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  ClipboardCheck,
  FileText,
  Activity,
  ArrowUpRight,
  Download,
  RefreshCw,
  Sparkles,
  Search,
  CheckCircle2,
  Info,
} from "lucide-react";
import { previewAction, useSession } from "../../lib/session";
import { downloadCSV } from "../../lib/storage";
import { Button, Notice } from "../../components/ui/primitives";
import {
  summarizeAnalytics,
  analyticsBrief,
  percentage,
  type AnalyticsInput,
} from "../../lib/admin-analytics";
import { ExecutiveSignals } from "./ExecutiveSignals";
import { ProgressCharts } from "./ProgressCharts";
import type { Navigate } from "../../types";
import "./intelligence.css";

type Insight = {
  summary: string;
  actions: {
    title: string;
    evidence: string;
    action: string;
    priority: string;
  }[];
  generatedAt: string;
};
export function InstitutionalOverview({ navigate }: { navigate: Navigate }) {
  const session = useSession(),
    [data, setData] = useState<AnalyticsInput | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [days, setDays] = useState(14),
    [group, setGroup] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [sort, setSort] = useState("priority"),
    [page, setPage] = useState(0),
    [insight, setInsight] = useState<Insight | null>(null),
    [aiError, setAiError] = useState(""),
    [busy, setBusy] = useState(false);
  const generation = useRef(0),
    mounted = useRef(true);
  const load = async () => {
    setLoading(true);
    setError("");
    generation.current++;
    setBusy(false);
    setInsight(null);
    setAiError("");
    try {
      const result = await previewAction<AnalyticsInput>("admin/analytics");
      if (result.source !== "server") throw Error("No se pudo confirmar la conexión con los datos centrales.");
      if (mounted.current) setData(result);
    } catch (e) {
      if (mounted.current) setError((e as Error).message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);
  const d = useMemo(
    () => (data ? summarizeAnalytics(data, group, days) : null),
    [data, group, days],
  );
  const groups = useMemo(
    () =>
      [...new Set(data?.studentProgress.map((s) => s.group) || [])].sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [data],
  );
  const rows = useMemo(
    () =>
      d?.studentProgress
        .filter(
          (s) =>
            s.name
              .toLocaleLowerCase("es")
              .includes(query.toLocaleLowerCase("es")) &&
            (status === "all" ||
              (status === "pending" && !s.started) ||
              (status === "progress" && s.started && !s.completed) ||
              (status === "complete" && s.completed) ||
              (status === "report" && s.completed && !s.report)),
        )
        .sort((a, b) => {
          if (sort === "name") return a.name.localeCompare(b.name, "es");
          const priority = (s: typeof a) =>
            s.completed && !s.report
              ? 0
              : !s.started
                ? 1
                : !s.completed
                  ? 2
                  : 3;
          return (
            priority(a) - priority(b) || a.name.localeCompare(b.name, "es")
          );
        }) || [],
    [d, query, status, sort],
  );
  useEffect(() => {
    setPage(0);
  }, [query, status, group, data, sort]);
  const changeScope = (nextDays: number, nextGroup: string) => {
    generation.current++;
    setDays(nextDays);
    setGroup(nextGroup);
    setInsight(null);
    setAiError("");
    setBusy(false);
  };
  const analyze = async () => {
    if (!d) return;
    const token = ++generation.current;
    setBusy(true);
    setInsight(null);
    setAiError("");
    try {
      let result: Insight;
      result = await previewAction("admin/insights", {
          method: "POST",
          body: JSON.stringify({ days, group }),
          signal: AbortSignal.timeout(30000),
        });
      if (mounted.current && token === generation.current) setInsight(result);
    } catch (e) {
      if (mounted.current && token === generation.current)
        setAiError(
          (e as Error).name === "TimeoutError"
            ? "El análisis tardó demasiado. Puedes volver a intentar."
            : (e as Error).message,
        );
    } finally {
      if (mounted.current && token === generation.current) setBusy(false);
    }
  };
  const exportRows = () =>
    downloadCSV("seguimiento-vocacional.csv", [
      [
        "Estudiante",
        "Grupo",
        "Cuenta",
        "Con actividad",
        "Batería completada",
        "Con informe",
      ],
      ...rows.map((s) => [
        s.name,
        s.group,
        s.status,
        s.started ? "SÍ" : "No",
        s.completed ? "SÍ" : "No",
        s.report ? "SÍ" : "No",
      ]),
    ]);
  return (
    <div className="intel-dashboard intel-executive" id="resumen">
      <header className="intel-heading">
        <div>
          <span className="intel-overline">
            <Activity size={14} /> INTELIGENCIA DE NEGOCIOS
          </span>
          <h1>Resumen general</h1>
          <p>Participación, avance y decisiones en un solo lugar.</p>
        </div>
        <div className="intel-heading-actions">
          <Button
            variant="secondary"
            disabled={loading}
            icon={
              <RefreshCw size={16} className={loading ? "intel-spin" : ""} />
            }
            onClick={load}
          >
            Actualizar
          </Button>
          <Button
            variant="secondary"
            disabled={!d || loading}
            icon={<Download size={16} />}
            onClick={exportRows}
          >
            Exportar seguimiento
          </Button>
          <Button
            disabled={!d || loading || busy || session.user?.role !== "admin"}
            icon={<Sparkles size={16} />}
            onClick={() => {
              document
                .getElementById("analisis-ia")
                ?.scrollIntoView({ block: "start" });
              void analyze();
            }}
          >
            Analizar con IA
          </Button>
        </div>
      </header>
      {error && (
        <Notice tone="danger">
          {error} <button onClick={load}>Reintentar</button>
        </Notice>
      )}
      {loading && !data && (
        <div className="intel-loading" role="status">
          <RefreshCw className="intel-spin" /> Consultando los indicadores de tu
          comunidad…
        </div>
      )}
      {d && data && (
        <>
          <nav className="intel-section-nav" aria-label="Secciones del resumen">
            <a href="#resumen">Vista general</a>
            <a href="#tendencias">Tendencias</a>
            <a href="#analisis-ia">Análisis con IA</a>
            <a href="#seguimiento">Seguimiento</a>
          </nav>
          <div className="intel-toolbar">
            <div className="intel-source">
              <span className="intel-live-dot" />
              <span>
                {"Datos de la institución"}
                <small>
                  Actualizado{" "}
                  {new Date(data.generatedAt).toLocaleTimeString("es-EC", {
                    timeZone: "America/Guayaquil",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · Ecuador
                </small>

              </span>
            </div>
            <label className="intel-filter">
              Grupo
              <select
                aria-label="Grupo"
                value={group}
                onChange={(e) => changeScope(days, e.target.value)}
              >
                <option value="">Todos los grupos</option>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <div
              className="intel-period"
              role="group"
              aria-label="Periodo de actividad"
            >
              {[7, 14, 30].map((n) => (
                <button
                  key={n}
                  aria-pressed={days === n}
                  onClick={() => changeScope(n, group)}
                >
                  {n} días
                </button>
              ))}
            </div>
          </div>
          <div className="intel-kpis">
            {[
              {
                icon: Users,
                label: "Estudiantes",
                value: d.students,
                detail: `${d.active} con acceso activo`,
                rate: percentage(d.active, d.students),
                caption: "acceso habilitado",
              },
              {
                icon: Activity,
                label: "Participación",
                value: d.students
                  ? percentage(d.started, d.students) + "%"
                  : "—",
                detail: `${d.started} de ${d.students} con actividad`,
                rate: percentage(d.started, d.students),
                caption: "respondieron al menos una pregunta",
              },
              {
                icon: ClipboardCheck,
                label: "Baterías completadas",
                value: d.completed,
                detail: `${percentage(d.completed, d.students)}% del total de estudiantes`,
                rate: percentage(d.completed, d.students),
                caption: "todas las evaluaciones asignadas",
              },
              {
                icon: FileText,
                label: "Con informe",
                value: d.reports,
                detail: `${d.pendingReports} completaron y esperan informe`,
                rate: percentage(d.reports, d.students),
                caption: "estudiantes con informe disponible",
              },
            ].map(({ icon: Icon, ...m }) => (
              <article key={m.label}>
                <div>
                  <span>{m.label}</span>
                  <Icon size={19} />
                </div>
                <strong>{m.value}</strong>
                <p>{m.detail}</p>
                <div className="intel-track">
                  <span style={{ width: m.rate + "%" }} />
                </div>
                <small className="intel-kpi-definition">{m.caption}</small>
              </article>
            ))}
          </div>
          <p className="intel-kpi-note">
            Indicadores actuales del grupo seleccionado. El periodo se aplica a
            entregas, tendencias y actividad reciente.
          </p>
          <div id="tendencias">
            <ProgressCharts data={d} mode="overview" />
          </div>
          <ExecutiveSignals
            data={d}
            onSelect={(next) => {
              setStatus(next);
              setQuery("");
              setPage(0);
              document
                .getElementById("seguimiento")
                ?.scrollIntoView({ block: "start" });
            }}
            onSetup={() => navigate("usuarios")}
          />
          <section className="intel-ai intel-panel" id="analisis-ia">
            <header>
              <div>
                <span className="intel-overline">
                  <Sparkles size={14} /> ASISTENTE DE ANÁLISIS
                </span>
                <h2>Análisis y recomendaciones con IA</h2>
                <p>
                  Una lectura de tus cifras, con prioridades para el siguiente
                  paso.
                </p>
              </div>
              <span className="intel-ai-badge">
                {busy
                  ? "Analizando…"
                  : insight
                    ? "Análisis disponible"
                    : "Gemini · bajo demanda"}
              </span>
            </header>
            <div className="intel-ai-layout">
              <div>
                <div className="intel-ai-orb">
                  <Sparkles size={28} />
                </div>
                <h3>Una segunda mirada a tus datos</h3>
                <p>
                  {d.students
                    ? "Genera prioridades basadas en la participación, la finalización y los informes del alcance seleccionado."
                    : "Aún no hay estudiantes en este alcance. La IA puede ayudarte a preparar los primeros pasos de la plataforma."}
                </p>
                <Button
                  disabled={busy || loading || session.user?.role !== "admin"}
                  icon={<Sparkles size={16} />}
                  onClick={analyze}
                >
                  {busy
                    ? "Analizando indicadores…"
                    : insight
                      ? "Volver a analizar"
                      : "Generar análisis con IA"}
                </Button>
                <small>
                  Solo se envían conteos agregados. Revisa las sugerencias antes
                  de actuar.
                </small>
              </div>
              <div aria-live="polite" aria-busy={busy}>
                {aiError && <Notice tone="danger">{aiError}</Notice>}
                {busy ? (
                  <div className="intel-empty">
                    <RefreshCw className="intel-spin" />
                    <strong>Preparando tu análisis</strong>
                    <p>Revisando los indicadores del alcance seleccionado.</p>
                  </div>
                ) : insight ? (
                  <div className="intel-insights">
                    <span className="intel-overline">
                      ANÁLISIS GENERADO CON IA
                    </span>
                    <p>{insight.summary}</p>
                    {insight.actions.map((a, i) => (
                      <article key={i}>
                        <span className="intel-priority">
                          Prioridad {a.priority}
                        </span>
                        <h3>{a.title}</h3>
                        <p>{a.action}</p>
                        <small>Evidencia: {a.evidence}</small>
                      </article>
                    ))}
                    <Button
                      variant="secondary"
                      icon={<Download size={15} />}
                      onClick={() => {
                        const content = [
                          "Análisis administrativo · Ruta Vocacional 360°",
                          `Alcance: ${group || "Todos los grupos"} · ${days} días`,
                          `Fuente: ${"Institución"}`,
                          `Generado: ${insight.generatedAt}`,
                          "",
                          insight.summary,
                          ...insight.actions.map(
                            (a) =>
                              `\n${a.title} · Prioridad ${a.priority}\n${a.action}\nEvidencia: ${a.evidence}`,
                          ),
                        ].join("\n");
                        const url = URL.createObjectURL(
                          new Blob(["\ufeff" + content], {
                            type: "text/plain;charset=utf-8",
                          }),
                        );
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "analisis-administrativo.txt";
                        link.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      Descargar análisis
                    </Button>
                    <small>
                      Generado{" "}
                      {new Date(insight.generatedAt).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                      })}{" "}
                      · Puede contener errores.
                    </small>
                  </div>
                ) : (
                  <div className="intel-ai-preview">
                    <span className="intel-overline">
                      DATOS QUE ANALIZARÁ LA IA
                    </span>
                    <h3>
                      {group || "Todos los grupos"} · {days} días
                    </h3>
                    <dl>
                      {[
                        ["Estudiantes", d.students],
                        ["Con actividad", d.started],
                        ["Baterías completas", d.completed],
                        ["Informes pendientes", d.pendingReports],
                        ["Entregas del periodo", d.current],
                        ["Entregas anteriores", d.previous],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p>
                      Recibirás un resumen y hasta tres acciones priorizadas,
                      cada una con la evidencia que la respalda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          <ProgressCharts data={d} mode="comparison" />
          <section className="intel-panel" id="seguimiento" tabIndex={-1}>
            <header>
              <div>
                <span className="intel-overline">SEGUIMIENTO INDIVIDUAL</span>
                <h2>Cada estudiante cuenta</h2>
                <p>Busca y prioriza a quién acompañar.</p>
              </div>
              <span className="intel-count">{rows.length} estudiantes</span>
            </header>
            <div className="intel-table-filters">
              <label>
                <Search size={17} />
                <input
                  aria-label="Buscar estudiante"
                  placeholder="Buscar por nombre…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="intel-filter">
                Avance
                <select
                  aria-label="Avance"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Sin empezar</option>
                  <option value="progress">En curso</option>
                  <option value="complete">Batería completada</option>
                  <option value="report">Completaron sin informe</option>
                </select>
              </label>
            </div>
            <div className="intel-table-order">
              <label className="intel-filter">
                Ordenar
                <select
                  aria-label="Ordenar seguimiento"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="priority">Prioridad de acompañamiento</option>
                  <option value="name">Nombre A–Z</option>
                </select>
              </label>
              <small>
                Primero: informes pendientes, sin empezar y en curso.
              </small>
            </div>
            <div className="intel-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Grupo</th>
                    <th>Cuenta</th>
                    <th>Evaluaciones</th>
                    <th>Informe</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(page * 8, page * 8 + 8).map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="intel-person">
                          <i>{s.name.trim().slice(0, 1).toUpperCase()}</i>
                          <strong>{s.name}</strong>
                        </span>
                      </td>
                      <td>{s.group}</td>
                      <td>{s.status}</td>
                      <td>
                        <span
                          className={
                            "intel-status " +
                            (s.completed
                              ? "is-complete"
                              : s.started
                                ? "is-progress"
                                : "")
                          }
                        >
                          {s.completed
                            ? "Completada"
                            : s.started
                              ? "En curso"
                              : "Sin empezar"}
                        </span>
                      </td>
                      <td>
                        {s.report ? (
                          <span className="intel-positive">Disponible</span>
                        ) : (
                          "Pendiente"
                        )}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={5} className="intel-table-empty">
                        {d.students
                          ? "No hay estudiantes que coincidan con estos filtros."
                          : "Los estudiantes registrados aparecerán aquí."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="intel-pagination">
              <span>
                {rows.length
                  ? `${page * 8 + 1}–${Math.min(page * 8 + 8, rows.length)} de ${rows.length}`
                  : "Sin registros"}{" "}
                · La exportación respeta los filtros
              </span>
              <div>
                <Button
                  variant="secondary"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  disabled={(page + 1) * 8 >= rows.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </footer>
          </section>
          <div className="intel-two-col">
            <section className="intel-panel">
              <header>
                <div>
                  <span className="intel-overline">TU ESPACIO DE TRABAJO</span>
                  <h2>Gestiona la experiencia</h2>
                </div>
              </header>
              <div className="intel-shortcuts">
                {[
                  {
                    icon: Users,
                    title: "Usuarios y acompañamiento",
                    text: "Cuentas, grupos y acceso",
                    route: "usuarios",
                  },
                  {
                    icon: ClipboardCheck,
                    title: "Evaluaciones",
                    text: "Crear, publicar y asignar tests",
                    route: "editor",
                  },
                  {
                    icon: FileText,
                    title: "Resultados e informes",
                    text: "Revisar entregas y orientar",
                    route: "admin-resultados",
                  },
                ].map(({ icon: Icon, ...a }) => (
                  <button
                    key={a.route}
                    onClick={() => navigate(a.route as Parameters<Navigate>[0])}
                  >
                    <Icon size={21} />
                    <span>
                      <strong>{a.title}</strong>
                      <small>{a.text}</small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
            </section>
            <section className="intel-panel">
              <header>
                <div>
                  <span className="intel-overline">
                    ÚLTIMAS ENTREGAS · {days} DÍAS
                  </span>
                  <h2>Lo que está pasando</h2>
                </div>
                <button
                  className="intel-link"
                  onClick={() => navigate("admin-resultados")}
                >
                  Ver resultados <ArrowUpRight size={16} />
                </button>
              </header>
              {d.recent.length ? (
                d.recent.map((s) => (
                  <div className="intel-activity" key={s.id}>
                    <CheckCircle2 size={19} />
                    <div>
                      <strong>{s.student}</strong>
                      <p>{s.title}</p>
                      <small>
                        {new Date(s.date).toLocaleString("es-EC", {
                          timeZone: "America/Guayaquil",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="intel-empty">
                  <Activity size={28} />
                  <strong>Todo listo para recibir actividad</strong>
                  <p>Las entregas del periodo aparecerán aquí.</p>
                </div>
              )}
            </section>
          </div>
          <footer className="intel-footnote">
            <Info size={15} />
            <span>
              Los indicadores describen actividad y avance. No miden aptitud
              académica ni predicen decisiones vocacionales.
            </span>
          </footer>
        </>
      )}
    </div>
  );
}

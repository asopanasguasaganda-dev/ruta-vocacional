import { BarChart3, ArrowUpRight, Activity } from "lucide-react";
import { percentage, type AnalyticsSummary } from "../../lib/admin-analytics";
export function ProgressCharts({
  data: d,
  mode = "overview",
}: {
  data: AnalyticsSummary;
  mode?: "overview" | "comparison";
}) {
  const maximum = Math.max(
      2,
      2 *
        Math.ceil(
          Math.max(
            0,
            ...d.activity.map((x) => x.count),
            ...d.previousActivity.map((x) => x.count),
          ) / 2,
        ),
    ),
    segments = [
      {
        label: "Sin empezar",
        value: d.students - d.started,
        color: "var(--bi-slate)",
      },
      {
        label: "En curso",
        value: d.started - d.completed,
        color: "var(--bi-purple)",
      },
      { label: "Completaron", value: d.completed, color: "var(--bi-teal)" },
    ];
  let offset = 0;
  return (
    <>
      {mode === "overview" && (
        <div className="intel-chart-grid">
          <section className="intel-panel intel-trend">
            <header>
              <div>
                <span className="intel-overline">ACTIVIDAD EN EL PERIODO</span>
                <h2>Entregas y evolución</h2>
                <p>Entregas por día · hora de Ecuador</p>
              </div>
              <span className="intel-icon">
                <Activity size={20} />
              </span>
            </header>
            <div className="intel-trend-total">
              <strong>{d.current.toLocaleString("es-EC")}</strong>
              <span>entregas en {d.days} días</span>
              <b
                className={
                  d.change !== null && d.change < 0
                    ? "intel-warn"
                    : "intel-positive"
                }
              >
                {d.change === null
                  ? "Sin base de comparación"
                  : `${d.change > 0 ? "+" : ""}${d.change}% vs. periodo anterior`}
              </b>
            </div>
            <p className="intel-comparison-legend">
              <span>
                <i />
                Periodo actual
              </span>
              <span>
                <i />
                Periodo anterior · mismos días relativos
              </span>
            </p>
            <div className="intel-plot">
              <div className="intel-gridlines" aria-hidden="true">
                <span>{maximum}</span>
                <span>{Math.floor(maximum / 2)}</span>
                <span>0</span>
              </div>
              <div className="intel-columns">
                {d.activity.map((day, i) => (
                  <div className="intel-column" key={day.date}>
                    <div
                      className="intel-prior-bar"
                      aria-hidden="true"
                      style={{
                        height: `${(d.previousActivity[i].count / maximum) * 100}%`,
                      }}
                    />
                    <button
                      aria-label={`${day.date}: ${day.count} entregas; ${d.previousActivity[i].date}: ${d.previousActivity[i].count} en el periodo anterior`}
                      title={`${day.date}: ${day.count} entregas`}
                      style={{
                        height: `${(day.count / maximum) * 100}%`,
                      }}
                    >
                      <span>
                        {day.count} / {d.previousActivity[i].count}
                      </span>
                    </button>
                    <small>
                      {i === 0 ||
                      i === d.days - 1 ||
                      i % Math.ceil(d.days / 7) === 0
                        ? day.date.slice(8) + "/" + day.date.slice(5, 7)
                        : ""}
                    </small>
                  </div>
                ))}
              </div>
            </div>
            {!d.current && (
              <p className="intel-chart-note">
                Sin entregas en este periodo. Las nuevas entregas aparecerán
                aquí.
              </p>
            )}
            <details className="intel-chart-data">
              <summary>Ver datos del gráfico</summary>
              <div>
                {d.activity.map((x) => (
                  <span key={x.date}>
                    {x.date}: <b>{x.count}</b> · Anterior (
                    {d.previousActivity[d.activity.indexOf(x)].date}):{" "}
                    <b>{d.previousActivity[d.activity.indexOf(x)].count}</b>
                  </span>
                ))}
              </div>
            </details>
          </section>
          <section className="intel-panel">
            <header>
              <div>
                <span className="intel-overline">AVANCE ACTUAL</span>
                <h2>Estado de los estudiantes</h2>
                <p>Una categoría por estudiante</p>
              </div>
            </header>
            <div className="intel-donut">
              <svg
                viewBox="0 0 180 180"
                role="img"
                aria-label={segments
                  .map((s) => `${s.label}: ${s.value}`)
                  .join(", ")}
              >
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="var(--bi-track)"
                  strokeWidth="15"
                />
                {segments.map((s) => {
                  const part = d.students ? (s.value / d.students) * 100 : 0,
                    prior = offset;
                  offset += part;
                  return (
                    <circle
                      key={s.label}
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="15"
                      pathLength="100"
                      strokeDasharray={`${part} ${100 - part}`}
                      strokeDashoffset={-prior}
                      transform="rotate(-90 90 90)"
                    />
                  );
                })}
                <text
                  x="90"
                  y="89"
                  textAnchor="middle"
                  className="intel-donut-value"
                >
                  {d.students ? percentage(d.completed, d.students) + "%" : "—"}
                </text>
                <text
                  x="90"
                  y="111"
                  textAnchor="middle"
                  className="intel-donut-label"
                >
                  finalización
                </text>
              </svg>
              <ul>
                {segments.map((s) => (
                  <li key={s.label}>
                    <i style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <b>{s.value}</b>
                    <small>{percentage(s.value, d.students)}%</small>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}
      {mode === "comparison" && (
        <div className="intel-two-col">
          <section className="intel-panel">
            <header>
              <div>
                <span className="intel-overline">
                  EVALUACIONES · {d.days} DÍAS
                </span>
                <h2>Las evaluaciones con más entregas</h2>
                <p>Por instrumento y versión · incluye reintentos</p>
              </div>
              <BarChart3 size={20} />
            </header>
            {d.byTest.length ? (
              <div className="intel-ranking">
                {d.byTest.slice(0, 6).map((t, i) => (
                  <div key={t.id}>
                    <div>
                      <span>
                        <small>{String(i + 1).padStart(2, "0")}</small>
                        {t.title}
                      </span>
                      <b>{t.count}</b>
                    </div>
                    <div className="intel-track">
                      <span
                        style={{
                          width: percentage(t.count, d.byTest[0].count) + "%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="intel-empty">
                <BarChart3 size={28} />
                <strong>Aún no hay entregas para comparar</strong>
                <p>
                  El ranking se construye con las evaluaciones completadas en el
                  periodo.
                </p>
              </div>
            )}
          </section>
          <section className="intel-panel">
            <header>
              <div>
                <span className="intel-overline">GRUPOS · ESTADO ACTUAL</span>
                <h2>Participación y finalización</h2>
                <p>Compara el avance, no las aptitudes</p>
              </div>
              <ArrowUpRight size={20} />
            </header>
            {d.groups.length ? (
              <div className="intel-groups">
                {d.groups.map((g) => (
                  <div key={g.name}>
                    <div>
                      <strong>{g.name}</strong>
                      <span>
                        {g.completed} / {g.total} completaron
                      </span>
                    </div>
                    <div
                      className="intel-track intel-group-track"
                      aria-label={`${g.name}: ${g.started} con actividad y ${g.completed} completaron de ${g.total}`}
                    >
                      <span
                        style={{ width: percentage(g.started, g.total) + "%" }}
                      />
                      <b
                        style={{
                          width: percentage(g.completed, g.total) + "%",
                        }}
                      />
                    </div>
                    <small>
                      {percentage(g.started, g.total)}% con actividad ·{" "}
                      {percentage(g.completed, g.total)}% de finalización
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="intel-empty">
                <strong>Los grupos aparecerán aquí</strong>
                <p>Asigna un grupo al registrar o editar estudiantes.</p>
              </div>
            )}
            <p className="intel-legend">
              <i /> Con actividad <i /> Completaron
            </p>
          </section>
        </div>
      )}
    </>
  );
}

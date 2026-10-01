import { ArrowUpRight, Users, ClipboardCheck, FileText } from "lucide-react";
import type { AnalyticsSummary } from "../../lib/admin-analytics";

export function ExecutiveSignals({
  data: d,
  onSelect,
  onSetup,
}: {
  data: AnalyticsSummary;
  onSelect: (status: string) => void;
  onSetup: () => void;
}) {
  const date = (value: string) =>
    new Date(value + "T12:00:00-05:00").toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
      timeZone: "America/Guayaquil",
    });
  return (
    <>
      <section
        className="intel-period-summary"
        aria-label="Resultados del periodo"
      >
        <div>
          <span>Entregas del periodo</span>
          <strong>{d.current.toLocaleString("es-EC")}</strong>
          <small>
            {date(d.periodStart)} – {date(d.periodEnd)}
          </small>
        </div>
        <div>
          <span>Estudiantes que entregaron</span>
          <strong>{d.periodStudents.toLocaleString("es-EC")}</strong>
          <small>Personas únicas, sin duplicar reintentos</small>
        </div>
        <div>
          <span>Promedio de entregas</span>
          <strong>
            {d.dailyAverage.toLocaleString("es-EC")}
            <em> / día</em>
          </strong>
          <small>Incluye los días sin actividad</small>
        </div>
        <div>
          <span>Variación de entregas</span>
          <strong
            className={d.change !== null && d.change < 0 ? "intel-warn" : ""}
          >
            {d.change === null ? "—" : `${d.change > 0 ? "+" : ""}${d.change}%`}
          </strong>
          <small>
            {d.previous
              ? `${d.previous} en los ${d.days} días anteriores`
              : "Sin entregas en el periodo anterior"}
          </small>
        </div>
      </section>
      <section
        className="intel-priorities"
        aria-label="Prioridades de acompañamiento"
      >
        <header>
          <h2>Prioridades de acompañamiento</h2>
          <span>Selecciona una señal para ver a quién acompañar</span>
        </header>
        {!d.students ? (
          <div className="intel-start">
            <div>
              <strong>Aún no hay estudiantes en este alcance</strong>
              <p>
                Registra estudiantes o selecciona otro grupo para consultar su
                avance.
              </p>
            </div>
            <button onClick={onSetup}>
              Gestionar usuarios <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="intel-priority-grid">
            {[
              {
                value: d.pendingReports,
                title: "Informes pendientes",
                text: "Completaron su batería y esperan informe",
                status: "report",
                icon: FileText,
              },
              {
                value: d.withoutActivity,
                title: "Sin empezar",
                text: "Revisar acceso y evaluaciones asignadas",
                status: "pending",
                icon: Users,
              },
              {
                value: d.started - d.completed,
                title: "Baterías en curso",
                text: "Acompañar las evaluaciones pendientes",
                status: "progress",
                icon: ClipboardCheck,
              },
            ].map(({ icon: Icon, ...s }) => (
              <button key={s.status} onClick={() => onSelect(s.status)}>
                <Icon size={19} />
                <span>
                  <b>{s.title}</b>
                  <small>{s.text}</small>
                </span>
                <strong>{s.value}</strong>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

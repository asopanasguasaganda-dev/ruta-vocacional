"use client";
import { useState } from "react";
import { Card, SelectField, Field } from "../../components/ui/primitives";
import { decimal } from "./shared";
export function TrainingAnalytics({ attempts }: { attempts: any[] }) {
  const [chosen, setChosen] = useState(""),
    [from, setFrom] = useState(""),
    [until, setUntil] = useState("");
  const key = (a: any) =>
    [a.instrument.id, a.instrument.version, a.mode].join(":");
  const cohorts = attempts.filter(
      (a, i) => attempts.findIndex((x) => key(a) === key(x)) === i,
    ),
    active = chosen || (cohorts[0] && key(cohorts[0]));
  const rows = attempts.filter(
      (a) =>
        key(a) === active &&
        (!from ||
          Date.parse(a.started_at) >= Date.parse(from + "T00:00:00-05:00")) &&
        (!until ||
          Date.parse(a.started_at) <= Date.parse(until + "T23:59:59-05:00")),
    ),
    graded = rows.filter(
      (a) => a.result?.state === "complete" && a.result.percent != null,
    );
  const areas = [
    ...new Set<string>(
      graded.flatMap((a) => a.result.areas.map((r: any) => r.area)),
    ),
  ].map((area) => {
    const values = graded.flatMap((a) =>
      a.result.areas.filter((r: any) => r.area === area),
    );
    return {
      area,
      count: values.length,
      mean: values.reduce((n, r) => n + r.percent, 0) / values.length,
    };
  });
  return (
    <Card className="training-editor">
      <h2>Seguimiento por versión y modalidad</h2>
      <div className="training-split">
        <SelectField
          label="Conjunto comparable"
          value={active || ""}
          onChange={(e) => setChosen(e.target.value)}
        >
          <option value="">Selecciona un simulador</option>
          {cohorts.map((a) => (
            <option key={key(a)} value={key(a)}>
              {a.instrument.title} · v{a.instrument.version} ·{" "}
              {a.mode === "exam" ? "Examen" : "Práctica"}
            </option>
          ))}
        </SelectField>
        <Field
          label="Desde (hora de Ecuador)"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Field
          label="Hasta (hora de Ecuador)"
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
        />
      </div>
      <div className="training-summary">
        <div>
          <strong>{new Set(rows.map((a) => a.user_id)).size}</strong>
          <p>Estudiantes únicos</p>
        </div>
        <div>
          <strong>{rows.length}</strong>
          <p>Intentos en el período</p>
        </div>
        <div>
          <strong>
            {rows.filter((a) => a.state === "in_progress").length}
          </strong>
          <p>En curso</p>
        </div>
        <div>
          <strong>
            {rows.filter((a) => a.state === "pending-review").length}
          </strong>
          <p>Revisiones pendientes</p>
        </div>
        <div>
          <strong>
            {graded.reduce((n, a) => n + a.result.coverage.omitted, 0)}
          </strong>
          <p>Omisiones en intentos calificados</p>
        </div>
      </div>
      {areas.map((r) => (
        <div key={r.area}>
          <b>{r.area}</b>
          <p>
            Media de {r.count} intentos calificados: {decimal(r.mean)} / 100
          </p>
          <progress value={r.mean} max={100} />
        </div>
      ))}
      <p>
        {graded.length
          ? "Las barras describen los intentos de esta versión y modalidad. Una persona puede aportar varios intentos; no es una medición de aptitud ni una probabilidad de ingreso."
          : "No hay intentos calificados en este conjunto."}
      </p>
    </Card>
  );
}

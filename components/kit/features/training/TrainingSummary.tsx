"use client";
import Link from "next/link";
import { useTraining } from "./shared";
import { Card } from "../../components/ui/primitives";
export function TrainingSummary() {
  const { data, error } = useTraining();
  if (!data || error) return null;
  const next = data.enrollments.find((e: any) => e.next),
    career = data.careers.find((c: any) => data.goal.careerIds.includes(c.id));
  return (
    <Card className="stack-sm">
      <span className="eyebrow">TU PREPARACIÓN</span>
      <h2>{career?.name || "Cursos y simuladores"}</h2>
      <p>
        {next
          ? next.snapshot.title + " · Siguiente: " + next.next.title
          : "Explora los cursos publicados y elige cómo continuar."}
      </p>
      <Link className="button button--secondary" href="/mi-ruta/cursos">
        {next ? "Continuar mi preparación" : "Explorar cursos"}
      </Link>
    </Card>
  );
}

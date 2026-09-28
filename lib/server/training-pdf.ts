import { jsPDF } from "jspdf";
import { attempt, attemptView } from "./training";
import { fail } from "./store";
import { answerText } from "@/components/kit/lib/test-answer-text";
export function trainingPdf(user: any, id: string) {
  const a = attemptView(user, attempt(user, id));
  if (!a.result) fail("El resultado aún no está disponible.", 409);
  const p = new jsPDF(),
    r = a.result;
  let y = 22;
  const line = (text: string, bold = false) => {
    p.setFont("helvetica", bold ? "bold" : "normal");
    p.setFontSize(bold ? 13 : 10);
    const rows = p.splitTextToSize(text, 174);
    if (bold && y + rows.length * 6 + 12 > 276) {
      p.addPage();
      y = 22;
    }
    for (const row of rows) {
      if (y > 276) {
        p.addPage();
        y = 22;
      }
      p.text(row, 18, y);
      y += 6;
    }
    y += 4;
  };
  line("Ruta Vocacional 360° · Cursos y simuladores", true);
  line(a.instrument.title, true);
  line("Estudiante: " + a.name);
  line(
    "Inicio: " +
      new Date(a.started_at).toLocaleString("es-EC", {
        timeZone: "America/Guayaquil",
      }),
  );
  line(
    (a.mode === "exam" ? "Simulación de examen" : "Práctica") +
      " · Versión " +
      a.instrument.version +
      " · Revisión " +
      r.revision,
  );
  line(
    "Calificación: " +
      (r.state==='annulled'?'Intento anulado':r.percent == null
        ? "Pendiente de revisión"
        : r.percent.toFixed(2) + " / 100"),
  );
  line(
    "Puntos: " + r.raw + " de " + r.max + " · Omitidas: " + r.coverage.omitted,
  );
  line(r.note);
  if (r.annulled?.length)
    line(r.annulled.length + " preguntas anuladas. " + r.annulmentPolicy);
  for (const h of a.resultHistory as any[])
    line("Revisión " + h.revision + ": " + h.reason);
  for (const area of r.areas) {
    line(area.area, true);
    line(
      area.raw +
        " / " +
        area.max +
        " · " +
        area.percent.toFixed(2) +
        " %" +
        (area.weight ? " · Peso " + area.weight + " %" : ""),
    );
  }
  for (const q of a.instrument.questions) {
    line(q.text, true);
    if(r.annulled?.includes(q.id))line('Pregunta anulada; excluida del cálculo.');
    line(answerText(a.instrument, q, r.answers[q.id]));
    const explanation = a.explanations.find((e: any) => e.id === q.id);
    if (explanation) line(explanation.text || "");
  }
  line("Registro: " + a.id);
  line(
    "La nota académica es independiente de tus intereses vocacionales y del avance del curso.",
  );
  return p.output("arraybuffer");
}

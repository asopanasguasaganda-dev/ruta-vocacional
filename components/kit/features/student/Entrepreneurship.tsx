import { VentureSteps } from "./ReferenceCatalog";
import { Download, Lightbulb } from "lucide-react";
import { downloadText, isStringRecord, useLocalState } from "../../lib/storage";
import {
  Card,
  Notice,
  PageHeader,
  TextareaField,
  Button,
  Progress,
} from "../../components/ui/primitives";
const fields = [
  {
    id: "problem",
    title: "1. Un problema cercano",
    prompt: "¿Qué dificultad observas en tu colegio o comunidad?",
  },
  {
    id: "people",
    title: "2. Las personas",
    prompt: "¿A quién afecta y cómo podrías escuchar su experiencia?",
  },
  {
    id: "idea",
    title: "3. Tu propuesta",
    prompt: "¿Qué pequeña solución te gustaría probar?",
  },
  {
    id: "value",
    title: "4. El valor que aporta",
    prompt: "¿Qué mejoraría para esas personas?",
  },
  {
    id: "test",
    title: "5. Una primera prueba",
    prompt: "¿Cómo podrías probarlo con pocos recursos?",
  },
  {
    id: "learn",
    title: "6. Lo que quieres aprender",
    prompt: "¿Qué observarías para saber si vale la pena continuar?",
  },
];
export function Entrepreneurship() {
  const [canvas, setCanvas, saved] = useLocalState<Record<string, string>>(
    "rv360:venture",
    {},
    isStringRecord,
  );
  const count = fields.filter((f) => canvas[f.id]?.trim()).length;
  return (
    <>
      <PageHeader
        eyebrow="IDEAS CON PROPÓSITO"
        title="Explora tu lado emprendedor"
        description="Transforma una necesidad cercana en una idea que puedas probar."
        actions={
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={() =>
              downloadText(
                "mi-idea-emprendedora.txt",
                [
                  "MI IDEA — RUTA VOCACIONAL 360°",
                  ...fields.map(
                    (f) =>
                      "\n" + f.title + "\n" + (canvas[f.id] || "Pendiente"),
                  ),
                ].join("\n"),
              )
            }
          >
            Descargar idea
          </Button>
        }
      />
      <div className="stack">
        <Notice>
          <div className="row">
            <Lightbulb size={19} />
            Emprender también es crear soluciones para tu comunidad. Comienza
            pequeño y aprende de las personas.
          </div>
        </Notice>
        <Card>
          <Progress
            value={count}
            total={6}
            label="Partes de tu idea exploradas"
          />
        </Card>
        <div className="grid grid-2">
          {fields.map((f) => (
            <Card key={f.id} className="stack-sm">
              <h3>{f.title}</h3>
              <TextareaField
                label={f.prompt}
                placeholder="Escribe tus ideas..."
                rows={4}
                value={canvas[f.id] || ""}
                onChange={(e) =>
                  setCanvas((prev) => ({ ...prev, [f.id]: e.target.value }))
                }
              />
            </Card>
          ))}
        </div>
        <p className="small muted">
          {saved
            ? "Tus ideas se guardan automáticamente en tu cuenta."
            : "Descarga tu idea para conservarla; el almacenamiento local no está disponible."}
        </p>
      </div>
      <VentureSteps/>
    </>
  );
}

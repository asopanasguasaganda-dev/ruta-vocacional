import { versionLabel } from '../../lib/version';
import { flush } from '../../lib/session';
import { PublicationCenter } from "./Publication";
import { useState } from "react";
import { Plus, Save, Eye, Pencil, ClipboardList } from "lucide-react";
import type { Instrument, Question } from "../../types";
import { instruments, dimensions } from "../../data/instruments";
import { isStringRecord, useLocalState } from "../../lib/storage";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  SelectField,
  TextareaField,
} from "../../components/ui/primitives";
import { AnswerOptions } from "../../components/domain/Questionnaire";
import { Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
export function EvaluationEditor({initialId="intereses"}:{initialId?:string}) {
  const [id, setId] = useState(initialId);
  const instrument = instruments.find((i) => i.id === id)!;
  return (
    <>
      <PageHeader
        eyebrow="GESTIÓN ACADÉMICA"
        title="Banco de evaluaciones"
        description="Revisa preguntas y prepara borradores antes de una publicación controlada."
      />
      <div className="stack">
        <div className="filters">
          <SelectField
            label="Instrumento"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </SelectField>
          <Badge tone="warning">Borrador institucional</Badge>
        </div>
        <QuestionBank key={id} instrument={instrument} />
        <PublicationCenter key={"publish-"+id} kind="instrument" items={[{id:instrument.id,title:instrument.title}]} />
      </div>
    </>
  );
}
export function QuestionBank({ instrument }: { instrument: Instrument }) {
  const [draft, setDraft] = useLocalState<Record<string, string>>(
    "rv360:admin-draft:" + instrument.id,
    {},
    isStringRecord,
  );
  const [editing, setEditing] = useState<Question | null>(null);
  const [text, setText] = useState("");
  const [dimension, setDimension] = useState("R");
  const [preview, setPreview] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<number>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const extra = Object.keys(draft)
    .filter((k) => k.startsWith("NEW-") && !k.endsWith(":dimension"))
    .map((id) => ({
      id,
      text: draft[id],
      dimension: draft[id + ":dimension"] || undefined,
    }));
  const questions = [...instrument.questions, ...extra].map((q) => ({
    ...q,
    text: draft[q.id] || q.text,
    dimension: draft[q.id + ":dimension"] || q.dimension,
  }));
  return (
    <>
      <Notice tone="neutral">
        Guardar un borrador no modifica el test del estudiante. Publica una versión revisada desde el panel inferior. Los estudiantes que ya comenzaron conservan su versión original.
      </Notice>
      <Card>
        <div className="row between" style={{ marginBottom: 22 }}>
          <div className="row">
            <span className="icon-tile">
              <ClipboardList />
            </span>
            <div>
              <h2>{instrument.title}</h2>
              <p className="muted small">
                {questions.length} preguntas · versión {versionLabel(instrument.version)}
              </p>
            </div>
          </div>
          {instrument.options.length > 0 && (
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditing({
                  id: "NEW-" + crypto.randomUUID(),
                  text: "",
                  dimension:
                    instrument.id === "intereses" ? "R" : "Autoconocimiento",
                });
                setText("");
                setDimension(
                  instrument.id === "intereses" ? "R" : "Autoconocimiento",
                );
                setError("");
              }}
            >
              Añadir pregunta
            </Button>
          )}
        </div>
        <div style={{ marginBottom: 20 }}>
          <Field
            label="Buscar pregunta"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe una palabra..."
          />
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Pregunta</th>
                <th scope="col">Dimensión</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {questions
                .filter((q) =>
                  q.text.toLowerCase().includes(query.toLowerCase()),
                )
                .map((q) => (
                  <tr key={q.id}>
                    <td>
                      <code className="small">
                        {q.id.length > 12 ? q.id.slice(0, 10) + "…" : q.id}
                      </code>
                      {draft[q.id] && (
                        <div>
                          <Badge tone="warning">Borrador</Badge>
                        </div>
                      )}
                    </td>
                    <td style={{ minWidth: 260 }}>{q.text}</td>
                    <td>{q.dimension || "Preferencias"}</td>
                    <td>
                      <div className="table-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPreview(q);
                            setAnswer(undefined);
                          }}
                          icon={<Eye size={15} />}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditing(q);
                            setText(q.text);
                            setDimension(q.dimension || "");
                            setError("");
                          }}
                          icon={<Pencil size={15} />}
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar pregunta de borrador"
      >
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (text.trim().length < 12) {
              setError("Escribe una pregunta de al menos 12 caracteres.");
              return;
            }
            try { if (editing)
              await setDraft((prev) => ({
                ...prev,
                [editing.id]: text.trim(),
                [editing.id + ":dimension"]: dimension,
              }));
            await flush(); setEditing(null);
            toast("Borrador guardado en tu institución"); } catch(e){setError((e as Error).message);}
          }}
        >
          <TextareaField
            label="Enunciado"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={error}
          />
          {instrument.id !== "valores" && (
            <SelectField
              label="Dimensión"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
            >
              {(instrument.id === "intereses"
                ? dimensions.map((d) => ({ value: d.code, label: d.name }))
                : [
                    ...new Set(instrument.questions.map((q) => q.dimension!)),
                  ].map((d) => ({ value: d, label: d }))
              ).map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </SelectField>
          )}
          <p className="small muted">
            La escala conserva las opciones del instrumento original.
          </p>
          <Button type="submit" icon={<Save size={16} />}>
            Guardar borrador
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Vista previa de una pregunta"
        wide
      >
        {preview && (
          <div className="stack">
            <Badge tone="warning">Vista previa del borrador</Badge>
            <h2>{preview.text}</h2>
            <AnswerOptions
              options={preview.options || instrument.options}
              value={answer}
              onChange={setAnswer}
              name="editor-preview"
              vertical={!!preview.options}
            />
            <p className="small muted">
              Esta respuesta de prueba no se guarda en ninguna evaluación.
            </p>
          </div>
        )}
      </Dialog>
    </>
  );
}

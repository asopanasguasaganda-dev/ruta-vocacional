import type { Question } from "../../types";
import { Button, Field, TextareaField } from "../../components/ui/primitives";

/** Edits the universal question schema; evaluation stays in test-engine. */
export function AcademicQuestionSettings({
  q,
  change,
}: {
  q: Question;
  change: (v: Partial<Question>) => void;
}) {
  return (
    <div className="training-editor">
      <Field
        label="Peso de la pregunta"
        type="number"
        min={0.01}
        step="any"
        value={q.weight ?? 1}
        onChange={(e) => change({ weight: Number(e.target.value) })}
      />
      {q.policy === "objective" && q.type === "multiple" && (
        <>
          <label>
            <input
              type="checkbox"
              checked={!!q.partialCredit}
              onChange={(e) =>
                change({
                  partialCredit: e.target.checked,
                  incorrectPenalty: e.target.checked ? 1 : undefined,
                })
              }
            />{" "}
            Crédito parcial
          </label>
          {q.partialCredit && (
            <Field
              label="Descuento por opción incorrecta (fracción del máximo, mínimo total cero)"
              type="number"
              min={0.01}
              step="any"
              value={q.incorrectPenalty ?? 1}
              onChange={(e) =>
                change({ incorrectPenalty: Number(e.target.value) })
              }
            />
          )}
        </>
      )}
      {q.policy === "objective" && q.type === "number" && (
        <div className="training-split">
          <Field
            label="Respuesta numérica mínima aceptada"
            type="number"
            step="any"
            value={q.numericKey?.min ?? ""}
            onChange={(e) =>
              change({
                numericKey: {
                  min: Number(e.target.value),
                  max: q.numericKey?.max ?? Number(e.target.value),
                },
              })
            }
          />
          <Field
            label="Respuesta numérica máxima aceptada"
            type="number"
            step="any"
            value={q.numericKey?.max ?? ""}
            onChange={(e) =>
              change({
                numericKey: {
                  max: Number(e.target.value),
                  min: q.numericKey?.min ?? Number(e.target.value),
                },
              })
            }
          />
        </div>
      )}
      {q.policy === "objective" && q.type === "short" && (
        <>
          <TextareaField
            label="Textos aceptados (uno por línea)"
            value={(q.acceptedTexts || []).join("\n")}
            onChange={(e) =>
              change({ acceptedTexts: e.target.value.split("\n") })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={!!q.normalizeText}
              onChange={(e) => change({ normalizeText: e.target.checked })}
            />{" "}
            Ignorar mayúsculas, tildes y espacios repetidos
          </label>
        </>
      )}
      {q.policy === "rubric" && (
        <>
          {q.rubric?.map((r) => (
            <fieldset key={r.id}>
              <legend>Criterio de rúbrica</legend>
              <Field
                label="Criterio"
                value={r.label}
                onChange={(e) =>
                  change({
                    rubric: q.rubric!.map((x) =>
                      x.id === r.id ? { ...x, label: e.target.value } : x,
                    ),
                  })
                }
              />
              {r.levels.map((l) => (
                <div className="training-split" key={l.id}>
                  <Field
                    label="Nivel"
                    value={l.label}
                    onChange={(e) =>
                      change({
                        rubric: q.rubric!.map((x) =>
                          x.id === r.id
                            ? {
                                ...x,
                                levels: x.levels.map((n) =>
                                  n.id === l.id
                                    ? { ...n, label: e.target.value }
                                    : n,
                                ),
                              }
                            : x,
                        ),
                      })
                    }
                  />
                  <Field
                    label="Puntos del nivel"
                    type="number"
                    min={0}
                    step="any"
                    value={l.points}
                    onChange={(e) =>
                      change({
                        rubric: q.rubric!.map((x) =>
                          x.id === r.id
                            ? {
                                ...x,
                                levels: x.levels.map((n) =>
                                  n.id === l.id
                                    ? { ...n, points: Number(e.target.value) }
                                    : n,
                                ),
                              }
                            : x,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  change({
                    rubric: q.rubric!.map((x) =>
                      x.id === r.id
                        ? {
                            ...x,
                            levels: [
                              ...x.levels,
                              { id: crypto.randomUUID(), label: "", points: 0 },
                            ],
                          }
                        : x,
                    ),
                  })
                }
              >
                Añadir nivel
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  change({ rubric: q.rubric!.filter((x) => x.id !== r.id) })
                }
              >
                Quitar criterio
              </Button>
            </fieldset>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              change({
                rubric: [
                  ...(q.rubric || []),
                  {
                    id: crypto.randomUUID(),
                    label: "",
                    levels: [
                      {
                        id: crypto.randomUUID(),
                        label: "Sin evidencia",
                        points: 0,
                      },
                      { id: crypto.randomUUID(), label: "Completo", points: 1 },
                    ],
                  },
                ],
              })
            }
          >
            Añadir criterio
          </Button>
        </>
      )}
    </div>
  );
}

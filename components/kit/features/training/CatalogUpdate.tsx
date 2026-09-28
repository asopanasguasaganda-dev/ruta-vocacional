"use client";
import { useState } from "react";
import { Button, Notice, Field } from "../../components/ui/primitives";
import { trainingApi } from "./shared";
export function CatalogUpdate({ refresh }: { refresh: () => void }) {
  const [preview, setPreview] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    setError("");
    setPreview(null);
    try {
      if (file.size > 1500000) throw Error("Máximo 1,5 MB por lote.");
      const input = JSON.parse(await file.text());
      setPreview(await trainingApi("/catalog/preview", { input }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Actualizar catálogo por lote verificable</summary>
      <p>
        JSON con fuente, sourceUrl, retrievedAt y careers. Conserva los
        identificadores CES existentes; cada carrera incluye sus ofertas. Las
        ausencias no eliminan datos.
      </p>
      <Field
        label="Archivo JSON de actualización"
        type="file"
        accept=".json,application/json"
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {error && <Notice tone="danger">{error}</Notice>}
      {preview && (
        <>
          <p>
            {preview.added.length} altas · {preview.changed.length} cambios ·{" "}
            {preview.absent.length} carreras ausentes ·{" "}
            {preview.missingOffers.length} ofertas ausentes.
          </p>
          <div className="training-choices">
            {preview.added.map((c: any) => (
              <p key={c.id}>
                Alta: {c.name} ({c.id})
              </p>
            ))}
            {preview.changed.map((c: any) => (
              <p key={c.id}>
                Cambio: {c.name} ({c.id})
              </p>
            ))}
          </div>
          <Notice>{preview.note}</Notice>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await trainingApi("/catalog/apply", { id: preview.id });
                setPreview(null);
                refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirmar lote revisado
          </Button>
        </>
      )}
    </details>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { readApiResponse } from "../../lib/api-response";
import { Button, Notice } from "../../components/ui/primitives";
export async function trainingApi(path = "", body?: any, method = "POST") {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true")
    throw Error(
      "Cursos necesita el servidor y una base de datos persistente. Esta publicación contiene solo el diseño.",
    );
  return readApiResponse(
    await fetch("/api/training" + path, {
      method: body === undefined ? "GET" : method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    }),
  );
}
export function useTraining() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setData(await trainingApi());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    refresh();
    const focus = () => refresh();
    window.addEventListener("focus", focus);
    const timer = setInterval(focus, 30000);
    return () => {
      window.removeEventListener("focus", focus);
      clearInterval(timer);
    };
  }, [refresh]);
  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError("");
    try {
      const r = await fn();
      await refresh();
      return r;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setBusy(false);
    }
  };
  return { data, error, busy, refresh, run };
}
export function TrainingError({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return error ? (
    <Notice tone="danger">
      {error}{" "}
      <Button variant="ghost" onClick={retry}>
        Reintentar
      </Button>
    </Notice>
  ) : null;
}
export function ChoiceList({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { id: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  return (
    <fieldset className="training-choices">
      <legend>{label}</legend>
      <input
        aria-label={"Buscar " + label.toLowerCase()}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre"
      />
      <div>
        {items
          .filter((i) =>
            i.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()),
          )
          .map((i) => (
            <label key={i.id}>
              <input
                type="checkbox"
                checked={value.includes(i.id)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...value, i.id]
                      : value.filter((x) => x !== i.id),
                  )
                }
              />
              {i.name}
            </label>
          ))}
      </div>
      <small>{value.length} seleccionados</small>
    </fieldset>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <nav className="training-tabs" aria-label="Secciones de cursos">
      {items.map((i) => (
        <button
          key={i}
          aria-current={i === value ? "page" : undefined}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </nav>
  );
}
export const decimal = (n: number | null | undefined) =>
  n == null
    ? "Pendiente"
    : n.toLocaleString("es-EC", { maximumFractionDigits: 2 });

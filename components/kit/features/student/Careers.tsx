import { ReferenceCatalog } from "./ReferenceCatalog";
import { useMemo, useState } from "react";
import { Bookmark, Check, GitCompareArrows } from "lucide-react";
import type { Career } from "../../types";
import { careers, careerAreas } from "../../data/careers";
import { dimensions } from "../../data/instruments";
import { isStringArray, useLocalState } from "../../lib/storage";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Notice,
  PageHeader,
  SelectField,
  Tabs,
} from "../../components/ui/primitives";
import { CareerCard } from "../../components/domain/CareerCard";
import { Dialog } from "../../components/ui/Dialog";
export function CareerDetail({
  career,
  onClose,
  saved,
  onSave,
}: {
  career: Career | null;
  onClose: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog
      open={!!career}
      onClose={onClose}
      title={career?.name || "Carrera"}
      wide
    >
      {career && (
        <div className="stack">
          <Badge tone="primary">{career.area}</Badge>
          <p>{career.description}</p>
          <div className="grid grid-2">
            <div>
              <h3>¿Qué podrías hacer?</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                {career.activities}
              </p>
            </div>
            <div>
              <h3>Habilidades por desarrollar</h3>
              <p className="muted small" style={{ marginTop: 8 }}>
                {career.skills}
              </p>
            </div>
          </div>
          <div>
            <h3>Qué conviene investigar</h3>
            <p className="muted small" style={{ marginTop: 8 }}>
              {career.investigate}
            </p>
            {career.sourceUrl&&<p><a className="text-link" href={career.sourceUrl} target="_blank" rel="noopener noreferrer">Fuente oficial</a><small> · Consultada el {career.sourceDate}</small></p>}
          </div>
          <div className="row">
            {career.interests.map((code) => (
              <Badge key={code}>
                {dimensions.find((d) => d.code === code)?.name}
              </Badge>
            ))}
          </div>
          <Notice tone="neutral">
            Ficha orientativa. Verifica la oferta, acreditación, requisitos y
            costos directamente con cada institución educativa.
          </Notice>
          <Button
            onClick={onSave}
            icon={saved ? <Check size={17} /> : <Bookmark size={17} />}
          >
            {saved ? "Guardada · quitar de mi lista" : "Guardar para explorar"}
          </Button>
        </div>
      )}
    </Dialog>
  );
}
export function Careers() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [tab, setTab] = useState("all");
  const [saved, setSaved] = useLocalState<string[]>(
    "rv360:saved-careers",
    [],
    isStringArray,
  );
  const [selected, setSelected] = useState<Career | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const results = useMemo(
    () =>
      careers.filter(
        (c) =>
          (!query ||
            [c.name, c.description, c.area]
              .join(" ")
              .toLocaleLowerCase("es")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(
                query
                  .toLocaleLowerCase("es")
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, ""),
              )) &&
          (!area || c.area === area) &&
          (tab === "all" || saved.includes(c.id)),
      ),
    [query, area, tab, saved],
  );
  const toggle = (id: string) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  return (
    <>
      <PageHeader
        eyebrow="NUEVAS POSIBILIDADES"
        title="Explorar carreras"
        description="Descubre actividades, compara opciones y guarda lo que quieras investigar."
        actions={
          <Button
            variant="secondary"
            icon={<GitCompareArrows size={17} />}
            disabled={compare.length < 2}
            onClick={() => setShowCompare(true)}
          >
            Comparar ({compare.length}/3)
          </Button>
        }
      />
      <div className="stack">
        <Tabs
          items={[
            { id: "all", label: "Todas las carreras" },
            { id: "saved", label: "Guardadas (" + saved.length + ")" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="filters">
          <Field
            label="Buscar carrera"
            placeholder="Nombre, área o actividad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          />
          <SelectField
            label="Área de estudio"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">Todas las áreas</option>
            {[...new Set(careers.map(c=>c.area))].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </SelectField>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setArea("");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
        <p className="small muted">
          {results.length} carreras · Selecciona dos o tres para comparar.
        </p>
        {results.length ? (
          <div className="career-browser"><div className="career-list">
            {results.map((c) => (
              <div className="stack-sm" key={c.id}>
                <CareerCard
                  career={c}
                  saved={saved.includes(c.id)}
                  onSave={() => toggle(c.id)}
                  onOpen={() => setSelected(c)}
                />
                <Checkbox
                  label={"Comparar " + c.name}
                  checked={compare.includes(c.id)}
                  disabled={!compare.includes(c.id) && compare.length >= 3}
                  onChange={() =>
                    setCompare((prev) =>
                      prev.includes(c.id)
                        ? prev.filter((x) => x !== c.id)
                        : [...prev, c.id],
                    )
                  }
                />
              </div>
            ))}
          </div><Card className="comparison-panel"><span className="icon-tile"><GitCompareArrows/></span><h2>Compara tus opciones</h2><p className="muted">Selecciona hasta tres carreras para descubrir lo que tienen en común y sus diferencias.</p>{compare.map(id=><div className="comparison-selection" key={id}><b>{careers.find(c=>c.id===id)?.name}</b><button aria-label="Quitar de la comparación" onClick={()=>setCompare(prev=>prev.filter(x=>x!==id))}>×</button></div>)}{!compare.length&&<p className="comparison-placeholder">Las carreras que selecciones aparecerán aquí.</p>}<Button disabled={compare.length<2} onClick={()=>setShowCompare(true)}>Comparar carreras ({compare.length}/3)</Button></Card></div>
        ) : (
          <EmptyState
            title={
              tab === "saved"
                ? "Aún no hay carreras en esta lista"
                : "No encontramos esa carrera"
            }
            description="Prueba con otra búsqueda o explora todas las áreas."
            action={
              <Button
                onClick={() => {
                  setTab("all");
                  setQuery("");
                  setArea("");
                }}
              >
                Ver todas las carreras
              </Button>
            }
          />
        )}
      </div>
      <ReferenceCatalog/>
      <CareerDetail
        career={selected}
        onClose={() => setSelected(null)}
        saved={!!selected && saved.includes(selected.id)}
        onSave={() => selected && toggle(selected.id)}
      />
      <Dialog
        open={showCompare}
        onClose={() => setShowCompare(false)}
        title="Comparar posibilidades"
        wide
      >
        <div className="stack">
          <div className="data-table-wrap">
            <table className="data-table">
              <caption>
                Comparación orientativa de carreras seleccionadas
              </caption>
              <thead>
                <tr>
                  <th scope="col">Aspecto</th>
                  {compare.map((id) => (
                    <th scope="col" key={id}>
                      {careers.find((c) => c.id === id)?.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "area", name: "Área" },
                  { key: "activities", name: "Actividades" },
                  { key: "skills", name: "Habilidades" },
                  { key: "investigate", name: "Investiga" },
                ].map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.name}</th>
                    {compare.map((id) => (
                      <td style={{ minWidth: 180 }} key={id}>
                        {
                          careers.find((c) => c.id === id)?.[
                            row.key as keyof Career
                          ]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Notice>
            Compara también tu contexto, posibilidades de acceso y experiencias
            personales.
          </Notice>
        </div>
      </Dialog>
    </>
  );
}

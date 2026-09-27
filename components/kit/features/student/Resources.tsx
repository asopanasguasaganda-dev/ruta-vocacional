import { useSession } from '../../lib/session';
import { useState } from "react";
import { BookOpen, Bookmark, Clock, ArrowRight } from "lucide-react";
import { resources } from "../../data/resources";
import type { Resource } from "../../data/resources";
import { isStringArray, useLocalState } from "../../lib/storage";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  PageHeader,
  SelectField,
} from "../../components/ui/primitives";
import { Dialog } from "../../components/ui/Dialog";
export function ResourceCard({
  resource,
  saved,
  onSave,
  onOpen,
  index = 0,
}: {
  resource: Resource;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  index?: number;
}) {
  return (
    <Card className="feature-card student-resource-card">
      <div
        className={
          "resource-art " +
          (index % 3 === 1 ? "teal" : index % 3 === 2 ? "amber" : "")
        }
      >
        <img src={"/assets/resource-"+(index%6+1)+".webp"} alt="" loading="lazy"/>
      </div>
      <div className="row between">
        <Badge>{resource.category}</Badge>
        <IconButton
          label={
            saved ? "Quitar recurso guardado" : "Guardar " + resource.title
          }
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </IconButton>
      </div>
      <h3>{resource.title}</h3>
      <p className="muted">{resource.intro}</p>
      <div className="row between" style={{ marginTop: "auto" }}>
        <span className="row small muted">
          <Clock size={14} />
          {resource.minutes?`${resource.minutes} min`:'A tu ritmo'}
        </span>
        <Button variant="ghost" size="sm" onClick={onOpen}>
          Leer guía <ArrowRight size={15} />
        </Button>
      </div>
    </Card>
  );
}
export function Resources() {
 const session=useSession();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useLocalState<string[]>(
    "rv360:saved-resources",
    [],
    isStringArray,
  );
  const [open, setOpen] = useState<Resource | null>(null);
  const filtered = resources.filter(
    (r) =>
      (!query ||
        (r.title + " " + r.intro)
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!category || r.category === category) &&
      (!savedOnly || saved.includes(r.id)),
  );
  return (
    <>
      <PageHeader
        eyebrow="APRENDE Y EXPLORA"
        title="Recursos para tu camino"
        description="Guías prácticas para investigar opciones y conversar sobre tu futuro."
      />
      <div className="filters">
        <Field
          label="Buscar recursos"
          type="search"
          placeholder="¿Qué te gustaría descubrir?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SelectField
          label="Tema"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todos los temas</option>
          {[...new Set(resources.map((r) => r.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <Button
          variant={savedOnly ? "primary" : "secondary"}
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly((v) => !v)}
          icon={<Bookmark size={16} />}
        >
          Guardados ({saved.length})
        </Button>
      </div>
      {filtered.length ? (
        <div className="grid grid-3 student-resource-grid">
          {filtered.map((r, i) => (
            <ResourceCard
              key={r.id}
              resource={r}
              index={resources.findIndex(resource=>resource.id===r.id)}
              saved={saved.includes(r.id)}
              onSave={() => { if(!session.user){window.location.href="/ingresar";return;} return setSaved((prev) =>
                  prev.includes(r.id)
                    ? prev.filter((id) => id !== r.id)
                    : [...prev, r.id],
                );}
              }
              onOpen={() => setOpen(r)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay recursos con estos filtros"
          action={
            <Button
              onClick={() => {
                setQuery("");
                setCategory("");
                setSavedOnly(false);
              }}
            >
              Ver todos
            </Button>
          }
        />
      )}
      <Dialog
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.title || "Guía"}
        wide
      >
        {open && (
          <article className="stack">
            <div className="row">
              <Badge tone="primary">{open.category}</Badge>
              <span className="muted small">
                {open.minutes?`${open.minutes} min de lectura aproximada`:'Lectura a tu ritmo'}
              </span>
            </div>
            <p>{open.intro}</p>
            <ol className="stack-sm">
              {open.steps.map((step) => (
                <li key={step} className="muted">
                  {step}
                </li>
              ))}
            </ol>
            <>{open.sourceUrl&&<p><a className="text-link" href={open.sourceUrl} target="_blank" rel="noopener noreferrer">Consultar fuente</a><span className="muted small"> · Consultada el {open.sourceDate}</span></p>}</><small className="muted">
              Guía práctica · Ruta Vocacional 360°
            </small>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Volver a los recursos
            </Button>
          </article>
        )}
      </Dialog>
    </>
  );
}
